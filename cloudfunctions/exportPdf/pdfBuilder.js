const PAGE_W = 842
const PAGE_H = 595
const MARGIN = 34
const INK = '#24201f'
const MUTED = '#756b66'
const RED = '#bd2b22'
const PAPER = '#fffdf9'
const LINE = '#d9d2cc'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const hexToRgb = (hex) => {
  const value = String(hex || '#ffffff').replace('#', '')
  return {
    r: parseInt(value.slice(0, 2), 16) || 0,
    g: parseInt(value.slice(2, 4), 16) || 0,
    b: parseInt(value.slice(4, 6), 16) || 0
  }
}

const luminance = (hex) => {
  const rgb = hexToRgb(hex)
  return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114
}

const pdfEscape = (value) => String(value || '')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)')

const textHex = (value) => {
  const text = String(value || '')
  let hex = ''
  for (let i = 0; i < text.length; i += 1) {
    hex += text.charCodeAt(i).toString(16).padStart(4, '0')
  }
  return hex.toUpperCase()
}

const byteLength = (value) => {
  let length = 0
  for (let i = 0; i < value.length; i += 1) {
    length += value.charCodeAt(i) <= 0xff ? 1 : 2
  }
  return length
}

const stringToArrayBuffer = (value) => {
  const buffer = new ArrayBuffer(byteLength(value))
  const view = new Uint8Array(buffer)
  let offset = 0
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    if (code <= 0xff) {
      view[offset++] = code
    } else {
      view[offset++] = code >> 8
      view[offset++] = code & 0xff
    }
  }
  return buffer
}

const colorCommand = (hex) => {
  const rgb = hexToRgb(hex)
  return `${(rgb.r / 255).toFixed(3)} ${(rgb.g / 255).toFixed(3)} ${(rgb.b / 255).toFixed(3)} rg`
}

const strokeColorCommand = (hex) => {
  const rgb = hexToRgb(hex)
  return `${(rgb.r / 255).toFixed(3)} ${(rgb.g / 255).toFixed(3)} ${(rgb.b / 255).toFixed(3)} RG`
}

const drawText = (text, x, y, size = 10, color = INK) =>
  `${colorCommand(color)}\nBT /F1 ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td <${textHex(text)}> Tj ET\n`

const drawLatin = (text, x, y, size = 10, color = INK) =>
  `${colorCommand(color)}\nBT /F2 ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${pdfEscape(text)}) Tj ET\n`

const drawRect = (x, y, w, h, fill = '#ffffff', stroke = '', lineWidth = 0.7) => [
  colorCommand(fill),
  stroke ? strokeColorCommand(stroke) : '',
  `${lineWidth.toFixed(2)} w`,
  `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re`,
  stroke ? 'B' : 'f'
].filter(Boolean).join('\n') + '\n'

const drawLine = (x1, y1, x2, y2, color = LINE, width = 0.35) =>
  `${strokeColorCommand(color)}\n${width.toFixed(2)} w\n${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S\n`

const drawCircle = (cx, cy, r, fill = '#ffffff', stroke = '') => {
  const k = 0.5522847498
  const c = r * k
  return [
    colorCommand(fill),
    stroke ? strokeColorCommand(stroke) : '',
    `${(cx + r).toFixed(2)} ${cy.toFixed(2)} m`,
    `${(cx + r).toFixed(2)} ${(cy + c).toFixed(2)} ${(cx + c).toFixed(2)} ${(cy + r).toFixed(2)} ${cx.toFixed(2)} ${(cy + r).toFixed(2)} c`,
    `${(cx - c).toFixed(2)} ${(cy + r).toFixed(2)} ${(cx - r).toFixed(2)} ${(cy + c).toFixed(2)} ${(cx - r).toFixed(2)} ${cy.toFixed(2)} c`,
    `${(cx - r).toFixed(2)} ${(cy - c).toFixed(2)} ${(cx - c).toFixed(2)} ${(cy - r).toFixed(2)} ${cx.toFixed(2)} ${(cy - r).toFixed(2)} c`,
    `${(cx + c).toFixed(2)} ${(cy - r).toFixed(2)} ${(cx + r).toFixed(2)} ${(cy - c).toFixed(2)} ${(cx + r).toFixed(2)} ${cy.toFixed(2)} c`,
    stroke ? 'B' : 'f'
  ].filter(Boolean).join('\n') + '\n'
}

const wrapText = (text, maxChars) => {
  const value = String(text || '')
  const lines = []
  for (let i = 0; i < value.length; i += maxChars) lines.push(value.slice(i, i + maxChars))
  return lines.length ? lines : ['']
}

const drawWrappedText = (text, x, y, maxChars, lineHeight, size, color = MUTED, maxLines = 3) =>
  wrapText(text, maxChars).slice(0, maxLines).map((line, index) =>
    drawText(line, x, y - index * lineHeight, size, color)
  ).join('')

const getEventData = (event) => ({
  cols: clamp(Number(event.cols || 58), 1, 160),
  rows: clamp(Number(event.rows || 58), 1, 160),
  beads: Array.isArray(event.beads) ? event.beads : [],
  materials: Array.isArray(event.materialList) ? event.materialList : []
})

const getMaterialMap = (materials) => materials.reduce((map, item) => {
  map[String(item.color || '').toLowerCase()] = item
  return map
}, {})

const drawPageHeader = (title, eyebrow) => {
  let out = drawText(eyebrow, MARGIN, PAGE_H - 32, 8, RED)
  out += drawText(title, MARGIN, PAGE_H - 56, 19, INK)
  out += drawLine(MARGIN, PAGE_H - 70, PAGE_W - MARGIN, PAGE_H - 70, '#c9bdb6', 0.8)
  return out
}

const drawPageFooter = (page, total) => {
  let out = drawLine(MARGIN, 25, PAGE_W - MARGIN, 25, '#e3ddd8', 0.35)
  out += drawText('录取拼豆工坊 · 线下制作图纸', MARGIN, 11, 7, MUTED)
  out += drawLatin(`${page} / ${total}`, PAGE_W - MARGIN - 26, 11, 7, MUTED)
  return out
}

const drawBoard = (event, options = {}) => {
  const { cols, rows, beads, materials } = getEventData(event)
  const startX = options.startX || 0
  const startY = options.startY || 0
  const endX = options.endX == null ? cols : options.endX
  const endY = options.endY == null ? rows : options.endY
  const viewCols = Math.max(1, endX - startX)
  const viewRows = Math.max(1, endY - startY)
  const maxW = options.maxW || 720
  const maxH = options.maxH || 390
  const cell = Math.min(maxW / viewCols, maxH / viewRows)
  const boardW = cell * viewCols
  const boardH = cell * viewRows
  const boardX = options.x + (maxW - boardW) / 2
  const boardY = options.y + (maxH - boardH) / 2
  const materialMap = getMaterialMap(materials)
  const showCodes = Boolean(options.showCodes)
  const showAxes = Boolean(options.showAxes)
  let out = drawRect(boardX, boardY, boardW, boardH, PAPER, '#2d2927', 1.1)

  for (let x = 0; x <= viewCols; x += 1) {
    const absoluteX = startX + x
    const major = absoluteX % 5 === 0 || x === viewCols
    out += drawLine(boardX + x * cell, boardY, boardX + x * cell, boardY + boardH, major ? '#a99b92' : '#e4ddd8', major ? 0.55 : 0.18)
  }
  for (let y = 0; y <= viewRows; y += 1) {
    const absoluteY = startY + y
    const major = absoluteY % 5 === 0 || y === viewRows
    out += drawLine(boardX, boardY + y * cell, boardX + boardW, boardY + y * cell, major ? '#a99b92' : '#e4ddd8', major ? 0.55 : 0.18)
  }

  beads.forEach((bead) => {
    if (!bead.on || bead.x < startX || bead.x >= endX || bead.y < startY || bead.y >= endY) return
    const x = boardX + (bead.x - startX) * cell
    const y = boardY + (viewRows - (bead.y - startY) - 1) * cell
    const meta = materialMap[String(bead.color || '').toLowerCase()] || {}
    if (showCodes) {
      out += drawRect(x + 0.12, y + 0.12, Math.max(0.2, cell - 0.24), Math.max(0.2, cell - 0.24), bead.color)
      const patternCode = meta.symbol || meta.code
      if (patternCode && cell >= 6) {
        const labelColor = luminance(bead.color) < 125 ? '#ffffff' : '#191716'
        const code = String(patternCode)
        const fontSize = Math.min(8, Math.max(4.6, cell * 0.46))
        out += drawLatin(code, x + Math.max(0.8, (cell - code.length * fontSize * 0.55) / 2), y + cell * 0.34, fontSize, labelColor)
      }
    } else {
      out += drawCircle(x + cell / 2, y + cell / 2, Math.max(0.7, cell * 0.38), bead.color)
    }
  })

  if (showAxes) {
    for (let x = 0; x < viewCols; x += 1) {
      const absolute = startX + x + 1
      if (absolute === startX + 1 || absolute % 5 === 0 || x === viewCols - 1) {
        out += drawLatin(absolute, boardX + x * cell + cell * 0.25, boardY - 11, 6, MUTED)
      }
    }
    for (let y = 0; y < viewRows; y += 1) {
      const absolute = startY + y + 1
      if (absolute === startY + 1 || absolute % 5 === 0 || y === viewRows - 1) {
        const labelY = boardY + (viewRows - y - 1) * cell + cell * 0.28
        out += drawLatin(absolute, boardX - 22, labelY, 6, MUTED)
      }
    }
  }

  return out
}

const buildOverviewPage = (event) => {
  const { cols, rows, materials } = getEventData(event)
  const boardCount = Math.ceil(cols / 29) * Math.ceil(rows / 29)
  const hoursMin = Math.max(1, Math.ceil(Number(event.beadCount || 0) / 420))
  const hoursMax = Math.max(hoursMin + 1, Math.ceil(Number(event.beadCount || 0) / 260))
  let out = drawRect(0, 0, PAGE_W, PAGE_H, '#f7f5f2')
  out += drawRect(0, PAGE_H - 13, PAGE_W, 13, RED)
  out += drawText('录取拼豆工坊', MARGIN, PAGE_H - 48, 9, RED)
  out += drawText(event.title || '学校校徽拼豆图纸', MARGIN, PAGE_H - 82, 24, INK)
  out += drawText('线下制作包 · 图纸 / 色号 / 数量 / 坐标 / 熨烫', MARGIN, PAGE_H - 108, 10, MUTED)

  out += drawRect(MARGIN, 90, 360, 350, '#ffffff', '#ded6d0', 0.8)
  out += drawBoard(event, { x: MARGIN + 25, y: 115, maxW: 310, maxH: 290 })
  out += drawText('全彩图预览', MARGIN + 25, 105, 8, MUTED)

  const panelX = 430
  out += drawText('制作参数', panelX, 430, 14, INK)
  const specs = [
    ['院校', event.school || '学校校徽'],
    ['图纸规格', `${cols} x ${rows} 豆位`],
    ['成品尺寸', event.sizeText || '以底板规格为准'],
    ['底板数量', `${boardCount} 块 29 x 29 标准底板`],
    ['实际用豆', `${event.beadCount || 0} 颗`],
    ['建议备豆', `${event.spareBeadCount || 0} 颗`],
    ['颜色数量', `${materials.length} 色`],
    ['豆子品牌', event.colorSetName || 'MARD 221'],
    ['预计工时', `${hoursMin} - ${hoursMax} 小时`]
  ]
  specs.forEach((item, index) => {
    const y = 400 - index * 27
    out += drawText(item[0], panelX, y, 8, MUTED)
    out += drawText(item[1], panelX + 96, y, 10, INK)
    out += drawLine(panelX, y - 8, PAGE_W - MARGIN, y - 8, '#e5dfda', 0.3)
  })

  out += drawText('开工前检查', panelX, 146, 12, INK)
  ;['核对学校与校徽版本', '按材料页配齐品牌与色号', '打印时选择实际大小 100%', '先拼中心图形再向外扩展'].forEach((text, index) => {
    const y = 120 - index * 20
    out += drawRect(panelX, y - 1, 8, 8, '#ffffff', RED, 0.8)
    out += drawText(text, panelX + 17, y, 8, MUTED)
  })
  return out
}

const buildFullPatternPage = (event) => {
  const { cols, rows, materials } = getEventData(event)
  let out = drawPageHeader('全彩图纸', `${event.school || '学校校徽'} · 第 1 步`)
  out += drawText(`${cols} x ${rows} 豆位 · ${event.sizeText || ''} · ${event.beadCount || 0} 颗 · ${materials.length} 色`, MARGIN, PAGE_H - 88, 9, MUTED)
  out += drawBoard(event, { x: MARGIN, y: 92, maxW: PAGE_W - MARGIN * 2, maxH: 390 })
  out += drawText('用途：核对整体轮廓和颜色关系。实际摆豆请配合后续分区坐标图。', MARGIN, 62, 8, MUTED)
  return out
}

const buildCoordinatePages = (event) => {
  const { cols, rows } = getEventData(event)
  const xCuts = [0, Math.ceil(cols / 2), cols]
  const yCuts = [0, Math.ceil(rows / 2), rows]
  const pages = []
  const names = ['左上', '右上', '左下', '右下']
  let section = 0
  for (let yIndex = 0; yIndex < 2; yIndex += 1) {
    for (let xIndex = 0; xIndex < 2; xIndex += 1) {
      const startX = xCuts[xIndex]
      const endX = xCuts[xIndex + 1]
      const startY = yCuts[yIndex]
      const endY = yCuts[yIndex + 1]
      let out = drawPageHeader(`${names[section]}分区坐标图`, `坐标图 ${section + 1} / 4`)
      out += drawText(`列 ${startX + 1} - ${endX} · 行 ${startY + 1} - ${endY} · 格内字母/数字对应材料页色号`, MARGIN, PAGE_H - 89, 9, MUTED)
      out += drawBoard(event, {
        x: MARGIN + 30,
        y: 70,
        maxW: PAGE_W - MARGIN * 2 - 45,
        maxH: 405,
        startX,
        endX,
        startY,
        endY,
        showCodes: true,
        showAxes: true
      })
      pages.push(out)
      section += 1
    }
  }
  return pages
}

const buildMaterialsPage = (event) => {
  const materials = Array.isArray(event.materialList) ? event.materialList : []
  let out = drawPageHeader('材料清单', `${event.school || '学校校徽'} · 配豆单`)
  out += drawText(`实际用豆 ${event.beadCount || 0} 颗 · 建议额外备豆 ${event.spareBeadCount || 0} 颗 · 共 ${materials.length} 色`, MARGIN, PAGE_H - 90, 9, MUTED)
  out += drawRect(MARGIN, PAGE_H - 132, PAGE_W - MARGIN * 2, 25, '#ece8e4')
  ;[['色样', 10], ['图纸号', 44], ['品牌', 118], ['品牌色号', 255], ['颜色名', 370], ['用量', 570], ['备豆', 655], ['合计', 720]].forEach((item) => {
    out += drawText(item[0], MARGIN + item[1], PAGE_H - 124, 8, INK)
  })
  materials.slice(0, 18).forEach((item, index) => {
    const y = PAGE_H - 160 - index * 25
    if (index % 2 === 1) out += drawRect(MARGIN, y - 7, PAGE_W - MARGIN * 2, 22, '#faf8f6')
    out += drawCircle(MARGIN + 18, y + 2, 7, item.color, '#bdb4ae')
    out += drawLatin(item.symbol || item.code || '-', MARGIN + 44, y, 7)
    out += drawText(item.brand || '自定义', MARGIN + 118, y, 7)
    out += drawLatin(item.code || '-', MARGIN + 255, y, 7)
    out += drawText(item.name || '未命名颜色', MARGIN + 370, y, 7)
    out += drawText(`${item.count || 0} 颗`, MARGIN + 570, y, 7)
    out += drawText(`${item.spare || 0} 颗`, MARGIN + 655, y, 7)
    out += drawText(`${Number(item.count || 0) + Number(item.spare || 0)} 颗`, MARGIN + 720, y, 7)
  })
  out += drawRect(MARGIN, 50, PAGE_W - MARGIN * 2, 55, '#fff6e8', '#ead7b8', 0.6)
  out += drawText('配豆说明', MARGIN + 16, 84, 9, INK)
  out += drawText('优先按同一品牌色号购买；缺色替换时，请在自然光下与色样比对。透明、荧光和夜光豆需单独标记。', MARGIN + 16, 64, 8, MUTED)
  return out
}

const buildCraftGuidePage = (event) => {
  const craftSteps = Array.isArray(event.craftSteps) ? event.craftSteps : []
  let out = drawPageHeader('制作与熨烫指南', `${event.school || '学校校徽'} · 交付说明`)
  const steps = craftSteps.length ? craftSteps : [
    { title: '核对图纸', detail: '确认底板尺寸、方向、色号和材料数量。' },
    { title: '开始摆豆', detail: '从中心图形开始，按分区坐标逐块完成。' },
    { title: '熨烫定型', detail: '覆盖熨烫纸，中低温画圈移动，避免局部过热。' },
    { title: '翻面加固', detail: '冷却后翻面补烫，再压平至完全冷却。' },
    { title: '装裱交付', detail: '使用背板或相框固定，避免大尺寸作品弯曲。' }
  ]
  steps.slice(0, 5).forEach((step, index) => {
    const x = index < 3 ? MARGIN : 430
    const row = index < 3 ? index : index - 3
    const y = index < 3 ? 445 - row * 112 : 445 - row * 112
    out += drawCircle(x + 16, y + 10, 15, RED)
    out += drawLatin(index + 1, x + 12, y + 6, 10, '#ffffff')
    out += drawText(step.title || '', x + 44, y + 7, 11, INK)
    out += drawWrappedText(step.detail || '', x + 44, y - 13, index < 3 ? 31 : 30, 14, 8, MUTED, 3)
  })

  out += drawRect(430, 186, PAGE_W - MARGIN - 430, 78, '#fff1ef', '#e4b8b3', 0.6)
  out += drawText('熨烫建议', 448, 239, 10, RED)
  out += drawText('中低温、短时、多次、持续移动。', 448, 218, 9, INK)
  out += drawText('每次 10 - 15 秒，冷却后检查连接程度。', 448, 199, 8, MUTED)

  out += drawRect(MARGIN, 56, PAGE_W - MARGIN * 2, 88, '#f0f3f2', '#cbd6d3', 0.6)
  out += drawText('打印与交付', MARGIN + 18, 118, 10, INK)
  out += drawText('打印设置：A4 横向 · 实际大小 100% · 禁止“适合页面”缩放 · 彩色打印。', MARGIN + 18, 96, 8, MUTED)
  out += drawText('线下店交付：PDF 全部页面 + 材料清单；现场再次确认品牌、底板和熨烫方式。', MARGIN + 18, 76, 8, MUTED)
  return out
}

const buildPdfString = (event) => {
  const pages = [
    buildOverviewPage(event),
    buildFullPatternPage(event),
    ...buildCoordinatePages(event),
    buildMaterialsPage(event),
    buildCraftGuidePage(event)
  ]
  const totalPages = pages.length
  const pageContents = pages.map((content, index) => content + drawPageFooter(index + 1, totalPages))
  const objects = []
  const addObject = (body) => {
    objects.push(body)
    return objects.length
  }
  const catalogId = addObject('<< /Type /Catalog /Pages 2 0 R >>')
  const pagesId = addObject('')
  const fontCjkId = addObject('<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H /DescendantFonts [5 0 R] >>')
  const fontLatinId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
  addObject('<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 2 >> /FontDescriptor 6 0 R >>')
  addObject('<< /Type /FontDescriptor /FontName /STSong-Light /Flags 4 /FontBBox [0 -200 1000 900] /ItalicAngle 0 /Ascent 880 /Descent -120 /CapHeight 700 /StemV 80 >>')
  const pageIds = []

  pageContents.forEach((content) => {
    const streamId = addObject(`<< /Length ${byteLength(content)} >>\nstream\n${content}endstream`)
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${fontCjkId} 0 R /F2 ${fontLatinId} 0 R >> >> /Contents ${streamId} 0 R >>`)
    pageIds.push(pageId)
  })
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`

  const chunks = ['%PDF-1.4\n%\xE2\xE3\xCF\xD3\n']
  const offsets = [0]
  objects.forEach((body, index) => {
    offsets[index + 1] = byteLength(chunks.join(''))
    chunks.push(`${index + 1} 0 obj\n${body}\nendobj\n`)
  })
  const xrefOffset = byteLength(chunks.join(''))
  chunks.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`)
  for (let i = 1; i <= objects.length; i += 1) {
    chunks.push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`)
  }
  chunks.push(`trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)
  return chunks.join('')
}

const buildPdfArrayBuffer = (event) => stringToArrayBuffer(buildPdfString(event))

module.exports = {
  buildPdfArrayBuffer,
  buildPdfString
}
