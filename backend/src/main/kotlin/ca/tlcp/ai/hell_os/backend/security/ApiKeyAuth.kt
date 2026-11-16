package ca.tlcp.ai.hell_os.backend.security

import ca.tlcp.ai.hell_os.backend.persistence.KeyRole
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.ArrayDeque
import java.util.concurrent.ConcurrentHashMap

/** Who an authenticated connection is. Available as the WebSocket session principal. */
data class ApiKeyPrincipal(
    val keyId: Long,
    val name: String,
    val role: KeyRole,
)

/**
 * Blocks an IP for a minute after 10 failed key attempts in a minute.
 * The backend is reachable over the internet, so guessing must be expensive.
 */
@Component
class AuthFailureLimiter {
    private val failures = ConcurrentHashMap<String, ArrayDeque<Long>>()

    fun isBlocked(ip: String): Boolean {
        val queue = failures[ip] ?: return false

        synchronized(queue) {
            prune(queue)
            return queue.size >= MAX_FAILURES
        }
    }

    fun recordFailure(ip: String) {
        val queue = failures.computeIfAbsent(ip) { ArrayDeque() }

        synchronized(queue) {
            prune(queue)
            queue.addLast(System.currentTimeMillis())
        }
    }

    private fun prune(queue: ArrayDeque<Long>) {
        val cutoff = System.currentTimeMillis() - WINDOW_MS
        while (queue.isNotEmpty() && queue.first() < cutoff) queue.removeFirst()
    }

    private companion object {
        const val MAX_FAILURES = 10
        const val WINDOW_MS = 60_000L
    }
}

/**
 * Reads `Authorization: Bearer <key>` and, if it matches an active key,
 * authenticates the request with ROLE_TARGET or ROLE_MANAGER. The WebSocket
 * upgrade is an ordinary HTTP request, so this runs for it too.
 *
 * (Not a Spring bean on purpose: it is created in SecurityConfig, otherwise
 * Boot would also register it as a second, global servlet filter.)
 */
class ApiKeyAuthFilter(
    private val keys: ApiKeyService,
    private val limiter: AuthFailureLimiter,
) : OncePerRequestFilter() {

    private val log = LoggerFactory.getLogger(ApiKeyAuthFilter::class.java)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val ip = request.remoteAddr ?: "unknown"

        if (limiter.isBlocked(ip)) {
            response.status = 429
            return
        }

        val header = request.getHeader("Authorization")

        if (header != null && header.startsWith("Bearer ")) {
            val key = keys.authenticate(header.substring(7).trim())

            if (key == null) {
                limiter.recordFailure(ip)
                log.warn("Rejected an unknown or revoked API key from {}", ip)
            } else {
                val principal = ApiKeyPrincipal(key.id, key.name, key.role)
                val authentication = UsernamePasswordAuthenticationToken.authenticated(
                    principal,
                    null,
                    listOf(SimpleGrantedAuthority("ROLE_${key.role.name}")),
                )

                val context = SecurityContextHolder.createEmptyContext()
                context.authentication = authentication
                SecurityContextHolder.setContext(context)
            }
        }

        filterChain.doFilter(request, response)
    }
}
