/**
 * Tiny persistence layer for Settings controls that actually work.
 * Values live in localStorage (shared by every HELL window), so a toggle the
 * "user" flips is still flipped when Settings is reopened.
 */

const PREFIX = 'hell-os:setting:'

export function loadSetting(key: string): string | null {
    try {
        return window.localStorage.getItem(PREFIX + key)
    } catch {
        return null
    }
}

export function saveSetting(key: string, value: string): void {
    try {
        window.localStorage.setItem(PREFIX + key, value)
    } catch {
        // storage unavailable: the setting just won't survive a reopen
    }
}
