const fs = require('fs')
const path = require('path')
const { SCHOOL_LOGO_DATABASE } = require('../data/schoolLogoDatabase.generated')

const OUTPUT_DIR = path.resolve(__dirname, '../cloud-database')
const JSON_OUTPUT_PATH = path.join(OUTPUT_DIR, 'school_logos.import.json')
const NDJSON_OUTPUT_PATH = path.join(OUTPUT_DIR, 'school_logos.import.ndjson')

const records = SCHOOL_LOGO_DATABASE.map((record) => ({
  _id: record.school,
  school: record.school,
  province: record.province,
  type: record.type,
  status: record.cachedFileID ? 'cloud_cached' : record.status,
  localPath: record.localPath,
  imageUrl: record.imageUrl,
  downloadUrl: record.downloadUrl,
  cachedFileID: record.cachedFileID,
  sourceName: record.sourceName,
  sourceUrl: record.sourceUrl,
  cacheStatus: record.cacheStatus,
  cacheMessage: record.cacheMessage,
  licenseNote: record.licenseNote,
  updatedAt: new Date().toISOString()
}))

fs.mkdirSync(OUTPUT_DIR, { recursive: true })
fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(records, null, 2), 'utf8')
fs.writeFileSync(NDJSON_OUTPUT_PATH, records.map((record) => JSON.stringify(record)).join('\n'), 'utf8')

console.log(`Exported ${records.length} records`)
console.log(JSON_OUTPUT_PATH)
console.log(NDJSON_OUTPUT_PATH)
