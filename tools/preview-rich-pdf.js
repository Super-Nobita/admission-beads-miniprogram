const fs = require('fs')
const path = require('path')
const { buildPdfArrayBuffer } = require('../utils/pdfBuilder')

const cols = 58
const rows = 58
const palette = ['#8854b3', '#d5b9f8', '#2f2b2f', '#fff5ed', '#edb045']
const beads = []

for (let y = 0; y < rows; y += 1) {
  for (let x = 0; x < cols; x += 1) {
    const dx = x - (cols - 1) / 2
    const dy = y - (rows - 1) / 2
    const distance = Math.sqrt(dx * dx + dy * dy)
    let color = palette[3]
    if (distance < 24 && distance > 21) color = palette[0]
    if (distance < 18 && distance > 15) color = palette[1]
    if ((Math.abs(dx) < 2 || Math.abs(dy) < 2) && distance < 13) color = palette[2]
    if (distance < 6) color = palette[4]
    beads.push({ x, y, on: true, color })
  }
}

const materialList = [
  { brand: 'MARD 221', code: 'D7', symbol: 'D7', name: 'MARD D7', color: palette[0], count: 420, spare: 34 },
  { brand: 'MARD 221', code: 'D9', symbol: 'D9', name: 'MARD D9', color: palette[1], count: 360, spare: 29 },
  { brand: 'MARD 221', code: 'H6', symbol: 'H6', name: 'MARD H6', color: palette[2], count: 240, spare: 20 },
  { brand: 'MARD 221', code: 'H12', symbol: 'H12', name: 'MARD H12', color: palette[3], count: 2100, spare: 168 },
  { brand: 'MARD 221', code: 'G5', symbol: 'G5', name: 'MARD G5', color: palette[4], count: 244, spare: 20 }
]

const payload = {
  title: '清华大学校徽拼豆图纸',
  school: '清华大学',
  colorSetName: 'MARD 221',
  cols,
  rows,
  sizeText: '290mm x 290mm',
  beadCount: 3364,
  spareBeadCount: 271,
  beads,
  materialList,
  craftSteps: [
    { title: '核对图纸', detail: '确认学校、底板尺寸、色卡品牌和颜色数量，按材料页备豆。' },
    { title: '按清单配豆', detail: '每色多备 5% 到 8%，并把相近颜色分盒标记。' },
    { title: '从中心摆放', detail: '先完成中心图形，再按左上、右上、左下、右下分区扩展。' },
    { title: '分区熨烫', detail: '覆盖熨烫纸，中低温短时多次移动，冷却后再翻面加固。' },
    { title: '装裱交付', detail: '完全冷却后压平，大图使用背板或相框固定。' }
  ]
}

const outputDir = path.resolve(__dirname, '../output/pdf')
fs.mkdirSync(outputDir, { recursive: true })
const outputPath = path.join(outputDir, 'sample-rich-pattern.pdf')
fs.writeFileSync(outputPath, Buffer.from(buildPdfArrayBuffer(payload)))
console.log(outputPath)
