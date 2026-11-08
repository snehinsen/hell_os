import type { ReactNode } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Icon } from '../../components/Icon'
import type { GlyphName } from '../../components/glyphs'
import { WinLink } from '../../components/win10'
import { FONT_LIGHT, FONT_SEMIBOLD, WIN } from '../../components/tokens'
import type { AsideGroup, Level } from './content'

/** Status colours, matching Windows 10 dark: green ok, amber warn, red error. */
const LEVELS = {
    ok: { color: WIN.green, badge: WIN.green, mark: 'check', markColor: '#000000' },
    warn: { color: '#FFB900', badge: '#FFB900', mark: '!', markColor: '#000000' },
    error: { color: '#F1707B', badge: '#E81123', mark: '×', markColor: '#FFFFFF' },
} as const

export function levelColor(level: Level): string {
    return level === 'none' ? WIN.text : LEVELS[level].color
}

/** Big status icon with the small round badge in the corner. */
export function StatusIcon({
    icon,
    size = 36,
    level = 'ok',
    background = WIN.defenderContent,
}: {
    icon: GlyphName
    size?: number
    level?: Level
    background?: string
}) {
    const badgeSize = Math.round(size * 0.45)
    const style = level === 'none' ? null : LEVELS[level]

    return (
        <Box position="relative" width={`${size}px`} height={`${size}px`} flexShrink={0}>
            <Icon name={icon} size={size} color={levelColor(level)} />
            {style && (
                <Flex
                    position="absolute"
                    right="-3px"
                    bottom="-3px"
                    width={`${badgeSize}px`}
                    height={`${badgeSize}px`}
                    borderRadius="50%"
                    bg={style.badge}
                    border={`2px solid ${background}`}
                    align="center"
                    justify="center"
                >
                    {style.mark === 'check' ? (
                        <Icon name="check" size={Math.round(badgeSize * 0.6)} color={style.markColor} />
                    ) : (
                        <Text
                            fontSize={`${Math.round(badgeSize * 0.8)}px`}
                            fontWeight="700"
                            lineHeight="1"
                            color={style.markColor}
                        >
                            {style.mark}
                        </Text>
                    )}
                </Flex>
            )}
        </Box>
    )
}

export function PageHeader({
    title,
    subtitle,
}: {
    title: string
    subtitle: string
}) {
    return (
        <Box mb="24px">
            <Text as="h1" fontFamily={FONT_LIGHT} fontSize="28px" lineHeight="1.2" mb="8px">
                {title}
            </Text>
            <Text fontSize="14px">{subtitle}</Text>
        </Box>
    )
}

/** One section of a Windows Security page: icon + heading, status text, content. */
export function Section({
    icon,
    title,
    level = 'none',
    status,
    children,
}: {
    icon: GlyphName
    title: string
    level?: Level
    status?: string
    children?: ReactNode
}) {
    return (
        <Box mb="28px">
            <Flex align="center" gap="12px" mb="8px">
                <Icon name={icon} size={20} color={levelColor(level)} />
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

export function Lines({ lines }: { lines: string[] }) {
    return (
        <Box mb="12px">
            {lines.map(line => (
                <Text key={line} fontSize="13px" color={WIN.secondary}>
                    {line}
                </Text>
            ))}
        </Box>
    )
}

export function LinkStack({
    links,
}: {
    links: { label: string; onClick?: () => void }[]
}) {
    return (
        <Flex direction="column" align="flex-start" gap="6px">
            {links.map(link => (
                <WinLink key={link.label} onClick={link.onClick}>
                    {link.label}
                </WinLink>
            ))}
        </Flex>
    )
}

/** Info bar, e.g. "This feature is managed by your system administrator". */
export function Banner({ children }: { children: ReactNode }) {
    return (
        <Flex
            align="center"
            gap="12px"
            mb="24px"
            px="16px"
            py="12px"
            bg={WIN.band}
            borderLeft={`4px solid ${WIN.accent}`}
        >
            <Icon name="info" size={18} color={WIN.accent} />
            <Text fontSize="14px">{children}</Text>
        </Flex>
    )
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
                    <LinkStack links={group.links.map(label => ({ label }))} />
                </Box>
            ))}
        </Box>
    )
}

export function PageLayout({
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
