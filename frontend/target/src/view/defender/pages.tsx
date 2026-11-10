import { useEffect, useMemo, useState } from 'react'
import { Box, Flex, Grid, Text, chakra } from '@chakra-ui/react'
import { Icon } from '../../components/Icon'
import type { GlyphName } from '../../components/glyphs'
import { WinButton, WinLink, WinSelect } from '../../components/win10'
import { FONT_SEMIBOLD, WIN } from '../../components/tokens'
import {
    ALLOW_FAIL,
    FIREWALL_MESSAGES,
    FULL_SCAN_PAUSES,
    GUARD_MESSAGES,
    QUARANTINE_FAIL,
    QUICK_SCAN_RESULTS,
    REMOVE_FAIL,
    RESTRICT_ACCESS_MESSAGES,
    THREATS,
    UPDATE_CHECK_FAIL,
    asideFor,
    escalate,
    pick,
    randomInt,
    scanMessage,
    type GuardKey,
    type Level,
    type PageId,
    type Severity,
} from './content'
import { useDefender } from './context'
import {
    Banner,
    LinkStack,
    Lines,
    PageHeader,
    PageLayout,
    Section,
    StatusIcon,
    levelColor,
} from './shared'

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */

const HOME_TILES: {
    page: PageId
    icon: GlyphName
    title: string
    status: string
    level: Level
}[] = [
    { page: 'virus', icon: 'shield', title: 'Virus & threat protection', status: `${THREATS.length} threats found. Action needed.`, level: 'error' },
    { page: 'account', icon: 'contact', title: 'Account protection', status: 'No action needed.', level: 'ok' },
    { page: 'firewall', icon: 'firewall', title: 'Firewall & network protection', status: 'Your firewall is turned off.', level: 'warn' },
    { page: 'app', icon: 'appBrowser', title: 'App & browser control', status: 'Potentially unwanted application detected.', level: 'warn' },
    { page: 'device', icon: 'laptop', title: 'Device security', status: 'View status and manage hardware security features', level: 'none' },
    { page: 'health', icon: 'heart', title: 'Device performance & health', status: 'Reports on the performance health of your device. Action recommended.', level: 'warn' },
    { page: 'family', icon: 'family', title: 'Family options', status: 'Manage how your family uses their devices.', level: 'none' },
]

export function HomePage() {
    const { navigate } = useDefender()

    return (
        <Box>
            <PageHeader
                title="Security at a glance"
                subtitle="See what’s happening with the security and health of your device and take any actions needed."
            />

            <Grid
                templateColumns="repeat(auto-fill, minmax(220px, 1fr))"
                gap="4px"
                maxWidth="900px"
            >
                {HOME_TILES.map(tile => (
                    <chakra.button
                        key={tile.page}
                        type="button"
                        display="flex"
                        flexDirection="column"
                        alignItems="flex-start"
                        textAlign="left"
                        minHeight="170px"
                        padding="20px"
                        border="2px solid transparent"
                        _hover={{ bg: WIN.hover }}
                        onClick={() => navigate(tile.page)}
                    >
                        <Box mb="16px">
                            <StatusIcon icon={tile.icon} size={40} level={tile.level} />
                        </Box>
                        <Text fontFamily={FONT_SEMIBOLD} fontSize="16px" mb="4px">
                            {tile.title}
                        </Text>
                        <Text fontSize="13px" color={WIN.secondary}>
                            {tile.status}
                        </Text>
                    </chakra.button>
                ))}
            </Grid>
        </Box>
    )
}

/* ------------------------------------------------------------------ */
/* Virus & threat protection                                           */
/* ------------------------------------------------------------------ */

export function VirusPage() {
    const { navigate, message } = useDefender()
    const [scan, setScan] = useState<'idle' | 'running'>('idle')
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(QUICK_SCAN_RESULTS[0])
    const [lastScan, setLastScan] = useState(() => new Date())

    useEffect(() => {
        if (scan !== 'running') return

        const id = window.setInterval(() => {
            setProgress(value => Math.min(100, value + 5))
        }, 300)

        return () => window.clearInterval(id)
    }, [scan])

    useEffect(() => {
        if (scan === 'running' && progress >= 100) {
            setScan('idle')
            setResult(pick(QUICK_SCAN_RESULTS))
            setLastScan(new Date())
        }
    }, [scan, progress])

    const lastScanText = useMemo(
        () =>
            `${lastScan.toLocaleDateString()} ${lastScan.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
            })} (quick scan)`,
        [lastScan],
    )

    const secondsLeft = Math.max(1, Math.round(((100 - progress) / 5) * 0.3))

    return (
        <PageLayout
            title="Virus & threat protection"
            subtitle="Protection for your device against threats."
            aside={asideFor('Virus & threat protection')}
        >
            <Section icon="shield" title="Current threats" level="error">
                {scan === 'running' ? (
                    <Box maxWidth="420px">
                        <Text fontSize="14px" mb="4px">
                            Quick scan running...
                        </Text>
                        <Text fontSize="13px" color={WIN.secondary} mb="10px">
                            Estimated time remaining: {secondsLeft} sec
                        </Text>
                        <div className="win-progress" role="progressbar" aria-valuenow={progress}>
                            <div style={{ width: `${progress}%` }} />
                        </div>
                        <Box mt="14px">
                            <WinButton onClick={() => setScan('idle')}>Cancel</WinButton>
                        </Box>
                    </Box>
                ) : (
                    <>
                        <Text fontSize="14px" mb="8px">
                            {result.threats} threats found.
                        </Text>
                        <Lines
                            lines={[
                                `Last scan: ${lastScanText}`,
                                `Items scanned: ${result.items.toLocaleString()}`,
                                `Reason: ${result.reason}`,
                            ]}
                        />
                        <Flex gap="8px" mb="14px" wrap="wrap">
                            <WinButton
                                primary
                                onClick={() => message(escalate('start-actions', QUARANTINE_FAIL))}
                            >
                                Start actions
                            </WinButton>
                            <WinButton
                                onClick={() => {
                                    setProgress(0)
                                    setScan('running')
                                }}
                            >
                                Quick scan
                            </WinButton>
                        </Flex>
                        <LinkStack
                            links={[
                                { label: 'See threat details', onClick: () => navigate('virus-threats') },
                                { label: 'Scan options', onClick: () => navigate('virus-options') },
                                { label: 'Allowed threats', onClick: () => navigate('virus-allowed') },
                                { label: 'Protection history', onClick: () => navigate('virus-history') },
                            ]}
                        />
                    </>
                )}
            </Section>

            <Section
                icon="settings"
                title="Virus & threat protection settings"
                status="No action needed."
                level="ok"
            >
                <LinkStack links={[{ label: 'Manage settings', onClick: () => navigate('virus-settings') }]} />
            </Section>

            <Section
                icon="sync"
                title="Virus & threat protection updates"
                status="Security intelligence updates are overdue."
                level="warn"
            >
                <LinkStack links={[{ label: 'Check for updates', onClick: () => navigate('virus-updates') }]} />
            </Section>

            <Section
                icon="lock"
                title="Ransomware protection"
                status="No action needed."
                level="ok"
            >
                <LinkStack
                    links={[
                        {
                            label: 'Manage ransomware protection',
                            onClick: () =>
                                message({
                                    headline: 'Ransomware protection cannot be configured.',
                                    detail: [
                                        'Ransomware has not contacted this computer yet.',
                                        'Please try again after it has.',
                                    ],
                                }),
                        },
                    ]}
                />
            </Section>
        </PageLayout>
    )
}

const SEVERITY_COLOR: Record<Severity, string> = {
    Low: WIN.secondary,
    Moderate: '#FFB900',
    High: '#FF8C3A',
    Severe: '#F1707B',
    Critical: '#F1707B',
}

export function ThreatsPage() {
    const { message } = useDefender()
    const [openId, setOpenId] = useState<string | null>(null)

    return (
        <PageLayout
            title="Current threats"
            subtitle={`${THREATS.length} threats need your attention.`}
            aside={asideFor('Virus & threat protection')}
        >
            <Box mb="20px">
                <WinButton
                    primary
                    onClick={() => message(escalate('start-actions', QUARANTINE_FAIL))}
                >
                    Start actions
                </WinButton>
            </Box>

            {THREATS.map(threat => {
                const open = openId === threat.id

                return (
                    <Box key={threat.id} borderBottom={`1px solid ${WIN.border}`}>
                        <chakra.button
                            type="button"
                            display="flex"
                            alignItems="center"
                            gap="12px"
                            width="100%"
                            textAlign="left"
                            py="12px"
                            px="4px"
                            _hover={{ bg: WIN.hoverLight }}
                            aria-expanded={open}
                            onClick={() => setOpenId(open ? null : threat.id)}
                        >
                            <Icon name="shield" size={20} color={levelColor('error')} />
                            <Box flex="1" minWidth="0">
                                <Text fontSize="14px" fontFamily={FONT_SEMIBOLD}>
                                    {threat.app}
                                </Text>
                                <Text fontSize="12px" color={WIN.secondary}>
                                    {threat.threatName}
                                </Text>
                            </Box>
                            <Text fontSize="13px" color={SEVERITY_COLOR[threat.severity]}>
                                {threat.severity}
                            </Text>
                        </chakra.button>

                        {open && (
                            <Box pl="36px" pb="16px">
                                <Text fontSize="13px" mb="6px">
                                    {threat.description}
                                </Text>
                                {threat.risk && (
                                    <Text fontSize="13px" color={WIN.secondary} mb="6px">
                                        Potential risk: {threat.risk}
                                    </Text>
                                )}
                                <Text fontSize="13px" color={WIN.secondary} mb="12px">
                                    Recommended action: {threat.action}
                                </Text>
                                <Flex gap="8px" wrap="wrap">
                                    <WinButton onClick={() => message(escalate('quarantine', QUARANTINE_FAIL))}>
                                        Quarantine
                                    </WinButton>
                                    <WinButton onClick={() => message(escalate('remove', REMOVE_FAIL))}>
                                        Remove
                                    </WinButton>
                                    <WinButton onClick={() => message(escalate('allow', ALLOW_FAIL))}>
                                        Allow on device
                                    </WinButton>
                                </Flex>
                            </Box>
                        )}
                    </Box>
                )
            })}
        </PageLayout>
    )
}

type ScanKind = 'quick' | 'full' | 'custom' | 'offline'

const SCAN_KINDS: { id: ScanKind; title: string; description: string }[] = [
    { id: 'quick', title: 'Quick scan', description: 'Checks folders in your system where threats are commonly found.' },
    { id: 'full', title: 'Full scan', description: 'Checks all files and running programs on your hard disk. This scan could take longer than one hour.' },
    { id: 'custom', title: 'Custom scan', description: 'Choose which files and locations you want to check.' },
    { id: 'offline', title: 'Microsoft Defender Offline scan', description: 'Some malicious software can be particularly difficult to remove from your device. Microsoft Defender Offline can help find and remove them using up-to-date threat definitions. This will restart your device and will take about 15 minutes.' },
]

export function ScanOptionsPage() {
    const { message } = useDefender()
    const [kind, setKind] = useState<ScanKind>('quick')
    const [run, setRun] = useState<'quick' | 'full' | null>(null)
    const [progress, setProgress] = useState(0)
    const [ticks, setTicks] = useState(0)
    const [pauseAt, setPauseAt] = useState(0)
    const [pausedReason, setPausedReason] = useState<string | null>(null)

    useEffect(() => {
        if (!run || pausedReason) return

        const id = window.setInterval(() => {
            setTicks(value => value + 1)
            setProgress(value =>
                run === 'quick'
                    ? Math.min(100, value + 4)
                    : Math.min(100, Number((value + 0.1).toFixed(1))),
            )
        }, 400)

        return () => window.clearInterval(id)
    }, [run, pausedReason])

    useEffect(() => {
        if (run === 'quick' && progress >= 100) {
            setRun(null)
            message(scanMessage(pick(QUICK_SCAN_RESULTS)))
        }

        // The full scan always gives up after a little while.
        if (run === 'full' && !pausedReason && ticks >= pauseAt) {
            setPausedReason(pick(FULL_SCAN_PAUSES))
        }
    }, [run, progress, ticks, pauseAt, pausedReason, message])

    const start = () => {
        if (kind === 'custom') {
            message({
                headline: 'Custom scan is unavailable.',
                detail: [
                    'Your computer is unable to choose a folder.',
                    'All folders are currently suspicious.',
                ],
            })
            return
        }

        if (kind === 'offline') {
            message({
                headline: 'Microsoft Defender Offline scan cannot start.',
                detail: [
                    'This scan requires a restart.',
                    'Restarts are not currently approved.',
                ],
            })
            return
        }

        setProgress(0)
        setTicks(0)
        setPausedReason(null)
        setPauseAt(randomInt(20, 35))
        setRun(kind)
    }

    const resume = () => {
        setPausedReason(null)
        setPauseAt(ticks + randomInt(15, 30))
    }

    return (
        <PageLayout
            title="Scan options"
            subtitle="Run a quick, full, custom, or Microsoft Defender Offline scan."
            aside={asideFor('scan options')}
        >
            {run ? (
                <Box maxWidth="460px">
                    {pausedReason ? (
                        <>
                            <Text fontFamily={FONT_SEMIBOLD} fontSize="16px" mb="4px">
                                Scan paused automatically.
                            </Text>
                            <Text fontSize="14px" color={WIN.secondary} mb="12px">
                                Reason: {pausedReason}
                            </Text>
                        </>
                    ) : run === 'full' ? (
                        <>
                            <Text fontFamily={FONT_SEMIBOLD} fontSize="16px" mb="4px">
                                Full scan started.
                            </Text>
                            <Text fontSize="14px" color={WIN.secondary} mb="4px">
                                Estimated completion: 47 hours.
                            </Text>
                            <Text fontSize="14px" color={WIN.secondary} mb="12px">
                                Reason: Your computer contains an unreasonable number of files.
                            </Text>
                        </>
                    ) : (
                        <Text fontSize="14px" mb="12px">
                            Quick scan running...
                        </Text>
                    )}

                    <Text fontSize="13px" mb="8px">
                        {progress}% complete
                    </Text>
                    <div className="win-progress" role="progressbar" aria-valuenow={progress}>
                        <div style={{ width: `${progress}%` }} />
                    </div>
                    <Flex gap="8px" mt="16px">
                        {pausedReason && <WinButton primary onClick={resume}>Resume</WinButton>}
                        <WinButton onClick={() => setRun(null)}>Cancel</WinButton>
                    </Flex>
                </Box>
            ) : (
                <>
                    {SCAN_KINDS.map(option => (
                        <chakra.label
                            key={option.id}
                            display="flex"
                            gap="12px"
                            alignItems="flex-start"
                            mb="18px"
                            cursor="pointer"
                        >
                            <input
                                type="radio"
                                name="scan-kind"
                                checked={kind === option.id}
                                onChange={() => setKind(option.id)}
                                style={{ marginTop: 4, accentColor: WIN.accent }}
                            />
                            <Box>
                                <Text fontFamily={FONT_SEMIBOLD} fontSize="14px">
                                    {option.title}
                                </Text>
                                <Text fontSize="13px" color={WIN.secondary}>
                                    {option.description}
                                </Text>
                            </Box>
                        </chakra.label>
                    ))}
                    <WinButton onClick={start}>Scan now</WinButton>
                </>
            )}
        </PageLayout>
    )
}

export function HistoryPage() {
    return (
        <PageLayout
            title="Protection history"
            subtitle="View the latest protection actions and recommendations from Windows Security."
            aside={asideFor('protection history')}
        >
            <Box mb="24px">
                <Text fontSize="14px" mb="6px">
                    Filters
                </Text>
                <WinSelect options={['All recent items', 'Quarantined threats', 'Removed threats', 'Allowed threats']} />
            </Box>
            <Text fontFamily={FONT_SEMIBOLD} fontSize="16px" mb="4px">
                No recent security events found.
            </Text>
            <Text fontSize="14px" color={WIN.secondary}>
                Note: This does not necessarily mean that nothing happened.
            </Text>
        </PageLayout>
    )
}

export function AllowedPage() {
    return (
        <PageLayout
            title="Allowed threats"
            subtitle="View the threats that you’ve allowed to run on your device."
            aside={asideFor('allowed threats')}
        >
            <Text fontFamily={FONT_SEMIBOLD} fontSize="16px" mb="4px">
                No allowed threats.
            </Text>
            <Text fontSize="14px" color={WIN.secondary}>
                Threats are not currently allowed to be allowed.
            </Text>
        </PageLayout>
    )
}

/* ------------------------------------------------------------------ */
/* Settings: the "you can't turn me off" gauntlet                      */
/* ------------------------------------------------------------------ */

function SettingBlock({
    title,
    description,
    children,
}: {
    title: string
    description: string
    children: React.ReactNode
}) {
    return (
        <Box mb="28px">
            <Text fontFamily={FONT_SEMIBOLD} fontSize="16px" mb="4px">
                {title}
            </Text>
            <Text fontSize="14px" color={WIN.secondary} mb="12px">
                {description}
            </Text>
            {children}
        </Box>
    )
}

/** Toggle that never moves: clicking shows the Nth message for this guard. */
function GuardedToggle({ guard, label }: { guard: GuardKey; label: string }) {
    const { message } = useDefender()

    return (
        <Flex align="center" gap="12px">
            <button
                type="button"
                role="switch"
                aria-checked
                aria-label={label}
                className="win-toggle on"
                onClick={() => message(escalate(`guard:${guard}`, GUARD_MESSAGES[guard]))}
            >
                <span className="win-toggle-knob" />
            </button>
            <Text fontSize="14px">On</Text>
        </Flex>
    )
}

/** Real-time protection: visibly turns off, then turns itself back on. */
function RealTimeToggle() {
    const { message } = useDefender()
    const [on, setOn] = useState(true)

    const flip = () => {
        if (!on) return

        setOn(false)
        const next = escalate('guard:rtp', GUARD_MESSAGES.rtp)

        window.setTimeout(() => {
            setOn(true)
            message(next)
        }, 1800)
    }

    return (
        <Flex align="center" gap="12px">
            <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label="Real-time protection"
                className={`win-toggle${on ? ' on' : ''}`}
                onClick={flip}
            >
                <span className="win-toggle-knob" />
            </button>
            <Text fontSize="14px">{on ? 'On' : 'Off'}</Text>
        </Flex>
    )
}

export function VirusSettingsPage() {
    const { message } = useDefender()

    return (
        <PageLayout
            title="Virus & threat protection settings"
            subtitle="View and update Windows Security settings for your device."
            aside={asideFor('virus & threat protection settings')}
        >
            <SettingBlock
                title="Real-time protection"
                description="Locates and stops malware from installing or running on your device. You can turn off this setting for a short time before it turns back on automatically."
            >
                <RealTimeToggle />
            </SettingBlock>

            <SettingBlock
                title="Cloud-delivered protection"
                description="Provides increased and faster protection with access to the latest protection data in the cloud."
            >
                <GuardedToggle guard="cloud" label="Cloud-delivered protection" />
            </SettingBlock>

            <SettingBlock
                title="Automatic sample submission"
                description="Send sample files to Microsoft to help protect you and others from potential threats."
            >
                <GuardedToggle guard="samples" label="Automatic sample submission" />
            </SettingBlock>

            <SettingBlock
                title="Tamper Protection"
                description="Prevents others from tampering with important security features."
            >
                <GuardedToggle guard="tamper" label="Tamper Protection" />
            </SettingBlock>

            <SettingBlock
                title="Exclusions"
                description="Microsoft Defender Antivirus won’t scan items that have been excluded."
            >
                <WinLink
                    onClick={() =>
                        message(escalate('guard:exclusions', GUARD_MESSAGES.exclusions))
                    }
                >
                    Add or remove exclusions
                </WinLink>
            </SettingBlock>
        </PageLayout>
    )
}

export function UpdatesPage() {
    const { message } = useDefender()
    const [checking, setChecking] = useState(false)

    const check = () => {
        if (checking) return

        setChecking(true)
        window.setTimeout(() => {
            setChecking(false)
            message(escalate('update-check', UPDATE_CHECK_FAIL))
        }, 3000)
    }

    return (
        <PageLayout
            title="Protection updates"
            subtitle="View information about your security intelligence updates."
            aside={asideFor('protection updates')}
        >
            <Section
                icon="sync"
                title="Security intelligence"
                level="warn"
                status="Security intelligence updates are overdue."
            >
                <Lines
                    lines={[
                        'Security intelligence version: 1.000.0.0',
                        'Last successful update: Never.',
                        'Next scheduled update: To be determined.',
                    ]}
                />
                {checking ? (
                    <Box maxWidth="320px">
                        <Text fontSize="13px" mb="8px">
                            Checking for updates...
                        </Text>
                        <div className="win-progress">
                            <div style={{ width: '40%' }} />
                        </div>
                    </Box>
                ) : (
                    <WinButton onClick={check}>Check for updates</WinButton>
                )}
            </Section>
        </PageLayout>
    )
}

/* ------------------------------------------------------------------ */
/* Other areas                                                         */
/* ------------------------------------------------------------------ */

export function AccountPage() {
    const { message } = useDefender()

    return (
        <PageLayout
            title="Account protection"
            subtitle="Security information for your account."
            aside={asideFor('account protection')}
        >
            <Section
                icon="contact"
                title="Microsoft account"
                level="ok"
                status="Sign in with your Microsoft account to get additional security features such as Dynamic lock and Find my device."
            >
                <LinkStack
                    links={[
                        {
                            label: 'Sign in',
                            onClick: () =>
                                message({
                                    headline: 'Sign-in is unavailable.',
                                    detail: ['Your computer already knows who you are.'],
                                }),
                        },
                    ]}
                />
            </Section>
            <Section
                icon="lock"
                title="Windows Hello"
                level="ok"
                status="Use fingerprint or face recognition to sign in to your device. Windows Hello isn’t available on this device."
            />
            <Section
                icon="key"
                title="Dynamic lock"
                level="ok"
                status="Automatically lock your device when you’re away."
            />
        </PageLayout>
    )
}

export function FirewallPage() {
    const { message } = useDefender()

    const profiles = [
        'Domain network',
        'Private network',
        'Public network (active)',
    ]

    return (
        <PageLayout
            title="Firewall & network protection"
            subtitle="Who and what can access your networks."
            aside={asideFor('firewall & network protection')}
        >
            <Banner>This feature is managed by your system administrator.</Banner>

            <Section
                icon="firewall"
                title="Firewall disabled"
                level="warn"
                status="Your firewall is currently disabled. Your computer is exposed to potentially hostile network traffic."
            >
                <Text fontSize="13px" color={WIN.secondary}>
                    Recommended action: Enable firewall protection.
                </Text>
            </Section>

            {profiles.map(profile => (
                <Flex key={profile} align="center" gap="16px" py="10px">
                    <StatusIcon icon="firewall" size={28} level="warn" />
                    <Box flex="1">
                        <Text fontSize="14px" fontFamily={FONT_SEMIBOLD}>
                            {profile}
                        </Text>
                        <Text fontSize="12px" color={WIN.secondary}>
                            Firewall is off.
                        </Text>
                    </Box>
                    <WinButton onClick={() => message(escalate('firewall', FIREWALL_MESSAGES))}>
                        Turn on
                    </WinButton>
                </Flex>
            ))}

            <Box mt="24px">
                <LinkStack
                    links={[
                        'Allow an app through firewall',
                        'Network and Internet troubleshooter',
                        'Firewall notification settings',
                        'Advanced settings',
                        'Restore firewalls to default',
                    ].map(label => ({ label }))}
                />
            </Box>
        </PageLayout>
    )
}

export function AppBrowserPage() {
    const { message } = useDefender()

    return (
        <PageLayout
            title="App & browser control"
            subtitle="Update settings for Microsoft Defender SmartScreen to help protect your device from potentially dangerous apps, files, sites, and downloads."
            aside={asideFor('App & browser control')}
        >
            <Section
                icon="appBrowser"
                title="Potentially unwanted application detected"
                level="warn"
            >
                <Lines
                    lines={[
                        'Application detected: Windows Settings',
                        'Classification: Unnecessary system utility.',
                        'Recommended action: Consider restricting access.',
                    ]}
                />
                <WinButton onClick={() => message(escalate('restrict-access', RESTRICT_ACCESS_MESSAGES))}>
                    Restrict access
                </WinButton>
            </Section>

            <Section
                icon="appBrowser"
                title="Reputation-based protection"
                level="ok"
                status="These settings protect your device from malicious or potentially unwanted apps, files, and websites."
            />
            <Section
                icon="laptop"
                title="Isolated browsing"
                status="Microsoft Defender Application Guard opens untrusted sites in a lightweight virtual container so your device stays protected."
            />
            <Section
                icon="shield"
                title="Exploit protection"
                status="Exploit protection is built into Windows 10 to help protect your device against attacks."
            />
        </PageLayout>
    )
}

export function DeviceSecurityPage() {
    return (
        <PageLayout
            title="Device security"
            subtitle="Security that comes built into your device."
            aside={asideFor('device security')}
        >
            <Section
                icon="laptop"
                title="Core isolation"
                status="Virtualization-based security protects the core parts of your device."
            />
            <Section
                icon="shield"
                title="Security processor"
                status="Your security processor, called the trusted platform module (TPM), provides additional encryption for your device."
            />
            <Section
                icon="lock"
                title="Secure boot"
                level="ok"
                status="Secure boot is on, preventing malicious software from loading when your device starts up."
            />
            <Section
                icon="completed"
                title="Hardware security"
                level="ok"
                status="Your device meets the requirements for standard hardware security."
            />
        </PageLayout>
    )
}

export function HealthPage() {
    const checks: { name: string; note?: string; level: Level }[] = [
        { name: 'Windows Time service', note: 'Accuracy is not guaranteed.', level: 'warn' },
        { name: 'Capacity', level: 'ok' },
        { name: 'Device driver', note: 'HP LaserJet has been classified as a threat.', level: 'warn' },
        { name: 'Apps and software', note: 'Calculator, Notepad and others require review.', level: 'error' },
        { name: 'Battery life', level: 'ok' },
    ]

    return (
        <PageLayout
            title="Device performance & health"
            subtitle="View info about the performance health of your device."
            aside={asideFor('device performance & health')}
        >
            <Section icon="heart" title="Health report">
                <Text fontSize="13px" color={WIN.secondary} mb="12px">
                    Last scan: {new Date().toLocaleDateString()}
                </Text>
                {checks.map(check => (
                    <Flex key={check.name} align="center" gap="12px" py="6px">
                        <StatusIcon icon="completed" size={20} level={check.level} />
                        <Box>
                            <Text fontSize="14px">{check.name}</Text>
                            {check.note && (
                                <Text fontSize="12px" color={WIN.secondary}>
                                    {check.note}
                                </Text>
                            )}
                        </Box>
                    </Flex>
                ))}
            </Section>
        </PageLayout>
    )
}

export function FamilyPage() {
    return (
        <PageLayout
            title="Family options"
            subtitle="Get what you need to simplify your family’s digital life."
            aside={asideFor('family options')}
        >
            <Section
                icon="family"
                title="Keep your family safer"
                status="Choose what your kids see online, limit screen time, and get activity reports."
            />
            <Section
                icon="laptop"
                title="See your family’s devices"
                status="Check the health and safety of your family’s Windows 10 devices."
            />
        </PageLayout>
    )
}

export function SettingsPage() {
    return (
        <PageLayout title="Settings" subtitle="Manage Windows Security.">
            <Section icon="shield" title="Manage providers" />
            <Section icon="notifications" title="Notifications" />
            <Section icon="settings" title="Update protection" />
            <Section icon="info" title="About">
                <Lines lines={['Windows Security', 'Version 1000.19042.1001.0']} />
            </Section>
        </PageLayout>
    )
}
