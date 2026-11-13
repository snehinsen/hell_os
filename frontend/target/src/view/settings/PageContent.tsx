import type { ReactNode } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { FONT_LIGHT } from '../../components/tokens'
import { findPage } from './data'
import { FALLBACK_SPEC, PAGE_SPECS } from './pageSpecs'
import { RestrictionProvider } from './RestrictionProvider'
import { SpecPage } from './SpecPage'

function PageTitle({ children }: { children: ReactNode }) {
    return (
        <Text
            as="h1"
            fontFamily={FONT_LIGHT}
            fontSize="28px"
            lineHeight="1.2"
            mb="24px"
        >
            {children}
        </Text>
    )
}

/**
 * One Settings page. The content comes from pageSpecs.ts; every control that
 * is "blocked" shows its message from restrictions.ts when touched, and
 * controls without a restriction are real, persistent settings.
 */
export function PageContent({
    categoryId,
    pageId,
}: {
    categoryId: string
    pageId: string
}) {
    const pageKey = `${categoryId}/${pageId}`
    const title = findPage(categoryId, pageId)?.title ?? 'Settings'
    const spec = PAGE_SPECS[pageKey] ?? FALLBACK_SPEC

    return (
        <RestrictionProvider>
            <Box>
                <PageTitle>{title}</PageTitle>
                <SpecPage spec={spec} pageKey={pageKey} />
            </Box>
        </RestrictionProvider>
    )
}
