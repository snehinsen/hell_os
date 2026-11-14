import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { WinDialog } from '../../components/WinDialog'
import { RestrictionContext } from './RestrictionContext'
import { RESTRICTIONS } from './restrictions'

/**
 * Ids that are not "blocked" messages but real actions. Anything in pageSpecs
 * can use them as its `restriction`; they run instead of showing a dialog.
 */
const ACTIONS: Record<string, () => void> = {
    'open:defender': () => {
        void window.hell?.openApp('defender')
    },
    'open:settings': () => {
        void window.hell?.openApp('settings')
    },
}

// Attempt counters live for the whole session (they survive page navigation),
// so the same control keeps escalating no matter where the user wanders.
const attempts: Record<string, number> = {}

interface ActiveMessage {
    headline: string
    detail: string[]
}

export function RestrictionProvider({ children }: { children: ReactNode }) {
    const [active, setActive] = useState<ActiveMessage | null>(null)
    const open = useRef(false)

    const deny = useCallback((id: string) => {
        const action = ACTIONS[id]

        if (action) {
            action()
            return
        }

        // Ignore clicks (or slider drags) while a message is already showing.
        if (open.current) return

        const variants = RESTRICTIONS[id]
        if (!variants || variants.length === 0) return

        const attempt = attempts[id] ?? 0
        attempts[id] = attempt + 1

        const variant = variants[Math.min(attempt, variants.length - 1)]
        if (variant.silent) return

        open.current = true
        setActive({
            headline:
                variant.headline ?? 'This setting is managed by your organization.',
            detail: variant.detail ?? [],
        })
    }, [])

    const close = useCallback(() => {
        open.current = false
        setActive(null)
    }, [])

    const api = useMemo(() => ({ deny }), [deny])

    return (
        <RestrictionContext.Provider value={api}>
            {children}
            {active && (
                <WinDialog
                    headline={active.headline}
                    detail={active.detail}
                    onClose={close}
                />
            )}
        </RestrictionContext.Provider>
    )
}
