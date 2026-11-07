import { createSystem, defaultConfig } from '@chakra-ui/react'

export const system = createSystem(defaultConfig, {
    globalCss: {
        'html, body, #root': {
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            background: 'gray.950',
            color: 'white',
        },
        body: {
            fontFamily: '"Segoe UI", Arial, sans-serif',
            overflow: 'hidden',
        },
    },
})
