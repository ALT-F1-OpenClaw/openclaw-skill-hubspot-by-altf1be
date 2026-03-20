#!/usr/bin/env node

/**
 * OpenClaw {{SKILL_NAME}} Skill — CLI for {{SERVICE}} management.
 *
 * Replace {{SKILL_NAME}}, {{SERVICE}}, and customize commands.
 *
 * @author Abdelkrim BOUJRAF <abdelkrim@alt-f1.be>
 * @license MIT
 * @see https://www.alt-f1.be
 */

import { readFileSync, statSync } from 'node:fs';
import { basename, resolve, posix } from 'node:path';
import { Buffer } from 'node:buffer';
import { config } from 'dotenv';
import { Command } from 'commander';

// ── Config (lazy via Proxy — only validated when a command runs) ────────────

config(); // load .env

let _cfg;
function getCfg() {
  if (!_cfg) {
    _cfg = {
      // Required
      host:       env('SKILL_HOST'),
      apiToken:   env('SKILL_API_TOKEN'),
      // Optional (with defaults)
      maxResults: parseInt(process.env.SKILL_MAX_RESULTS || '50', 10),
      maxFileSize: parseInt(process.env.SKILL_MAX_FILE_SIZE || '52428800', 10), // 50 MB
    };
  }
  return _cfg;
}
const CFG = new Proxy({}, { get: (_, prop) => getCfg()[prop] });

function env(key) {
  const v = process.env[key];
  if (!v) {
    console.error(`ERROR: Missing required env var ${key}. See .env.example`);
    process.exit(1);
  }
  return v;
}

// ── Security helpers ────────────────────────────────────────────────────────

/** Prevent path traversal attacks */
function safePath(p) {
  if (!p) return '';
  const normalized = posix.normalize(p).replace(/\\/g, '/');
  if (normalized.includes('..')) {
    console.error('ERROR: Path traversal detected — ".." is not allowed');
    process.exit(1);
  }
  return normalized.replace(/^\/+/, '');
}

/** Enforce file size limits */
function checkFileSize(filePath) {
  const stat = statSync(filePath);
  if (stat.size > CFG.maxFileSize) {
    console.error(`ERROR: File exceeds size limit (${(stat.size / 1048576).toFixed(1)} MB > ${(CFG.maxFileSize / 1048576).toFixed(1)} MB)`);
    process.exit(1);
  }
  return stat.size;
}

// ── HTTP client with rate-limit retry ───────────────────────────────────────

function authHeader() {
  // Adapt to your service's auth method:
  // Basic auth: Buffer.from(`user:${CFG.apiToken}`).toString('base64')
  // Bearer:     `Bearer ${CFG.apiToken}`
  // Custom:     see service docs
  const token = Buffer.from(`apikey:${CFG.apiToken}`).toString('base64');
  return `Basic ${token}`;
}

function baseUrl() {
  const host = CFG.host.replace(/\/+$/, '');
  const prefix = host.startsWith('http') ? host : `https://${host}`;
  return `${prefix}/api/v1`; // Adjust API path
}

/**
 * Make an authenticated API request with rate-limit retry.
 *
 * @param {string} path     API path (e.g. /items)
 * @param {object} options  fetch options (method, body, headers)
 * @param {number} retries  max retry attempts on 429
 */
async function apiFetch(path, options = {}, retries = 3) {
  const url = path.startsWith('http') ? path : `${baseUrl()}${path}`;
  const headers = {
    'Authorization': authHeader(),
    'Accept': 'application/json',
    ...options.headers,
  };

  // Don't set Content-Type for FormData (browser/node sets boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    const resp = await fetch(url, { ...options, headers });

    // Rate limit handling with exponential backoff
    if (resp.status === 429) {
      const retryAfter = parseInt(resp.headers.get('retry-after') || '5', 10);
      const backoff = retryAfter * 1000 * attempt;
      if (attempt < retries) {
        console.error(`⏳ Rate limited — retrying in ${(backoff / 1000).toFixed(0)}s (attempt ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }
    }

    // No content (e.g. DELETE success)
    if (resp.status === 204) return null;

    const body = await resp.text();
    let json;
    try { json = JSON.parse(body); } catch { json = null; }

    if (!resp.ok) {
      const msg = json?.message || json?.error || body || resp.statusText;
      const err = new Error(msg);
      err.statusCode = resp.status;
      throw err;
    }

    return json;
  }
}

// ── Response helpers ────────────────────────────────────────────────────────

/**
 * Extract a linked resource title from HAL+JSON responses.
 * Useful for APIs that return { _links: { status: { href, title } } }
 */
function halLink(obj, rel) {
  return obj?._links?.[rel]?.title || obj?._links?.[rel]?.href?.split('/').pop() || '?';
}

/**
 * Extract numeric ID from a HAL link href.
 */
function halId(obj, rel) {
  const href = obj?._links?.[rel]?.href;
  if (!href) return null;
  const match = href.match(/\/(\d+)$/);
  return match ? match[1] : null;
}

/**
 * Extract plain text from rich text formats (e.g. Atlassian ADF, ProseMirror).
 * Customize for your service's rich text format.
 */
function extractRichText(doc) {
  if (!doc || typeof doc === 'string') return doc || '';
  if (!doc.content) return '';
  const texts = [];
  for (const node of doc.content) {
    for (const inline of (node.content || [])) {
      if (inline.type === 'text') texts.push(inline.text || '');
    }
  }
  return texts.join('\n');
}

// ── Example CRUD commands ───────────────────────────────────────────────────

async function cmdList(options) {
  const params = new URLSearchParams({ limit: String(CFG.maxResults) });
  if (options.status) params.set('status', options.status);
  if (options.assignee) params.set('assignee', options.assignee);

  const resp = await apiFetch(`/items?${params}`);
  const items = resp?.items || resp?.data || [];

  if (!items.length) {
    console.log('No items found.');
    return;
  }

  for (const item of items) {
    console.log(`📋  #${String(item.id).padEnd(6)}  ${(item.status || '').padEnd(12)}  ${item.title || item.name}`);
  }
  console.log(`\n${items.length} item(s)`);
}

async function cmdRead(options) {
  if (!options.id) {
    console.error('ERROR: --id is required');
    process.exit(1);
  }

  const item = await apiFetch(`/items/${options.id}`);

  console.log(`📋 #${item.id}: ${item.title || item.name}`);
  console.log(`   Status:   ${item.status || '?'}`);
  console.log(`   Created:  ${item.createdAt?.substring(0, 10) || '?'}`);
  console.log(`   Updated:  ${item.updatedAt?.substring(0, 10) || '?'}`);

  if (item.description) {
    console.log(`\n📝 Description:\n${typeof item.description === 'string' ? item.description : extractRichText(item.description)}`);
  }
}

async function cmdCreate(options) {
  if (!options.title) {
    console.error('ERROR: --title is required');
    process.exit(1);
  }

  const payload = { title: options.title };
  if (options.description) payload.description = options.description;
  if (options.status) payload.status = options.status;
  if (options.assignee) payload.assignee = options.assignee;

  const result = await apiFetch('/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  console.log(`✅ Created: #${result.id} — ${result.title || result.name}`);
}

async function cmdUpdate(options) {
  if (!options.id) {
    console.error('ERROR: --id is required');
    process.exit(1);
  }

  const payload = {};
  if (options.title) payload.title = options.title;
  if (options.description) payload.description = options.description;
  if (options.status) payload.status = options.status;
  if (options.assignee) payload.assignee = options.assignee;

  await apiFetch(`/items/${options.id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  console.log(`✅ Updated: #${options.id}`);
}

async function cmdDelete(options) {
  if (!options.id) {
    console.error('ERROR: --id is required');
    process.exit(1);
  }
  if (!options.confirm) {
    console.error('ERROR: Delete requires --confirm flag for safety');
    console.error('Usage: skill-name delete --id 42 --confirm');
    process.exit(1);
  }

  await apiFetch(`/items/${options.id}`, { method: 'DELETE' });
  console.log(`✅ Deleted: #${options.id}`);
}

// ── CLI definition ──────────────────────────────────────────────────────────

const program = new Command();

program
  .name('skill-name')
  .description('OpenClaw {{SKILL_NAME}} Skill — {{SERVICE}} management')
  .version('1.0.0');

program.command('list').description('List items')
  .option('-s, --status <name>', 'Filter by status')
  .option('-a, --assignee <user>', 'Filter by assignee')
  .action(wrap(cmdList));

program.command('read').description('Read item details')
  .requiredOption('--id <id>', 'Item ID')
  .action(wrap(cmdRead));

program.command('create').description('Create an item')
  .requiredOption('-t, --title <text>', 'Item title')
  .option('-d, --description <text>', 'Description')
  .option('-s, --status <name>', 'Status')
  .option('-a, --assignee <user>', 'Assignee')
  .action(wrap(cmdCreate));

program.command('update').description('Update an item')
  .requiredOption('--id <id>', 'Item ID')
  .option('-t, --title <text>', 'New title')
  .option('-d, --description <text>', 'New description')
  .option('-s, --status <name>', 'New status')
  .option('-a, --assignee <user>', 'New assignee')
  .action(wrap(cmdUpdate));

program.command('delete').description('Delete an item (requires --confirm)')
  .requiredOption('--id <id>', 'Item ID')
  .option('--confirm', 'Confirm deletion (required)')
  .action(wrap(cmdDelete));

// ── Error wrapper ───────────────────────────────────────────────────────────

function wrap(fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (err) {
      if (err.statusCode) {
        console.error(`ERROR (${err.statusCode}): ${err.message}`);
      } else {
        console.error(`ERROR: ${err.message}`);
      }
      process.exit(1);
    }
  };
}

program.parse();
