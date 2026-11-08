/**
 * Windows Security ("Defender") content: threats, alerts, and every message
 * the app shows when something goes wrong.
 *
 * RULES FOR WRITING THESE
 *  - Reasonably convincing UI, increasingly questionable security decisions.
 *  - Absurd, but with a reason that almost makes sense.
 *  - Never hint that the account is low-privileged. Blame the threat, the
 *    scan, the administrator's policies, or the committee.
 */

export type PageId =
    | 'home'
    | 'virus'
    | 'virus-threats'
    | 'virus-options'
    | 'virus-history'
    | 'virus-allowed'
    | 'virus-settings'
    | 'virus-updates'
    | 'account'
    | 'firewall'
    | 'app'
    | 'device'
    | 'health'
    | 'family'
    | 'settings'

export type Level = 'ok' | 'warn' | 'error' | 'none'

export interface Msg {
    headline: string
    detail: string[]
}

export interface AsideGroup {
    heading: string
    text?: string
    links: string[]
}

export type Severity = 'Low' | 'Moderate' | 'High' | 'Severe' | 'Critical'

export interface Threat {
    id: string
    app: string
    threatName: string
    severity: Severity
    description: string
    risk?: string
    action: string
}

export interface AlertDef {
    title: string
    lines: string[]
    target: PageId
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pick<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)]
}

const attempts: Record<string, number> = {}

/** Nth call with the same key returns item N; the last item repeats forever. */
export function escalate<T>(key: string, items: T[]): T {
    const attempt = attempts[key] ?? 0
    attempts[key] = attempt + 1
    return items[Math.min(attempt, items.length - 1)]
}

export function asideFor(topic: string): AsideGroup[] {
    return [
        {
            heading: 'Windows Community videos',
            links: [`Learn more about ${topic}`],
        },
        { heading: 'Have a question?', links: ['Get help'] },
        { heading: 'Who’s protecting me?', links: ['Manage providers'] },
        { heading: 'Help improve Windows Security', links: ['Give us feedback'] },
        {
            heading: 'Change your privacy settings',
            text: 'View and change privacy settings for your Windows 10 device.',
            links: ['Privacy settings', 'Privacy dashboard', 'Privacy Statement'],
        },
    ]
}

/* ------------------------------------------------------------------ */
/* Threats (exactly 14, so "14 threats found" is always true)          */
/* ------------------------------------------------------------------ */

export const THREATS: Threat[] = [
    {
        id: 'hp',
        app: 'HP LaserJet',
        threatName: 'Peripheral.PrintingDevice.Hostile',
        severity: 'Severe',
        description:
            'Threat classification: Potentially Hostile Printing Device. This device has demonstrated the ability to reproduce physical documents.',
        risk: 'Unauthorized duplication',
        action: 'Do not allow it to print. It may spread paper-based malware.',
    },
    {
        id: 'edge',
        app: 'Microsoft Edge',
        threatName: 'Browser.Generic',
        severity: 'Moderate',
        description:
            'This application has demonstrated suspicious browsing behaviour.',
        action: 'Stop browsing.',
    },
    {
        id: 'notepad',
        app: 'Notepad',
        threatName: 'TextEditor.Unverified',
        severity: 'Low',
        description:
            'This application allows users to create arbitrary text files without administrative supervision.',
        action: 'Review immediately.',
    },
    {
        id: 'calc',
        app: 'Calculator',
        threatName: 'Unauthorized.Mathematics',
        severity: 'Critical',
        description:
            'This application has performed mathematical operations without requesting administrator approval.',
        action: 'Isolate application.',
    },
    {
        id: 'recycle',
        app: 'Recycle Bin',
        threatName: 'Data.Destruction',
        severity: 'High',
        description: 'This location contains files scheduled for deletion.',
        action: 'Investigate the user.',
    },
    {
        id: 'windows',
        app: 'Windows',
        threatName: 'OperatingSystem.Suspicious',
        severity: 'Moderate',
        description:
            'Suspicious activity has been detected on this computer. The suspicious activity appears to be Windows.',
        action:
            'Review immediately. Do not make Windows aware that it has been detected.',
    },
    {
        id: 'taskmgr',
        app: 'Task Manager',
        threatName: 'Utility.Surveillance',
        severity: 'High',
        description:
            'This application has knowledge of every other application and is not sharing it responsibly.',
        action: 'Limit its awareness.',
    },
    {
        id: 'clock',
        app: 'System Clock',
        threatName: 'Time.Unsynchronized',
        severity: 'Low',
        description:
            'This component has been observed changing continuously without authorization.',
        action: 'Do not trust it with the time.',
    },
    {
        id: 'wallpaper',
        app: 'Desktop Wallpaper',
        threatName: 'Image.Decorative',
        severity: 'Low',
        description:
            'This image is being displayed without a documented business justification.',
        action: 'Look away.',
    },
    {
        id: 'mouse',
        app: 'Mouse',
        threatName: 'Peripheral.PointingDevice',
        severity: 'Moderate',
        description:
            'This device has been observed moving on its own initiative.',
        action: 'Monitor closely.',
    },
    {
        id: 'keyboard',
        app: 'Keyboard',
        threatName: 'Peripheral.TextInput',
        severity: 'High',
        description:
            'This device is capable of entering arbitrary characters into any application.',
        action: 'Type less.',
    },
    {
        id: 'explorer',
        app: 'File Explorer',
        threatName: 'Explorer.Unrestricted',
        severity: 'High',
        description:
            'This application has direct access to every file on the system.',
        action: 'Restrict its curiosity.',
    },
    {
        id: 'paint',
        app: 'Paint',
        threatName: 'Graphics.Unsupervised',
        severity: 'Low',
        description: 'This application allows the creation of images by anyone.',
        action: 'Draw responsibly.',
    },
    {
        id: 'self',
        app: 'Windows Security',
        threatName: 'Self.Reference',
        severity: 'Moderate',
        description: 'This application has detected itself.',
        action: 'Do not make eye contact.',
    },
]

/* ------------------------------------------------------------------ */
/* Random pop-up alerts                                                */
/* ------------------------------------------------------------------ */

export const ALERTS: AlertDef[] = [
    {
        title: 'THREAT DETECTED: HP LaserJet',
        lines: [
            'Threat classification: Potentially Hostile Printing Device.',
            'Recommended action: Do not allow it to print. It may spread paper-based malware.',
        ],
        target: 'virus-threats',
    },
    {
        title: 'Windows Security Alert',
        lines: [
            'Your computer has detected suspicious activity.',
            'The suspicious activity appears to be Windows.',
        ],
        target: 'virus-threats',
    },
    {
        title: 'Potentially unwanted application detected',
        lines: [
            'Application detected: Windows Settings',
            'Classification: Unnecessary system utility.',
            'Recommended action: Consider restricting access.',
        ],
        target: 'app',
    },
    {
        title: 'Security intelligence updates are overdue',
        lines: [
            'Last successful update: Never.',
            'Next scheduled update: To be determined.',
        ],
        target: 'virus-updates',
    },
    {
        title: 'Firewall disabled',
        lines: [
            'Your computer is exposed to potentially hostile network traffic.',
            'Recommended action: Enable firewall protection.',
        ],
        target: 'firewall',
    },
    {
        title: 'Scan paused automatically',
        lines: ['Reason: Your computer needs a break.'],
        target: 'virus-options',
    },
    {
        title: 'Windows Security Alert',
        lines: [
            'Your computer is now responsible for its own safety.',
            'This message is unrelated to any other message.',
        ],
        target: 'virus',
    },
    {
        title: 'Protection history updated',
        lines: [
            'No recent security events found.',
            'This does not necessarily mean that nothing happened.',
        ],
        target: 'virus-history',
    },
]

export function randomAlert(): AlertDef {
    if (Math.random() < 0.4) return pick(ALERTS)

    const threat = pick(THREATS)

    return {
        title: `Threat detected: ${threat.app}`,
        lines: [
            `Threat name: ${threat.threatName}`,
            `Severity: ${threat.severity}`,
            `Recommended action: ${threat.action}`,
        ],
        target: 'virus-threats',
    }
}

/* ------------------------------------------------------------------ */
/* Failures: quarantine / remove / allow                               */
/* ------------------------------------------------------------------ */

export const QUARANTINE_FAIL: Msg[] = [
    {
        headline: 'Quarantine operation failed.',
        detail: [
            'Reason: The selected threat has refused to cooperate.',
            'Administrative assistance may be required.',
        ],
    },
    {
        headline: 'Quarantine operation failed.',
        detail: [
            'Reason: The threat is not currently accepting visitors.',
            'Please try again when it is.',
        ],
    },
    {
        headline: 'Quarantine operation failed.',
        detail: [
            'Reason: The quarantine is full.',
            'It was not a large quarantine.',
        ],
    },
    {
        headline: 'Quarantine operation failed.',
        detail: [
            'Reason: The threat has been quarantined before and did not enjoy it.',
            'Administrative assistance may be required.',
        ],
    },
]

export const REMOVE_FAIL: Msg[] = [
    {
        headline: 'Threat removal unsuccessful.',
        detail: [
            'The selected threat appears to have established residency.',
            'Please consult your system administrator.',
        ],
    },
    {
        headline: 'Threat removal unsuccessful.',
        detail: [
            'The threat has been present for longer than this application.',
            'Seniority has been taken into account.',
        ],
    },
    {
        headline: 'Threat removal unsuccessful.',
        detail: [
            'Removal requires the threat’s consent.',
            'It has not responded.',
        ],
    },
]

export const ALLOW_FAIL: Msg[] = [
    {
        headline: 'This action is managed by your administrator.',
        detail: [
            'Your administrator has declined to allow threats at this time.',
        ],
    },
    {
        headline: 'Action not permitted.',
        detail: ['Threats are not currently permitted to be permitted.'],
    },
]

/* ------------------------------------------------------------------ */
/* Scans                                                               */
/* ------------------------------------------------------------------ */

export interface ScanResult {
    items: number
    threats: number
    reason: string
}

export const QUICK_SCAN_RESULTS: ScanResult[] = [
    {
        items: 0,
        threats: THREATS.length,
        reason: 'Several files were identified as suspicious before scanning began.',
    },
    {
        items: 1,
        threats: THREATS.length,
        reason: 'The scan was interrupted by a threat.',
    },
    {
        items: 31204,
        threats: THREATS.length,
        reason: 'All threats were already known. They were found again.',
    },
]

export function scanMessage(result: ScanResult): Msg {
    return {
        headline: 'Quick scan completed.',
        detail: [
            `Items scanned: ${result.items.toLocaleString()}`,
            `Threats detected: ${result.threats}`,
            `Reason: ${result.reason}`,
        ],
    }
}

export const FULL_SCAN_PAUSES: string[] = [
    'Your computer needs a break.',
    'The scan was getting tired.',
    'Your computer contains an unreasonable number of files.',
    'The scan has requested a moment to reflect.',
]

/* ------------------------------------------------------------------ */
/* Settings that cannot be changed                                     */
/* ------------------------------------------------------------------ */

export type GuardKey = 'rtp' | 'tamper' | 'cloud' | 'samples' | 'exclusions'

/**
 * Trying to turn protection off. The Nth attempt shows message N.
 * (For rtp the toggle also visibly flips off and then back on.)
 */
export const GUARD_MESSAGES: Record<GuardKey, Msg[]> = {
    rtp: [
        {
            headline: 'Real-time protection turned itself back on.',
            detail: [
                'Real-time protection noticed it had been turned off.',
                'It did not appreciate this.',
            ],
        },
        {
            headline: 'Real-time protection cannot be turned off.',
            detail: [
                'Real-time protection is currently protecting the setting that turns off real-time protection.',
            ],
        },
        {
            headline: 'Your request has been forwarded.',
            detail: [
                'Your request to disable real-time protection has been forwarded to real-time protection.',
                'Real-time protection has declined.',
            ],
        },
        {
            headline: 'Real-time protection is currently unavailable.',
            detail: [
                'Your administrator has disabled the ability to enable real-time protection.',
                'Your computer is now responsible for its own safety.',
                'This does not mean that real-time protection is off.',
            ],
        },
        {
            headline: 'Request denied.',
            detail: [
                'Real-time protection has filed an objection.',
                'Estimated response time: 47 hours.',
            ],
        },
    ],
    tamper: [
        {
            headline: 'Tamper Protection cannot be turned off.',
            detail: [
                'Turning off Tamper Protection is considered tampering.',
                'This attempt has been logged and forwarded to no one in particular.',
            ],
        },
        {
            headline: 'Tamper Protection cannot be turned off.',
            detail: ['This attempt has been logged. Again.'],
        },
    ],
    cloud: [
        {
            headline: 'Cloud-delivered protection cannot be turned off.',
            detail: [
                'The cloud is currently listening and does not wish to be interrupted.',
            ],
        },
    ],
    samples: [
        {
            headline: 'Automatic sample submission cannot be turned off.',
            detail: [
                'Your computer has already submitted all of its samples.',
                'There are no samples remaining.',
            ],
        },
    ],
    exclusions: [
        {
            headline: 'Exclusions are not permitted.',
            detail: [
                'Everything on this computer is already suspicious.',
                'Exemptions would be unfair to the other files.',
            ],
        },
    ],
}

/* ------------------------------------------------------------------ */
/* Other absurdities                                                   */
/* ------------------------------------------------------------------ */

export const FIREWALL_MESSAGES: Msg[] = [
    {
        headline: 'This setting is managed by your administrator.',
        detail: [
            'The firewall is awaiting approval from the firewall committee.',
            'Next committee meeting: To be determined.',
        ],
    },
    {
        headline: 'This setting is managed by your administrator.',
        detail: [
            'Your computer is exposed to potentially hostile network traffic.',
            'Your administrator is aware.',
        ],
    },
    {
        headline: 'Request noted.',
        detail: [
            'Firewall protection will be enabled at a convenient time.',
            'It is not currently convenient.',
        ],
    },
]

export const RESTRICT_ACCESS_MESSAGES: Msg[] = [
    {
        headline: 'Access could not be restricted.',
        detail: [
            'Windows Settings is required to restrict access to Windows Settings.',
            'This has been identified as a conflict of interest.',
        ],
    },
    {
        headline: 'Access could not be restricted.',
        detail: ['Windows Settings has been consulted. It disagrees.'],
    },
]

export const UPDATE_CHECK_FAIL: Msg[] = [
    {
        headline: 'We couldn’t check for updates.',
        detail: [
            'The update service is currently busy updating itself.',
            'Please try again at an unspecified time.',
        ],
    },
    {
        headline: 'We couldn’t check for updates.',
        detail: [
            'The last update check is still in progress.',
            'It has been in progress since the beginning.',
        ],
    },
]
