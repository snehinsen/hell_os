import type { GlyphName } from '../../components/glyphs'

export interface SettingsPageDef {
    id: string
    title: string
    icon: GlyphName
}

export interface SettingsCategoryDef {
    id: string
    title: string
    description: string
    icon: GlyphName
    pages: SettingsPageDef[]
}

/**
 * Mirrors the Windows 10 (21H1+) Settings app: same categories, same order,
 * same tile text (en-GB spelling, as on the reference VM) and the same
 * sub-page lists.
 */
export const SETTINGS_CATEGORIES: SettingsCategoryDef[] = [
    {
        id: 'system',
        title: 'System',
        description: 'Display, sound, notifications, power',
        icon: 'system',
        pages: [
            { id: 'display', title: 'Display', icon: 'display' },
            { id: 'sound', title: 'Sound', icon: 'sound' },
            { id: 'notifications', title: 'Notifications & actions', icon: 'notifications' },
            { id: 'focus', title: 'Focus assist', icon: 'focus' },
            { id: 'power', title: 'Power & sleep', icon: 'power' },
            { id: 'battery', title: 'Battery', icon: 'battery' },
            { id: 'storage', title: 'Storage', icon: 'storage' },
            { id: 'tablet', title: 'Tablet', icon: 'tablet' },
            { id: 'multitasking', title: 'Multitasking', icon: 'multitasking' },
            { id: 'project', title: 'Projecting to this PC', icon: 'project' },
            { id: 'shared', title: 'Shared experiences', icon: 'shared' },
            { id: 'clipboard', title: 'Clipboard', icon: 'clipboard' },
            { id: 'remote', title: 'Remote Desktop', icon: 'remote' },
            { id: 'about', title: 'About', icon: 'info' },
        ],
    },
    {
        id: 'devices',
        title: 'Devices',
        description: 'Bluetooth, printers, mouse',
        icon: 'devices',
        pages: [
            { id: 'bluetooth', title: 'Bluetooth & other devices', icon: 'bluetooth' },
            { id: 'printers', title: 'Printers & scanners', icon: 'printer' },
            { id: 'mouse', title: 'Mouse', icon: 'mouse' },
            { id: 'touchpad', title: 'Touchpad', icon: 'touchpad' },
            { id: 'typing', title: 'Typing', icon: 'keyboard' },
            { id: 'pen', title: 'Pen & Windows Ink', icon: 'pen' },
            { id: 'autoplay', title: 'AutoPlay', icon: 'autoplay' },
            { id: 'usb', title: 'USB', icon: 'usb' },
        ],
    },
    {
        id: 'phone',
        title: 'Mobile devices',
        description: 'Link your Android, iPhone',
        icon: 'phone',
        pages: [{ id: 'yourphone', title: 'Your Phone', icon: 'phone' }],
    },
    {
        id: 'network',
        title: 'Network & Internet',
        description: 'WiFi, flight mode, VPN',
        icon: 'network',
        pages: [
            { id: 'status', title: 'Status', icon: 'globe' },
            { id: 'wifi', title: 'Wi-Fi', icon: 'wifi' },
            { id: 'ethernet', title: 'Ethernet', icon: 'ethernet' },
            { id: 'dialup', title: 'Dial-up', icon: 'dialup' },
            { id: 'vpn', title: 'VPN', icon: 'vpn' },
            { id: 'airplane', title: 'Flight mode', icon: 'airplane' },
            { id: 'hotspot', title: 'Mobile hotspot', icon: 'hotspot' },
            { id: 'datausage', title: 'Data usage', icon: 'dataUsage' },
            { id: 'proxy', title: 'Proxy', icon: 'globe' },
        ],
    },
    {
        id: 'personalization',
        title: 'Personalisation',
        description: 'Background, lock screen, colours',
        icon: 'personalization',
        pages: [
            { id: 'background', title: 'Background', icon: 'picture' },
            { id: 'colors', title: 'Colours', icon: 'color' },
            { id: 'lockscreen', title: 'Lock screen', icon: 'lock' },
            { id: 'themes', title: 'Themes', icon: 'themes' },
            { id: 'fonts', title: 'Fonts', icon: 'font' },
            { id: 'start', title: 'Start', icon: 'startMenu' },
            { id: 'taskbar', title: 'Taskbar', icon: 'taskbar' },
        ],
    },
    {
        id: 'apps',
        title: 'Apps',
        description: 'Uninstall, defaults',
        icon: 'apps',
        pages: [
            { id: 'features', title: 'Apps & features', icon: 'apps' },
            { id: 'defaults', title: 'Default apps', icon: 'defaultApps' },
            { id: 'offlinemaps', title: 'Offline maps', icon: 'map' },
            { id: 'websites', title: 'Apps for websites', icon: 'link' },
            { id: 'video', title: 'Video playback', icon: 'video' },
            { id: 'startup', title: 'Startup', icon: 'startup' },
        ],
    },
    {
        id: 'accounts',
        title: 'Accounts',
        description: 'Your accounts, email, sync, work, family',
        icon: 'accounts',
        pages: [
            { id: 'info', title: 'Your info', icon: 'contact' },
            { id: 'email', title: 'Email & accounts', icon: 'mail' },
            { id: 'signin', title: 'Sign-in options', icon: 'key' },
            { id: 'work', title: 'Access work or school', icon: 'briefcase' },
            { id: 'family', title: 'Family & other users', icon: 'family' },
            { id: 'sync', title: 'Sync your settings', icon: 'sync' },
        ],
    },
    {
        id: 'time',
        title: 'Time & Language',
        description: 'Speech, region, date',
        icon: 'time',
        pages: [
            { id: 'datetime', title: 'Date & time', icon: 'clock' },
            { id: 'region', title: 'Region', icon: 'region' },
            { id: 'language', title: 'Language', icon: 'language' },
            { id: 'speech', title: 'Speech', icon: 'speech' },
        ],
    },
    {
        id: 'gaming',
        title: 'Gaming',
        description: 'Game Bar, captures, Game Mode',
        icon: 'gaming',
        pages: [
            { id: 'gamebar', title: 'Xbox Game Bar', icon: 'gaming' },
            { id: 'captures', title: 'Captures', icon: 'capture' },
            { id: 'gamemode', title: 'Game Mode', icon: 'gaming' },
            { id: 'xbox', title: 'Xbox Networking', icon: 'network' },
        ],
    },
    {
        id: 'ease',
        title: 'Ease of Access',
        description: 'Narrator, magnifier, high contrast',
        icon: 'ease',
        pages: [
            { id: 'display', title: 'Display', icon: 'display' },
            { id: 'cursor', title: 'Mouse pointer', icon: 'cursor' },
            { id: 'textcursor', title: 'Text cursor', icon: 'keyboard' },
            { id: 'magnifier', title: 'Magnifier', icon: 'magnifier' },
            { id: 'colorfilters', title: 'Colour filters', icon: 'color' },
            { id: 'highcontrast', title: 'High contrast', icon: 'contrast' },
            { id: 'narrator', title: 'Narrator', icon: 'narrator' },
            { id: 'audio', title: 'Audio', icon: 'audio' },
            { id: 'captions', title: 'Closed captions', icon: 'captions' },
            { id: 'speech', title: 'Speech', icon: 'speech' },
            { id: 'keyboard', title: 'Keyboard', icon: 'keyboard' },
            { id: 'mouse', title: 'Mouse', icon: 'mouse' },
            { id: 'eyecontrol', title: 'Eye control', icon: 'eye' },
        ],
    },
    {
        id: 'search',
        title: 'Search',
        description: 'Find my files, permissions',
        icon: 'searchCategory',
        pages: [
            { id: 'permissions', title: 'Permissions & History', icon: 'searchCategory' },
            { id: 'searching', title: 'Searching Windows', icon: 'searchCategory' },
        ],
    },
    {
        id: 'privacy',
        title: 'Privacy',
        description: 'Location, camera, microphone',
        icon: 'privacy',
        pages: [
            { id: 'general', title: 'General', icon: 'lock' },
            { id: 'speech', title: 'Speech', icon: 'speech' },
            { id: 'inking', title: 'Inking & typing personalisation', icon: 'pen' },
            { id: 'diagnostics', title: 'Diagnostics & feedback', icon: 'info' },
            { id: 'activity', title: 'Activity history', icon: 'history' },
            { id: 'location', title: 'Location', icon: 'location' },
            { id: 'camera', title: 'Camera', icon: 'camera' },
            { id: 'microphone', title: 'Microphone', icon: 'microphone' },
            { id: 'notifications', title: 'Notifications', icon: 'notifications' },
            { id: 'accountinfo', title: 'Account info', icon: 'contact' },
            { id: 'contacts', title: 'Contacts', icon: 'family' },
        ],
    },
    {
        id: 'update',
        title: 'Update & Security',
        description: 'Windows Update, recovery, backup',
        icon: 'update',
        pages: [
            { id: 'windowsupdate', title: 'Windows Update', icon: 'update' },
            { id: 'delivery', title: 'Delivery Optimisation', icon: 'download' },
            { id: 'security', title: 'Windows Security', icon: 'shield' },
            { id: 'backup', title: 'Backup', icon: 'upload' },
            { id: 'troubleshoot', title: 'Troubleshoot', icon: 'troubleshoot' },
            { id: 'recovery', title: 'Recovery', icon: 'recovery' },
            { id: 'activation', title: 'Activation', icon: 'completed' },
            { id: 'finddevice', title: 'Find my device', icon: 'findDevice' },
            { id: 'developers', title: 'For developers', icon: 'developers' },
        ],
    },
]

export function findCategory(categoryId: string): SettingsCategoryDef | undefined {
    return SETTINGS_CATEGORIES.find(category => category.id === categoryId)
}

export function findPage(
    categoryId: string,
    pageId: string,
): SettingsPageDef | undefined {
    return findCategory(categoryId)?.pages.find(page => page.id === pageId)
}

/** Flat list used by the "Find a setting" search box. */
export const SEARCH_INDEX = SETTINGS_CATEGORIES.flatMap(category =>
    category.pages.map(page => ({
        categoryId: category.id,
        categoryTitle: category.title,
        pageId: page.id,
        title: page.title,
    })),
)
