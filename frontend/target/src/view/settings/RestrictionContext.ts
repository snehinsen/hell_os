import { createContext, useContext } from 'react'

export interface RestrictionApi {
    /** Show the "blocked" message for a restriction id (see restrictions.ts). */
    deny: (id: string) => void
}

export const RestrictionContext = createContext<RestrictionApi>({
    deny: () => undefined,
})

export function useRestrictions(): RestrictionApi {
    return useContext(RestrictionContext)
}
