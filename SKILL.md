---
name: skill-name-by-altf1be
description: "Short description of what the skill does — entities, actions, auth method."
homepage: https://github.com/ALT-F1-OpenClaw/openclaw-skill-CHANGEME
metadata:
  {"openclaw": {"emoji": "🔧", "requires": {"env": ["SKILL_HOST", "SKILL_API_TOKEN"]}, "optional": {"env": ["SKILL_MAX_RESULTS", "SKILL_MAX_FILE_SIZE"]}, "primaryEnv": "SKILL_HOST"}}
---

# {{Skill Name}} by @altf1be

One-line description of what this skill does.

## Setup

1. Get credentials from {{service provider}}
2. Set environment variables (or create `.env` in `{baseDir}`):

```
# Required
SKILL_HOST=https://your-instance.example.com
SKILL_API_TOKEN=your-token

# Optional
SKILL_MAX_RESULTS=50
SKILL_MAX_FILE_SIZE=52428800
```

3. Install dependencies: `cd {baseDir} && npm install`

## Commands

### Items (CRUD)

```bash
# List items (with optional filters)
node {baseDir}/scripts/skill-name.mjs list --status active --assignee me

# Read item details
node {baseDir}/scripts/skill-name.mjs read --id 42

# Create an item
node {baseDir}/scripts/skill-name.mjs create --title "New item" --description "Details here"

# Update an item
node {baseDir}/scripts/skill-name.mjs update --id 42 --title "Updated title" --status done

# Delete an item (requires --confirm)
node {baseDir}/scripts/skill-name.mjs delete --id 42 --confirm
```

### Reference Data

```bash
# List statuses, types, priorities, etc.
node {baseDir}/scripts/skill-name.mjs status-list
node {baseDir}/scripts/skill-name.mjs type-list
```

## Security

- Auth method: {{Basic / Bearer / OAuth / Certificate}} auth
- No secrets or tokens printed to stdout
- All delete operations require explicit `--confirm` flag
- Path traversal prevention for file uploads (`safePath()`)
- Built-in rate limiting with exponential backoff retry (3 attempts)
- File size validation before upload
- Lazy config validation (only checked when a command runs)

## Dependencies

- `commander` — CLI framework
- `dotenv` — environment variable loading
- Node.js built-in `fetch` (requires Node >= 18)

## Author

Abdelkrim BOUJRAF — [ALT-F1 SRL](https://www.alt-f1.be), Brussels 🇧🇪 🇲🇦
X: [@altf1be](https://x.com/altf1be)
