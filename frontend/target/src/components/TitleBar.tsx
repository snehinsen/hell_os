import { Flex, Text, chakra } from '@chakra-ui/react'
import { Icon } from './Icon'
import { WIN } from './tokens'
import './win10.css'

/**
 * Custom title bar for the frameless Settings / Windows Security windows.
 * Electron draws the native minimize / maximize / close buttons on top of the
 * right edge (titleBarOverlay), so this only renders the back arrow + title,
 * exactly like the real UWP apps. The bar is a window drag region.
 */
export function TitleBar({
    title,
    background,
    canGoBack,
    onBack,
}: {
    title: string
    background: string
    canGoBack: boolean
    onBack: () => void
}) {
    return (
        <Flex
            className="win-drag"
            height="32px"
            flexShrink={0}
            align="center"
            bg={background}
            color={WIN.text}
            userSelect="none"
        >
            <chakra.button
                type="button"
                className="win-nodrag"
                aria-label="Back"
                display="flex"
                alignItems="center"
                justifyContent="center"
                width="48px"
                height="32px"
                disabled={!canGoBack}
                opacity={canGoBack ? 1 : 0.4}
                cursor={canGoBack ? 'pointer' : 'default'}
                _hover={canGoBack ? { bg: WIN.hover } : undefined}
                onClick={onBack}
            >
                <Icon name="back" size={14} />
            </chakra.button>
            <Text fontSize="12px" ml="4px">
                {title}
            </Text>
        </Flex>
    )
}
