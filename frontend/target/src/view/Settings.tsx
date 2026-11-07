import { useMemo, useState, type ReactNode } from 'react'
import { Box, Flex, Grid, Text, chakra } from '@chakra-ui/react'
import { Icon } from '../components/Icon'
import { TitleBar } from '../components/TitleBar'
import { FONT_SEMIBOLD, FONT_UI, WIN } from '../components/tokens'
import {
    SEARCH_INDEX,
    SETTINGS_CATEGORIES,
    findCategory,
} from './settings/data'
import { PageContent } from './settings/PageContent'
import '../components/win10.css'
import './settings.css'

/** Shown in the profile band at the top of Settings home. */
const PROFILE = {
    name: 'HELL User',
    email: 'hell.user@outlook.com',
}

interface SettingsLocation {
    categoryId: string
    pageId: string
}

/* ------------------------------------------------------------------ */
/* Profile band pieces                                                 */
/* ------------------------------------------------------------------ */

function OneDriveIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
            <path d="M10 25a6 6 0 0 1-.9-11.9A8 8 0 0 1 24.4 11.6 6.5 6.5 0 0 1 24 25z" />
        </svg>
    )
}

function RewardsIcon() {
    return (
        <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <path d="M5 4h22v6l-6 6h-10l-6-6z" />
            <circle cx="16" cy="24" r="4" />
        </svg>
    )
}

function Shortcut({
    icon,
    title,
    subtitle,
    onClick,
}: {
    icon: ReactNode
    title: string
    subtitle: string
    onClick?: () => void
}) {
    return (
        <chakra.button
            type="button"
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            textAlign="left"
            minWidth="110px"
            maxWidth="150px"
            onClick={onClick}
            _hover={{ opacity: 0.8 }}
        >
            <Box height="32px" mb="12px" color={WIN.text}>
                {icon}
            </Box>
            <Text fontSize="14px" lineHeight="1.4">
                {title}
            </Text>
            <Text fontSize="12px" color={WIN.secondary}>
                {subtitle}
            </Text>
        </chakra.button>
    )
}

/* ------------------------------------------------------------------ */
/* "Find a setting" search box with suggestion dropdown                */
/* ------------------------------------------------------------------ */

function SearchBox({
    width,
    onPick,
}: {
    width: string
    onPick: (categoryId: string, pageId: string) => void
}) {
    const [query, setQuery] = useState('')

    const results = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return []

        return SEARCH_INDEX.filter(
            entry =>
                entry.title.toLowerCase().includes(q) ||
                entry.categoryTitle.toLowerCase().includes(q),
        ).slice(0, 8)
    }, [query])

    return (
        <Box position="relative" width={width} maxWidth="100%">
            <input
                className="win-search"
                type="text"
                placeholder="Find a setting"
                aria-label="Find a setting"
                value={query}
                onChange={event => setQuery(event.target.value)}
            />

            <Flex
                position="absolute"
                top="0"
                right="0"
                height="100%"
                width="32px"
                align="center"
                justify="center"
                pointerEvents="none"
            >
                <Icon name="search" size={14} />
            </Flex>

            {results.length > 0 && (
                <Box
                    position="absolute"
                    top="100%"
                    left="0"
                    right="0"
                    zIndex={20}
                    bg={WIN.popup}
                    border={`1px solid ${WIN.border}`}
                    boxShadow="0 4px 14px rgba(0, 0, 0, 0.6)"
                >
                    {results.map(result => (
                        <chakra.button
                            key={`${result.categoryId}/${result.pageId}`}
                            type="button"
                            display="block"
                            width="100%"
                            textAlign="left"
                            px="12px"
                            py="8px"
                            _hover={{ bg: WIN.selected }}
                            onClick={() => {
                                setQuery('')
                                onPick(result.categoryId, result.pageId)
                            }}
                        >
                            <Text fontSize="14px">{result.title}</Text>
                            <Text fontSize="12px" color={WIN.secondary}>
                                {result.categoryTitle}
                            </Text>
                        </chakra.button>
                    ))}
                </Box>
            )}
        </Box>
    )
}

/* ------------------------------------------------------------------ */
/* Settings window                                                     */
/* ------------------------------------------------------------------ */

export function Settings() {
    // null = Settings home
    const [location, setLocation] = useState<SettingsLocation | null>(null)

    const lastChecked = useMemo(
        () =>
            new Date().toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
            }),
        [],
    )

    const openPage = (categoryId: string, pageId: string) =>
        setLocation({ categoryId, pageId })

    const openCategory = (categoryId: string) => {
        const category = findCategory(categoryId)
        if (category) openPage(category.id, category.pages[0].id)
    }

    const activeCategory = location ? findCategory(location.categoryId) : undefined
    const isHome = !location || !activeCategory

    return (
        <Flex
            className="win-dark"
            direction="column"
            height="100vh"
            overflow="hidden"
            bg={isHome ? WIN.black : WIN.page}
            color={WIN.text}
            fontFamily={FONT_UI}
        >
            <TitleBar
                title="Settings"
                background={WIN.black}
                canGoBack={!isHome}
                onBack={() => setLocation(null)}
            />

            {isHome ? (
                /* ---------------- Home ---------------- */
                <Box flex="1" minHeight="0" overflowY="auto">
                    {/* Profile band */}
                    <Box bg={WIN.band}>
                        <Flex
                            maxWidth="1330px"
                            mx="auto"
                            px="20px"
                            minHeight="156px"
                            py="20px"
                            align="center"
                            justify="space-between"
                            wrap="wrap"
                            gap="24px"
                        >
                            <Flex align="center" gap="12px">
                                <Flex
                                    width="110px"
                                    height="110px"
                                    flexShrink={0}
                                    borderRadius="50%"
                                    bg="#E6E6E6"
                                    align="center"
                                    justify="center"
                                >
                                    <Icon name="contact" size={64} color="#333333" />
                                </Flex>
                                <Box>
                                    <Text fontFamily={FONT_SEMIBOLD} fontSize="28px" lineHeight="1.2">
                                        {PROFILE.name}
                                    </Text>
                                    <Text fontSize="15px" color={WIN.secondary}>
                                        {PROFILE.email}
                                    </Text>
                                    <chakra.button
                                        type="button"
                                        color={WIN.link}
                                        fontSize="15px"
                                        _hover={{ textDecoration: 'underline' }}
                                    >
                                        My Microsoft account
                                    </chakra.button>
                                </Box>
                            </Flex>

                            <Flex gap="40px" align="flex-start">
                                <Shortcut
                                    icon={<OneDriveIcon />}
                                    title="OneDrive"
                                    subtitle="Manage"
                                />
                                <Shortcut
                                    icon={<Icon name="update" size={32} />}
                                    title="Windows Update"
                                    subtitle={`Last checked: Today, ${lastChecked}`}
                                    onClick={() => openPage('update', 'windowsupdate')}
                                />
                                <Shortcut
                                    icon={<RewardsIcon />}
                                    title="Rewards"
                                    subtitle="0 points"
                                />
                            </Flex>
                        </Flex>
                    </Box>

                    {/* Search + tiles */}
                    <Flex direction="column" align="center" px="20px" pt="32px" pb="48px">
                        <SearchBox width="335px" onPick={openPage} />

                        <Grid
                            templateColumns="repeat(auto-fill, minmax(260px, 1fr))"
                            width="100%"
                            maxWidth="1330px"
                            mt="48px"
                        >
                            {SETTINGS_CATEGORIES.map(category => (
                                <chakra.button
                                    key={category.id}
                                    type="button"
                                    display="flex"
                                    alignItems="flex-start"
                                    gap="20px"
                                    textAlign="left"
                                    padding="14px 8px 18px"
                                    minHeight="111px"
                                    _hover={{ bg: WIN.hoverLight }}
                                    onClick={() => openCategory(category.id)}
                                >
                                    <Box pt="2px">
                                        <Icon
                                            name={category.icon}
                                            size={32}
                                            color={WIN.accent}
                                        />
                                    </Box>
                                    <Box minWidth="0">
                                        <Text fontSize="15px" lineHeight="1.4">
                                            {category.title}
                                        </Text>
                                        <Text fontSize="12.5px" lineHeight="1.45" color={WIN.secondary}>
                                            {category.description}
                                        </Text>
                                    </Box>
                                </chakra.button>
                            ))}
                        </Grid>
                    </Flex>
                </Box>
            ) : (
                /* ---------------- Category page ---------------- */
                <Flex flex="1" minHeight="0" overflow="hidden">
                    {/* Left navigation pane */}
                    <Flex
                        as="nav"
                        direction="column"
                        width="320px"
                        flexShrink={0}
                        overflowY="auto"
                        pb="16px"
                    >
                        <chakra.button
                            type="button"
                            display="flex"
                            alignItems="center"
                            gap="16px"
                            px="20px"
                            height="44px"
                            textAlign="left"
                            _hover={{ bg: WIN.hover }}
                            onClick={() => setLocation(null)}
                        >
                            <Icon name="home" size={16} />
                            <Text fontSize="14px">Home</Text>
                        </chakra.button>

                        <Box px="16px" py="10px">
                            <SearchBox width="100%" onPick={openPage} />
                        </Box>

                        <Text
                            fontFamily={FONT_SEMIBOLD}
                            fontSize="16px"
                            px="20px"
                            pt="12px"
                            pb="8px"
                        >
                            {activeCategory.title}
                        </Text>

                        {activeCategory.pages.map(page => {
                            const selected = page.id === location.pageId

                            return (
                                <chakra.button
                                    key={page.id}
                                    type="button"
                                    position="relative"
                                    display="flex"
                                    alignItems="center"
                                    gap="16px"
                                    px="20px"
                                    minHeight="40px"
                                    textAlign="left"
                                    bg={selected ? WIN.selected : 'transparent'}
                                    _hover={{ bg: selected ? WIN.selected : WIN.hover }}
                                    aria-current={selected ? 'page' : undefined}
                                    onClick={() => openPage(activeCategory.id, page.id)}
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
                                    <Icon name={page.icon} size={16} />
                                    <Text fontSize="14px">{page.title}</Text>
                                </chakra.button>
                            )
                        })}
                    </Flex>

                    {/* Page content */}
                    <Box flex="1" minWidth="0" overflowY="auto" px="40px" py="28px">
                        <PageContent
                            categoryId={location.categoryId}
                            pageId={location.pageId}
                        />
                    </Box>
                </Flex>
            )}
        </Flex>
    )
}
