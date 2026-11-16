package ca.tlcp.ai.hell_os.backend.service

import ca.tlcp.ai.hell_os.backend.persistence.EventLog
import ca.tlcp.ai.hell_os.backend.persistence.EventLogRepository
import ca.tlcp.ai.hell_os.protocol.LogEntry
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/** Writes and reads the persistent event log. Everything is truncated: inputs may be hostile. */
@Service
class EventLogService(private val repo: EventLogRepository) {

    fun record(
        source: String,
        kind: String,
        summary: String,
        detail: String? = null,
        atMs: Long = System.currentTimeMillis(),
    ): LogEntry {
        val saved = repo.save(
            EventLog(
                atMs = atMs,
                source = source.take(16),
                kind = kind.take(64),
                summary = summary.take(600),
                detail = detail?.take(4000),
            ),
        )

        return saved.toEntry()
    }

    @Transactional(readOnly = true)
    fun query(limit: Int, beforeId: Long?): List<LogEntry> {
        val page = PageRequest.of(0, limit.coerceIn(1, 500))

        val rows = if (beforeId == null) {
            repo.findAllByOrderByIdDesc(page)
        } else {
            repo.findByIdLessThanOrderByIdDesc(beforeId, page)
        }

        return rows.map { it.toEntry() }
    }

    private fun EventLog.toEntry() = LogEntry(id, atMs, source, kind, summary, detail)
}
