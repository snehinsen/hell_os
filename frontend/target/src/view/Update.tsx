import { useEffect, useState } from 'react'
import './update.css'

/**
 * The fake Windows 10 "Working on updates" screen.
 *
 * It never finishes. Progress crawls up in uneven steps, stalls for seconds at
 * a time, occasionally slides BACKWARDS, parks at 99% for a minute or more,
 * then "restarts" and resumes from somewhere much lower. The last value is
 * kept in localStorage so reloading the window doesn't reset it.
 */

type Phase = 'working' | 'restarting'

const STORAGE_KEY = 'hell-os:update-progress'

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function loadProgress(): number {
    try {
        const stored = Number(window.localStorage.getItem(STORAGE_KEY))

        if (Number.isFinite(stored) && stored >= 0 && stored <= 99) {
            return Math.floor(stored)
        }
    } catch {
        // storage unavailable: start from 0
    }

    return 0
}

function nextProgress(current: number): number {
    const roll = Math.random()

    // Stall: nothing moves.
    if (roll < 0.2) return current

    // Regress: the percentage visibly goes backwards.
    if (roll < 0.3 && current > 8) {
        return Math.max(0, current - randomInt(3, 18))
    }

    // The closer to the end, the slower it crawls.
    if (current >= 90) return Math.min(99, current + 1)
    if (current >= 70) return Math.min(99, current + randomInt(0, 2))

    return Math.min(99, current + randomInt(1, 4))
}

function Spinner() {
    return (
        <div className="update-spinner" aria-hidden="true">
            {[0, 1, 2, 3, 4].map(index => (
                <span
                    key={index}
                    className="update-dot"
                    style={{ animationDelay: `${index * 0.18}s` }}
                />
            ))}
        </div>
    )
}

export function Update() {
    const [progress, setProgress] = useState(loadProgress)
    const [phase, setPhase] = useState<Phase>('working')
    const [tick, setTick] = useState(0)

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, String(progress))
        } catch {
            // storage unavailable: progress just won't survive a reload
        }
    }, [progress])

    // Working: advance (or not) at irregular intervals.
    useEffect(() => {
        if (phase !== 'working') return

        const parked = progress >= 99
        const delay = parked
            ? randomInt(45_000, 90_000)
            : randomInt(1_500, 7_000)

        const id = window.setTimeout(() => {
            if (parked) {
                setPhase('restarting')
                return
            }

            setProgress(nextProgress)
            setTick(value => value + 1)
        }, delay)

        return () => window.clearTimeout(id)
    }, [phase, progress, tick])

    // Restarting: sit on a spinner, then resume from far lower than before.
    useEffect(() => {
        if (phase !== 'restarting') return

        const id = window.setTimeout(() => {
            setProgress(randomInt(5, 35))
            setPhase('working')
        }, randomInt(8_000, 16_000))

        return () => window.clearTimeout(id)
    }, [phase])

    return (
        <main className="update" onContextMenu={event => event.preventDefault()}>
            <div className="update-content">
                <Spinner />

                {phase === 'working' ? (
                    <>
                        <h1>Working on updates</h1>
                        <p className="update-percent">{progress}% complete</p>
                        <p>Don&rsquo;t turn off your PC. This will take a while.</p>
                    </>
                ) : (
                    <h1>Restarting</h1>
                )}
            </div>
        </main>
    )
}
