import { useEffect, useState } from 'react'
import { Box, Flex, Text, chakra } from '@chakra-ui/react'
import { Icon } from './Icon'
import { WinDialog } from './WinDialog'
import { FONT_SEMIBOLD, FONT_UI, WIN } from './tokens'

interface Message {
    headline: string
    detail: string[]
}

interface Toast {
    title: string
    body: string[]
}

/** The Manager sends line lists as a JSON array string; be forgiving about anything else. */
function parseLines(value: string | undefined): string[] {
    if (!value) return []

    try {
        const parsed: unknown = JSON.parse(value)

        if (Array.isArray(parsed)) {
            return parsed.filter((line): line is string => typeof line === 'string')
        }
    } catch {
        // not JSON: treat as one line
    }

    return [value]
}

/**
 * Shows what the Manager tells this window to show: message boxes and corner
 * notifications. It renders nothing until a command arrives.
 */
export function CommandHost({ app }: { app: 'settings' | 'defender' }) {
    const [message, setMessage] = useState<Message | null>(null)
    const [toast, setToast] = useState<Toast | null>(null)

    useEffect(() => {
        const unsubscribe = window.hell?.onCommand((command, args) => {
            if (command === 'show_message') {
                setMessage({
                    headline: args.headline ?? '',
                    detail: parseLines(args.detail),
                })
            }

            if (command === 'show_toast') {
                setToast({ title: args.title ?? '', body: parseLines(args.body) })
            }
        })

        return () => unsubscribe?.()
    }, [])

    // Notifications disappear on their own, like the real ones.
    useEffect(() => {
        if (!toast) return

        const id = window.setTimeout(() => setToast(null), 15_000)
        return () => window.clearTimeout(id)
    }, [toast])

    const source = app === 'defender' ? 'Windows Security' : 'Settings'

    return (
        <>
            {message && (
                <WinDialog
                    headline={message.headline}
                    detail={message.detail}
                    onClose={() => setMessage(null)}
                    silent
                />
            )}

            {toast && (
                <Box
                    position="fixed"
                    right="16px"
                    bottom="16px"
                    width="min(360px, calc(100% - 32px))"
                    zIndex={1500}
                    bg={WIN.popup}
                    color={WIN.text}
                    fontFamily={FONT_UI}
                    border={`1px solid ${WIN.border}`}
                    boxShadow="0 6px 24px rgba(0, 0, 0, 0.6)"
                >
                    <Flex align="center" gap="8px" px="12px" pt="10px">
                        <Icon
                            name={app === 'defender' ? 'shield' : 'settings'}
                            size={13}
                            color={WIN.accent}
                        />
                        <Text fontSize="12px" color={WIN.secondary} flex="1">
                            {source}
                        </Text>
                        <chakra.button
                            type="button"
                            aria-label="Dismiss"
                            fontSize="18px"
                            lineHeight="1"
                            px="6px"
                            _hover={{ bg: WIN.selected }}
                            onClick={() => setToast(null)}
                        >
                            ×
                        </chakra.button>
                    </Flex>
                    <Box px="12px" pt="4px" pb="12px">
                        <Text fontFamily={FONT_SEMIBOLD} fontSize="14px" mb="4px">
                            {toast.title}
                        </Text>
                        {toast.body.map(line => (
                            <Text key={line} fontSize="13px" color={WIN.secondary}>
                                {line}
                            </Text>
                        ))}
                    </Box>
                </Box>
            )}
        </>
    )
}
