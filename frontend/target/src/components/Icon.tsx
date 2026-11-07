import { chakra } from '@chakra-ui/react'
import { GLYPHS, type GlyphName } from './glyphs'
import { ICON_FONT } from './tokens'

interface IconProps {
    name: GlyphName
    size?: number
    color?: string
}

/** Renders a Segoe MDL2 Assets glyph, exactly like the icons in real Windows 10. */
export function Icon({ name, size = 16, color }: IconProps) {
    return (
        <chakra.span
            aria-hidden="true"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            width={`${size}px`}
            height={`${size}px`}
            fontFamily={ICON_FONT}
            fontSize={`${size}px`}
            fontStyle="normal"
            fontWeight="normal"
            lineHeight="1"
            userSelect="none"
            color={color}
        >
            {GLYPHS[name]}
        </chakra.span>
    )
}
