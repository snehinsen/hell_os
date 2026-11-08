import { createContext, useContext } from 'react'
import type { Msg, PageId } from './content'

export interface DefenderApi {
    navigate: (page: PageId) => void
    /** Show a message box (ignored while another one is already open). */
    message: (msg: Msg) => void
}

export const DefenderContext = createContext<DefenderApi>({
    navigate: () => undefined,
    message: () => undefined,
})

export function useDefender(): DefenderApi {
    return useContext(DefenderContext)
}
