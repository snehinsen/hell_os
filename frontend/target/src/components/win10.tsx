import { useState, type ReactNode } from 'react'
import { Box, Flex, Text, chakra } from '@chakra-ui/react'
import { Icon } from './Icon'
import type { GlyphName } from './glyphs'
import { FONT_SEMIBOLD, WIN } from './tokens'
import './win10.css'

/** Standard Win10 dark button: gray by default, accent-blue when `primary`. */
export function WinButton({
    children,
    primary = false,
    onClick,
}: {
    children: ReactNode
    primary?: boolean
    onClick?: () => void
}) {
    return (
        <chakra.button
            type="button"
            onClick={onClick}
            minHeight="32px"
            px="16px"
            fontSize="14px"
            bg={primary ? WIN.accent : WIN.buttonGray}
            color={WIN.text}
            border="2px solid transparent"
            _hover={{ borderColor: '#7A7A7A' }}
            _active={{ bg: primary ? WIN.accentDark : WIN.buttonActive }}
        >
            {children}
        </chakra.button>
    )
}

/** Blue hyperlink-style button. */
export function WinLink({
    children,
    onClick,
}: {
    children: ReactNode
    onClick?: () => void
}) {
    return (
        <chakra.button
            type="button"
            onClick={onClick}
            color={WIN.link}
            fontSize="14px"
            textAlign="left"
            _hover={{ textDecoration: 'underline' }}
        >
            {children}
        </chakra.button>
    )
}

/** On/Off switch with the label to its right, like Settings. */
export function WinToggle({
    defaultOn = false,
    label,
}: {
    defaultOn?: boolean
    label?: string
}) {
    const [on, setOn] = useState(defaultOn)

    return (
        <Flex align="center" gap="12px">
            <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={label}
                className={`win-toggle${on ? ' on' : ''}`}
                onClick={() => setOn(value => !value)}
            >
                <span className="win-toggle-knob" />
            </button>
            <Text fontSize="14px">{on ? 'On' : 'Off'}</Text>
        </Flex>
    )
}

/** Native drop-down styled like a Win10 combo box. */
export function WinSelect({
    options,
    defaultValue,
}: {
    options: string[]
    defaultValue?: string
}) {
    return (
        <select className="win-select" defaultValue={defaultValue ?? options[0]}>
            {options.map(option => (
                <option key={option}>{option}</option>
            ))}
        </select>
    )
}

/** Bold sub-heading used between groups of settings. */
export function SectionTitle({ children }: { children: ReactNode }) {
    return (
        <Text
            fontFamily={FONT_SEMIBOLD}
            fontSize="20px"
            lineHeight="1.3"
            mt="32px"
            mb="12px"
        >
            {children}
        </Text>
    )
}

/** Icon + title + description row, optionally clickable (Settings list item). */
export function SettingRow({
    icon,
    title,
    description,
    onClick,
}: {
    icon?: GlyphName
    title: string
    description?: string
    onClick?: () => void
}) {
    return (
        <Flex
            align="center"
            gap="16px"
            px="12px"
            py="10px"
            mx="-12px"
            cursor={onClick ? 'pointer' : 'default'}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            _hover={onClick ? { bg: WIN.hover } : undefined}
        >
            {icon && <Icon name={icon} size={20} />}
            <Box minWidth="0">
                <Text fontSize="14px">{title}</Text>
                {description && (
                    <Text fontSize="12px" color={WIN.secondary}>
                        {description}
                    </Text>
                )}
            </Box>
        </Flex>
    )
}
