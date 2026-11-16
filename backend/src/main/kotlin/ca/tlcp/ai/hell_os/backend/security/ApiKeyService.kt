package ca.tlcp.ai.hell_os.backend.security

import ca.tlcp.ai.hell_os.backend.persistence.ApiKey
import ca.tlcp.ai.hell_os.backend.persistence.ApiKeyRepository
import ca.tlcp.ai.hell_os.backend.persistence.KeyRole
import ca.tlcp.ai.hell_os.protocol.KeyInfo
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64

data class CreatedKey(val key: ApiKey, val secret: String)

fun ApiKey.toInfo() = KeyInfo(id, name, role.name, createdAtMs, lastUsedAtMs, revokedAtMs)

@Service
class ApiKeyService(private val repo: ApiKeyRepository) {

    private val random = SecureRandom()

    fun hash(secret: String): String =
        MessageDigest.getInstance("SHA-256")
            .digest(secret.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(it) }

    /** Creates a key and returns its secret exactly once. */
    @Transactional
    fun create(name: String, role: KeyRole): CreatedKey {
        val bytes = ByteArray(32).also(random::nextBytes)
        val secret = "hell_${role.name.lowercase()}_" +
            Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)

        val saved = repo.save(
            ApiKey(
                name = name.trim().take(80),
                role = role,
                keyHash = hash(secret),
                createdAtMs = System.currentTimeMillis(),
            ),
        )

        return CreatedKey(saved, secret)
    }

    /** Returns the key for a presented secret, or null if unknown or revoked. */
    @Transactional
    fun authenticate(secret: String): ApiKey? {
        val key = repo.findByKeyHash(hash(secret)) ?: return null
        if (key.revokedAtMs != null) return null

        // Avoid a database write on every single handshake.
        val now = System.currentTimeMillis()
        val last = key.lastUsedAtMs
        if (last == null || now - last > 60_000) key.lastUsedAtMs = now

        return key
    }

    @Transactional(readOnly = true)
    fun list(): List<ApiKey> = repo.findAll().sortedBy { it.id }

    @Transactional
    fun revoke(id: Long): ApiKey? {
        val key = repo.findById(id).orElse(null) ?: return null
        if (key.revokedAtMs == null) key.revokedAtMs = System.currentTimeMillis()
        return key
    }

    @Transactional(readOnly = true)
    fun hasActive(role: KeyRole): Boolean = repo.existsByRoleAndRevokedAtMsIsNull(role)

    @Transactional(readOnly = true)
    fun activeCount(role: KeyRole): Long = repo.countByRoleAndRevokedAtMsIsNull(role)
}
