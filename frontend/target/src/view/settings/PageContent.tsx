import { useMemo, type ReactNode } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Icon } from '../../components/Icon'
import {
    SectionTitle,
    SettingRow,
    WinButton,
    WinLink,
    WinSelect,
    WinToggle,
} from '../../components/win10'
import { FONT_LIGHT, FONT_SEMIBOLD, WIN } from '../../components/tokens'
import { findPage } from './data'

/* ------------------------------------------------------------------ */
/* Layout helpers                                                      */
/* ------------------------------------------------------------------ */

function PageTitle({ children }: { children: ReactNode }) {
    return (
        <Text
            as="h1"
            fontFamily={FONT_LIGHT}
            fontSize="28px"
            lineHeight="1.2"
            mb="24px"
        >
            {children}
        </Text>
    )
}

interface AsideGroup {
    heading: string
    text?: string
    links: string[]
}

/** Right-hand "Have a question? / Related links" column found on most Win10 pages. */
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

const HELP_GROUP: AsideGroup[] = [
    { heading: 'Have a question?', links: ['Get help'] },
    { heading: 'Make Windows better', links: ['Give us feedback'] },
]

function TwoColumn({
    children,
    aside = HELP_GROUP,
}: {
    children: ReactNode
    aside?: AsideGroup[]
}) {
    return (
        <Flex gap="48px" align="flex-start" wrap="wrap">
            <Box flex="1" minWidth="320px" maxWidth="640px">
                {children}
            </Box>
            <Aside groups={aside} />
        </Flex>
    )
}

function KeyValue({ label, value }: { label: string; value: string }) {
    return (
        <Box mb="14px">
            <Text fontFamily={FONT_SEMIBOLD} fontSize="14px">
                {label}
            </Text>
            <Text fontSize="14px">{value}</Text>
        </Box>
    )
}

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

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

function WindowsUpdatePage() {
    const lastChecked = useMemo(
        () =>
            new Date().toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
            }),
        [],
    )

    return (
        <TwoColumn
            aside={[
                {
                    heading: 'Looking for info on the latest updates?',
                    links: ['Learn more'],
                },
                {
                    heading: 'Related links',
                    links: ['Check Storage', 'OS build info'],
                },
                ...HELP_GROUP,
            ]}
        >
            <Flex align="center" gap="16px" mb="20px">
                <Icon name="completed" size={48} color={WIN.green} />
                <Box>
                    <Text fontFamily={FONT_SEMIBOLD} fontSize="20px">
                        You&rsquo;re up to date
                    </Text>
                    <Text fontSize="14px" color={WIN.secondary}>
                        Last checked: Today, {lastChecked}
                    </Text>
                </Box>
            </Flex>

            <WinButton>Check for updates</WinButton>

            <Box mt="32px">
                <SettingRow
                    icon="pause"
                    title="Pause updates for 7 days"
                    description="Visit Advanced options to change the pause period"
                    onClick={() => undefined}
                />
                <SettingRow
                    icon="clock"
                    title="Change active hours"
                    description="Currently 8:00 AM to 5:00 PM"
                    onClick={() => undefined}
                />
                <SettingRow
                    icon="history"
                    title="View update history"
                    description="See updates installed on your device"
                    onClick={() => undefined}
                />
                <SettingRow
                    icon="settings"
                    title="Advanced options"
                    description="Additional update controls and settings"
                    onClick={() => undefined}
                />
            </Box>
        </TwoColumn>
    )
}

function WindowsSecurityPage() {
    const areas: { icon: Parameters<typeof Icon>[0]['name']; title: string }[] = [
        { icon: 'shield', title: 'Virus & threat protection' },
        { icon: 'contact', title: 'Account protection' },
        { icon: 'firewall', title: 'Firewall & network protection' },
        { icon: 'appBrowser', title: 'App & browser control' },
        { icon: 'laptop', title: 'Device security' },
        { icon: 'heart', title: 'Device performance & health' },
        { icon: 'family', title: 'Family options' },
    ]

    return (
        <TwoColumn aside={HELP_GROUP}>
            <Text fontSize="14px" mb="16px">
                Windows Security is your home to view and manage the security and
                health of your device.
            </Text>
            <WinButton>Open Windows Security</WinButton>

            <SectionTitle>Protection areas</SectionTitle>
            {areas.map(area => (
                <Flex key={area.title} align="center" gap="16px" py="10px">
                    <Box position="relative">
                        <Icon name={area.icon} size={24} color={WIN.green} />
                    </Box>
                    <Box>
                        <Text fontSize="14px">{area.title}</Text>
                        <Text fontSize="12px" color={WIN.secondary}>
                            No action needed.
                        </Text>
                    </Box>
                </Flex>
            ))}
        </TwoColumn>
    )
}

function RecoveryPage() {
    return (
        <TwoColumn
            aside={[
                { heading: 'Help from the web', links: ['Creating a recovery drive'] },
                ...HELP_GROUP,
            ]}
        >
            <SectionTitle>Reset this PC</SectionTitle>
            <Text fontSize="14px" mb="16px">
                If your PC isn&rsquo;t running well, resetting it might help. This
                lets you choose to keep your personal files or remove them, and
                then reinstalls Windows.
            </Text>
            <WinButton>Get started</WinButton>

            <SectionTitle>Advanced startup</SectionTitle>
            <Text fontSize="14px" mb="16px">
                Start up from a device or disc (such as a USB drive or DVD),
                change Windows startup settings, or restore Windows from a
                system image. This will restart your PC.
            </Text>
            <WinButton>Restart now</WinButton>

            <SectionTitle>More recovery options</SectionTitle>
            <WinLink>Learn how to start fresh with a clean installation of Windows</WinLink>
        </TwoColumn>
    )
}

function DisplayPage() {
    return (
        <TwoColumn
            aside={[
                {
                    heading: 'Related settings',
                    links: ['Advanced display settings', 'Graphics settings'],
                },
                {
                    heading: 'Sleep better',
                    text: 'Night light can help you get to sleep by displaying warmer colours at night.',
                    links: ['Set up Night light'],
                },
                ...HELP_GROUP,
            ]}
        >
            <SectionTitle>Brightness and colour</SectionTitle>
            <Labeled label="Change brightness for the built-in display">
                <input
                    className="win-range"
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={70}
                    aria-label="Brightness"
                />
            </Labeled>
            <Labeled label="Night light">
                <WinToggle label="Night light" />
            </Labeled>
            <WinLink>Night light settings</WinLink>

            <SectionTitle>Scale and layout</SectionTitle>
            <Text fontSize="12px" color={WIN.secondary} mb="6px">
                Change the size of text, apps, and other items
            </Text>
            <WinSelect options={['100% (Recommended)', '125%', '150%', '175%']} />
            <Box mt="12px" mb="20px">
                <WinLink>Advanced scaling settings</WinLink>
            </Box>
            <Labeled label="Display resolution">
                <WinSelect
                    options={[
                        '1920 \u00D7 1080 (Recommended)',
                        '1680 \u00D7 1050',
                        '1600 \u00D7 900',
                        '1366 \u00D7 768',
                        '1280 \u00D7 720',
                    ]}
                />
            </Labeled>
            <Labeled label="Display orientation">
                <WinSelect options={['Landscape', 'Portrait', 'Landscape (flipped)', 'Portrait (flipped)']} />
            </Labeled>
        </TwoColumn>
    )
}

function AboutPage() {
    return (
        <TwoColumn
            aside={[
                {
                    heading: 'Related settings',
                    links: ['BitLocker settings', 'Device Manager', 'Remote desktop', 'System protection', 'Advanced system settings', 'Rename this PC'],
                },
                ...HELP_GROUP,
            ]}
        >
            <Flex align="center" gap="16px" mb="8px">
                <Icon name="shield" size={36} color={WIN.green} />
                <Box>
                    <Text fontFamily={FONT_SEMIBOLD} fontSize="16px">
                        Your PC is monitored and protected.
                    </Text>
                    <WinLink>See details in Windows Security</WinLink>
                </Box>
            </Flex>

            <SectionTitle>Device specifications</SectionTitle>
            <KeyValue label="Device name" value="DESKTOP-H3LL0S1" />
            <KeyValue label="Processor" value="Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz   1.80 GHz" />
            <KeyValue label="Installed RAM" value="8.00 GB (7.89 GB usable)" />
            <KeyValue label="Device ID" value="5E1F2A3C-7B40-4D9A-9C61-0AE4D8B2F713" />
            <KeyValue label="Product ID" value="00331-10000-00001-AA512" />
            <KeyValue label="System type" value="64-bit operating system, x64-based processor" />
            <KeyValue label="Pen and touch" value="No pen or touch input is available for this display" />
            <WinButton>Copy</WinButton>
            <Box mt="12px">
                <WinButton>Rename this PC</WinButton>
            </Box>

            <SectionTitle>Windows specifications</SectionTitle>
            <KeyValue label="Edition" value="Windows 10 Pro" />
            <KeyValue label="Version" value="20H2" />
            <KeyValue label="OS build" value="19042.631" />
            <WinButton>Copy</WinButton>
            <Flex direction="column" gap="6px" mt="16px">
                <WinLink>Change product key or upgrade your edition of Windows</WinLink>
                <WinLink>Read the Microsoft Services Agreement that applies to our services</WinLink>
                <WinLink>Read the Microsoft Software License Terms</WinLink>
            </Flex>
        </TwoColumn>
    )
}

function BluetoothPage() {
    return (
        <TwoColumn
            aside={[
                {
                    heading: 'Related settings',
                    links: ['Devices and printers', 'Sound settings', 'Display settings', 'More Bluetooth options'],
                },
                ...HELP_GROUP,
            ]}
        >
            <Flex
                as="button"
                align="center"
                gap="16px"
                px="16px"
                py="14px"
                mb="24px"
                bg="transparent"
                border="2px solid transparent"
                _hover={{ bg: WIN.hover }}
                textAlign="left"
            >
                <Icon name="add" size={24} />
                <Text fontSize="14px" fontFamily={FONT_SEMIBOLD}>
                    Add Bluetooth or other device
                </Text>
            </Flex>

            <Labeled label="Bluetooth">
                <WinToggle defaultOn label="Bluetooth" />
            </Labeled>
            <Text fontSize="12px" color={WIN.secondary} mb="8px">
                Now discoverable as &ldquo;DESKTOP-H3LL0S1&rdquo;
            </Text>

            <SectionTitle>Mouse, keyboard, &amp; pen</SectionTitle>
            <SettingRow icon="mouse" title="USB Optical Mouse" />
            <SettingRow icon="keyboard" title="USB Keyboard" />

            <SectionTitle>Audio</SectionTitle>
            <SettingRow icon="sound" title="Speakers (High Definition Audio Device)" />

            <SectionTitle>Other devices</SectionTitle>
            <SettingRow icon="display" title="Generic PnP Monitor" />
        </TwoColumn>
    )
}

function NetworkStatusPage() {
    return (
        <TwoColumn
            aside={[
                { heading: 'Have a question?', links: ['Get help'] },
                { heading: 'Make Windows better', links: ['Give us feedback'] },
            ]}
        >
            <Text fontSize="20px" fontFamily={FONT_SEMIBOLD} mb="16px">
                Network status
            </Text>
            <Flex align="center" gap="20px" mb="16px">
                <Icon name="ethernet" size={64} color={WIN.accent} />
                <Box>
                    <Text fontFamily={FONT_SEMIBOLD} fontSize="16px">
                        Ethernet
                    </Text>
                    <Text fontSize="14px">Public network</Text>
                    <Text fontSize="14px" color={WIN.secondary}>
                        You&rsquo;re connected to the Internet
                    </Text>
                </Box>
            </Flex>
            <Text fontSize="12px" color={WIN.secondary} mb="16px">
                If you have a limited data plan, you can make this network a
                metered connection or change other properties.
            </Text>
            <Flex gap="8px" mb="8px">
                <WinButton>Properties</WinButton>
                <WinButton>Data usage</WinButton>
            </Flex>

            <SectionTitle>Change your network settings</SectionTitle>
            <SettingRow icon="ethernet" title="Change adapter options" description="View network adapters and change connection settings." onClick={() => undefined} />
            <SettingRow icon="shared" title="Sharing options" description="For the networks you connect to, decide what you want to share." onClick={() => undefined} />
            <SettingRow icon="troubleshoot" title="Network troubleshooter" description="Diagnose and fix network problems." onClick={() => undefined} />
            <Box mt="16px">
                <WinLink>View your network properties</WinLink>
            </Box>
            <Box mt="6px">
                <WinLink>Windows Firewall</WinLink>
            </Box>
            <Box mt="6px">
                <WinLink>Network and Sharing Centre</WinLink>
            </Box>
            <Box mt="6px">
                <WinLink>Network reset</WinLink>
            </Box>
        </TwoColumn>
    )
}

function WifiPage() {
    return (
        <TwoColumn
            aside={[
                {
                    heading: 'Related settings',
                    links: ['Change adapter options', 'Change advanced sharing options', 'Network and Sharing Centre', 'Windows Firewall'],
                },
                ...HELP_GROUP,
            ]}
        >
            <Labeled label="Wi-Fi">
                <WinToggle defaultOn label="Wi-Fi" />
            </Labeled>
            <Flex direction="column" gap="6px" mb="8px">
                <WinLink>Show available networks</WinLink>
                <WinLink>Hardware properties</WinLink>
                <WinLink>Manage known networks</WinLink>
            </Flex>

            <SectionTitle>Random hardware addresses</SectionTitle>
            <Text fontSize="14px" mb="8px">
                Use random hardware addresses to make it harder for people to
                track your location when you connect to different Wi-Fi
                networks.
            </Text>
            <WinToggle label="Random hardware addresses" />

            <SectionTitle>Hotspot 2.0 networks</SectionTitle>
            <Text fontSize="14px">
                Hotspot 2.0 networks make it more secure to connect to public
                Wi-Fi hotspots. They might be available in public places like
                airports, hotels, and cafes.
            </Text>
        </TwoColumn>
    )
}

function BackgroundPage() {
    return (
        <TwoColumn
            aside={[
                {
                    heading: 'Related settings',
                    links: ['High contrast settings', 'Sync your settings'],
                },
                ...HELP_GROUP,
            ]}
        >
            {/* Desktop preview, same blue wallpaper family as stock Windows 10 */}
            <Box
                width="280px"
                height="170px"
                mb="24px"
                border="8px solid #555555"
                borderBottomWidth="14px"
                background="linear-gradient(135deg, #0a2f6b 0%, #0078D7 55%, #4cc2ff 100%)"
            />
            <Labeled label="Background">
                <WinSelect options={['Picture', 'Solid colour', 'Slideshow']} />
            </Labeled>
            <Labeled label="Choose a fit">
                <WinSelect options={['Fill', 'Fit', 'Stretch', 'Tile', 'Centre', 'Span']} />
            </Labeled>
        </TwoColumn>
    )
}

function AppsFeaturesPage() {
    const apps: [string, string][] = [
        ['3D Viewer', '16.0 KB'],
        ['Calculator', '24.0 KB'],
        ['Camera', '16.0 KB'],
        ['Mail and Calendar', '1.20 MB'],
        ['Microsoft Edge', '178 MB'],
        ['Paint 3D', '16.0 KB'],
    ]

    return (
        <TwoColumn
            aside={[
                {
                    heading: 'Related settings',
                    links: ['Programs and Features'],
                },
                ...HELP_GROUP,
            ]}
        >
            <Labeled label="Choose where to get apps">
                <Text fontSize="12px" color={WIN.secondary} mb="6px">
                    Installing only apps from the Microsoft Store helps protect your
                    device.
                </Text>
                <WinSelect options={['Anywhere', 'Anywhere, but let me know if there\u2019s a comparable app in the Microsoft Store', 'The Microsoft Store only']} />
            </Labeled>

            <Flex direction="column" gap="6px" mb="8px">
                <WinLink>Optional features</WinLink>
                <WinLink>App execution aliases</WinLink>
            </Flex>

            <SectionTitle>Apps &amp; features</SectionTitle>
            {apps.map(([name, size]) => (
                <Flex
                    key={name}
                    justify="space-between"
                    py="10px"
                    borderBottom={`1px solid ${WIN.border}`}
                >
                    <Text fontSize="14px">{name}</Text>
                    <Text fontSize="12px" color={WIN.secondary}>
                        {size}
                    </Text>
                </Flex>
            ))}
        </TwoColumn>
    )
}

function YourInfoPage() {
    return (
        <TwoColumn
            aside={[
                {
                    heading: 'Related settings',
                    links: ['Sign-in options', 'Family & other users'],
                },
                ...HELP_GROUP,
            ]}
        >
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
                    <Text fontSize="14px" color={WIN.secondary}>
                        Administrator
                    </Text>
                </Box>
            </Flex>
            <Box mb="8px">
                <WinLink>Sign in with a Microsoft account instead</WinLink>
            </Box>

            <SectionTitle>Create your picture</SectionTitle>
            <Flex gap="8px">
                <WinButton>Camera</WinButton>
                <WinButton>Browse for one</WinButton>
            </Flex>
        </TwoColumn>
    )
}

function FallbackPage({ title }: { title: string }) {
    return (
        <TwoColumn>
            <Text fontSize="14px" color={WIN.secondary}>
                No settings are available for &ldquo;{title}&rdquo; right now.
            </Text>
        </TwoColumn>
    )
}

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */

export function PageContent({
    categoryId,
    pageId,
}: {
    categoryId: string
    pageId: string
}) {
    const title = findPage(categoryId, pageId)?.title ?? 'Settings'

    let body: ReactNode

    switch (`${categoryId}/${pageId}`) {
        case 'update/windowsupdate':
            body = <WindowsUpdatePage />
            break
        case 'update/security':
            body = <WindowsSecurityPage />
            break
        case 'update/recovery':
            body = <RecoveryPage />
            break
        case 'system/display':
            body = <DisplayPage />
            break
        case 'system/about':
            body = <AboutPage />
            break
        case 'devices/bluetooth':
            body = <BluetoothPage />
            break
        case 'network/status':
            body = <NetworkStatusPage />
            break
        case 'network/wifi':
            body = <WifiPage />
            break
        case 'personalization/background':
            body = <BackgroundPage />
            break
        case 'apps/features':
            body = <AppsFeaturesPage />
            break
        case 'accounts/info':
            body = <YourInfoPage />
            break
        default:
            body = <FallbackPage title={title} />
    }

    return (
        <Box>
            <PageTitle>{title}</PageTitle>
            {body}
        </Box>
    )
}
