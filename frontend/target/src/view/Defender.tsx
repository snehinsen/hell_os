import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Box, Flex, Grid, Text, chakra } from '@chakra-ui/react'
import { Icon } from '../components/Icon'
import type { GlyphName } from '../components/glyphs'
import { WinButton, WinLink } from '../components/win10'
import { FONT_LIGHT, FONT_SEMIBOLD, FONT_UI, WIN } from '../components/tokens'
import '../components/win10.css'
import './defender.css'

/* ------------------------------------------------------------------ */
/* Navigation model — mirrors the real Windows Security left rail      */
/* ------------------------------------------------------------------ */

type PageId =
    | 'home'
    | 'virus'
    | 'account'
    | 'firewall'
    | 'app'
    | 'device'
    | 'health'
    | 'family'
    | 'settings'

interface NavItem {
    id: PageId
    title: string
    icon: GlyphName
}

const NAV_ITEMS: NavItem[] = [
    { id: 'home', title: 'Home', icon: 'home' },
    { id: 'virus', title: 'Virus & threat protection', icon: 'shield' },
    { id: 'account', title: 'Account protection', icon: 'contact' },
    { id: 'firewall', title: 'Firewall & network protection', icon: 'firewall' },
    { id: 'app', title: 'App & browser control', icon: 'appBrowser' },
    { id: 'device', title: 'Device security', icon: 'laptop' },
    { id: 'health', title: 'Device performance & health', icon: 'heart' },
    { id: 'family', title: 'Family options', icon: 'family' },
]

const SETTINGS_ITEM: NavItem = { id: 'settings', title: 'Settings', icon: 'settings' }

const RAIL_BG = '#E6E6E6'
const CONTENT_BG = '#F3F3F3'

/* ------------------------------------------------------------------ */
/* Shared building blocks                                              */
/* ------------------------------------------------------------------ */

function StatusIcon({
    icon,
    size = 36,
    color = WIN.green,
    badge = true,
}: {
    icon: GlyphName
    size?: number
    color?: string
    badge?: boolean
}) {
    const badgeSize = Math.round(size * 0.45)

    return (
        <Box position="relative" width={`${size}px`} height={`${size}px`} flexShrink={0}>
            <Icon name={icon} size={size} color={color} />
            {badge && (
                <Flex
                    position="absolute"
                    right="-3px"
                    bottom="-3px"
                    width={`${badgeSize}px`}
                    height={`${badgeSize}px`}
                    borderRadius="50%"
                    bg={color}
                    border={`2px solid ${CONTENT_BG}`}
                    align="center"
                    justify="center"
                >
                    <Icon name="check" size={Math.round(badgeSize * 0.6)} color="#FFFFFF" />
                </Flex>
            )}
        </Box>
    )
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <Box mb="24px">
            <Text as="h1" fontFamily={FONT_LIGHT} fontSize="28px" lineHeight="1.2" mb="8px">
                {title}
            </Text>
            <Text fontSize="14px">{subtitle}</Text>
        </Box>
    )
}

/** One section of a Windows Security page: icon + heading, status text, links. */
function Section({
    icon,
    title,
    status,
    children,
}: {
    icon: GlyphName
    title: string
    status?: string
    children?: ReactNode
}) {
    return (
        <Box mb="28px">
            <Flex align="center" gap="12px" mb="8px">
                <Icon name={icon} size={20} />
                <Text fontFamily={FONT_SEMIBOLD} fontSize="16px">
                    {title}
                </Text>
            </Flex>
            <Box pl="32px">
                {status && (
                    <Text fontSize="14px" color={WIN.secondary} mb="8px">
                        {status}
                    </Text>
                )}
                {children}
            </Box>
        </Box>
    )
}

function LinkStack({ links }: { links: string[] }) {
    return (
        <Flex direction="column" align="flex-start" gap="6px">
            {links.map(link => (
                <WinLink key={link}>{link}</WinLink>
            ))}
        </Flex>
    )
}

/** A "Domain network / Private network" style status row. */
function StatusRow({
    icon,
    title,
    status,
}: {
    icon: GlyphName
    title: string
    status: string
}) {
    return (
        <Flex align="center" gap="16px" py="10px">
            <StatusIcon icon={icon} size={28} />
            <Box>
                <Text fontSize="14px" fontFamily={FONT_SEMIBOLD}>
                    {title}
                </Text>
                <Text fontSize="12px" color={WIN.secondary}>
                    {status}
                </Text>
            </Box>
        </Flex>
    )
}

interface AsideGroup {
    heading: string
    text?: string
    links: string[]
}

function Aside({ groups }: { groups: AsideGroup[] }) {
    return (
        <Box width="260px" flexShrink={0}>
            {groups.map(group => (
                <Box key={group.heading} mb="24px">
                    <Text fontFamily={FONT_SEMIBOLD} fontSize="14px" mb="6px">
                        {group.heading}
                    </Text>
                    {group.text && (
                        <Text fontSize="13px" mb="6px">
                            {group.text}
                        </Text>
                    )}
                    <LinkStack links={group.links} />
                </Box>
            ))}
        </Box>
    )
}

const PRIVACY_ASIDE: AsideGroup = {
    heading: 'Change your privacy settings',
    text: 'View and change privacy settings for your Windows 10 device.',
    links: ['Privacy settings', 'Privacy dashboard', 'Privacy Statement'],
}

function withAside(topic: string): AsideGroup[] {
    return [
        {
            heading: 'Windows Community videos',
            links: [`Learn more about ${topic}`],
        },
        { heading: 'Have a question?', links: ['Get help'] },
        { heading: 'Who’s protecting me?', links: ['Manage providers'] },
        { heading: 'Help improve Windows Security', links: ['Give us feedback'] },
        PRIVACY_ASIDE,
    ]
}

function PageLayout({
    title,
    subtitle,
    aside,
    children,
}: {
    title: string
    subtitle: string
    aside?: AsideGroup[]
    children: ReactNode
}) {
    return (
        <Flex gap="48px" align="flex-start" wrap="wrap">
            <Box flex="1" minWidth="340px" maxWidth="640px">
                <PageHeader title={title} subtitle={subtitle} />
                {children}
            </Box>
            {aside && <Aside groups={aside} />}
        </Flex>
    )
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

function HomePage({ onOpen }: { onOpen: (page: PageId) => void }) {
    const tiles: { page: PageId; icon: GlyphName; title: string; status: string }[] = [
        { page: 'virus', icon: 'shield', title: 'Virus & threat protection', status: 'No action needed.' },
        { page: 'account', icon: 'contact', title: 'Account protection', status: 'No action needed.' },
        { page: 'firewall', icon: 'firewall', title: 'Firewall & network protection', status: 'No action needed.' },
        { page: 'app', icon: 'appBrowser', title: 'App & browser control', status: 'No action needed.' },
        { page: 'device', icon: 'laptop', title: 'Device security', status: 'View status and manage hardware security features' },
        { page: 'health', icon: 'heart', title: 'Device performance & health', status: 'No action needed.' },
        { page: 'family', icon: 'family', title: 'Family options', status: 'Manage how your family uses their devices.' },
    ]

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
                {tiles.map(tile => {
                    const needsNoBadge =
                        tile.page === 'device' || tile.page === 'family'

                    return (
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
                            _hover={{ bg: '#E6E6E6' }}
                            onClick={() => onOpen(tile.page)}
                        >
                            <Box mb="16px">
                                <StatusIcon icon={tile.icon} size={40} badge={!needsNoBadge} />
                            </Box>
                            <Text fontFamily={FONT_SEMIBOLD} fontSize="16px" mb="4px">
                                {tile.title}
                            </Text>
                            <Text fontSize="13px" color={WIN.secondary}>
                                {tile.status}
                            </Text>
                        </chakra.button>
                    )
                })}
            </Grid>
        </Box>
    )
}

function VirusPage() {
    const [scan, setScan] = useState<'idle' | 'running'>('idle')
    const [progress, setProgress] = useState(0)
    const [filesScanned, setFilesScanned] = useState(31204)
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
            setFilesScanned(30000 + Math.floor(Math.random() * 4000))
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
            aside={withAside('Virus & threat protection')}
        >
            <Section icon="shield" title="Current threats">
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
                        <Text fontSize="14px" mb="4px">
                            No current threats.
                        </Text>
                        <Text fontSize="13px" color={WIN.secondary}>
                            Last scan: {lastScanText}
                        </Text>
                        <Text fontSize="13px" color={WIN.secondary}>
                            0 threats found.
                        </Text>
                        <Text fontSize="13px" color={WIN.secondary}>
                            Scan lasted 2 minutes 14 seconds
                        </Text>
                        <Text fontSize="13px" color={WIN.secondary} mb="14px">
                            {filesScanned.toLocaleString()} files scanned
                        </Text>
                        <Box mb="14px">
                            <WinButton
                                onClick={() => {
                                    setProgress(0)
                                    setScan('running')
                                }}
                            >
                                Quick scan
                            </WinButton>
                        </Box>
                        <LinkStack
                            links={['Scan options', 'Allowed threats', 'Protection history']}
                        />
                    </>
                )}
            </Section>

            <Section
                icon="settings"
                title="Virus & threat protection settings"
                status="No action needed."
            >
                <WinLink>Manage settings</WinLink>
            </Section>

            <Section
                icon="sync"
                title="Virus & threat protection updates"
                status="Security intelligence is up to date."
            >
                <Text fontSize="13px" color={WIN.secondary} mb="8px">
                    Last update: {new Date().toLocaleDateString()}
                </Text>
                <WinLink>Check for updates</WinLink>
            </Section>

            <Section
                icon="lock"
                title="Ransomware protection"
                status="No action needed."
            >
                <WinLink>Manage ransomware protection</WinLink>
            </Section>
        </PageLayout>
    )
}

function AccountPage() {
    return (
        <PageLayout
            title="Account protection"
            subtitle="Security information for your account."
            aside={withAside('Account protection')}
        >
            <Section
                icon="contact"
                title="Microsoft account"
                status="Sign in with your Microsoft account to get additional security features such as Dynamic lock and Find my device."
            >
                <WinLink>Sign in</WinLink>
            </Section>
            <Section
                icon="lock"
                title="Windows Hello"
                status="Use fingerprint or face recognition to sign in to your device. Windows Hello isn’t available on this device."
            >
                <WinLink>Learn more</WinLink>
            </Section>
            <Section
                icon="key"
                title="Dynamic lock"
                status="Automatically lock your device when you’re away."
            >
                <WinLink>Change Dynamic lock settings</WinLink>
            </Section>
        </PageLayout>
    )
}

function FirewallPage() {
    return (
        <PageLayout
            title="Firewall & network protection"
            subtitle="Who and what can access your networks."
            aside={withAside('Firewall & network protection')}
        >
            <StatusRow icon="firewall" title="Domain network" status="Firewall is on." />
            <StatusRow icon="firewall" title="Private network" status="Firewall is on." />
            <StatusRow icon="firewall" title="Public network (active)" status="Firewall is on." />
            <Box mt="24px">
                <LinkStack
                    links={[
                        'Allow an app through firewall',
                        'Network and Internet troubleshooter',
                        'Firewall notification settings',
                        'Advanced settings',
                        'Restore firewalls to default',
                    ]}
                />
            </Box>
        </PageLayout>
    )
}

function AppBrowserPage() {
    return (
        <PageLayout
            title="App & browser control"
            subtitle="Update settings for Microsoft Defender SmartScreen to help protect your device from potentially dangerous apps, files, sites, and downloads."
            aside={withAside('App & browser control')}
        >
            <Section
                icon="appBrowser"
                title="Reputation-based protection"
                status="These settings protect your device from malicious or potentially unwanted apps, files, and websites."
            >
                <WinLink>Reputation-based protection settings</WinLink>
            </Section>
            <Section
                icon="laptop"
                title="Isolated browsing"
                status="Microsoft Defender Application Guard opens untrusted sites in a lightweight virtual container so your device stays protected."
            >
                <WinLink>Install Microsoft Defender Application Guard</WinLink>
            </Section>
            <Section
                icon="shield"
                title="Exploit protection"
                status="Exploit protection is built into Windows 10 to help protect your device against attacks."
            >
                <WinLink>Exploit protection settings</WinLink>
            </Section>
        </PageLayout>
    )
}

function DeviceSecurityPage() {
    return (
        <PageLayout
            title="Device security"
            subtitle="Security that comes built into your device."
            aside={withAside('Device security')}
        >
            <Section
                icon="laptop"
                title="Core isolation"
                status="Virtualization-based security protects the core parts of your device."
            >
                <WinLink>Core isolation details</WinLink>
            </Section>
            <Section
                icon="shield"
                title="Security processor"
                status="Your security processor, called the trusted platform module (TPM), provides additional encryption for your device."
            >
                <WinLink>Security processor details</WinLink>
            </Section>
            <Section
                icon="lock"
                title="Secure boot"
                status="Secure boot is on, preventing malicious software from loading when your device starts up."
            />
            <Section
                icon="completed"
                title="Hardware security"
                status="Your device meets the requirements for standard hardware security."
            >
                <WinLink>Learn more</WinLink>
            </Section>
        </PageLayout>
    )
}

function HealthPage() {
    const checks = [
        'Windows Time service',
        'Capacity',
        'Device driver',
        'Apps and software',
        'Battery life',
    ]

    return (
        <PageLayout
            title="Device performance & health"
            subtitle="View info about the performance health of your device."
            aside={withAside('Device performance & health')}
        >
            <Section icon="heart" title="Health report">
                <Text fontSize="13px" color={WIN.secondary} mb="12px">
                    Last scan: {new Date().toLocaleDateString()}
                </Text>
                {checks.map(check => (
                    <Flex key={check} align="center" gap="12px" py="6px">
                        <StatusIcon icon="completed" size={20} badge={false} />
                        <Text fontSize="14px">{check}</Text>
                    </Flex>
                ))}
            </Section>
            <Section icon="sync" title="Fresh start">
                <Text fontSize="13px" color={WIN.secondary} mb="8px">
                    Start fresh with a clean and updated installation of Windows.
                </Text>
                <WinLink>Additional info</WinLink>
            </Section>
        </PageLayout>
    )
}

function FamilyPage() {
    return (
        <PageLayout
            title="Family options"
            subtitle="Get what you need to simplify your family’s digital life."
            aside={withAside('Family options')}
        >
            <Section
                icon="family"
                title="Keep your family safer"
                status="Choose what your kids see online, limit screen time, and get activity reports."
            >
                <WinLink>View family settings</WinLink>
            </Section>
            <Section
                icon="laptop"
                title="See your family’s devices"
                status="Check the health and safety of your family’s Windows 10 devices."
            >
                <WinLink>View devices</WinLink>
            </Section>
        </PageLayout>
    )
}

function SettingsPage() {
    return (
        <PageLayout title="Settings" subtitle="Manage Windows Security.">
            <Section icon="shield" title="Manage providers">
                <WinLink>Manage providers</WinLink>
            </Section>
            <Section icon="notifications" title="Notifications">
                <WinLink>Manage notifications</WinLink>
            </Section>
            <Section icon="settings" title="Update protection">
                <WinLink>Check for updates</WinLink>
            </Section>
            <Section icon="info" title="About">
                <Text fontSize="13px" color={WIN.secondary}>
                    Windows Security
                </Text>
                <Text fontSize="13px" color={WIN.secondary}>
                    Version 1000.19042.1001.0
                </Text>
            </Section>
        </PageLayout>
    )
}

/* ------------------------------------------------------------------ */
/* Window                                                              */
/* ------------------------------------------------------------------ */

function NavButton({
    item,
    selected,
    expanded,
    onClick,
}: {
    item: NavItem
    selected: boolean
    expanded: boolean
    onClick: () => void
}) {
    return (
        <chakra.button
            type="button"
            position="relative"
            display="flex"
            alignItems="center"
            height="44px"
            width="100%"
            textAlign="left"
            bg={selected ? '#D6D6D6' : 'transparent'}
            _hover={{ bg: selected ? '#D6D6D6' : '#DADADA' }}
            title={item.title}
            aria-current={selected ? 'page' : undefined}
            onClick={onClick}
        >
            {selected && (
                <Box
                    position="absolute"
                    left="0"
                    top="8px"
                    bottom="8px"
                    width="4px"
                    bg={WIN.accent}
                />
            )}
            <Flex width="48px" flexShrink={0} align="center" justify="center">
                <Icon name={item.icon} size={18} />
            </Flex>
            {expanded && (
                <Text fontSize="14px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                    {item.title}
                </Text>
            )}
        </chakra.button>
    )
}

export function Defender() {
    const [page, setPage] = useState<PageId>('home')
    const [expanded, setExpanded] = useState(true)

    const content = (() => {
        switch (page) {
            case 'virus':
                return <VirusPage />
            case 'account':
                return <AccountPage />
            case 'firewall':
                return <FirewallPage />
            case 'app':
                return <AppBrowserPage />
            case 'device':
                return <DeviceSecurityPage />
            case 'health':
                return <HealthPage />
            case 'family':
                return <FamilyPage />
            case 'settings':
                return <SettingsPage />
            default:
                return <HomePage onOpen={setPage} />
        }
    })()

    return (
        <Flex
            className="win-light"
            height="100vh"
            overflow="hidden"
            bg={CONTENT_BG}
            color="#000000"
            fontFamily={FONT_UI}
        >
            {/* Left navigation rail */}
            <Flex
                as="nav"
                direction="column"
                justify="space-between"
                width={expanded ? '260px' : '48px'}
                flexShrink={0}
                bg={RAIL_BG}
                transition="width 150ms ease"
                overflow="hidden"
            >
                <Box>
                    <chakra.button
                        type="button"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width="48px"
                        height="44px"
                        aria-label="Toggle navigation"
                        _hover={{ bg: '#DADADA' }}
                        onClick={() => setExpanded(value => !value)}
                    >
                        <Icon name="hamburger" size={18} />
                    </chakra.button>

                    <Box mt="4px">
                        {NAV_ITEMS.map(item => (
                            <NavButton
                                key={item.id}
                                item={item}
                                selected={page === item.id}
                                expanded={expanded}
                                onClick={() => setPage(item.id)}
                            />
                        ))}
                    </Box>
                </Box>

                <NavButton
                    item={SETTINGS_ITEM}
                    selected={page === 'settings'}
                    expanded={expanded}
                    onClick={() => setPage('settings')}
                />
            </Flex>

            {/* Page content */}
            <Box flex="1" minWidth="0" overflowY="auto" px="40px" py="28px">
                {content}
            </Box>
        </Flex>
    )
}
