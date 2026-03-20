# openclaw-skill-{{name}}

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org/)
[![{{Service}}](https://img.shields.io/badge/{{Service}}-API-blue.svg)]({{SERVICE_URL}})
[![OpenClaw Skill](https://img.shields.io/badge/OpenClaw-Skill-orange.svg)](https://clawhub.ai)
[![ClawHub](https://img.shields.io/badge/ClawHub-{{slug}}-orange)](https://clawhub.ai/skills/{{slug}})
[![Security](https://img.shields.io/badge/Security_Scan-Benign-green)](https://clawhub.ai/skills/{{slug}})
[![GitHub last commit](https://img.shields.io/github/last-commit/ALT-F1-OpenClaw/openclaw-skill-{{name}})](https://github.com/ALT-F1-OpenClaw/openclaw-skill-{{name}}/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/ALT-F1-OpenClaw/openclaw-skill-{{name}})](https://github.com/ALT-F1-OpenClaw/openclaw-skill-{{name}}/issues)
[![GitHub stars](https://img.shields.io/github/stars/ALT-F1-OpenClaw/openclaw-skill-{{name}})](https://github.com/ALT-F1-OpenClaw/openclaw-skill-{{name}}/stargazers)

Short description of what this skill does.

By [Abdelkrim BOUJRAF](https://www.alt-f1.be) / ALT-F1 SRL, Brussels 🇧🇪 🇲🇦

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Setup](#setup)
- [Commands](#commands)
- [Security](#security)
- [API Coverage](#api-coverage)
- [ClawHub](#clawhub)
- [License](#license)
- [Author](#author)
- [Contributing](#contributing)

## Features

- **Items** — Create, read, update, delete, list with filters
- **Reference Data** — Statuses, types, priorities, categories
- **Attachments** — Upload, list, delete (with `--confirm`)
- **Security** — `--confirm` required for deletes, no secrets to stdout, rate-limit retry with backoff
- **Auth** — {{auth method}} (works with {{cloud/self-hosted/both}})

## Quick Start

```bash
# 1. Clone
git clone https://github.com/ALT-F1-OpenClaw/openclaw-skill-{{name}}.git
cd openclaw-skill-{{name}}

# 2. Install
npm install

# 3. Configure
cp .env.example .env
# Edit .env with your credentials

# 4. Use
node scripts/skill-name.mjs list
node scripts/skill-name.mjs read --id 42
node scripts/skill-name.mjs create --title "My first item"
```

## Setup

1. Get credentials from {{service provider}}
2. Copy `.env.example` to `.env` and fill in:
   - `SKILL_HOST` — your instance URL
   - `SKILL_API_TOKEN` — your API token
3. Run `npm install`

### Prerequisites

- Node.js >= 18
- {{Service}} account with API access
- API token or credentials (see [Setup](#setup))

## Commands

See [SKILL.md](./SKILL.md) for full command reference.

### N commands across M entities:

| Entity | Commands |
|--------|----------|
| Items | `list`, `read`, `create`, `update`, `delete` |
| Reference | `status-list`, `type-list` |

## Security

- {{Auth method}} authentication
- No secrets or tokens printed to stdout
- All delete operations require explicit `--confirm` flag
- Path traversal prevention for file uploads (`safePath()`)
- Built-in rate limiting with exponential backoff retry (3 attempts)
- File size validation before upload
- Lazy config validation (only checked when a command runs)

## API Coverage

See [docs/API-COVERAGE.md](./docs/API-COVERAGE.md) for a full breakdown of supported vs unsupported API resources.

## ClawHub

Published as: `{{slug}}`

```bash
clawhub install {{slug}}
```

## License

MIT — see [LICENSE](./LICENSE)

## Author

Abdelkrim BOUJRAF — [ALT-F1 SRL](https://www.alt-f1.be), Brussels 🇧🇪 🇲🇦
- GitHub: [@abdelkrim](https://github.com/abdelkrim)
- X: [@altf1be](https://x.com/altf1be)

## Contributing

Contributions welcome! Please open an issue or PR.
