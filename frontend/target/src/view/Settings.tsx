import { useMemo, useState } from 'react'
import { Box, Flex, Grid, Text, chakra } from '@chakra-ui/react'
import { Icon } from '../components/Icon'
import { FONT_LIGHT, FONT_SEMIBOLD, FONT_UI, WIN } from '../components/tokens'
import {
    SEARCH_INDEX,
    SETTINGS_CATEGORIES,
    findCategory,
} from './settings/data'
import { PageContent } from './settings/PageContent'
import '../components/win10.css'
import './settings.css'

interface SettingsLocation {
    categoryId: string
    pageId: string
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
                width="36px"
                align="center"
                justify="center"
                pointerEvents="none"
            >
                <Icon name="search" size={16} />
            </Flex>

            {results.length > 0 && (
                <Box
                    position="absolute"
                    top="100%"
                    left="0"
                    right="0"
                    zIndex={20}
                    bg="#FFFFFF"
                    border="1px solid #CCCCCC"
                    boxShadow="0 4px 14px rgba(0, 0, 0, 0.2)"
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
                            _hover={{ bg: WIN.hover }}
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
    // null = Windows Settings home
    const [location, setLocation] = useState<SettingsLocation | null>(null)

    const openPage = (categoryId: string, pageId: string) =>
        setLocation({ categoryId, pageId })

    const openCategory = (categoryId: string) => {
        const category = findCategory(categoryId)
        if (category) openPage(category.id, category.pages[0].id)
    }

    const activeCategory = location ? findCategory(location.categoryId) : undefined

    /* ---------------- Home ---------------- */

    if (!location || !activeCategory) {
        return (
            <Flex
                className="win-light"
                direction="column"
                align="center"
                height="100vh"
                overflowY="auto"
                bg="#FFFFFF"
                color="#000000"
                fontFamily={FONT_UI}
                px="40px"
                pt="36px"
                pb="48px"
            >
                <Text
                    as="h1"
                    fontFamily={FONT_LIGHT}
                    fontSize="28px"
                    lineHeight="1.2"
                    mb="20px"
                >
                    Windows Settings
                </Text>

                <SearchBox width="500px" onPick={openPage} />

                <Grid
                    templateColumns="repeat(auto-fill, minmax(280px, 1fr))"
                    gap="4px"
                    width="100%"
                    maxWidth="1000px"
                    mt="44px"
                >
                    {SETTINGS_CATEGORIES.map(category => (
                        <chakra.button
                            key={category.id}
                            type="button"
                            display="flex"
                            alignItems="center"
                            gap="16px"
                            textAlign="left"
                            padding="14px 16px"
                            minHeight="88px"
                            border="2px solid transparent"
                            _hover={{ bg: WIN.hover }}
                            onClick={() => openCategory(category.id)}
                        >
                            <Icon
                                name={category.icon}
                                size={36}
                                color={WIN.accent}
                            />
                            <Box minWidth="0">
                                <Text fontSize="16px">{category.title}</Text>
                                <Text fontSize="12px" color={WIN.secondary}>
                                    {category.description}
                                </Text>
                            </Box>
                        </chakra.button>
                    ))}
                </Grid>
            </Flex>
        )
    }

    /* ---------------- Category page ---------------- */

    return (
        <Flex
            className="win-light"
            height="100vh"
            overflow="hidden"
            bg="#FFFFFF"
            color="#000000"
            fontFamily={FONT_UI}
        >
            {/* Left navigation pane */}
            <Flex
                as="nav"
                direction="column"
                width="320px"
                flexShrink={0}
                overflowY="auto"
                bg="#FFFFFF"
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
                            bg={selected ? WIN.hover : 'transparent'}
                            _hover={{ bg: selected ? WIN.hover : WIN.hoverLight }}
                            aria-current={selected ? 'page' : undefined}
                            onClick={() =>
                                openPage(activeCategory.id, page.id)
                            }
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
    )
}
