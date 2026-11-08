import { useEffect, useState, type ReactNode } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Icon } from '../../components/Icon'
import {
    SectionTitle,
    WinButton,
    WinLink,
    WinSelect,
    WinToggle,
} from '../../components/win10'
import { FONT_SEMIBOLD, WIN } from '../../components/tokens'
import { useRestrictions } from './RestrictionContext'
import type { AsideGroup, PageSpec, SpecElement } from './pageSpecs'

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
/* Special elements                                                    */
/* ------------------------------------------------------------------ */

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

function UpdateStatus() {
    const { deny } = useRestrictions()
    const [progress, setProgress] = useState(readUpdateProgress)

    // The update window and Settings share localStorage, so this stays in sync
    // with whatever percentage (or setback) the update screen is showing.
    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === UPDATE_KEY) setProgress(readUpdateProgress())
        }

        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    return (
        <Box mb="8px">
            <Flex align="center" gap="16px" mb="20px">
                <Icon name="update" size={48} color={WIN.accent} />
                <Box>
                    <Text fontFamily={FONT_SEMIBOLD} fontSize="20px">
                        Updates available
                    </Text>
                    <Text fontSize="14px" color={WIN.secondary}>
                        Last checked: Today
                    </Text>
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

            <Box mb="24px">
                <Text fontSize="14px" mb="2px">
                    Windows Malicious Software Removal Tool x64 - v5.126 (KB890830)
                </Text>
                <Text fontSize="14px" color={WIN.secondary}>
                    Status: Pending install
                </Text>
            </Box>

            <WinButton onClick={() => deny('checkupdates')}>
                Check for updates
            </WinButton>
        </Box>
    )
}

/* ------------------------------------------------------------------ */
/* Element renderer                                                    */
/* ------------------------------------------------------------------ */

function Item({ element }: { element: SpecElement }) {
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
                        <WinToggle defaultOn={element.on} label={element.label} />
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
                        <WinSelect options={element.options} />
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

        case 'app':
            return (
                <Flex
                    align="center"
                    justify="space-between"
                    gap="12px"
                    py="8px"
                    borderBottom={`1px solid ${WIN.border}`}
                >
                    <Box>
                        <Text fontSize="14px">{element.name}</Text>
                        <Text fontSize="12px" color={WIN.secondary}>
                            {element.size}
                        </Text>
                    </Box>
                    <WinButton onClick={() => deny('uninstall')}>Uninstall</WinButton>
                </Flex>
            )

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
    }
}

export function SpecPage({ spec }: { spec: PageSpec }) {
    return (
        <Flex gap="48px" align="flex-start" wrap="wrap">
            <Box flex="1" minWidth="320px" maxWidth="640px">
                {spec.elements.map((element, index) => (
                    <Item key={index} element={element} />
                ))}
            </Box>
            <Aside groups={[...(spec.related ?? []), ...HELP_GROUPS]} />
        </Flex>
    )
}
