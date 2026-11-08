import { useEffect } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { WinButton } from './win10'
import { FONT_SEMIBOLD, WIN } from './tokens'

/**
 * Win10-style modal message box (dark). Used by Settings for "blocked" messages
 * and by Windows Security for failed quarantines, scans, and so on.
 * Enter / Escape / the OK button all dismiss it.
 */
export function WinDialog({
    headline,
    detail,
    onClose,
}: {
    headline: string
    detail: string[]
    onClose: () => void
}) {
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' || event.key === 'Enter') onClose()
        }

        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    return (
        <Flex
            position="fixed"
            inset="0"
            zIndex={1000}
            align="center"
            justify="center"
            bg="rgba(0, 0, 0, 0.65)"
            role="alertdialog"
            aria-modal="true"
            aria-label={headline}
        >
            <Box
                width="min(480px, 90vw)"
                bg={WIN.popup}
                border={`1px solid ${WIN.border}`}
                px="24px"
                pt="24px"
                pb="20px"
                boxShadow="0 8px 32px rgba(0, 0, 0, 0.6)"
            >
                <Text
                    fontFamily={FONT_SEMIBOLD}
                    fontSize="20px"
                    lineHeight="1.3"
                    mb="12px"
                >
                    {headline}
                </Text>

                {detail.map(line => (
                    <Text key={line} fontSize="14px" mb="8px">
                        {line}
                    </Text>
                ))}

                <Flex justify="flex-end" mt="20px">
                    <WinButton primary onClick={onClose}>
                        OK
                    </WinButton>
                </Flex>
            </Box>
        </Flex>
    )
}
