
import { useState } from 'react'
import {
    Box,
    Flex,
    Grid,
    Heading,
    Input,
    Text,
    VStack,
} from '@chakra-ui/react'

type SettingsCategory =
    | 'Home'
    | 'System'
    | 'Devices'
    | 'Network & Internet'
    | 'Personalization'
    | 'Apps'
    | 'Accounts'
    | 'Update & Security'

const categories: SettingsCategory[] = [
    'Home',
    'System',
    'Devices',
    'Network & Internet',
    'Personalization',
    'Apps',
    'Accounts',
    'Update & Security',
]

const descriptions: Record<SettingsCategory, string> = {
    Home: 'Find a setting or explore the categories below.',
    System: 'Display, sound, notifications, power and more.',
    Devices: 'Bluetooth, printers, mouse and other devices.',
    'Network & Internet': 'Wi-Fi, airplane mode, VPN and network settings.',
    Personalization: 'Background, colours, lock screen and themes.',
    Apps: 'Uninstall, defaults and optional features.',
    Accounts: 'Your accounts, email and sign-in options.',
    'Update & Security': 'Windows Update, recovery and security.',
}

export function Settings() {
    const [activeCategory, setActiveCategory] =
        useState<SettingsCategory>('Home')

    const [search, setSearch] = useState('')

    const filteredCategories = categories.filter(category =>
        category.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Flex
            className="settings"
            direction="column"
            width="100%"
            height="100vh"
            bg="#202020"
            color="white"
            overflow="hidden"
        >
            {/* Header */}
            <Box px="36px" pt="28px" pb="20px" flexShrink={0}>
                <Heading
                    fontSize="32px"
                    fontWeight="normal"
                    mb="20px"
                >
                    Settings
                </Heading>

                <Input
                    width="400px"
                    maxWidth="100%"
                    placeholder="Find a setting"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    bg="#292929"
                    borderColor="#555555"
                    borderRadius="0"
                    _focus={{
                        borderColor: '#0078D7',
                        boxShadow: 'none',
                    }}
                />
            </Box>

            {/* Main layout */}
            <Flex flex="1" minHeight="0" overflow="hidden">

                {/* Sidebar */}
                <VStack
                    align="stretch"
                    width="250px"
                    flexShrink={0}
                    gap="2px"
                    bg="#181818"
                    borderRight="1px solid #404040"
                    padding="12px 8px"
                    overflowY="auto"
                >
                    {filteredCategories.map(category => (
                        <Box
                            key={category}
                            as="button"
                            textAlign="left"
                            padding="12px 16px"
                            color={
                                activeCategory === category
                                    ? 'white'
                                    : '#BDBDBD'
                            }
                            bg={
                                activeCategory === category
                                    ? '#292929'
                                    : 'transparent'
                            }
                            borderLeft={
                                activeCategory === category
                                    ? '3px solid #0078D7'
                                    : '3px solid transparent'
                            }
                            cursor="pointer"
                            _hover={{
                                bg: '#353535',
                                color: 'white',
                            }}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </Box>
                    ))}
                </VStack>

                {/* Content */}
                <Box
                    flex="1"
                    minWidth="0"
                    padding="32px 40px"
                    overflowY="auto"
                    bg="#202020"
                >
                    <Heading
                        fontSize="28px"
                        fontWeight="normal"
                        mb="12px"
                    >
                        {activeCategory === 'Home'
                            ? 'Welcome to HELL Settings'
                            : activeCategory}
                    </Heading>

                    <Text color="#BDBDBD" mb="28px">
                        {descriptions[activeCategory]}
                    </Text>

                    {activeCategory === 'Home' && (
                        <Grid
                            templateColumns="repeat(auto-fill, minmax(220px, 1fr))"
                            gap="16px"
                        >
                            {categories
                                .filter(category => category !== 'Home')
                                .map(category => (
                                    <Box
                                        key={category}
                                        as="button"
                                        textAlign="left"
                                        padding="20px"
                                        minHeight="110px"
                                        bg="#292929"
                                        border="1px solid #404040"
                                        _hover={{
                                            bg: '#353535',
                                            borderColor: '#0078D7',
                                        }}
                                        onClick={() =>
                                            setActiveCategory(category)
                                        }
                                    >
                                        <Heading
                                            fontSize="17px"
                                            fontWeight="medium"
                                            mb="8px"
                                        >
                                            {category}
                                        </Heading>

                                        <Text
                                            fontSize="sm"
                                            color="#BDBDBD"
                                        >
                                            {descriptions[category]}
                                        </Text>
                                    </Box>
                                ))}
                        </Grid>
                    )}

                    {activeCategory !== 'Home' && (
                        <Box
                            padding="24px"
                            bg="#292929"
                            border="1px solid #404040"
                            maxWidth="750px"
                        >
                            <Heading
                                fontSize="20px"
                                fontWeight="normal"
                                mb="12px"
                            >
                                {activeCategory} overview
                            </Heading>

                            <Text color="#BDBDBD">
                                This section is currently under development.
                            </Text>
                        </Box>
                    )}
                </Box>
            </Flex>
        </Flex>
    )
}
