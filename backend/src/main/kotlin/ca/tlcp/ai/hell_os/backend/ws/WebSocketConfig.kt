package ca.tlcp.ai.hell_os.backend.ws

import ca.tlcp.ai.hell_os.backend.service.EventLogService
import ca.tlcp.ai.hell_os.protocol.StateMsg
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.env.Environment
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean

/**
 * Two endpoints, one per role. Authentication happens before the upgrade (see SecurityConfig).
 * No allowed origins are configured, so browsers are restricted to same-origin; the real
 * clients (Electron's Node and the Manager's JVM) don't send an Origin header at all.
 */
@Configuration
@EnableWebSocket
class WebSocketConfig(
    private val targetHandler: TargetHandler,
    private val managerHandler: ManagerHandler,
) : WebSocketConfigurer {

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(targetHandler, "/ws/target")
        registry.addHandler(managerHandler, "/ws/manager")
    }

    /**
     * Messages are small: 64 KB max. Idle sessions are dropped after 60 s; the Target heartbeats
     * every 5 s and the Manager polls the state every 20 s, so healthy clients never hit this.
     */
    @Bean
    fun webSocketContainer(): ServletServerContainerFactoryBean =
        ServletServerContainerFactoryBean().apply {
            setMaxTextMessageBufferSize(64 * 1024)
            setMaxSessionIdleTimeout(60_000L)
        }
}

/**
 * Drops a Target that has gone quiet and tells the Managers.
 *
 * NOTE: this only reports the loss. Killing the VM is the Manager's job (it runs on the
 * host and can reach the hypervisor); a scammer with admin inside the VM can silence
 * anything that runs inside it.
 */
@Component
class HeartbeatMonitor(
    private val registry: SessionRegistry,
    private val events: EventLogService,
    environment: Environment,
) {
    private val log = LoggerFactory.getLogger(HeartbeatMonitor::class.java)

    private val timeoutMs: Long =
        environment.getProperty("hell.heartbeat-timeout-ms", Long::class.javaObjectType, 15_000L)

    @Scheduled(fixedDelay = 2_000)
    fun check() {
        if (!registry.hasTimedOut(timeoutMs)) return

        if (registry.dropTarget()) {
            log.warn("Target stopped sending heartbeats for {} ms: dropped", timeoutMs)
            events.record("BACKEND", "target_lost", "Target stopped sending heartbeats", "timeout ${timeoutMs} ms")
            registry.broadcast(StateMsg(registry.status()))
        }
    }
}
