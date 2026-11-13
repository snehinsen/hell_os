import type { GlyphName } from '../../components/glyphs'

/**
 * Declarative description of every Settings page.
 *
 * Adding a new blocked control = add an element here and a matching entry in
 * restrictions.ts. `restriction` is the id of the "blocked" message; an element
 * with NO `restriction` is a real, working control: toggles and drop-downs
 * remember their value between sessions (see components/settingsStore.ts).
 *
 * A page that contains at least one blocked control automatically gets the
 * Win10 "Some settings are hidden or managed by your organization" banner
 * under its title (override with `managed`).
 */

export interface AsideGroup {
    heading: string
    text?: string
    links: string[]
}

export interface AppEntry {
    name: string
    size: string
    bytes: number
    /** ISO date, e.g. 2026-06-12 */
    date: string
}

export type SpecElement =
    | { t: 'section'; title: string }
    | { t: 'text'; text: string; muted?: boolean }
    | { t: 'toggle'; label: string; on?: boolean; restriction?: string }
    | { t: 'select'; label: string; options: string[]; restriction?: string }
    | { t: 'range'; label: string; value: number; restriction: string }
    | { t: 'button'; label: string; restriction?: string; primary?: boolean }
    | { t: 'link'; label: string; restriction?: string }
    | { t: 'row'; icon?: GlyphName; iconColor?: string; title: string; description?: string; restriction?: string }
    | { t: 'kv'; label: string; value: string }
    | { t: 'status'; icon: GlyphName; color: string; title: string; subtitle?: string }
    | { t: 'applist'; apps: AppEntry[] }
    | { t: 'preview' }
    | { t: 'profile' }
    | { t: 'updatestatus' }
    | { t: 'activehours' }
    | { t: 'updatehistory' }
    | { t: 'refreshrate' }

export interface PageSpec {
    related?: AsideGroup[]
    elements: SpecElement[]
    /** Force the "managed by your organization" banner on or off. */
    managed?: boolean
    /** Windows Update variant: adds "View configured update policies". */
    policyLink?: boolean
}

const GREEN = '#6CCB5F'
const AMBER = '#FFB900'
const RED = '#F1707B'

export const FALLBACK_SPEC: PageSpec = {
    managed: true,
    elements: [
        {
            t: 'text',
            text: 'Your administrator has not yet decided what you are allowed to do here.',
            muted: true,
        },
    ],
}

const INSTALLED_APPS: AppEntry[] = [
    { name: '3D Viewer', size: '16.0 KB', bytes: 16384, date: '2026-06-12' },
    { name: 'Calculator', size: '24.0 KB', bytes: 24576, date: '2026-06-12' },
    { name: 'Camera', size: '16.0 KB', bytes: 16384, date: '2026-06-12' },
    { name: 'Mail and Calendar', size: '1.20 MB', bytes: 1258291, date: '2026-07-03' },
    { name: 'Microsoft Edge', size: '178 MB', bytes: 186646528, date: '2026-10-14' },
    { name: 'Notepad', size: '184 KB', bytes: 188416, date: '2026-06-12' },
    { name: 'Paint 3D', size: '16.0 KB', bytes: 16384, date: '2026-06-12' },
    { name: 'Windows Security', size: '1.00 MB', bytes: 1048576, date: '2026-06-12' },
]

export const PAGE_SPECS: Record<string, PageSpec> = {
    /* ================= System ================= */
    'system/display': {
        related: [
            { heading: 'Related settings', links: ['Advanced display settings', 'Graphics settings'] },
            {
                heading: 'Sleep better',
                text: 'Night light can help you get to sleep by displaying warmer colours at night.',
                links: ['Set up Night light'],
            },
        ],
        elements: [
            { t: 'section', title: 'Brightness and colour' },
            { t: 'range', label: 'Change brightness for the built-in display', value: 70, restriction: 'brightness' },
            { t: 'toggle', label: 'Night light', restriction: 'nightlight' },
            { t: 'link', label: 'Night light settings', restriction: 'nightlight' },
            { t: 'section', title: 'Scale and layout' },
            { t: 'select', label: 'Change the size of text, apps, and other items', options: ['100% (Recommended)', '125%', '150%', '175%'], restriction: 'scale' },
            { t: 'select', label: 'Display resolution', options: ['1920 × 1080 (Recommended)', '1680 × 1050', '1600 × 900', '1366 × 768', '1280 × 720'], restriction: 'resolution' },
            { t: 'select', label: 'Display orientation', options: ['Landscape', 'Portrait', 'Landscape (flipped)', 'Portrait (flipped)'], restriction: 'orientation' },
            // Deliberately NOT blocked: a real, working control.
            { t: 'section', title: 'Advanced display settings' },
            { t: 'refreshrate' },
        ],
    },

    'system/sound': {
        related: [{ heading: 'Related settings', links: ['Sound Control Panel', 'Microphone privacy settings'] }],
        elements: [
            { t: 'section', title: 'Output' },
            { t: 'select', label: 'Choose your output device', options: ['Speakers (High Definition Audio Device)'], restriction: 'outputdevice' },
            { t: 'range', label: 'Master volume', value: 37, restriction: 'volume' },
            { t: 'section', title: 'Other sound options' },
            { t: 'toggle', label: 'Play Windows system sounds', on: true, restriction: 'systemsounds' },
        ],
    },

    'system/notifications': {
        elements: [
            { t: 'toggle', label: 'Get notifications from apps and other senders', on: true, restriction: 'notifications' },
            { t: 'toggle', label: 'Show notifications on the lock screen', on: true, restriction: 'notifications' },
            { t: 'toggle', label: 'Get tips, tricks, and suggestions as you use Windows', on: true },
        ],
    },

    'system/focus': {
        elements: [
            { t: 'select', label: 'Focus assist', options: ['Off', 'Priority only', 'Alarms only'], restriction: 'focus' },
        ],
    },

    // Desktop PC: no battery, so no "on battery power" options.
    'system/power': {
        related: [{ heading: 'Related settings', links: ['Additional power settings'] }],
        elements: [
            { t: 'section', title: 'Screen' },
            { t: 'select', label: 'Turn off after', options: ['Never', '10 minutes', '15 minutes'], restriction: 'sleep' },
            { t: 'section', title: 'Sleep' },
            { t: 'select', label: 'PC goes to sleep after', options: ['Never', '15 minutes', '30 minutes'], restriction: 'sleep' },
            { t: 'section', title: 'Shutdown settings' },
            { t: 'toggle', label: 'Hibernate', restriction: 'hibernate' },
        ],
    },

    'system/storage': {
        elements: [
            { t: 'section', title: 'Storage' },
            { t: 'row', icon: 'storage', title: 'Local Disk (C:)', description: '94.2 GB used of 237 GB' },
            { t: 'section', title: 'Storage Sense' },
            { t: 'toggle', label: 'Storage Sense can automatically free up space by getting rid of files you don’t need, like temporary files and content in your recycle bin.', restriction: 'storagesense' },
            { t: 'link', label: 'Configure Storage Sense or run it now', restriction: 'storagesense' },
        ],
    },

    'system/multitasking': {
        elements: [
            { t: 'section', title: 'Snap windows' },
            { t: 'toggle', label: 'Arrange windows automatically by dragging them to the sides or corners of the screen', on: true },
            { t: 'toggle', label: 'When I snap a window, automatically size it to fill available space', on: true },
            { t: 'toggle', label: 'When I snap a window, show what I can snap next to it', on: true },
            { t: 'section', title: 'Virtual desktops' },
            { t: 'select', label: 'On the taskbar, show windows that are open on', options: ['Only the desktop I’m using', 'All desktops'] },
            { t: 'select', label: 'Pressing Alt+Tab shows windows that are open on', options: ['Only the desktop I’m using', 'All desktops'] },
        ],
    },

    'system/clipboard': {
        elements: [
            { t: 'toggle', label: 'Clipboard history', restriction: 'clipboard' },
            { t: 'toggle', label: 'Sync across devices', restriction: 'clipboard' },
        ],
    },

    'system/about': {
        related: [
            { heading: 'Related settings', links: ['BitLocker settings', 'Device Manager', 'Remote desktop', 'System protection', 'Advanced system settings'] },
        ],
        elements: [
            { t: 'status', icon: 'shield', color: AMBER, title: 'Your PC is monitored and has some security recommendations.', subtitle: 'See details in Windows Security' },
            { t: 'section', title: 'Device specifications' },
            { t: 'kv', label: 'Device name', value: 'DESKTOP-H3LL0S1' },
            { t: 'kv', label: 'Processor', value: 'Intel(R) Core(TM) i5-8400 CPU @ 2.80GHz   2.81 GHz' },
            { t: 'kv', label: 'Installed RAM', value: '16.0 GB (15.9 GB usable)' },
            { t: 'kv', label: 'Device ID', value: '5E1F2A3C-7B40-4D9A-9C61-0AE4D8B2F713' },
            { t: 'kv', label: 'Product ID', value: '00331-10000-00001-AA512' },
            { t: 'kv', label: 'System type', value: '64-bit operating system, x64-based processor' },
            { t: 'kv', label: 'Pen and touch', value: 'No pen or touch input is available for this display' },
            { t: 'button', label: 'Copy' },
            { t: 'button', label: 'Rename this PC', restriction: 'rename' },
            { t: 'section', title: 'Windows specifications' },
            { t: 'kv', label: 'Edition', value: 'Windows 10 Pro' },
            { t: 'kv', label: 'Version', value: '22H2' },
            { t: 'kv', label: 'OS build', value: '19045.2006' },
            { t: 'button', label: 'Copy' },
            { t: 'link', label: 'Change product key or upgrade your edition of Windows' },
            { t: 'link', label: 'Read the Microsoft Services Agreement that applies to our services' },
            { t: 'link', label: 'Read the Microsoft Software License Terms' },
        ],
    },

    /* ================= Devices ================= */
    'devices/bluetooth': {
        related: [{ heading: 'Related settings', links: ['Devices and printers', 'Sound settings', 'Display settings', 'More Bluetooth options'] }],
        elements: [
            { t: 'button', label: '+  Add Bluetooth or other device', restriction: 'adddevice' },
            { t: 'toggle', label: 'Bluetooth', on: true, restriction: 'bluetooth' },
            { t: 'text', text: 'Now discoverable as “DESKTOP-H3LL0S1”', muted: true },
            { t: 'section', title: 'Mouse, keyboard, & pen' },
            { t: 'row', icon: 'mouse', title: 'USB Optical Mouse' },
            { t: 'row', icon: 'keyboard', title: 'USB Keyboard' },
            { t: 'section', title: 'Audio' },
            { t: 'row', icon: 'sound', title: 'Speakers (High Definition Audio Device)' },
            { t: 'section', title: 'Other devices' },
            { t: 'row', icon: 'display', title: 'Generic PnP Monitor' },
        ],
    },

    'devices/printers': {
        related: [{ heading: 'Related settings', links: ['Device and printer settings', 'Print server properties'] }],
        elements: [
            { t: 'button', label: '+  Add a printer or scanner', restriction: 'addprinter' },
            { t: 'section', title: 'Printers & scanners' },
            { t: 'row', icon: 'printer', iconColor: RED, title: 'HP LaserJet', description: 'Threat detected', restriction: 'printerrow' },
            { t: 'row', icon: 'printer', title: 'Microsoft Print to PDF' },
            { t: 'row', icon: 'printer', title: 'OneNote (Desktop)' },
        ],
    },

    'devices/mouse': {
        elements: [
            { t: 'select', label: 'Select your primary button', options: ['Left', 'Right'], restriction: 'primarybutton' },
            { t: 'range', label: 'Cursor speed', value: 10, restriction: 'mousespeed' },
            { t: 'select', label: 'Choose how many lines to scroll each time', options: ['3 lines', '1 line', '5 lines'] },
            { t: 'toggle', label: 'Scroll inactive windows when I hover over them', on: true },
        ],
    },

    'devices/typing': {
        elements: [
            { t: 'toggle', label: 'Autocorrect misspelled words', on: true },
            { t: 'toggle', label: 'Highlight misspelled words', on: true },
            { t: 'toggle', label: 'Show text suggestions as I type on the hardware keyboard', restriction: 'typing' },
        ],
    },

    'devices/autoplay': {
        elements: [
            { t: 'toggle', label: 'Use AutoPlay for all media and devices', on: true },
            { t: 'section', title: 'Choose AutoPlay defaults' },
            { t: 'select', label: 'Removable drive', options: ['Ask me every time', 'Open folder to view files (File Explorer)', 'Take no action'] },
            { t: 'select', label: 'Memory card', options: ['Ask me every time', 'Open folder to view files (File Explorer)', 'Take no action'] },
        ],
    },

    /* ================= Network & Internet ================= */
    'network/status': {
        elements: [
            { t: 'section', title: 'Network status' },
            { t: 'status', icon: 'ethernet', color: '#0078D7', title: 'Ethernet', subtitle: 'Public network • You’re connected to the Internet' },
            { t: 'text', text: 'If you have a limited data plan, you can make this network a metered connection or change other properties.', muted: true },
            { t: 'button', label: 'Properties', restriction: 'network' },
            { t: 'section', title: 'Change your network settings' },
            { t: 'row', icon: 'ethernet', title: 'Change adapter options', description: 'View network adapters and change connection settings.', restriction: 'network' },
            { t: 'row', icon: 'shared', title: 'Sharing options', description: 'For the networks you connect to, decide what you want to share.', restriction: 'network' },
            { t: 'row', icon: 'troubleshoot', title: 'Network troubleshooter', description: 'Diagnose and fix network problems.', restriction: 'network' },
            { t: 'link', label: 'Windows Firewall', restriction: 'network' },
            { t: 'link', label: 'Network and Sharing Centre', restriction: 'network' },
            { t: 'link', label: 'Network reset', restriction: 'networkreset' },
        ],
    },

    'network/wifi': {
        elements: [
            { t: 'toggle', label: 'Wi-Fi', on: true, restriction: 'wifi' },
            { t: 'link', label: 'Show available networks', restriction: 'wifi' },
            { t: 'link', label: 'Hardware properties', restriction: 'wifi' },
            { t: 'link', label: 'Manage known networks', restriction: 'wifi' },
            { t: 'section', title: 'Random hardware addresses' },
            { t: 'text', text: 'Use random hardware addresses to make it harder for people to track your location when you connect to different Wi-Fi networks.' },
            { t: 'toggle', label: 'Random hardware addresses', restriction: 'wifi' },
        ],
    },

    'network/airplane': {
        elements: [
            { t: 'toggle', label: 'Flight mode', restriction: 'flightmode' },
            { t: 'section', title: 'Wireless devices' },
            { t: 'toggle', label: 'Wi-Fi', on: true, restriction: 'wifi' },
            { t: 'toggle', label: 'Bluetooth', on: true, restriction: 'bluetooth' },
        ],
    },

    'network/vpn': {
        elements: [
            { t: 'button', label: '+  Add a VPN connection', restriction: 'vpn' },
            { t: 'section', title: 'Advanced options' },
            { t: 'toggle', label: 'Allow VPN over metered networks', on: true, restriction: 'vpn' },
            { t: 'toggle', label: 'Allow VPN while roaming', on: true, restriction: 'vpn' },
        ],
    },

    'network/hotspot': {
        elements: [
            { t: 'toggle', label: 'Share my Internet connection with other devices', restriction: 'hotspot' },
        ],
    },

    /* ================= Personalisation ================= */
    'personalization/background': {
        related: [{ heading: 'Related settings', links: ['High contrast settings', 'Sync your settings'] }],
        elements: [
            { t: 'preview' },
            { t: 'select', label: 'Background', options: ['Picture', 'Solid colour', 'Slideshow'], restriction: 'wallpaper' },
            { t: 'button', label: 'Browse', restriction: 'wallpaper' },
            { t: 'select', label: 'Choose a fit', options: ['Fill', 'Fit', 'Stretch', 'Tile', 'Centre', 'Span'], restriction: 'wallpaper' },
        ],
    },

    'personalization/colors': {
        elements: [
            { t: 'select', label: 'Choose your colour', options: ['Dark', 'Light', 'Custom'], restriction: 'darkmode' },
            { t: 'toggle', label: 'Transparency effects', on: true, restriction: 'accent' },
            { t: 'select', label: 'Choose your accent colour', options: ['Administrative Beige', 'Windows blue', 'Gold', 'Magenta'], restriction: 'accent' },
            { t: 'toggle', label: 'Automatically pick an accent colour from my background', restriction: 'accent' },
        ],
    },

    'personalization/lockscreen': {
        elements: [
            { t: 'select', label: 'Background', options: ['Picture', 'Windows spotlight', 'Slideshow'], restriction: 'wallpaper' },
            { t: 'toggle', label: 'Show lock screen background picture on the sign-in screen', on: true, restriction: 'wallpaper' },
        ],
    },

    'personalization/themes': {
        elements: [
            { t: 'select', label: 'Current theme', options: ['Productive'], restriction: 'theme' },
            { t: 'button', label: 'Get more themes in Microsoft Store', restriction: 'theme' },
        ],
    },

    'personalization/start': {
        elements: [
            { t: 'toggle', label: 'Show more tiles on Start' },
            { t: 'toggle', label: 'Show app list in Start menu', on: true },
            { t: 'toggle', label: 'Show recently added apps', on: true },
            { t: 'toggle', label: 'Show most used apps', on: true },
            { t: 'toggle', label: 'Use Start full screen' },
            { t: 'toggle', label: 'Show recently opened items in Jump Lists on Start or the taskbar and in File Explorer Quick Access', on: true },
        ],
    },

    'personalization/taskbar': {
        elements: [
            { t: 'toggle', label: 'Lock the taskbar', on: true, restriction: 'taskbar' },
            { t: 'toggle', label: 'Automatically hide the taskbar in desktop mode', restriction: 'taskbar' },
            { t: 'toggle', label: 'Use small taskbar buttons', restriction: 'taskbar' },
            { t: 'select', label: 'Taskbar location on screen', options: ['Bottom', 'Left', 'Top', 'Right'], restriction: 'taskbar' },
        ],
    },

    /* ================= Apps ================= */
    'apps/features': {
        related: [{ heading: 'Related settings', links: ['Programs and Features'] }],
        elements: [
            { t: 'text', text: 'Installing only apps from the Microsoft Store helps protect your device.', muted: true },
            { t: 'select', label: 'Choose where to get apps', options: ['Anywhere', 'The Microsoft Store only'], restriction: 'appsource' },
            { t: 'link', label: 'Optional features', restriction: 'appsource' },
            { t: 'link', label: 'App execution aliases', restriction: 'appsource' },
            { t: 'section', title: 'Apps & features' },
            { t: 'applist', apps: INSTALLED_APPS },
        ],
    },

    /* ================= Accounts ================= */
    'accounts/info': {
        related: [{ heading: 'Related settings', links: ['Sign-in options', 'Family & other users'] }],
        elements: [
            { t: 'profile' },
            { t: 'link', label: 'Sign in with a Microsoft account instead', restriction: 'msaccount' },
            { t: 'section', title: 'Create your picture' },
            { t: 'button', label: 'Camera', restriction: 'profilepicture' },
            { t: 'button', label: 'Browse for one', restriction: 'profilepicture' },
        ],
    },

    'accounts/signin': {
        elements: [
            { t: 'section', title: 'Password' },
            { t: 'text', text: 'Change your account password' },
            { t: 'button', label: 'Change', restriction: 'password' },
            { t: 'section', title: 'PIN' },
            { t: 'text', text: 'Create a PIN to use in place of passwords. You’ll be asked for this PIN when you sign in to Windows, apps, and services.' },
            { t: 'button', label: 'Add', restriction: 'signin' },
            { t: 'section', title: 'Windows Hello' },
            { t: 'text', text: 'Windows Hello isn’t available on this device.', muted: true },
        ],
    },

    /* ================= Time & Language ================= */
    'time/datetime': {
        related: [{ heading: 'Related settings', links: ['Date, time & regional formatting', 'Add clocks for different time zones'] }],
        elements: [
            { t: 'toggle', label: 'Set time automatically', restriction: 'autotime' },
            { t: 'toggle', label: 'Set time zone automatically', restriction: 'timezone' },
            { t: 'section', title: 'Set the date and time manually' },
            { t: 'button', label: 'Change', restriction: 'changedate' },
            { t: 'select', label: 'Time zone', options: ['(UTC) Coordinated Universal Time'], restriction: 'timezone' },
            { t: 'toggle', label: 'Adjust for daylight saving time automatically', on: true, restriction: 'timezone' },
        ],
    },

    'time/region': {
        elements: [
            { t: 'select', label: 'Country or region', options: ['United Kingdom'], restriction: 'region' },
            { t: 'select', label: 'Regional format', options: ['English (United Kingdom)'], restriction: 'region' },
        ],
    },

    'time/language': {
        elements: [
            { t: 'select', label: 'Windows display language', options: ['English (United Kingdom)'], restriction: 'language' },
            { t: 'section', title: 'Preferred languages' },
            { t: 'button', label: '+  Add a preferred language', restriction: 'language' },
            { t: 'section', title: 'Keyboards' },
            { t: 'row', icon: 'keyboard', title: 'English (United Kingdom)', description: 'Keyboard layout: UK' },
            { t: 'link', label: 'Choose an input method', restriction: 'keyboardlayout' },
            { t: 'button', label: '+  Add a keyboard', restriction: 'keyboardlayout' },
        ],
    },

    /* ================= Gaming / Ease of Access ================= */
    'gaming/gamebar': {
        elements: [
            { t: 'toggle', label: 'Record game clips, screenshots, and broadcast using Game bar', on: true, restriction: 'gamebar' },
        ],
    },
    'gaming/gamemode': {
        elements: [{ t: 'toggle', label: 'Game Mode', on: true }],
    },
    'ease/narrator': {
        elements: [{ t: 'toggle', label: 'Use Narrator', restriction: 'narrator' }],
    },
    'ease/magnifier': {
        elements: [{ t: 'toggle', label: 'Turn on Magnifier', restriction: 'magnifier' }],
    },
    'ease/highcontrast': {
        elements: [{ t: 'toggle', label: 'Turn on high contrast', restriction: 'highcontrast' }],
    },

    /* ================= Search ================= */
    'search/permissions': {
        elements: [
            { t: 'select', label: 'SafeSearch', options: ['Moderate', 'Strict', 'Off'] },
            { t: 'section', title: 'Cloud content search' },
            { t: 'toggle', label: 'Microsoft account', on: true },
            { t: 'toggle', label: 'Work or School account', on: true },
            { t: 'section', title: 'History' },
            { t: 'toggle', label: 'Search history on this device', on: true },
            { t: 'button', label: 'Clear device search history' },
        ],
    },

    /* ================= Privacy ================= */
    'privacy/general': {
        elements: [
            { t: 'toggle', label: 'Let apps use advertising ID to make ads more interesting to you based on your app activity (Turning this off will reset your ID.)', on: true },
            { t: 'toggle', label: 'Let websites provide locally relevant content by accessing my language list', on: true },
            { t: 'toggle', label: 'Let Windows track app launches to improve Start and search results', on: true },
            { t: 'toggle', label: 'Show me suggested content in the Settings app', on: true },
        ],
    },
    'privacy/location': {
        elements: [
            { t: 'toggle', label: 'Location for this device', on: true, restriction: 'location' },
            { t: 'toggle', label: 'Allow apps to access your location', on: true, restriction: 'location' },
        ],
    },
    'privacy/camera': {
        elements: [
            { t: 'toggle', label: 'Allow apps to access your camera', on: true, restriction: 'camera' },
        ],
    },
    'privacy/microphone': {
        elements: [
            { t: 'toggle', label: 'Allow apps to access your microphone', on: true, restriction: 'microphone' },
        ],
    },

    /* ================= Update & Security ================= */
    'update/windowsupdate': {
        managed: true,
        policyLink: true,
        related: [
            { heading: 'Looking for info on the latest updates?', links: ['Learn more'] },
            { heading: 'Related links', links: ['Check Storage', 'OS build info'] },
        ],
        elements: [
            { t: 'updatestatus' },
            { t: 'row', icon: 'pause', title: 'Pause updates for 7 days', description: 'Visit Advanced options to change the pause period', restriction: 'pauseupdates' },
            { t: 'activehours' },
            { t: 'updatehistory' },
            { t: 'row', icon: 'settings', title: 'Advanced options', description: 'Additional update controls and settings', restriction: 'advancedupdate' },
        ],
    },

    'update/security': {
        elements: [
            { t: 'text', text: 'Windows Security is your home to view and manage the security and health of your device.' },
            { t: 'button', label: 'Open Windows Security' },
            { t: 'section', title: 'Protection areas' },
            { t: 'row', icon: 'shield', iconColor: RED, title: 'Virus & threat protection', description: 'Action needed' },
            { t: 'row', icon: 'contact', iconColor: GREEN, title: 'Account protection', description: 'No action needed.' },
            { t: 'row', icon: 'firewall', iconColor: AMBER, title: 'Firewall & network protection', description: 'Action recommended' },
            { t: 'row', icon: 'appBrowser', iconColor: AMBER, title: 'App & browser control', description: 'Action recommended' },
            { t: 'row', icon: 'laptop', title: 'Device security', description: 'View status and manage hardware security features' },
            { t: 'row', icon: 'heart', iconColor: AMBER, title: 'Device performance & health', description: 'Action recommended' },
            { t: 'row', icon: 'family', title: 'Family options', description: 'Manage how your family uses their devices.' },
        ],
    },

    'update/recovery': {
        related: [{ heading: 'Help from the web', links: ['Creating a recovery drive'] }],
        elements: [
            { t: 'section', title: 'Reset this PC' },
            { t: 'text', text: 'If your PC isn’t running well, resetting it might help. This lets you choose to keep your personal files or remove them, and then reinstalls Windows.' },
            { t: 'button', label: 'Get started', restriction: 'resetpc' },
            { t: 'section', title: 'Advanced startup' },
            { t: 'text', text: 'Start up from a device or disc (such as a USB drive or DVD), change Windows startup settings, or restore Windows from a system image. This will restart your PC.' },
            { t: 'button', label: 'Restart now', restriction: 'advancedstartup' },
        ],
    },

    'update/backup': {
        elements: [
            { t: 'section', title: 'Back up using File History' },
            { t: 'text', text: 'Back up your files to another drive and restore them if the originals are lost, damaged, or deleted.' },
            { t: 'toggle', label: 'Automatically back up my files', restriction: 'backup' },
            { t: 'button', label: '+  Add a drive', restriction: 'backup' },
        ],
    },
}
