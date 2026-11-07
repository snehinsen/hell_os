/**
 * Segoe MDL2 Assets glyph map.
 *
 * Windows 10 draws every icon in Settings / Windows Security from this font
 * (it ships with Win10, so the Target VM already has it). Every icon in the
 * HELL UIs goes through <Icon name="..." />, so if a glyph ever looks wrong,
 * fix the code point here and it is fixed everywhere.
 *
 * Reference: https://learn.microsoft.com/windows/apps/design/style/segoe-ui-symbol-font
 */
export const GLYPHS = {
    // Chrome / navigation
    hamburger: '\uE700',
    home: '\uE80F',
    search: '\uE721',
    settings: '\uE713',
    back: '\uE72B',
    add: '\uE710',
    check: '\uE73E',
    completed: '\uE930',
    shield: '\uEA18',

    // Settings home categories
    system: '\uE770',
    devices: '\uE772',
    phone: '\uE8EA',
    network: '\uE774',
    personalization: '\uE771',
    apps: '\uE71D',
    accounts: '\uE77B',
    time: '\uE775',
    gaming: '\uE7FC',
    ease: '\uE776',
    searchCategory: '\uE773',
    privacy: '\uE72E',
    update: '\uE895',

    // System
    display: '\uE7F4',
    sound: '\uE767',
    notifications: '\uE91C',
    focus: '\uE708',
    power: '\uE7E8',
    battery: '\uE83F',
    storage: '\uEDA2',
    tablet: '\uE70A',
    multitasking: '\uE7C4',
    project: '\uEBC6',
    shared: '\uE72D',
    clipboard: '\uE77F',
    remote: '\uE8AF',
    info: '\uE946',

    // Devices
    bluetooth: '\uE702',
    printer: '\uE749',
    mouse: '\uE962',
    touchpad: '\uEFA5',
    keyboard: '\uE765',
    pen: '\uEDC6',
    autoplay: '\uE768',
    usb: '\uE88E',

    // Network & Internet
    wifi: '\uE701',
    ethernet: '\uE839',
    dialup: '\uE717',
    vpn: '\uE705',
    airplane: '\uE709',
    hotspot: '\uE704',
    dataUsage: '\uE9D9',
    globe: '\uE774',

    // Personalization
    picture: '\uE8B9',
    color: '\uE790',
    lock: '\uE72E',
    themes: '\uE771',
    font: '\uE8D2',
    startMenu: '\uE8FC',
    taskbar: '\uE8A5',

    // Apps
    defaultApps: '\uE8FD',
    map: '\uE707',
    video: '\uE714',
    startup: '\uE7E8',
    link: '\uE71B',

    // Accounts
    mail: '\uE715',
    key: '\uE8D7',
    briefcase: '\uE821',
    family: '\uE716',
    sync: '\uE895',
    contact: '\uE77B',

    // Time & Language / Gaming / Ease of Access
    clock: '\uE121',
    region: '\uE909',
    language: '\uE775',
    speech: '\uE720',
    capture: '\uE722',
    cursor: '\uE8B0',
    magnifier: '\uE8A3',
    contrast: '\uE790',
    narrator: '\uE720',
    audio: '\uE767',
    captions: '\uE7F0',
    eye: '\uE7B3',

    // Privacy
    location: '\uE81D',
    camera: '\uE722',
    microphone: '\uE720',
    history: '\uE81C',

    // Update & Security
    download: '\uE896',
    upload: '\uE898',
    troubleshoot: '\uE90F',
    recovery: '\uE777',
    findDevice: '\uE707',
    developers: '\uE943',
    pause: '\uE769',

    // Windows Security
    laptop: '\uE7F8',
    firewall: '\uE839',
    appBrowser: '\uE7C4',
    heart: '\uEB51',
    warning: '\uE7BA',
} as const

export type GlyphName = keyof typeof GLYPHS
