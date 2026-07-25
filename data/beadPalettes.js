const { MARD_221_COLORS } = require('./mardPalette')
const {
  HAMA_MIDI_COLORS,
  PERLER_COLORS,
  ARTKAL_S5_COLORS
} = require('./brandPalettes.generated')

const COMMON_STORE_COLORS = [
  { brand: '通用', code: 'W01', name: '瓷白', color: '#fffaf0', common: true, tags: ['white', 'paper'] },
  { brand: '通用', code: 'W02', name: '奶油白', color: '#f2e6cf', common: true, tags: ['white', 'warm'] },
  { brand: '通用', code: 'W03', name: '浅米黄', color: '#e7d6b5', common: true, tags: ['cream', 'paper'] },
  { brand: '通用', code: 'R01', name: '录取红', color: '#b7352b', common: true, tags: ['red', 'notice'] },
  { brand: '通用', code: 'R02', name: '朱砂红', color: '#8f1d22', common: true, tags: ['red', 'deep'] },
  { brand: '通用', code: 'R03', name: '玫瑰红', color: '#cf4f66', common: false, tags: ['pink', 'red'] },
  { brand: '通用', code: 'G01', name: '礼金', color: '#d9ad49', common: true, tags: ['gold', 'yellow'] },
  { brand: '通用', code: 'G02', name: '浅金', color: '#f0c86a', common: true, tags: ['gold', 'light'] },
  { brand: '通用', code: 'B01', name: '深海蓝', color: '#164f9c', common: true, tags: ['blue', 'deep'] },
  { brand: '通用', code: 'B02', name: '求是蓝', color: '#005bac', common: true, tags: ['blue'] },
  { brand: '通用', code: 'B03', name: '湖蓝', color: '#62a8e5', common: false, tags: ['blue', 'light'] },
  { brand: '通用', code: 'P01', name: '学院紫', color: '#6d3fb3', common: true, tags: ['purple'] },
  { brand: '通用', code: 'P02', name: '浅藤紫', color: '#d7c2ff', common: false, tags: ['purple', 'light'] },
  { brand: '通用', code: 'P03', name: '暗紫', color: '#34205f', common: true, tags: ['purple', 'deep'] },
  { brand: '通用', code: 'P04', name: '深清华紫', color: '#4a278a', common: true, tags: ['purple', 'school'] },
  { brand: '通用', code: 'C01', name: '青绿', color: '#147d72', common: true, tags: ['green', 'cyan'] },
  { brand: '通用', code: 'C02', name: '薄荷绿', color: '#84d8c5', common: false, tags: ['green', 'light'] },
  { brand: '通用', code: 'K01', name: '墨黑', color: '#24201f', common: true, tags: ['black'] },
  { brand: '通用', code: 'K02', name: '深蓝黑', color: '#182a42', common: true, tags: ['black', 'blue'] },
  { brand: '通用', code: 'K03', name: '暖灰', color: '#8b7b70', common: true, tags: ['gray'] },
  { brand: '通用', code: 'Y01', name: '亮黄', color: '#f2c94c', common: true, tags: ['yellow'] },
  { brand: '通用', code: 'O01', name: '橙金', color: '#e98f3e', common: true, tags: ['orange'] },
  { brand: '通用', code: 'N01', name: '粉白', color: '#fff1f7', common: false, tags: ['white', 'pink'] },
  { brand: '通用', code: 'N02', name: '冷白', color: '#eef5ff', common: true, tags: ['white', 'cool'] },
  { brand: '通用', code: 'M01', name: '医绿', color: '#1b8f86', common: true, tags: ['green', 'medical'] },
  { brand: '通用', code: 'A01', name: '艺术蓝', color: '#4c77d9', common: false, tags: ['blue', 'art'] }
]

const ARTKAL_S_5MM_CORE = [
  { brand: 'Artkal S 5mm', code: 'S01', name: 'White', color: '#ffffff', common: true, tags: ['white'] },
  { brand: 'Artkal S 5mm', code: 'S77', name: 'Ghost White', color: '#efefef', common: true, tags: ['white'] },
  { brand: 'Artkal S 5mm', code: 'S78', name: 'Ash Gray', color: '#d1d1d1', common: true, tags: ['gray'] },
  { brand: 'Artkal S 5mm', code: 'S79', name: 'Light Gray', color: '#bbbcbc', common: true, tags: ['gray'] },
  { brand: 'Artkal S 5mm', code: 'S07', name: 'Gray', color: '#9b9b9b', common: true, tags: ['gray'] },
  { brand: 'Artkal S 5mm', code: 'S43', name: 'Dark Gray', color: '#767777', common: true, tags: ['gray'] },
  { brand: 'Artkal S 5mm', code: 'S89', name: 'Charcoal Gray', color: '#484949', common: true, tags: ['black', 'gray'] },
  { brand: 'Artkal S 5mm', code: 'S69', name: 'Mine Shaft', color: '#23282b', common: true, tags: ['black'] },
  { brand: 'Artkal S 5mm', code: 'S13', name: 'Black', color: '#000000', common: true, tags: ['black'] },
  { brand: 'Artkal S 5mm', code: 'S42', name: 'Silver', color: '#a09f9d', common: false, tags: ['metal', 'gray'] },
  { brand: 'Artkal S 5mm', code: 'S41', name: 'Copper', color: '#9a5516', common: false, tags: ['metal', 'brown'] },
  { brand: 'Artkal S 5mm', code: 'S63', name: 'Metallic Gold', color: '#4c5914', common: false, tags: ['metal', 'gold'] },
  { brand: 'Artkal S 5mm', code: 'S52', name: 'Picasso', color: '#f2f0a1', common: false, tags: ['yellow', 'light'] },
  { brand: 'Artkal S 5mm', code: 'S29', name: 'Pastel Yellow', color: '#f6eb61', common: true, tags: ['yellow'] },
  { brand: 'Artkal S 5mm', code: 'S14', name: 'Sandstorm', color: '#fae053', common: true, tags: ['yellow'] },
  { brand: 'Artkal S 5mm', code: 'S27', name: 'Yellow', color: '#ffd100', common: true, tags: ['yellow'] },
  { brand: 'Artkal S 5mm', code: 'S48', name: 'Corn', color: '#ffc72c', common: true, tags: ['yellow', 'gold'] },
  { brand: 'Artkal S 5mm', code: 'S86', name: 'Goldenrod', color: '#eaaa00', common: true, tags: ['gold'] },
  { brand: 'Artkal S 5mm', code: 'S90', name: 'Pastel Orange', color: '#ffc56e', common: false, tags: ['orange'] },
  { brand: 'Artkal S 5mm', code: 'S03', name: 'Tangerine', color: '#f6ad4c', common: true, tags: ['orange'] },
  { brand: 'Artkal S 5mm', code: 'S39', name: 'Yellow Orange', color: '#ed8b00', common: true, tags: ['orange'] },
  { brand: 'Artkal S 5mm', code: 'S56', name: 'Bright Carrot', color: '#ff6a13', common: false, tags: ['orange'] },
  { brand: 'Artkal S 5mm', code: 'S04', name: 'Orange', color: '#ff671f', common: true, tags: ['orange'] },
  { brand: 'Artkal S 5mm', code: 'S66', name: 'Blaze Orange', color: '#f4633a', common: false, tags: ['orange', 'red'] },
  { brand: 'Artkal S 5mm', code: 'S87', name: 'Coral Red', color: '#ff6d6a', common: false, tags: ['red'] },
  { brand: 'Artkal S 5mm', code: 'S02', name: 'Burning Sand', color: '#ffa38b', common: false, tags: ['pink'] },
  { brand: 'Artkal S 5mm', code: 'S50', name: 'Mandys Pink', color: '#faaa8d', common: false, tags: ['pink'] },
  { brand: 'Artkal S 5mm', code: 'S35', name: 'Mona Lisa', color: '#f7ced7', common: false, tags: ['pink'] },
  { brand: 'Artkal S 5mm', code: 'S28', name: 'Lily Pink', color: '#eab8e4', common: false, tags: ['pink'] },
  { brand: 'Artkal S 5mm', code: 'S40', name: 'Carnation Pink', color: '#f1a7dc', common: false, tags: ['pink'] },
  { brand: 'Artkal S 5mm', code: 'S06', name: 'Raspberry Pink', color: '#ec86d0', common: false, tags: ['pink'] },
  { brand: 'Artkal S 5mm', code: 'S25', name: 'Hot Pink', color: '#ff34b3', common: false, tags: ['pink'] },
  { brand: 'Artkal S 5mm', code: 'S26', name: 'Magenta', color: '#db2152', common: true, tags: ['red', 'pink'] }
]

const BEAD_PALETTES = {
  mard221: {
    id: 'mard221',
    brand: 'MARD',
    name: 'MARD 221 标准色卡',
    beadSizeMm: 5,
    sourceName: 'MARD 221 标准色号（A-H、M 系列）',
    sourceUrl: 'https://www.pixel-beads.com/zh/mard-bead-color-chart',
    colors: MARD_221_COLORS
  },
  artkalS5: {
    id: 'artkalS5',
    brand: 'Artkal',
    name: 'Artkal S 5mm · 199 色',
    beadSizeMm: 5,
    sourceName: 'beadcolors / Artkal S 5mm',
    sourceUrl: 'https://github.com/maxcleme/beadcolors',
    colors: ARTKAL_S5_COLORS
  },
  perler5: {
    id: 'perler5',
    brand: 'Perler',
    name: 'Perler 5mm · 103 色',
    beadSizeMm: 5,
    sourceName: 'beadcolors / Perler',
    sourceUrl: 'https://github.com/maxcleme/beadcolors',
    colors: PERLER_COLORS
  },
  hamaMidi: {
    id: 'hamaMidi',
    brand: 'Hama',
    name: 'Hama Midi 5mm · 92 色',
    beadSizeMm: 5,
    sourceName: 'beadcolors / Hama Midi',
    sourceUrl: 'https://github.com/maxcleme/beadcolors',
    colors: HAMA_MIDI_COLORS
  },
  commonStore: {
    id: 'commonStore',
    brand: '通用',
    name: '店铺通用色号',
    beadSizeMm: 5,
    sourceName: '项目内置店铺通用近似色表',
    sourceUrl: '',
    colors: COMMON_STORE_COLORS
  },
  artkalS5Core: {
    id: 'artkalS5Core',
    brand: 'Artkal',
    name: 'Artkal S 5mm 常用色',
    beadSizeMm: 5,
    sourceName: 'Artkal S 5mm color chart 摘录',
    sourceUrl: 'https://www.artkalbead.com/artkal-beads1/',
    colors: ARTKAL_S_5MM_CORE
  }
}

const BEAD_COLORS = MARD_221_COLORS

const COLOR_SETS = [
  {
    id: 'admission',
    name: 'MARD 221',
    note: 'MARD 221 标准色，国内线下店更常见',
    paletteId: 'mard221',
    codes: null
  },
  {
    id: 'artkal-s5',
    name: 'Artkal S 5mm',
    note: 'Artkal S 系列 199 色，层次丰富，适合复杂校徽',
    paletteId: 'artkalS5',
    codes: null
  },
  {
    id: 'perler-5',
    name: 'Perler 5mm',
    note: 'Perler 103 色，材料表输出真实产品编号',
    paletteId: 'perler5',
    codes: null
  },
  {
    id: 'hama-midi',
    name: 'Hama Midi 5mm',
    note: 'Hama Midi 92 色，使用 Hama 品牌色号',
    paletteId: 'hamaMidi',
    codes: null
  }
]

module.exports = {
  BEAD_PALETTES,
  BEAD_COLORS,
  COLOR_SETS
}
