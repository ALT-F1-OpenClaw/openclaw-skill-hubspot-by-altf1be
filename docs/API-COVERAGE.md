# {{Service}} API — Coverage & Limitations

This document lists all API resources, what this skill covers, and what's excluded with reasons.

## ✅ Covered

| Resource | Commands | Notes |
|----------|----------|-------|
| Items | list, create, read, update, delete | Full CRUD with filters |
| Statuses | status-list | List available statuses |
| Types | type-list | List item types |

## ❌ Not Covered — With Reasons

### {{Feature Name}} (`/api/v1/feature`)
- **Reason:** {{Enterprise-only / Read-only API / Admin-only / UI-internal / Not relevant for CLI}}

### {{Another Feature}} (`/api/v1/another`)
- **Reason:** {{Explain why this is excluded}}

## 🔮 Candidates for Future Versions

| Resource | Priority | Why |
|----------|----------|-----|
| {{Feature}} | High | {{Explanation}} |
| {{Feature}} | Medium | {{Explanation}} |
| {{Feature}} | Low | {{Explanation}} |

## Categorized Exclusions

### Enterprise-Only Features
- {{List features requiring paid/enterprise license}}

### Read-Only / No Write API
- {{List resources that only support GET}}

### Admin-Only
- {{List resources requiring admin privileges}}

### UI-Internal / No CLI Value
- {{List resources only meaningful in the web UI}}

---

*Based on {{Service}} API {{version}} specification*
*Last updated: {{date}}*
