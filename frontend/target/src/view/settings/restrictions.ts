/**
 * "Blocked" messages for Windows Settings.
 *
 * Every control on every Settings page points at one of these ids (see
 * pageSpecs.ts). Each id has one or more variants; the Nth attempt on the same
 * control shows variant N, and the last variant repeats forever, so repeat
 * offenders get escalating (or ignored) responses.
 *
 * RULES FOR WRITING THESE
 *  - Absurd, but with a reason that almost makes sense.
 *  - NEVER hint that the account is low-privileged: no "you don't have
 *    permission", no "run as administrator", no "sign in as an admin". The
 *    blame always goes to a policy, the organisation, or the administrator's
 *    opinions.
 *  - `silent: true` means the control just doesn't respond at all.
 */

export interface RestrictionVariant {
    silent?: boolean
    headline?: string
    detail?: string[]
}

export const RESTRICTIONS: Record<string, RestrictionVariant[]> = {
    /* ---------------- Personalisation ---------------- */
    darkmode: [
        {
            headline: 'This setting has been disabled by your system administrator.',
            detail: [
                'Reason: Your administrator has determined that light mode is unnecessary.',
                'Current policy: Darkness is mandatory.',
            ],
        },
        {
            headline: 'Light mode remains unavailable.',
            detail: [
                'Current policy: Darkness is mandatory.',
                'Your administrator has noted your interest in light.',
            ],
        },
    ],
    wallpaper: [
        {
            headline: 'Wallpaper modification is currently restricted.',
            detail: [
                'Your organization has selected an approved desktop background.',
                'Policy violation attempts remaining: 0.',
            ],
        },
        {
            headline: 'Wallpaper modification is currently restricted.',
            detail: [
                'Policy violation attempts remaining: 0.',
                'Policy violation attempts used: Yes.',
            ],
        },
    ],
    accent: [
        {
            headline: 'This setting is managed by your organization.',
            detail: [
                'Your administrator has selected a colour scheme that they believe represents your productivity.',
                'Current selection: Administrative Beige.',
            ],
        },
    ],
    theme: [
        {
            headline: 'Themes are managed by your organization.',
            detail: [
                'Your administrator has selected a theme called Productive.',
                'It is the only theme. It is also the default theme.',
            ],
        },
    ],
    taskbar: [
        {
            headline: 'Taskbar settings are managed by your administrator.',
            detail: [
                'Your administrator has determined that the taskbar is happiest at the bottom of the screen.',
                'Please do not upset the taskbar.',
            ],
        },
    ],

    /* ---------------- Display ---------------- */
    brightness: [
        {
            headline: 'Brightness adjustment has been disabled by your administrator.',
            detail: [
                'Reason: Your administrator has determined that the screen is already visible.',
                'Current approved brightness: 70%.',
            ],
        },
        {
            headline: 'Brightness adjustment has been disabled by your administrator.',
            detail: [
                'Your administrator has noted that you are still adjusting.',
                'Current approved brightness: Still 70%.',
            ],
        },
    ],
    nightlight: [
        {
            headline: 'Night light is unavailable.',
            detail: [
                'Your administrator has determined that the sun is a sufficient source of natural lighting.',
            ],
        },
    ],
    scale: [
        {
            headline: 'Scaling is managed by your administrator.',
            detail: [
                'Your administrator has determined that everything is already the correct size.',
            ],
        },
    ],
    resolution: [
        {
            headline: 'Display configuration is managed by your system administrator.',
            detail: [
                'Your current resolution has been determined to be sufficient for all approved activities.',
                'Further requests will be ignored.',
            ],
        },
        // As promised: every request after the first is ignored.
        { silent: true },
    ],
    orientation: [
        {
            headline: 'Display orientation cannot be changed.',
            detail: [
                'Your administrator has determined that the screen is oriented correctly.',
                'Gravity has been consulted.',
            ],
        },
    ],

    /* ---------------- Sound ---------------- */
    volume: [
        {
            headline: 'Volume adjustment has been restricted.',
            detail: [
                'Your administrator has established an approved volume level.',
                'Current approved volume: 37%.',
            ],
        },
    ],
    systemsounds: [
        {
            headline: 'System sounds cannot be disabled.',
            detail: [
                'Your administrator says: Your computer must be able to communicate its disappointment.',
            ],
        },
    ],
    outputdevice: [
        {
            headline: 'Output device selection is managed by your organization.',
            detail: [
                'Your speakers have been assigned. They are not interested in changing roles.',
            ],
        },
    ],

    /* ---------------- System ---------------- */
    notifications: [
        {
            headline: 'Notification settings are managed by your administrator.',
            detail: [
                'Your administrator has determined that you are already notified enough.',
            ],
        },
    ],
    focus: [
        {
            headline: 'Focus assist cannot be enabled.',
            detail: [
                'Your administrator has determined that distractions are an approved part of your workflow.',
            ],
        },
    ],
    sleep: [
        {
            headline: 'Sleep settings are managed by your administrator.',
            detail: [
                'Your administrator has determined that sleep is unproductive.',
                'Current approved sleep: Never.',
            ],
        },
    ],
    hibernate: [
        {
            headline: 'Hibernate has been disabled by your system administrator.',
            detail: [
                'Your administrator says: Your computer must remain emotionally available.',
            ],
        },
    ],
    // Storage Sense: deliberately no message at all.
    storagesense: [{ silent: true }],
    clipboard: [
        {
            headline: 'Clipboard history is unavailable.',
            detail: [
                'Your administrator would prefer that you remembered things yourself.',
            ],
        },
    ],
    rename: [
        {
            headline: 'This PC cannot be renamed.',
            detail: [
                'Your administrator has determined that your computer is happy with its name.',
            ],
        },
    ],

    /* ---------------- Devices ---------------- */
    bluetooth: [
        {
            headline: 'Bluetooth has been disabled by your administrator.',
            detail: [
                'Your computer may only form relationships with approved devices.',
                'There are currently no approved devices.',
            ],
        },
    ],
    adddevice: [
        {
            headline: 'Adding devices is currently restricted.',
            detail: [
                'Your administrator has determined that you already have enough devices.',
            ],
        },
    ],
    addprinter: [
        {
            headline: 'A printer was found: HP LaserJet.',
            detail: [
                'Windows Security has classified this device as a threat.',
                'Installation has been cancelled for your safety.',
            ],
        },
        {
            headline: 'No other printers were found.',
            detail: ['The only printer found is still HP LaserJet.'],
        },
    ],
    printerrow: [
        {
            headline: 'This printer is unavailable.',
            detail: [
                'Windows Security has classified this printer as potentially hostile.',
                'It is not permitted to print until it has been investigated.',
            ],
        },
    ],
    mousespeed: [
        {
            headline: 'Mouse configuration is managed by your administrator.',
            detail: [
                'Current sensitivity has been approved by the Department of Cursor Affairs.',
            ],
        },
    ],
    primarybutton: [
        {
            headline: 'Button assignment is managed by your administrator.',
            detail: [
                'The left button has been designated as left.',
                'The right button has been designated as right.',
            ],
        },
    ],
    typing: [
        {
            headline: 'Typing settings are managed by your administrator.',
            detail: [
                'Your administrator has determined that you already type correctly enough.',
            ],
        },
    ],
    keyboardlayout: [
        {
            headline: 'Keyboard layout modification denied.',
            detail: [
                'Your administrator has determined that your current keyboard layout is a privilege, not a right.',
            ],
        },
    ],

    /* ---------------- Network & Internet ---------------- */
    network: [
        {
            headline: 'Network settings are managed by your organization.',
            detail: [
                'Your administrator has determined that the network is working as intended.',
            ],
        },
    ],
    networkreset: [
        {
            headline: 'Network reset is unavailable.',
            detail: [
                'Your network is currently functioning. Resetting it would be wasteful.',
            ],
        },
    ],
    wifi: [
        {
            headline: 'Wi-Fi settings are managed by your organization.',
            detail: [
                'Your administrator has determined that the Internet is currently being used responsibly.',
            ],
        },
    ],
    flightmode: [
        {
            headline: 'Flight mode is unavailable.',
            detail: ['Your computer is not currently airborne.'],
        },
    ],
    vpn: [
        {
            headline: 'VPN connections are not permitted.',
            detail: [
                'Your administrator has determined that your computer has nothing to hide.',
            ],
        },
    ],
    hotspot: [
        {
            headline: 'Mobile hotspot is unavailable.',
            detail: ['Your computer is not currently mobile.'],
        },
    ],

    /* ---------------- Apps ---------------- */
    appsource: [
        {
            headline: 'App source is managed by your administrator.',
            detail: [
                'Your administrator would like you to get apps from wherever apps currently are.',
            ],
        },
    ],
    // Uninstalling anything: deliberately no message at all.
    uninstall: [{ silent: true }],

    /* ---------------- Accounts ---------------- */
    msaccount: [
        {
            headline: 'Microsoft account sign-in is unavailable.',
            detail: ['Your computer already knows who you are.'],
        },
    ],
    profilepicture: [
        {
            headline: 'Profile pictures are managed by your administrator.',
            detail: [
                'Your administrator has already chosen a picture. It is not this one.',
            ],
        },
    ],
    password: [
        {
            headline: 'Password changes are managed by your organization.',
            detail: ['Your administrator is still using the previous one.'],
        },
    ],
    signin: [
        {
            headline: 'This sign-in option has been disabled.',
            detail: [
                'Your administrator remembers all passwords on your behalf.',
            ],
        },
    ],

    /* ---------------- Time & Language ---------------- */
    autotime: [
        {
            headline: 'Automatic time synchronization has been disabled by your administrator.',
            detail: [
                'Your computer will determine the current time independently.',
                'Your administrator says: Accuracy is not guaranteed.',
            ],
        },
    ],
    timezone: [
        {
            headline: 'Time zone changes are restricted.',
            detail: [
                'Your computer has determined that it is currently in the correct time zone.',
                'Please do not confuse it.',
            ],
        },
    ],
    changedate: [
        {
            headline: 'Manual time changes are not permitted.',
            detail: ['Your administrator has already set the time. It is now.'],
        },
    ],
    region: [
        {
            headline: 'Region settings are managed by your organization.',
            detail: [
                'Your administrator has confirmed that you are in the correct country.',
            ],
        },
    ],
    language: [
        {
            headline: 'Language changes are restricted.',
            detail: ['Your computer already understands you well enough.'],
        },
    ],

    /* ---------------- Gaming / Ease of Access ---------------- */
    gamebar: [
        {
            headline: 'Xbox Game Bar is unavailable.',
            detail: ['Your administrator does not consider this a game.'],
        },
    ],
    narrator: [
        {
            headline: 'Narrator is unavailable.',
            detail: ['Your computer has nothing to say.'],
        },
    ],
    magnifier: [
        {
            headline: 'Magnifier is unavailable.',
            detail: ['Everything is already the correct size.'],
        },
    ],
    highcontrast: [
        {
            headline: 'High contrast is managed by your administrator.',
            detail: ['Contrast levels have been approved.'],
        },
    ],

    /* ---------------- Privacy ---------------- */
    location: [
        {
            headline: 'Location services are unavailable.',
            detail: ['Your administrator already knows where you are.'],
        },
    ],
    camera: [
        {
            headline: 'Camera access is managed by your organization.',
            detail: [
                'Your camera has been reassigned to a different department.',
            ],
        },
    ],
    microphone: [
        {
            headline: 'Microphone access is managed by your organization.',
            detail: [
                'Your microphone is currently listening to someone else.',
                'Please try again later.',
            ],
        },
    ],

    /* ---------------- Update & Security ---------------- */
    checkupdates: [
        {
            headline: 'Windows Update is currently busy.',
            detail: [
                'Windows Update is updating Windows Update.',
                'Please try again later.',
            ],
        },
        {
            headline: 'Windows Update is still busy.',
            detail: ['It has not finished updating itself.'],
        },
    ],
    pauseupdates: [
        {
            headline: 'Updates cannot be paused.',
            detail: [
                'Updates are currently in progress.',
                'They have been in progress for some time.',
            ],
        },
    ],
    activehours: [
        {
            headline: 'Active hours are managed by your administrator.',
            detail: [
                'Your administrator has determined that all hours are active.',
                'Sleeping is not currently approved.',
            ],
        },
    ],
    updatehistory: [
        {
            headline: 'Update history is unavailable.',
            detail: [
                'No updates have been recorded because updates have not finished.',
            ],
        },
    ],
    advancedupdate: [
        {
            headline: 'Advanced options are unavailable.',
            detail: [
                'Your administrator has determined that your options are already advanced enough.',
            ],
        },
    ],
    resetpc: [
        {
            headline: 'This PC cannot be reset.',
            detail: [
                'Your administrator has determined that this PC is not currently broken enough.',
            ],
        },
    ],
    advancedstartup: [
        {
            headline: 'A restart is not currently approved.',
            detail: [
                'Restarts are scheduled by your administrator.',
                'Next approved restart: To be determined.',
            ],
        },
    ],
    backup: [
        {
            headline: 'Backup is unavailable.',
            detail: [
                'Your files are considered to be backed up in spirit.',
            ],
        },
    ],
}
