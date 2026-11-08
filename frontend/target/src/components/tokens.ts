/** Windows 10 design tokens (DARK theme — the Target VM is always Win10 in dark mode). */

export const WIN = {
    accent: '#0078D7',
    accentDark: '#005A9E',
    link: '#3A96DD',

    text: '#FFFFFF',
    secondary: '#BDBDBD',

    hover: '#2B2B2B',
    hoverLight: '#232323',
    selected: '#333333',
    border: '#404040',

    buttonGray: '#333333',
    buttonActive: '#555555',

    green: '#6CCB5F',
    yellow: '#FFB900',
    red: '#FF99A4',
    white: '#FFFFFF',
    black: '#000000',

    /** Settings: profile band on the home page / inputs / popups */
    band: '#1F1F1F',
    input: '#1F1F1F',
    inputBorder: '#8E8E8E',
    popup: '#2B2B2B',

    /** Settings sub-page background: pure black on Win10 dark */
    page: '#000000',

    /** Windows Security: left rail / content area (content is pure black on Win10 dark) */
    defenderRail: '#171717',
    defenderContent: '#000000',
} as const

export const FONT_UI = '"Segoe UI", "Segoe UI Variable", Arial, sans-serif'
export const FONT_LIGHT = '"Segoe UI Light", "Segoe UI Semilight", "Segoe UI", Arial, sans-serif'
export const FONT_SEMILIGHT = '"Segoe UI Semilight", "Segoe UI", Arial, sans-serif'
export const FONT_SEMIBOLD = '"Segoe UI Semibold", "Segoe UI", Arial, sans-serif'

/** Win10 icon font. "Segoe Fluent Icons" is the Win11 successor, kept only as a fallback. */
export const ICON_FONT = '"Segoe MDL2 Assets", "Segoe Fluent Icons"'
