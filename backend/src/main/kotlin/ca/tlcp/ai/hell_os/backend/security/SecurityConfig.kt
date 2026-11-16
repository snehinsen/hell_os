package ca.tlcp.ai.hell_os.backend.security

import ca.tlcp.ai.hell_os.backend.persistence.KeyRole
import ca.tlcp.ai.hell_os.backend.service.EventLogService
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.stereotype.Component

/**
 * Locks the whole server down: the only reachable URLs are the two WebSocket
 * endpoints, each requiring a key of the matching role. Everything else is denied.
 */
@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    fun securityFilterChain(
        http: HttpSecurity,
        keys: ApiKeyService,
        limiter: AuthFailureLimiter,
    ): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests {
                it.requestMatchers("/ws/target").hasRole("TARGET")
                    .requestMatchers("/ws/manager").hasRole("MANAGER")
                    .anyRequest().denyAll()
            }
            .exceptionHandling { it.authenticationEntryPoint(HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)) }
            .addFilterBefore(ApiKeyAuthFilter(keys, limiter), UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    /** Stops Boot from generating (and logging) a default user with a random password. */
    @Bean
    fun userDetailsService(): UserDetailsService =
        UserDetailsService { throw UsernameNotFoundException("Password logins are disabled") }
}

/** On first start (no active key of a role) creates one and prints its secret ONCE. */
@Component
class KeyBootstrap(
    private val keys: ApiKeyService,
    private val events: EventLogService,
) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(KeyBootstrap::class.java)

    override fun run(args: ApplicationArguments) {
        for ((role, label) in listOf(KeyRole.MANAGER to "Manager", KeyRole.TARGET to "Target")) {
            if (keys.hasActive(role)) continue

            val created = keys.create("Initial $label key", role)

            log.warn(
                "\n==============================================================\n" +
                    " NEW {} KEY (shown ONCE, store it now):\n" +
                    "   {}\n" +
                    "==============================================================",
                label.uppercase(),
                created.secret,
            )

            events.record("BACKEND", "key_created", "Created initial $label key #${created.key.id}")
        }
    }
}
