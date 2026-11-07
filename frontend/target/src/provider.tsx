import type { ReactNode } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider } from 'next-themes'
import { system } from "./theme"

interface ProviderProps {
    children: ReactNode
}

export function Provider({ children }: ProviderProps) {
    return (
        <ChakraProvider value={system}>
            <ThemeProvider
                attribute="class"
                forcedTheme="dark"
                enableSystem={false}
            >
                {children}
            </ThemeProvider>
        </ChakraProvider>
    )
}
