const fs = require('fs')
const path = require('path')
const { SCHOOL_CATALOG } = require('../data/schools')

const OUTPUT_PATH = path.resolve(__dirname, '../data/schoolLogoSources.generated.js')
const SITE_ORIGIN = 'https://www.urongda.com'
const TYPESENSE_API_KEY = process.env.URONGDA_TYPESENSE_API_KEY || ''
const TYPESENSE_URL = `${SITE_ORIGIN}/ts/multi_search?x-typesense-api-key=${encodeURIComponent(TYPESENSE_API_KEY)}`
const MAX_SCHOOLS = Number(process.env.MAX_SCHOOLS || 40)
const COLLECT_ALL = process.env.COLLECT_ALL === '1'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const normalizeUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `${SITE_ORIGIN}${url}`
  return `${SITE_ORIGIN}/${url}`
}

const searchLogoFiles = async (schoolName) => {
  if (!TYPESENSE_API_KEY) {
    throw new Error('请先设置 URONGDA_TYPESENSE_API_KEY，并确认你有权调用对应服务')
  }
  const res = await fetch(TYPESENSE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 school-logo-collector'
    },
    body: JSON.stringify({
      searches: [
        {
          collection: 'ctfiles',
          q: schoolName,
          query_by: 'school_name,name',
          per_page: 12,
          num_typos: 0,
          prefix: true,
          sort_by: '_text_match:desc,views:desc'
        }
      ]
    })
  })
  if (!res.ok) return []

  const data = await res.json()
  const hits = data && data.results && data.results[0] && data.results[0].hits
  return Array.isArray(hits) ? hits.map((hit) => hit.document || hit) : []
}

const scoreLogoFile = (schoolName, doc) => {
  const extension = String(doc.file_extension || '').toLowerCase()
  const name = String(doc.name || '')
  const sourceSchoolName = String(doc.school_name || '')
  let score = 0
  if (sourceSchoolName === schoolName) score += 80
  if (name.includes(schoolName)) score += 40
  if (name.includes('校徽')) score += 30
  if (extension === 'svg') score += 22
  if (extension === 'png') score += 18
  if (extension === 'webp') score += 8
  if (String(doc.weblink || '').includes('logo')) score += 10
  score += Math.min(Number(doc.views || 0) / 1000, 8)
  return score
}

const pickBestLogoFile = (schoolName, files) => {
  const supported = files.filter((doc) => {
    const extension = String(doc.file_extension || '').toLowerCase()
    return ['svg', 'png', 'webp', 'jpg', 'jpeg'].includes(extension) && doc.weblink
  })
  return supported
    .sort((a, b) => scoreLogoFile(schoolName, b) - scoreLogoFile(schoolName, a))[0]
}

const createPendingRecord = (school) => ({
  school: school.name,
  province: school.province || '',
  type: school.type || '',
  status: 'source_pending',
  sourceName: '',
  sourceUrl: '',
  imageUrl: '',
  downloadUrl: '',
  cachedFileID: '',
  licenseNote: '待采集官方来源和使用规范'
})

const createDownloadRecord = (school, logoFile) => {
  const sourceUrl = logoFile.school_slug ? `${SITE_ORIGIN}/logos/${logoFile.school_slug}` : `${SITE_ORIGIN}/files`
  return {
    school: school.name,
    province: school.province || '',
    type: school.type || '',
    status: 'third_party_download',
    sourceName: 'Urongda 高校校徽矢量图库',
    sourceUrl,
    imageUrl: '',
    downloadUrl: normalizeUrl(logoFile.weblink),
    cachedFileID: '',
    licenseNote: '第三方下载来源；需下载校徽文件、核对学校官方视觉规范，并转存为可直连图片或微信云缓存'
  }
}

const collectOne = async (school) => {
  const files = await searchLogoFiles(school.name)
  const logoFile = pickBestLogoFile(school.name, files)
  if (!logoFile) {
    return createPendingRecord(school)
  }

  return createDownloadRecord(school, logoFile)
}

const searchAllFilesPage = async (page) => {
  const res = await fetch(TYPESENSE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 school-logo-collector'
    },
    body: JSON.stringify({
      searches: [
        {
          collection: 'ctfiles',
          q: '*',
          query_by: 'school_name,name',
          per_page: 250,
          page,
          sort_by: 'views:desc'
        }
      ]
    })
  })
  if (!res.ok) return { found: 0, docs: [] }

  const data = await res.json()
  const result = data && data.results && data.results[0]
  const hits = result && Array.isArray(result.hits) ? result.hits : []
  return {
    found: Number((result && result.found) || 0),
    docs: hits.map((hit) => hit.document || hit)
  }
}

const collectAllFromSearchIndex = async () => {
  const bySchool = new Map()
  let page = 1
  let found = 0

  do {
    const result = await searchAllFilesPage(page)
    found = result.found
    result.docs.forEach((doc) => {
      const schoolName = String(doc.school_name || '').trim()
      if (!schoolName) return
      if (!bySchool.has(schoolName)) bySchool.set(schoolName, [])
      bySchool.get(schoolName).push(doc)
    })
    console.log(`Fetched page ${page}, total files ${found}, schools ${bySchool.size}`)
    page += 1
    await sleep(250)
  } while ((page - 1) * 250 < found)

  return Array.from(bySchool.keys()).sort((a, b) => a.localeCompare(b, 'zh-CN')).map((schoolName) => {
    const school = SCHOOL_CATALOG.find((item) => item.name === schoolName) || { name: schoolName, province: '', type: '' }
    const logoFile = pickBestLogoFile(schoolName, bySchool.get(schoolName))
    return logoFile ? createDownloadRecord(school, logoFile) : createPendingRecord(school)
  })
}

const serialize = (records) => `// Auto-generated by tools/collect-school-logos.js
// Review licensing before production use.

const GENERATED_LOGO_SOURCES = ${JSON.stringify(records, null, 2)}

module.exports = {
  GENERATED_LOGO_SOURCES
}
`

const main = async () => {
  let records = []
  if (COLLECT_ALL) {
    records = await collectAllFromSearchIndex()
  } else {
    const schools = SCHOOL_CATALOG.slice(0, MAX_SCHOOLS)
    for (const school of schools) {
      process.stdout.write(`Collecting ${school.name}... `)
      const record = await collectOne(school)
      records.push(record)
      process.stdout.write(`${record.imageUrl || record.downloadUrl || record.cachedFileID ? 'ok' : 'pending'}\n`)
      await sleep(350)
    }
  }

  fs.writeFileSync(OUTPUT_PATH, serialize(records), 'utf8')
  const found = records.filter((item) => item.imageUrl || item.downloadUrl || item.cachedFileID).length
  console.log(`Wrote ${records.length} records to ${OUTPUT_PATH}`)
  console.log(`Found ${found} logo source URLs`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
