import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, Text, chakra } from '@chakra-ui/react'
import { Icon } from '../components/Icon'
import type { GlyphName } from '../components/glyphs'
import { TitleBar } from '../components/TitleBar'
import { WinDialog } from '../components/WinDialog'
import { FONT_SEMIBOLD, FONT_UI, WIN } from '../components/tokens'
import {
    randomAlert,
    randomInt,
    type AlertDef,
    type Msg,
    type PageId,
} from './defender/content'
import { DefenderContext } from './defender/context'
import {
    AccountPage,
    AllowedPage,
    AppBrowserPage,
    DeviceSecurityPage,
    FamilyPage,
    FirewallPage,
    HealthPage,
    HistoryPage,
    HomePage,
    ScanOptionsPage,
    SettingsPage,
    ThreatsPage,
    UpdatesPage,
    VirusPage,
    VirusSettingsPage,
} from './defender/pages'
import '../components/win10.css'
import './defender.css'

/* ------------------------------------------------------------------ */
/* Navigation rail — mirrors the real Windows Security                 */
/* ------------------------------------------------------------------ */

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

/** Sub-pages of Virus & threat protection keep that rail item highlighted. */
function railFor(page: PageId): PageId {
    return page.startsWith('virus') ? 'virus' : page
}

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
            bg={selected ? WIN.selected : 'transparent'}
            _hover={{ bg: selected ? WIN.selected : WIN.hover }}
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

/* ------------------------------------------------------------------ */
/* Window                                                              */
/* ------------------------------------------------------------------ */

const FIRST_ALERT_MS: [number, number] = [6_000, 12_000]
const NEXT_ALERT_MS: [number, number] = [25_000, 70_000]
const ALERT_VISIBLE_MS = 15_000

export function Defender() {
    // History stack so the title-bar back arrow behaves like the real app.
    const [history, setHistory] = useState<PageId[]>(['home'])
    const [expanded, setExpanded] = useState(true)
    const [dialog, setDialog] = useState<Msg | null>(null)
    const [alert, setAlert] = useState<AlertDef | null>(null)
    const [alertsShown, setAlertsShown] = useState(0)

    const page = history[history.length - 1]

    const navigate = useCallback((target: PageId) => {
        setHistory(stack =>
            stack[stack.length - 1] === target ? stack : [...stack, target],
        )
    }, [])

    const goBack = useCallback(() => {
        setHistory(stack => (stack.length > 1 ? stack.slice(0, -1) : stack))
    }, [])

    // Ignore new messages while one is already on screen.
    const message = useCallback((msg: Msg) => {
        setDialog(current => current ?? msg)
    }, [])

    const api = useMemo(() => ({ navigate, message }), [navigate, message])

    // Random "toast" alerts: one soon after opening, then every 25-70 seconds.
    useEffect(() => {
        const [min, max] = alertsShown === 0 ? FIRST_ALERT_MS : NEXT_ALERT_MS

        const id = window.setTimeout(
            () => {
                if (alert) {
                    setAlert(null)
                } else {
                    setAlert(randomAlert())
                    setAlertsShown(count => count + 1)
                }
            },
            alert ? ALERT_VISIBLE_MS : randomInt(min, max),
        )

        return () => window.clearTimeout(id)
    }, [alert, alertsShown])

    const content = (() => {
        switch (page) {
            case 'virus':
                return <VirusPage />
            case 'virus-threats':
                return <ThreatsPage />
            case 'virus-options':
                return <ScanOptionsPage />
            case 'virus-history':
                return <HistoryPage />
            case 'virus-allowed':
                return <AllowedPage />
            case 'virus-settings':
                return <VirusSettingsPage />
            case 'virus-updates':
                return <UpdatesPage />
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
                return <HomePage />
        }
    })()

    const selectedRail = railFor(page)

    return (
        <DefenderContext.Provider value={api}>
            <Flex
                className="win-dark"
                direction="column"
                position="relative"
                height="100vh"
                overflow="hidden"
                bg={WIN.defenderContent}
                color={WIN.text}
                fontFamily={FONT_UI}
            >
                <TitleBar
                    title="Windows Security"
                    background={WIN.defenderContent}
                    canGoBack={history.length > 1}
                    onBack={goBack}
                />

                <Flex flex="1" minHeight="0" overflow="hidden">
                    {/* Left navigation rail */}
                    <Flex
                        as="nav"
                        direction="column"
                        justify="space-between"
                        width={expanded ? '260px' : '48px'}
                        flexShrink={0}
                        bg={WIN.defenderRail}
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
                                _hover={{ bg: WIN.hover }}
                                onClick={() => setExpanded(value => !value)}
                            >
                                <Icon name="hamburger" size={18} />
                            </chakra.button>

                            <Box mt="4px">
                                {NAV_ITEMS.map(item => (
                                    <NavButton
                                        key={item.id}
                                        item={item}
                                        selected={selectedRail === item.id}
                                        expanded={expanded}
                                        onClick={() =>
                                            item.id === 'home'
                                                ? setHistory(['home'])
                                                : navigate(item.id)
                                        }
                                    />
                                ))}
                            </Box>
                        </Box>

                        <NavButton
                            item={SETTINGS_ITEM}
                            selected={selectedRail === 'settings'}
                            expanded={expanded}
                            onClick={() => navigate('settings')}
                        />
                    </Flex>

                    {/* Page content */}
                    <Box flex="1" minWidth="0" overflowY="auto" px="40px" py="28px">
                        {content}
                    </Box>
                </Flex>

                {/* Random Windows Security "toast" notification */}
                {alert && (
                    <Box
                        position="absolute"
                        right="16px"
                        bottom="16px"
                        width="min(360px, calc(100% - 32px))"
                        zIndex={500}
                        bg={WIN.popup}
                        border={`1px solid ${WIN.border}`}
                        boxShadow="0 6px 24px rgba(0, 0, 0, 0.6)"
                    >
                        <Flex align="center" gap="8px" px="12px" pt="10px">
                            <Icon name="shield" size={13} color={WIN.accent} />
                            <Text fontSize="12px" color={WIN.secondary} flex="1">
                                Windows Security
                            </Text>
                            <chakra.button
                                type="button"
                                aria-label="Dismiss"
                                fontSize="18px"
                                lineHeight="1"
                                px="6px"
                                _hover={{ bg: WIN.selected }}
                                onClick={() => setAlert(null)}
                            >
                                ×
                            </chakra.button>
                        </Flex>
                        <chakra.button
                            type="button"
                            display="block"
                            width="100%"
                            textAlign="left"
                            px="12px"
                            pt="4px"
                            pb="12px"
                            _hover={{ bg: WIN.hoverLight }}
                            onClick={() => {
                                navigate(alert.target)
                                setAlert(null)
                            }}
                        >
                            <Text fontFamily={FONT_SEMIBOLD} fontSize="14px" mb="4px">
                                {alert.title}
                            </Text>
                            {alert.lines.map(line => (
                                <Text key={line} fontSize="13px" color={WIN.secondary}>
                                    {line}
                                </Text>
                            ))}
                        </chakra.button>
                    </Box>
                )}

                {dialog && (
                    <WinDialog
                        headline={dialog.headline}
                        detail={dialog.detail}
                        onClose={() => setDialog(null)}
                    />
                )}
            </Flex>
        </DefenderContext.Provider>
    )
}
