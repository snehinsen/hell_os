import { Box, Flex, Text } from '@chakra-ui/react'
import { WIN } from '../../components/tokens'
import { asideFor, type Level } from './content'
import { PageLayout, Section, StatusIcon } from './shared'

/**
 * Device performance & health. This is a DESKTOP PC, so there is deliberately
 * no "Battery life" check (Windows only shows it when a battery exists).
 */
export function HealthPage() {
    const checks: { name: string; note?: string; level: Level }[] = [
        { name: 'Windows Time service', note: 'Accuracy is not guaranteed.', level: 'warn' },
        { name: 'Storage capacity', level: 'ok' },
        { name: 'Device driver', note: 'HP LaserJet has been classified as a threat.', level: 'warn' },
        { name: 'Apps and software', note: 'Calculator, Notepad and others require review.', level: 'error' },
    ]

    return (
        <PageLayout
            title="Device performance & health"
            subtitle="View info about the performance health of your device."
            aside={asideFor('device performance & health')}
        >
            <Section icon="heart" title="Health report">
                <Text fontSize="13px" color={WIN.secondary} mb="12px">
                    Last scan: {new Date().toLocaleDateString()}
                </Text>
                {checks.map(check => (
                    <Flex key={check.name} align="center" gap="12px" py="6px">
                        <StatusIcon icon="completed" size={20} level={check.level} />
                        <Box>
                            <Text fontSize="14px">{check.name}</Text>
                            {check.note && (
                                <Text fontSize="12px" color={WIN.secondary}>
                                    {check.note}
                                </Text>
                            )}
                        </Box>
                    </Flex>
                ))}
            </Section>
        </PageLayout>
    )
}
