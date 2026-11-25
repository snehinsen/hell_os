import { useEffect } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { report } from './hellBridge'
import { WinButton } from './win10'
import { FONT_SEMIBOLD, WIN } from './tokens'

/**
 * Win10-style modal box (dark) with a title, arbitrary content and a row of
 * action buttons. Escape calls onClose.
 */
export function WinModal({
    title,
    children,
    actions,
    onClose,
}: {
    title: string
    children?: React.ReactNode
    actions: React.ReactNode
    onClose: () => void
}) {
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
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
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <Box
                width="min(520px, 90vw)"
                maxHeight="85vh"
                overflowY="auto"
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
                    {title}
                </Text>

                {children}

                <Flex justify="flex-end" gap="8px" mt="20px">
                    {actions}
                </Flex>
            </Box>
        </Flex>
    )
}

/**
 * Simple message box: headline, a few lines of detail, one OK button.
 * Used for every "blocked" / "failed" message. Enter and Escape dismiss it.
 *
 * Every message the person in the VM sees is also reported to the human watching
 * (unless `silent`, used for messages the Manager itself pushed).
 */
export function WinDialog({
    headline,
    detail,
    onClose,
    silent = false,
}: {
    headline: string
    detail: string[]
    onClose: () => void
    silent?: boolean
}) {
    useEffect(() => {
        if (!silent) report('dialog', headline, detail.join(' / '))
    }, [headline, detail, silent])

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Enter') onClose()
        }

        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    return (
        <WinModal
            title={headline}
            onClose={onClose}
            actions={
                <WinButton primary onClick={onClose}>
                    OK
                </WinButton>
            }
        >
            {detail.map(line => (
                <Text key={line} fontSize="14px" mb="8px">
                    {line}
                </Text>
            ))}
        </WinModal>
    )
}
