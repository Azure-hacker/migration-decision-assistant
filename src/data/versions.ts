import versions from './versions.json'

export type ProductVersion = {
  version: string
  label: string
  docsUrl: string
  overviewUrl: string
}

export type VersionData = {
  azureLocal: ProductVersion
  windowsServer: ProductVersion
  lastChecked: string
  sources: {
    azureLocalReleaseNotes: string
    windowsServerReleaseNotes: string
  }
}

export const versionData = versions as VersionData
