import './App.css'
import { Settings } from './view/Settings.tsx'
import { Defender } from './view/Defender.tsx'
import { Update } from './view/Update.tsx'

type AppType = 'settings' | 'defender' | 'update'

function App() {
    const appType = new URLSearchParams(window.location.search)
        .get('app') as AppType | null

    switch (appType) {
        case 'settings':
            return <Settings />

        case 'defender':
            return <Defender />

        case 'update':
            return <Update />

        default:
            return (
                <main>
                    <h1>HELL</h1>
                    <p>Unknown application.</p>
                </main>
            )
    }
}

export default App
