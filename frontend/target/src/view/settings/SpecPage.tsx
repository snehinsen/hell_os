import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Icon } from '../../components/Icon'
import { WinModal } from '../../components/WinDialog'
import { loadSetting, saveSetting } from '../../components/settingsStore'
import {
    SectionTitle,
    WinButton,
    WinLink,
    WinSelect,
    WinToggle,
} from '../../components/win10'
import { FONT_SEMIBOLD, WIN } from '../../components/tokens'
import { useRestrictions } from './RestrictionContext'
import type { AppEntry, AsideGroup, PageSpec, SpecElement } from './pageSpecs'

/* ------------------------------------------------------------------ */
/* Right-hand column                                                   */
/* ------------------------------------------------------------------ */

const HELP_GROUPS: AsideGroup[] = [
    { heading: 'Have a question?', links: ['Get help'] },
    { heading: 'Make Windows better', links: ['Give us feedback'] },
]

function Aside({ groups }: { groups: AsideGroup[] }) {
    return (
        <Box width="260px" flexShrink={0}>
            {groups.map(group => (
                <Box key={group.heading} mb="24px">
                    <Text fontFamily={FONT_SEMIBOLD} fontSize="14px" mb="6px">
                        {group.heading}
                    </Text>
                    {group.text && (
                        <Text fontSize="14px" mb="4px">
                            {group.text}
                        </Text>
                    )}
                    {group.links.map(link => (
                        <Box key={link} mb="4px">
                            <WinLink>{link}</WinLink>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    )
}

/* ------------------------------------------------------------------ */
/* "Managed by your organization" banner (what real Win10 shows)       */
/* ------------------------------------------------------------------ */

const UPDATE_POLICIES: [string, string][] = [
    ['Allow pausing updates', 'Not permitted'],
    ['Scheduled restart', 'Never approved'],
    ['Defer feature updates', '0 days (updates are not deferred, only late)'],
    ['Update source', 'Your administrator'],
    ['Installation progress', 'Ongoing'],
]

function ManagedBanner({ policyLink }: { policyLink: boolean }) {
    const [open, setOpen] = useState(false)

    return (
        <Box mb="24px">
            <Flex align="center" gap="10px">
                <Icon name="briefcase" size={16} />
                <Text fontSize="14px">
                    {policyLink
                        ? 'Some settings are managed by your organization.'
                        : 'Some settings are hidden or managed by your organization.'}
                </Text>
            </Flex>

            {policyLink && (
                <Box pl="26px" mt="4px">
                    <WinLink onClick={() => setOpen(true)}>
                        View configured update policies
                    </WinLink>
                </Box>
            )}

            {open && (
                <WinModal
                    title="Configured update policies"
                    onClose={() => setOpen(false)}
                    actions={
                        <WinButton primary onClick={() => setOpen(false)}>
                            OK
                        </WinButton>
                    }
                >
                    {UPDATE_POLICIES.map(([policy, value]) => (
                        <Flex
                            key={policy}
                            justify="space-between"
                            gap="16px"
                            py="8px"
                            borderBottom={`1px solid ${WIN.border}`}
                        >
                            <Text fontSize="14px">{policy}</Text>
                            <Text fontSize="14px" color={WIN.secondary} textAlign="right">
                                {value}
                            </Text>
                        </Flex>
                    ))}
                </WinModal>
            )}
        </Box>
    )
}

/* ------------------------------------------------------------------ */
/* Controls that look live but are blocked                             */
/* ------------------------------------------------------------------ */

function Labeled({ label, children }: { label: string; children: ReactNode }) {
    return (
        <Box mb="20px">
            <Text fontSize="14px" mb="6px">
                {label}
            </Text>
            {children}
        </Box>
    )
}

/** A toggle that never actually moves: clicking it triggers the blocked message. */
function LockedToggle({
    on,
    label,
    restriction,
}: {
    on: boolean
    label: string
    restriction: string
}) {
    const { deny } = useRestrictions()

    return (
        <Flex align="center" gap="12px">
            <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={label}
                className={`win-toggle${on ? ' on' : ''}`}
                onClick={() => deny(restriction)}
            >
                <span className="win-toggle-knob" />
            </button>
            <Text fontSize="14px">{on ? 'On' : 'Off'}</Text>
        </Flex>
    )
}

/** A drop-down that snaps back to its first option when changed. */
function LockedSelect({
    options,
    restriction,
}: {
    options: string[]
    restriction: string
}) {
    const { deny } = useRestrictions()

    return (
        <select
            className="win-select"
            value={options[0]}
            onChange={() => deny(restriction)}
        >
            {options.map(option => (
                <option key={option}>{option}</option>
            ))}
        </select>
    )
}

/** A slider that refuses to move. */
function LockedRange({
    value,
    restriction,
}: {
    value: number
    restriction: string
}) {
    const { deny } = useRestrictions()

    return (
        <Flex align="center" gap="12px">
            <input
                className="win-range"
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={() => deny(restriction)}
            />
            <Text fontSize="14px" minWidth="28px">
                {value}
            </Text>
        </Flex>
    )
}

/* ------------------------------------------------------------------ */
/* Controls that REALLY work                                           */
/* ------------------------------------------------------------------ */

const REFRESH_OPTIONS = ['60 Hertz', '59.94 Hertz', '50 Hertz']
const REFRESH_KEY = 'display:refresh'
const REVERT_SECONDS = 15

/**
 * Refresh rate: the one display control that is NOT blocked. It behaves like
 * the real thing: the screen blinks black, then a "Keep these display
 * settings?" box counts down and reverts if you do nothing.
 */
function RefreshRate() {
    const [value, setValue] = useState(() => {
        const stored = loadSetting(REFRESH_KEY)
        return stored && REFRESH_OPTIONS.includes(stored) ? stored : REFRESH_OPTIONS[0]
    })
    const [previous, setPrevious] = useState<string | null>(null)
    const [secondsLeft, setSecondsLeft] = useState(REVERT_SECONDS)
    const [flash, setFlash] = useState(false)

    const pending = previous !== null

    const change = (next: string) => {
        if (pending || next === value) return

        setPrevious(value)
        setValue(next)
        setSecondsLeft(REVERT_SECONDS)
        setFlash(true)
        window.setTimeout(() => setFlash(false), 900)
    }

    const revert = () => {
        if (previous !== null) setValue(previous)
        setPrevious(null)
    }

    const keep = () => {
        saveSetting(REFRESH_KEY, value)
        setPrevious(null)
    }

    useEffect(() => {
        if (!pending) return

        if (secondsLeft <= 0) {
            revert()
            return
        }

        const id = window.setTimeout(() => setSecondsLeft(seconds => seconds - 1), 1000)
        return () => window.clearTimeout(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pending, secondsLeft])

    return (
        <>
            <Labeled label="Refresh rate">
                <select
                    className="win-select"
                    value={value}
                    onChange={event => change(event.target.value)}
                >
                    {REFRESH_OPTIONS.map(option => (
                        <option key={option}>{option}</option>
                    ))}
                </select>
            </Labeled>

            {flash && <Box position="fixed" inset="0" zIndex={2000} bg="#000000" />}

            {pending && !flash && (
                <WinModal
                    title="Keep these display settings?"
                    onClose={revert}
                    actions={
                        <>
                            <WinButton primary onClick={keep}>
                                Keep changes
                            </WinButton>
                            <WinButton onClick={revert}>Revert</WinButton>
                        </>
                    }
                >
                    <Text fontSize="14px">
                        Reverting to previous display settings in {secondsLeft}{' '}
                        {secondsLeft === 1 ? 'second' : 'seconds'}.
                    </Text>
                </WinModal>
            )}
        </>
    )
}

const UPDATE_KEY = 'hell-os:update-progress'

/** Reads the progress the fake "Working on updates" window is showing. */
function readUpdateProgress(): number {
    try {
        const stored = Number(window.localStorage.getItem(UPDATE_KEY))

        if (Number.isFinite(stored) && stored >= 0 && stored <= 99) {
            return Math.floor(stored)
        }
    } catch {
        // storage unavailable
    }

    return 0
}

const EXTRA_UPDATES: { name: string; status: string }[] = [
    {
        name: '2026-11 Security Update for .NET Framework 4.8 for Windows 10 Version 22H2 for x64 (KB5048234)',
        status: 'Pending install',
    },
    {
        name: 'Security Intelligence Update for Microsoft Defender Antivirus - KB2267602 (Version 1.000.0.0)',
        status: 'Failed to install - retrying',
    },
    {
        name: 'Servicing Stack 10.0.19045.2000 for Windows 10 Version 22H2 (KB5031539)',
        status: 'Pending install',
    },
    {
        name: '2026-11 Update for Windows 10 Version 22H2 for x64-based Systems (KB4023057)',
        status: 'Pending download',
    },
]

function timeLabel(): string {
    return `Today, ${new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    })}`
}

/**
 * Windows Update: "Check for updates" genuinely checks. It takes a few
 * seconds and, being thorough, usually finds one more update. The main update
 * shows the live percentage of the fake update window.
 */
function UpdateStatus() {
    const [progress, setProgress] = useState(readUpdateProgress)
    const [found, setFound] = useState(() => {
        const stored = Number(loadSetting('update:found'))
        return Number.isFinite(stored)
            ? Math.min(Math.max(Math.floor(stored), 0), EXTRA_UPDATES.length)
            : 0
    })
    const [checking, setChecking] = useState(false)
    const [lastChecked, setLastChecked] = useState(timeLabel)

    // The update window and Settings share localStorage, so this stays in sync
    // with whatever percentage (or setback) the update screen is showing.
    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === UPDATE_KEY) setProgress(readUpdateProgress())
        }

        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    const check = () => {
        if (checking) return

        setChecking(true)
        window.setTimeout(
            () => {
                const next = Math.min(found + 1, EXTRA_UPDATES.length)

                setFound(next)
                saveSetting('update:found', String(next))
                setLastChecked(timeLabel())
                setChecking(false)
            },
            4000 + Math.floor(Math.random() * 3000),
        )
    }

    return (
        <Box mb="8px">
            <Flex align="center" gap="16px" mb="20px">
                <Icon name="update" size={48} color={WIN.accent} />
                <Box flex="1">
                    <Text fontFamily={FONT_SEMIBOLD} fontSize="20px">
                        {checking ? 'Checking for updates...' : 'Updates available'}
                    </Text>
                    {checking ? (
                        <Box mt="10px" maxWidth="320px">
                            <div className="win-progress indeterminate">
                                <div />
                            </div>
                        </Box>
                    ) : (
                        <Text fontSize="14px" color={WIN.secondary}>
                            Last checked: {lastChecked}
                        </Text>
                    )}
                </Box>
            </Flex>

            <Box mb="20px">
                <Text fontSize="14px" mb="2px">
                    2026-11 Cumulative Update for Windows 10 Version 22H2 for
                    x64-based Systems (KB5048239)
                </Text>
                <Text fontSize="14px" color={WIN.secondary} mb="8px">
                    Status: Installing - {progress}%
                </Text>
                <div className="win-progress" role="progressbar" aria-valuenow={progress}>
                    <div style={{ width: `${progress}%` }} />
                </div>
            </Box>

            <Box mb="20px">
                <Text fontSize="14px" mb="2px">
                    Windows Malicious Software Removal Tool x64 - v5.126 (KB890830)
                </Text>
                <Text fontSize="14px" color={WIN.secondary}>
                    Status: Pending install
                </Text>
            </Box>

            {EXTRA_UPDATES.slice(0, found).map(update => (
                <Box key={update.name} mb="20px">
                    <Text fontSize="14px" mb="2px">
                        {update.name}
                    </Text>
                    <Text fontSize="14px" color={WIN.secondary}>
                        Status: {update.status}
                    </Text>
                </Box>
            ))}

            {!checking && <WinButton onClick={check}>Check for updates</WinButton>}
        </Box>
    )
}

function hourLabel(hour: number): string {
    const suffix = hour < 12 ? 'AM' : 'PM'
    const display = hour % 12 === 0 ? 12 : hour % 12

    return `${display}:00 ${suffix}`
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hourLabel(hour))

function loadActiveHours(): [number, number] {
    const stored = loadSetting('update:active-hours')

    if (stored) {
        const [start, end] = stored.split('-').map(Number)

        if (Number.isInteger(start) && Number.isInteger(end)) return [start, end]
    }

    return [8, 17]
}

/** "Change active hours": a real dialog that saves, with the real 18-hour limit. */
function ActiveHours() {
    const [range, setRange] = useState<[number, number]>(loadActiveHours)
    const [draft, setDraft] = useState<[number, number]>(range)
    const [open, setOpen] = useState(false)

    const span = (draft[1] - draft[0] + 24) % 24
    const invalid = span === 0 || span > 18

    const save = () => {
        if (invalid) return

        setRange(draft)
        saveSetting('update:active-hours', `${draft[0]}-${draft[1]}`)
        setOpen(false)
    }

    return (
        <>
            <Flex
                align="center"
                gap="16px"
                px="12px"
                py="10px"
                mx="-12px"
                cursor="pointer"
                role="button"
                tabIndex={0}
                onClick={() => {
                    setDraft(range)
                    setOpen(true)
                }}
                _hover={{ bg: WIN.hover }}
            >
                <Icon name="clock" size={22} />
                <Box>
                    <Text fontSize="14px">Change active hours</Text>
                    <Text fontSize="12px" color={WIN.secondary}>
                        Currently {hourLabel(range[0])} to {hourLabel(range[1])}
                    </Text>
                </Box>
            </Flex>

            {open && (
                <WinModal
                    title="Active hours"
                    onClose={() => setOpen(false)}
                    actions={
                        <>
                            <WinButton primary onClick={save}>
                                Save
                            </WinButton>
                            <WinButton onClick={() => setOpen(false)}>Cancel</WinButton>
                        </>
                    }
                >
                    <Text fontSize="14px" mb="16px">
                        We won’t automatically restart this device during active
                        hours, and we won’t restart without checking if you’re
                        using it.
                    </Text>
                    <Labeled label="Start time">
                        <WinSelect
                            options={HOURS}
                            defaultValue={HOURS[draft[0]]}
                            onChange={value =>
                                setDraft(current => [HOURS.indexOf(value), current[1]])
                            }
                        />
                    </Labeled>
                    <Labeled label="End time">
                        <WinSelect
                            options={HOURS}
                            defaultValue={HOURS[draft[1]]}
                            onChange={value =>
                                setDraft(current => [current[0], HOURS.indexOf(value)])
                            }
                        />
                    </Labeled>
                    {invalid && (
                        <Text fontSize="13px" color="#F1707B">
                            The maximum range is 18 hours.
                        </Text>
                    )}
                </WinModal>
            )}
        </>
    )
}

const UPDATE_HISTORY: { name: string; status: string }[] = [
    { name: '2026-10 Cumulative Update for Windows 10 Version 22H2 for x64-based Systems (KB5044273)', status: 'Successfully installed on 10/14/2026' },
    { name: 'Windows Malicious Software Removal Tool x64 - v5.125 (KB890830)', status: 'Successfully installed on 10/14/2026' },
    { name: 'Security Intelligence Update for Microsoft Defender Antivirus - KB2267602', status: 'Failed to install on 11/10/2026' },
    { name: '2026-09 Cumulative Update for Windows 10 Version 22H2 for x64-based Systems (KB5043064)', status: 'Successfully installed on 9/9/2026' },
    { name: 'Feature update to Windows 10, version 22H2', status: 'Successfully installed on 6/12/2026' },
]

function UpdateHistory() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Flex
                align="center"
                gap="16px"
                px="12px"
                py="10px"
                mx="-12px"
                cursor="pointer"
                role="button"
                tabIndex={0}
                onClick={() => setOpen(true)}
                _hover={{ bg: WIN.hover }}
            >
                <Icon name="history" size={22} />
                <Box>
                    <Text fontSize="14px">View update history</Text>
                    <Text fontSize="12px" color={WIN.secondary}>
                        See updates installed on your device
                    </Text>
                </Box>
            </Flex>

            {open && (
                <WinModal
                    title="View update history"
                    onClose={() => setOpen(false)}
                    actions={
                        <WinButton primary onClick={() => setOpen(false)}>
                            OK
                        </WinButton>
                    }
                >
                    {UPDATE_HISTORY.map(entry => (
                        <Box key={entry.name} mb="14px">
                            <Text fontSize="14px">{entry.name}</Text>
                            <Text
                                fontSize="12px"
                                color={entry.status.startsWith('Failed') ? '#F1707B' : WIN.secondary}
                            >
                                {entry.status}
                            </Text>
                        </Box>
                    ))}
                </WinModal>
            )}
        </>
    )
}

/** Apps & features list with working search and sort. (Uninstall does nothing.) */
function AppList({ apps }: { apps: AppEntry[] }) {
    const { deny } = useRestrictions()
    const [query, setQuery] = useState('')
    const [sort, setSort] = useState('Name')

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        const list = apps.filter(app => app.name.toLowerCase().includes(q))

        if (sort === 'Size') return [...list].sort((a, b) => b.bytes - a.bytes)
        if (sort === 'Install date') {
            return [...list].sort((a, b) => b.date.localeCompare(a.date))
        }

        return [...list].sort((a, b) => a.name.localeCompare(b.name))
    }, [apps, query, sort])

    return (
        <Box>
            <Box mb="16px">
                <input
                    className="win-search"
                    type="text"
                    placeholder="Search this list"
                    aria-label="Search this list"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                />
            </Box>
            <Flex gap="24px" wrap="wrap" mb="16px">
                <Box>
                    <Text fontSize="12px" color={WIN.secondary} mb="4px">
                        Sort by:
                    </Text>
                    <WinSelect options={['Name', 'Size', 'Install date']} onChange={setSort} />
                </Box>
                <Box>
                    <Text fontSize="12px" color={WIN.secondary} mb="4px">
                        Filter by:
                    </Text>
                    <WinSelect options={['All drives']} />
                </Box>
            </Flex>

            {visible.length === 0 && (
                <Text fontSize="14px" color={WIN.secondary}>
                    We couldn’t find anything to show here. Please check your search
                    criteria.
                </Text>
            )}

            {visible.map(app => (
                <Flex
                    key={app.name}
                    align="center"
                    justify="space-between"
                    gap="12px"
                    py="8px"
                    borderBottom={`1px solid ${WIN.border}`}
                >
                    <Box>
                        <Text fontSize="14px">{app.name}</Text>
                        <Text fontSize="12px" color={WIN.secondary}>
                            {app.size} · {new Date(`${app.date}T00:00:00`).toLocaleDateString()}
                        </Text>
                    </Box>
                    <WinButton onClick={() => deny('uninstall')}>Uninstall</WinButton>
                </Flex>
            ))}
        </Box>
    )
}

/* ------------------------------------------------------------------ */
/* Element renderer                                                    */
/* ------------------------------------------------------------------ */

function Item({ element, pageKey }: { element: SpecElement; pageKey: string }) {
    const { deny } = useRestrictions()
    const block = (restriction?: string) =>
        restriction ? () => deny(restriction) : undefined

    switch (element.t) {
        case 'section':
            return <SectionTitle>{element.title}</SectionTitle>

        case 'text':
            return (
                <Text
                    fontSize="14px"
                    color={element.muted ? WIN.secondary : undefined}
                    mb="12px"
                >
                    {element.text}
                </Text>
            )

        case 'toggle':
            return (
                <Labeled label={element.label}>
                    {element.restriction ? (
                        <LockedToggle
                            on={element.on ?? false}
                            label={element.label}
                            restriction={element.restriction}
                        />
                    ) : (
                        <WinToggle
                            defaultOn={element.on}
                            label={element.label}
                            storageKey={`${pageKey}:${element.label}`}
                        />
                    )}
                </Labeled>
            )

        case 'select':
            return (
                <Labeled label={element.label}>
                    {element.restriction ? (
                        <LockedSelect
                            options={element.options}
                            restriction={element.restriction}
                        />
                    ) : (
                        <WinSelect
                            options={element.options}
                            storageKey={`${pageKey}:${element.label}`}
                        />
                    )}
                </Labeled>
            )

        case 'range':
            return (
                <Labeled label={element.label}>
                    <LockedRange
                        value={element.value}
                        restriction={element.restriction}
                    />
                </Labeled>
            )

        case 'button':
            return (
                <Box mb="12px">
                    <WinButton
                        primary={element.primary}
                        onClick={block(element.restriction)}
                    >
                        {element.label}
                    </WinButton>
                </Box>
            )

        case 'link':
            return (
                <Box mb="8px">
                    <WinLink onClick={block(element.restriction)}>
                        {element.label}
                    </WinLink>
                </Box>
            )

        case 'row':
            return (
                <Flex
                    align="center"
                    gap="16px"
                    px="12px"
                    py="10px"
                    mx="-12px"
                    cursor={element.restriction ? 'pointer' : 'default'}
                    role={element.restriction ? 'button' : undefined}
                    tabIndex={element.restriction ? 0 : undefined}
                    onClick={block(element.restriction)}
                    _hover={element.restriction ? { bg: WIN.hover } : undefined}
                >
                    {element.icon && (
                        <Icon name={element.icon} size={22} color={element.iconColor} />
                    )}
                    <Box minWidth="0">
                        <Text fontSize="14px">{element.title}</Text>
                        {element.description && (
                            <Text fontSize="12px" color={WIN.secondary}>
                                {element.description}
                            </Text>
                        )}
                    </Box>
                </Flex>
            )

        case 'kv':
            return (
                <Box mb="14px">
                    <Text fontFamily={FONT_SEMIBOLD} fontSize="14px">
                        {element.label}
                    </Text>
                    <Text fontSize="14px">{element.value}</Text>
                </Box>
            )

        case 'status':
            return (
                <Flex align="center" gap="16px" mb="16px">
                    <Icon name={element.icon} size={44} color={element.color} />
                    <Box>
                        <Text fontFamily={FONT_SEMIBOLD} fontSize="16px">
                            {element.title}
                        </Text>
                        {element.subtitle && (
                            <Text fontSize="14px" color={WIN.secondary}>
                                {element.subtitle}
                            </Text>
                        )}
                    </Box>
                </Flex>
            )

        case 'applist':
            return <AppList apps={element.apps} />

        case 'preview':
            return (
                <Box
                    width="280px"
                    height="170px"
                    mb="24px"
                    border="8px solid #555555"
                    borderBottomWidth="14px"
                    background="linear-gradient(135deg, #0a2f6b 0%, #0078D7 55%, #4cc2ff 100%)"
                />
            )

        case 'profile':
            return (
                <Flex align="center" gap="20px" mb="20px">
                    <Flex
                        width="96px"
                        height="96px"
                        borderRadius="50%"
                        bg="#E6E6E6"
                        align="center"
                        justify="center"
                    >
                        <Icon name="contact" size={52} color="#333333" />
                    </Flex>
                    <Box>
                        <Text fontFamily={FONT_SEMIBOLD} fontSize="20px">
                            HELL User
                        </Text>
                        <Text fontSize="14px" color={WIN.secondary}>
                            Local Account
                        </Text>
                    </Box>
                </Flex>
            )

        case 'updatestatus':
            return <UpdateStatus />

        case 'activehours':
            return <ActiveHours />

        case 'updatehistory':
            return <UpdateHistory />

        case 'refreshrate':
            return <RefreshRate />
    }
}

function isBlocked(element: SpecElement): boolean {
    return 'restriction' in element && Boolean(element.restriction)
}

export function SpecPage({ spec, pageKey }: { spec: PageSpec; pageKey: string }) {
    // Any page with a blocked control shows the real Win10 "managed" banner.
    const managed = spec.managed ?? spec.elements.some(isBlocked)

    return (
        <Flex gap="48px" align="flex-start" wrap="wrap">
            <Box flex="1" minWidth="320px" maxWidth="640px">
                {managed && <ManagedBanner policyLink={spec.policyLink ?? false} />}

                {spec.elements.map((element, index) => (
                    <Item key={index} element={element} pageKey={pageKey} />
                ))}
            </Box>
            <Aside groups={[...(spec.related ?? []), ...HELP_GROUPS]} />
        </Flex>
    )
}
