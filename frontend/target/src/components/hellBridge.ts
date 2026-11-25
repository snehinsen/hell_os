/**
 * Renderer-side helper for telling the human watching (via the main process and the
 * backend) what is happening in this window. Safe to call anywhere: it does nothing
 * when the page is opened outside Electron (plain `vite` in a browser).
 */
export function report(kind: string, summary: string, detail?: string): void {
    try {
        window.hell?.report(kind, summary, detail)
    } catch {
        // not running inside the Target
    }
}
