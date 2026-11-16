package ca.tlcp.ai.hell_os.backend.persistence

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

enum class KeyRole { TARGET, MANAGER }

/**
 * An API key. Only a SHA-256 hash is stored: the secret itself is shown once
 * when the key is created and can never be recovered. (Keys are 256 random
 * bits, so a plain hash is appropriate and a slow password hash is not needed.)
 *
 * Timestamps are epoch millis in plain Long columns to keep SQLite simple.
 */
@Entity
@Table(name = "api_keys")
class ApiKey(
    @Column(nullable = false, length = 80)
    var name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    var role: KeyRole,

    @Column(name = "key_hash", nullable = false, unique = true, length = 64)
    var keyHash: String,

    @Column(name = "created_at_ms", nullable = false)
    var createdAtMs: Long,

    @Column(name = "last_used_at_ms")
    var lastUsedAtMs: Long? = null,

    @Column(name = "revoked_at_ms")
    var revokedAtMs: Long? = null,
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0
}

/** One line of the audit / event log (commands, reports, connections, key changes). */
@Entity
@Table(name = "event_log", indexes = [Index(name = "idx_event_log_at", columnList = "at_ms")])
class EventLog(
    @Column(name = "at_ms", nullable = false)
    var atMs: Long,

    @Column(nullable = false, length = 16)
    var source: String,

    @Column(nullable = false, length = 64)
    var kind: String,

    @Column(nullable = false, length = 600)
    var summary: String,

    @Column(length = 4000)
    var detail: String? = null,
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0
}

interface ApiKeyRepository : JpaRepository<ApiKey, Long> {
    fun findByKeyHash(keyHash: String): ApiKey?
    fun existsByRoleAndRevokedAtMsIsNull(role: KeyRole): Boolean
    fun countByRoleAndRevokedAtMsIsNull(role: KeyRole): Long
}

interface EventLogRepository : JpaRepository<EventLog, Long> {
    fun findAllByOrderByIdDesc(pageable: Pageable): List<EventLog>
    fun findByIdLessThanOrderByIdDesc(id: Long, pageable: Pageable): List<EventLog>
}
