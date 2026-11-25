import org.jetbrains.compose.desktop.application.dsl.TargetFormat

plugins {
    alias(libs.plugins.kotlinJvm)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
}

dependencies {
    implementation(project(":shared"))

    implementation(compose.desktop.currentOs)
    implementation(libs.kotlinx.coroutinesSwing)

    implementation(libs.compose.uiToolingPreview)
}

compose.desktop {
    application {
        mainClass = "ca.tlcp.ai.hell_os.manager.MainKt"

        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
            packageName = "ca.tlcp.ai.hell_os.manager"
            packageVersion = "1.0.0"

            // The desktop transport uses the JDK's built-in WebSocket client and
            // java.util.prefs; the packaged runtime must include both modules.
            modules("java.net.http", "java.prefs")
        }
    }
}
