package ca.tlcp.ai.hell_os.manager

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform