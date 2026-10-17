# MuaraKu

> **The Safe Haven for Lost & Found**

MuaraKu is an AI-assisted lost-and-found platform designed to connect people who have lost belongings with people who have found them through a safer, more organized, and community-driven digital ecosystem.

Built with a focus on trust, privacy, and accessibility, MuaraKu aims to simplify the process of reporting lost items, discovering found belongings, and reconnecting people with their property.

## Overview

Losing an item can be stressful. Finding its owner can be just as difficult. Existing approaches often rely on scattered social media posts, unstructured group chats, or manual inquiries.

MuaraKu aims to bring these interactions into one platform, combining structured reports, community participation, privacy-conscious communication, and AI-assisted discovery.

## Core Features

- **Lost & Found Reports** — Create and manage reports for lost or found belongings.
- **Discovery & Search** — Browse community reports and find relevant items using descriptions and search tools.
- **Community Interaction** — Connect with other users through community conversations and private messaging.
- **Muara AI** — AI-assisted support and discovery, designed to complement rather than replace human judgment.
- **Trust & Safety** — Privacy-conscious workflows, reporting mechanisms, and moderation features.
- **Localization** — Support for Indonesian and English, with translation workflows designed around user choice.

*Feature availability and implementation status may change as development progresses.*

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| AI integration | OpenAI API, with a separate Python service planned |
| Security | Server-side authorization, database access policies, and applicable anti-abuse controls |

See the project configuration and architecture documentation for the current implementation details.

## Project Structure

The application is being organized around clear boundaries between routes, reusable components, feature logic, and shared infrastructure.

```text
muaraku-project/
├── src/
│   ├── app/
│   │   ├── (landing)/
│   │   ├── (user)/
│   │   ├── (admin)/
│   │   └── api/
│   ├── components/
│   ├── features/
│   ├── lib/
│   └── types/
├── docs/
│   ├── architecture/
│   ├── policies/
│   ├── security/
│   └── development/
├── public/
├── README.md
├── PRD.md
├── DESIGN.md
└── AGENTS.md
```

This is the intended organizational direction; the repository should be updated and verified as the restructuring progresses.

## Getting Started

### Prerequisites

- Node.js compatible with the project configuration
- npm
- A Supabase project and the credentials required by the features being developed

### Installation

```bash
git clone https://github.com/Konatsu13/muaraku-project.git
cd muaraku-project
npm install
```

### Environment Configuration

Create a local environment file using the project's environment template, if available:

```bash
cp .env.example .env.local
```

Configure the required environment variables using the project's setup documentation. Never commit secrets, API keys, service-role keys, or private credentials to Git.

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Checks

Run the checks supported by the current project configuration before submitting changes:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

If a command is unavailable or fails, investigate the actual project configuration and report the result rather than assuming the check passed.

## Documentation

Project documentation should remain the source of truth for its respective areas.

| Document | Purpose |
|---|---|
| [PRD](PRD.md) | Product requirements, scope, and planned behavior |
| [DESIGN](DESIGN.md) | Visual direction, design system, and interface guidelines |
| [AGENTS](AGENTS.md) | Instructions for AI coding agents |
| [CHANGELOG](CHANGELOG.md) | Record of meaningful project changes |
| `docs/architecture/` | Application architecture and database design |
| `docs/policies/` | User policies and platform rules |
| `docs/security/` | Security practices and reporting procedures |
| `docs/development/` | Coding standards and contribution workflow |

Documentation links should be updated as files are created, moved, or consolidated.

## Security

Security is an ongoing development priority.

- Enforce authorization on the server and at the database level.
- Apply appropriate Row Level Security policies to Supabase data.
- Keep private conversations and sensitive item details accessible only to authorized parties.
- Validate user input and apply suitable anti-abuse protections.
- Never expose secrets in client-side code or public repositories.

If you discover a security vulnerability, avoid publishing exploitable details in a public issue. Use the project's designated private reporting channel once it is established.

## Development Status

MuaraKu is under active development. Its interface, database design, AI capabilities, and security workflows may evolve as the project moves toward its next major iteration.

Do not assume a feature is production-ready solely because it is described in this document. Consult the current implementation and project tasks for verified status.

## License

Copyright © 2026 MuaraKu.

Unless a license is explicitly included in the repository, all rights are reserved. No permission to redistribute or reuse the project is granted by this notice alone.
