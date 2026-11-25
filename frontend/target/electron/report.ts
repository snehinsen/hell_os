/**
 * Everything the Target wants a human to know goes through report(): window opened,
 * user hit a blocked setting, and so on. It is only ever SENT to the backend; the
 * Target never acts on anything it receives except validated commands.
 *
 * report.ts is deliberately tiny and import-free so any module can use it without
 * creating an import cycle with the backend client.
 */

export interface Report {
    kind: string
    summary: string
    detail?: string
    at: number
}

type Sink = (report: Report) => void

let sink: Sink | null = null

export function setReportSink(next: Sink): void {
    sink = next
}

export function report(kind: string, summary: string, detail?: string): void {
    sink?.({
        kind: kind.slice(0, 40),
        summary: summary.slice(0, 500),
        detail: detail?.slice(0, 4000),
        at: Date.now(),
    })
}
