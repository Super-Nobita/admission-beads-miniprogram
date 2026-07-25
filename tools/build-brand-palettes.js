const fs = require('fs')
const path = require('path')

const VENDOR_DIR = path.resolve(__dirname, '../data/vendor/beadcolors')
const OUTPUT_PATH = path.resolve(__dirname, '../data/brandPalettes.generated.js')

const configs = [
  { file: 'hama.csv', exportName: 'HAMA_MIDI_COLORS', brand: 'Hama Midi 5mm', symbolPrefix: '' },
  { file: 'perler.csv', exportName: 'PERLER_COLORS', brand: 'Perler 5mm', symbolPrefix: 'P' },
  { file: 'artkal_s.csv', exportName: 'ARTKAL_S5_COLORS', brand: 'Artkal S 5mm', symbolPrefix: '' }
]

const toHex = (value) => Number(value).toString(16).padStart(2, '0')

const parsePalette = (config) => fs.readFileSync(path.join(VENDOR_DIR, config.file), 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line, index) => {
    const [code, name, r, g, b] = line.split(',')
    return {
      brand: config.brand,
      code,
      symbol: config.symbolPrefix ? `${config.symbolPrefix}${index + 1}` : code,
      name,
      color: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
      common: true,
      tags: []
    }
  })

const exportsMap = configs.reduce((map, config) => {
  map[config.exportName] = parsePalette(config)
  return map
}, {})

const source = `// Generated from maxcleme/beadcolors (MIT).
// Run tools/build-brand-palettes.js after updating data/vendor/beadcolors/*.csv.
${Object.keys(exportsMap).map((name) => `const ${name} = ${JSON.stringify(exportsMap[name], null, 2)}`).join('\n\n')}

module.exports = {
${Object.keys(exportsMap).map((name) => `  ${name}`).join(',\n')}
}
`

fs.writeFileSync(OUTPUT_PATH, source, 'utf8')
Object.keys(exportsMap).forEach((name) => console.log(`${name}: ${exportsMap[name].length}`))
console.log(OUTPUT_PATH)
