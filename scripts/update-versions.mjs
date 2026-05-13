#!/usr/bin/env node
/**
 * Bi-weekly version refresh.
 *
 * Pulls the latest Azure Local and Windows Server version metadata from public
 * Microsoft Learn pages and writes the result to src/data/versions.json so the
 * UI always reflects the current generally-available release names.
 *
 * The workflow that triggers this script will commit the result if it changed,
 * which causes GitHub Pages to redeploy.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const versionsFile = path.join(__dirname, '..', 'src', 'data', 'versions.json')

const SOURCES = {
  azureLocal: {
    url: 'https://learn.microsoft.com/en-us/azure/azure-local/whats-new',
    docsLabel: 'Azure Local — what is new',
    versionPattern: /\b(2[0-9]{3})\b release/gi,
    fallbackPattern: /\b(2[0-9]{3})\b/g,
  },
  windowsServer: {
    url: 'https://learn.microsoft.com/en-us/windows-server/get-started/whats-new-windows-server',
    docsLabel: 'Windows Server — what is new',
    productNamePattern: /Windows Server\s+(20[0-9]{2})/gi,
  },
}

const fetchText = async (url) => {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'mda-version-bot/1.0 (+https://github.com/Azure-hacker/migration-decision-assistant)',
    },
  })
  if (!res.ok) throw new Error(`Fetch failed for ${url}: HTTP ${res.status}`)
  return res.text()
}

const extractAzureLocalVersion = (html) => {
  const matches = []
  let match
  while ((match = SOURCES.azureLocal.versionPattern.exec(html)) !== null) {
    matches.push(match[1])
  }
  if (matches.length === 0) {
    while ((match = SOURCES.azureLocal.fallbackPattern.exec(html)) !== null) {
      const candidate = match[1]
      const numeric = Number(candidate)
      if (numeric >= 2300 && numeric <= 2999) matches.push(candidate)
    }
  }
  if (matches.length === 0) return null
  matches.sort()
  return matches[matches.length - 1]
}

const extractWindowsServerVersion = (html) => {
  const matches = []
  let match
  while ((match = SOURCES.windowsServer.productNamePattern.exec(html)) !== null) {
    matches.push(match[1])
  }
  if (matches.length === 0) return null
  matches.sort()
  return matches[matches.length - 1]
}

const today = () => new Date().toISOString().slice(0, 10)

const main = async () => {
  const current = JSON.parse(await fs.readFile(versionsFile, 'utf8'))

  let azureLocalVersion = current.azureLocal.version
  let azureLocalLabel = current.azureLocal.label
  try {
    const html = await fetchText(SOURCES.azureLocal.url)
    const next = extractAzureLocalVersion(html)
    if (next && next !== azureLocalVersion) {
      azureLocalVersion = next
      azureLocalLabel = `Azure Local ${next}`
      console.log(`Azure Local version updated: ${current.azureLocal.version} -> ${next}`)
    } else {
      console.log(`Azure Local version unchanged (${current.azureLocal.version})`)
    }
  } catch (err) {
    console.warn(`Azure Local fetch failed, keeping current value: ${err.message}`)
  }

  let wsVersion = current.windowsServer.version
  let wsLabel = current.windowsServer.label
  try {
    const html = await fetchText(SOURCES.windowsServer.url)
    const next = extractWindowsServerVersion(html)
    if (next && next !== wsVersion) {
      wsVersion = next
      wsLabel = `Windows Server ${next}`
      console.log(`Windows Server version updated: ${current.windowsServer.version} -> ${next}`)
    } else {
      console.log(`Windows Server version unchanged (${current.windowsServer.version})`)
    }
  } catch (err) {
    console.warn(`Windows Server fetch failed, keeping current value: ${err.message}`)
  }

  const next = {
    azureLocal: {
      version: azureLocalVersion,
      label: azureLocalLabel,
      docsUrl: SOURCES.azureLocal.url,
    },
    windowsServer: {
      version: wsVersion,
      label: wsLabel,
      docsUrl: SOURCES.windowsServer.url,
    },
    lastChecked: today(),
  }

  await fs.writeFile(versionsFile, JSON.stringify(next, null, 2) + '\n', 'utf8')
  console.log(`Wrote ${versionsFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
