# HELL OS
### Windows From Hell.

**HELL OS** is a Windows 10 tech-support scammer rage-machine project. Its goal is to recreate the experience of dealing with an increasingly dysfunctional Windows installation, complete with questionable security software, ridiculous system errors, frustrating settings, and deliberately inconvenient behaviour.

HELL OS uses a distributed architecture consisting of a simulated Windows environment, an external management application, and a central communication backend.

> **Disclaimer:** HELL OS is a fictional simulation, not a replacement operating system, real antivirus, or security product.

---

## Features

The simulated Windows environment runs inside the **HELL OS Target Electron application**, which manages several independently displayed application windows:

- **HELL Settings** — A Windows 10-inspired Settings experience with deliberately inconvenient configuration options.
- **HELL Defender** — A fictional antivirus interface with its own simulated security alerts and behaviour.
- **HELL Update** — A simulated Windows Update experience, complete with its own interface and fullscreen presentation.

These are separate windows belonging to the same Target Electron application, not independent Electron executables.

### Planned Behaviour

The Target simulation aims to introduce several intentionally frustrating features:

- Ridiculous system errors and misleading notifications.
- Simulated antivirus alerts and security warnings.
- Artificial resource consumption, including controlled RAM usage.
- Restricted Bluetooth and Wi-Fi configuration.
- Limited access to familiar Windows configuration tools.
- Remote management and monitoring through the external HELL OS Manager.

---

## Architecture

HELL OS follows a distributed architecture with three primary components: **Target, Manager, and Backend.**

Each component has a distinct responsibility and operates independently.

### 1. Target — Simulated Environment

<badge color="success">Runs inside the VM</badge>

The Target is the actual simulation. It runs inside a Windows virtual machine and is responsible for presenting and managing the fictional Windows environment.

It is an Electron application built primarily with React and TypeScript.

The Target uses a multi-window architecture:

- **Electron Main Process:** Manages application windows, desktop-level functionality, and simulation orchestration.
- **React Renderer:** Renders the individual simulated Windows applications.
- **Application Modes:** A shared React renderer selects which simulated application to display using URL query parameters.

The current application modes are:

- `?app=settings`
- `?app=defender`
- `?app=update`

Each application runs in its own Electron `BrowserWindow`, while remaining part of the same Target executable.

The Target is also responsible for communicating with the central Backend to receive management commands and report simulation status.

### 2. Manager — Host Management Application

<badge color="info">Runs outside the VM</badge>

The Manager is the host-side control application used to manage the Target remotely.

It runs outside the virtual machine, allowing the host to interact with and monitor the simulation without needing to operate inside the simulated environment.

The initial implementation uses Electron, React, and TypeScript.

However, Electron is not a permanent architectural requirement. Kotlin Multiplatform (KMP) is being considered as a possible future replacement.

The Manager is responsible for:

- Connecting to the central Backend.
- Sending management commands to the Target.
- Monitoring the Target's status and activity.
- Providing an external interface for controlling the simulation.
- Supporting future host-side VM management functionality.

### 3. Backend — Central Communication Server

<badge color="warning">Implementation undecided</badge>

The Backend is the central server responsible for communication between the Manager and Target.

It operates independently of both Electron applications and acts as their communication intermediary.

Its responsibilities include:

- Managing the *Manager* and *Target* connections.
- Facilitating real-time communication.
- Relaying management commands to the Target.
- Relaying simulation status and information back to the Manager.
- Handling communication and connection management.

The backend implementation has not yet been finalized.

Potential technologies include:

- **Python:** For flexibility, automation, and rapid development.
- **Spring Boot (Java/Kotlin):** For a structured, independently deployable backend with a mature ecosystem.

WebSockets are currently being considered as the primary communication mechanism, although the final protocol and implementation remain open.

---

## Technology Stack

HELL OS is intentionally polyglot. While Electron and TypeScript provide the foundation for the current desktop applications, other languages are absolutely welcome wherever they make technical sense.

| Technology           | Intended Purpose |
|----------------------|---|
| Electron             | Target and initial Manager desktop applications |
| TypeScript           | Electron integration, application logic, and frontend integration |
| React                | User interfaces |
| Vite / Electron-Vite | Frontend development and build tooling |
| Java                 | Standalone services, utilities, and backend functionality |
| Kotlin               | JVM-based services and utilities; preferred over Java where practical |
| Kotlin Multiplatform | Potential future Manager implementation |
| Python               | Backend development, automation, simulation logic, and standalone processes |
| PowerShell           | Windows-specific system administration and automation |

### Language Philosophy

There is no requirement to implement everything in TypeScript.

Use whichever supported language is best suited to the task:

- **TypeScript:** Electron integration, IPC, application orchestration, and React interfaces.
- **Java/Kotlin:** Backend services, independent JVM applications, and complex system functionality.
- **Python:** Backend services, simulation engines, automation, and functionality that benefits from Python's ecosystem.
- **PowerShell:** Windows-specific operations, system configuration, and administrative tasks.
- **Bash:** Shell scripts, automation, and development tooling.

Different components may communicate through IPC, WebSockets, HTTP APIs, standard input/output, or other appropriate interfaces.

The priority is believable behaviour, maintainability, and functionality — not forcing everything into one language.

---

## Getting Started

### Prerequisites

Requirements depend on which component you're developing.

Generally, you'll need:

- Node.js and npm for the Electron applications.
- A compatible Java/Kotlin or Python development environment, depending on the Backend implementation.

### Installation

Clone the repository:

```bash
git clone https://github.com/snehinsen/hell-os.git
cd hell-os
# or
cd hell-os/<component you want to work on>
```

Install dependencies separately for the components you're working on.

The Target and Manager each maintain their own frontend dependencies. The Backend will have its own installation and setup instructions once its implementation has been finalized.

### Development

Development commands are component-specific.

Refer to the respective component's configuration and `package.json` for available scripts.

---

## Security & Isolation

HELL OS is intended for controlled simulation environments.

The Target is designed to run inside a disposable, isolated Windows virtual machine.

The Manager operates outside the VM and communicates with the Target through the central Backend.

The host environment should retain control over the VM, allowing it to be observed, stopped, and reverted independently of the simulated Windows environment.

Communication between components should be appropriately authenticated and secured.

The Electron applications should use restricted preload bridges rather than exposing unrestricted Node.js functionality to renderer processes.

**HELL OS should never be used to compromise, deceive, or interfere with systems belonging to unsuspecting third parties.**
*Scammers are an exception, just don't install this on the scammer's PC itself*

---

## Project Status

HELL OS is under active development.

Current development priorities include:

- Developing the Target Electron application and its multi-window simulation architecture.
- Developing the external Manager application.
- Selecting and implementing the central Backend technology.
- Establishing real-time communication between the Manager and Target.
- Expanding the simulated Windows applications and system behaviour.
- Integrating host-side VM management.

---

*HELL OS — Because sometimes Windows needs a taste of its own medicine.*