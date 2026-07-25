const EMPTY = '#f6ecdf'
const { SCHOOL_CATALOG } = require('../../data/schools')
const { SCHOOL_LOGOS, SCHOOL_LOGO_MAP } = require('../../data/schoolLogos')
const { BEAD_PALETTES, BEAD_COLORS, COLOR_SETS } = require('../../data/beadPalettes')
const { buildPdfArrayBuffer } = require('../../utils/pdfBuilder')

const MAX_COLOR_OPTIONS = [6, 8, 10, 12]
const IMAGE_MODES = [
  {
    id: 'flat',
    name: '大色块',
    note: '适合红色/紫色函盒，底色更干净',
    brightRatio: 0.07,
    darkRatio: 0.09,
    contrast: 78,
    edgeRatio: 0.08,
    edgeContrast: 58,
    saturationBoost: 1.08,
    contrastBoost: 1.06
  },
  {
    id: 'redraw',
    name: '通知书重绘',
    note: '按录取通知书结构重建版式，学校名和标题最清楚',
    brightRatio: 0.02,
    darkRatio: 0.05,
    contrast: 48,
    edgeRatio: 0.025,
    edgeContrast: 30,
    saturationBoost: 1.18,
    contrastBoost: 1.18
  },
  {
    id: 'notice',
    name: '通知书清晰',
    note: '优先保学校名、标题和校徽轮廓',
    brightRatio: 0.028,
    darkRatio: 0.055,
    contrast: 54,
    edgeRatio: 0.032,
    edgeContrast: 34,
    saturationBoost: 1.18,
    contrastBoost: 1.16
  },
  {
    id: 'logo',
    name: '校徽清晰',
    note: '优先保留圆形边界、文字环和中心图形',
    brightRatio: 0.025,
    darkRatio: 0.045,
    contrast: 44,
    edgeRatio: 0.024,
    edgeContrast: 28,
    saturationBoost: 1.22,
    contrastBoost: 1.22
  },
  {
    id: 'photo',
    name: '照片细节',
    note: '保留纹理和渐变，适合复杂参考图',
    brightRatio: 0.05,
    darkRatio: 0.07,
    contrast: 62,
    edgeRatio: 0.045,
    edgeContrast: 42,
    saturationBoost: 1.12,
    contrastBoost: 1.1
  }
]
const BOARD_PRESETS = [
  {
    id: 'logo-2x2',
    name: '校徽 58×58',
    note: '2 x 2 方形底板，适合单独拼校徽',
    cols: 58,
    rows: 58,
    beadMm: 5,
    pixelW: 580,
    pixelH: 580
  },
  {
    id: 'logo-3x3',
    name: '校徽 87×87',
    note: '3 x 3 方形底板，校徽文字和轮廓更清楚',
    cols: 87,
    rows: 87,
    beadMm: 5,
    pixelW: 870,
    pixelH: 870
  },
  {
    id: 'standard-3x2',
    name: '5mm 推荐',
    note: '3 x 2 底板，适合通知书横版',
    cols: 87,
    rows: 58,
    beadMm: 5,
    pixelW: 870,
    pixelH: 580
  },
  {
    id: 'standard-4x3',
    name: '5mm 精细',
    note: '4 x 3 底板，文字和校徽更清楚',
    cols: 116,
    rows: 82,
    beadMm: 5,
    pixelW: 1160,
    pixelH: 820
  },
  {
    id: 'mini-144',
    name: 'mini 高清',
    note: '2.6mm 小豆，大图更细但制作量高',
    cols: 144,
    rows: 102,
    beadMm: 2.6,
    pixelW: 1440,
    pixelH: 1020
  }
]
const THEMES = [
  {
    id: 'red-gold',
    name: '红金上岸',
    paper: '#fffdfa',
    palette: ['#b7352b', '#e9b44c', '#44261f', '#fff0d8'],
    beadNames: ['录取红', '烫金黄', '墨印黑', '米白']
  },
  {
    id: 'violet',
    name: '紫藤学院',
    paper: '#fbf7ff',
    palette: ['#6d4acb', '#d9c6ff', '#2f2353', '#f5e9ff'],
    beadNames: ['学院紫', '浅藤紫', '深紫灰', '雾粉白']
  },
  {
    id: 'mint',
    name: '薄荷春日',
    paper: '#f7fffb',
    palette: ['#147d72', '#84d8c5', '#1f3d38', '#e5fff4'],
    beadNames: ['松石绿', '薄荷绿', '深青灰', '奶白绿']
  },
  {
    id: 'cyber',
    name: '赛博录取',
    paper: '#f9fbff',
    palette: ['#1565ff', '#ff4fa3', '#151923', '#dcf6ff'],
    beadNames: ['电光蓝', '霓虹粉', '夜幕黑', '冰蓝白']
  }
]

const SCHOOL_STYLES = [
  {
    id: 'tsinghua',
    name: '清华灵感',
    school: '清华大学',
    short: '清华',
    motif: 'gate',
    motifs: ['校门轮廓', '紫色系', '金色抬头'],
    theme: {
      id: 'school-tsinghua',
      name: '清华紫金',
      paper: '#fbf7ff',
      palette: ['#6d3fb3', '#d7c2ff', '#2b2342', '#e8b94f'],
      beadNames: ['清华紫', '浅藤紫', '深墨紫', '礼金']
    }
  },
  {
    id: 'pku',
    name: '北大灵感',
    school: '北京大学',
    short: '北大',
    motif: 'tower',
    motifs: ['塔形剪影', '朱红印章', '纸本米白'],
    theme: {
      id: 'school-pku',
      name: '北大朱红',
      paper: '#fffaf2',
      palette: ['#a91e24', '#e7b23b', '#2f2522', '#fff1da'],
      beadNames: ['燕园红', '书页金', '墨黑', '米白']
    }
  },
  {
    id: 'fudan',
    name: '复旦灵感',
    school: '复旦大学',
    short: '复旦',
    motif: 'scroll',
    motifs: ['函盒结构', '蓝金色', '卷轴边框'],
    theme: {
      id: 'school-fudan',
      name: '复旦蓝金',
      paper: '#f7fbff',
      palette: ['#164f9c', '#d9ad49', '#182a42', '#eef5ff'],
      beadNames: ['复旦蓝', '绸缎金', '深海蓝', '纸白']
    }
  },
  {
    id: 'zju',
    name: '浙大灵感',
    school: '浙江大学',
    short: '浙大',
    motif: 'bridge',
    motifs: ['求是蓝', '拱桥线条', '启程星点'],
    theme: {
      id: 'school-zju',
      name: '浙大蓝金',
      paper: '#f8fbff',
      palette: ['#005bac', '#62a8e5', '#1d2d44', '#f0c75e'],
      beadNames: ['求是蓝', '湖蓝', '深蓝灰', '亮金']
    }
  },
  {
    id: 'nju',
    name: '南大灵感',
    school: '南京大学',
    short: '南大',
    motif: 'stars',
    motifs: ['紫金色', '星空纹样', '学院边框'],
    theme: {
      id: 'school-nju',
      name: '南大紫金',
      paper: '#fbf8ff',
      palette: ['#5a2a82', '#caa34a', '#282039', '#eee3ff'],
      beadNames: ['南大紫', '紫金', '夜紫黑', '淡紫白']
    }
  }
]

const AUTO_THEMES = {
  综合: {
    name: '学院红金',
    palette: ['#b7352b', '#e9b44c', '#44261f', '#fff0d8'],
    beadNames: ['学院红', '礼金', '墨黑', '米白'],
    motif: 'classic',
    motifs: ['通知书边框', '正文框', '印章']
  },
  理工: {
    name: '理工蓝银',
    palette: ['#1f62b8', '#8fc5ff', '#1b2737', '#e8f4ff'],
    beadNames: ['工程蓝', '浅蓝', '深蓝灰', '冷白'],
    motif: 'bridge',
    motifs: ['结构线条', '工程蓝', '星点']
  },
  师范: {
    name: '师范青金',
    palette: ['#147d72', '#d7ad4f', '#203c37', '#e8fff5'],
    beadNames: ['青绿', '书页金', '深青', '浅绿白'],
    motif: 'scroll',
    motifs: ['书卷结构', '青金色', '页边线']
  },
  医药: {
    name: '医学校白',
    palette: ['#1b8f86', '#8bd7ce', '#243a38', '#f3fffb'],
    beadNames: ['医绿', '浅医绿', '深灰绿', '白'],
    motif: 'stars',
    motifs: ['洁净白底', '十字星点', '专业章']
  },
  财经: {
    name: '财经墨金',
    palette: ['#24324a', '#d5a948', '#111827', '#f8efd8'],
    beadNames: ['深蓝墨', '财富金', '黑', '账本米'],
    motif: 'scroll',
    motifs: ['函盒结构', '金色线条', '编号感']
  },
  农林: {
    name: '农林绿金',
    palette: ['#2f7d32', '#9ccc65', '#244026', '#fff4d6'],
    beadNames: ['叶绿', '嫩芽绿', '深林绿', '麦穗白'],
    motif: 'stars',
    motifs: ['叶片星点', '绿金色', '田野边框']
  },
  语言: {
    name: '语言朱白',
    palette: ['#b7352b', '#f0c86a', '#303030', '#fff5e8'],
    beadNames: ['朱红', '浅金', '字墨', '纸白'],
    motif: 'scroll',
    motifs: ['书页结构', '文字线', '印章']
  },
  政法: {
    name: '政法蓝红',
    palette: ['#21466f', '#b7352b', '#202833', '#eef3fb'],
    beadNames: ['法蓝', '章红', '深蓝黑', '浅白'],
    motif: 'classic',
    motifs: ['庄重边框', '红章', '正文区']
  },
  艺术: {
    name: '艺术粉蓝',
    palette: ['#d84f8b', '#4c77d9', '#262338', '#fff1f7'],
    beadNames: ['玫粉', '艺术蓝', '深紫黑', '浅粉白'],
    motif: 'stars',
    motifs: ['星点构图', '撞色', '画框感']
  },
  民族: {
    name: '民族彩纹',
    palette: ['#b7352b', '#2f7d5a', '#29324a', '#f2c94c'],
    beadNames: ['纹样红', '青绿', '深蓝', '亮黄'],
    motif: 'classic',
    motifs: ['彩纹边框', '校名区', '印章']
  }
}

const SCHOOL_SEARCH_CATALOG = SCHOOL_CATALOG.concat(
  SCHOOL_LOGOS
    .filter((record) => !SCHOOL_CATALOG.some((school) => school.name === record.school))
    .map((record) => ({
      name: record.school,
      province: record.province || '待补充',
      type: record.type || '综合'
    }))
)
const PROVINCES = ['全部'].concat(Array.from(new Set(SCHOOL_SEARCH_CATALOG.map((school) => school.province))))
const LOGO_BOARD_PRESETS = BOARD_PRESETS.filter((preset) => preset.id.startsWith('logo-'))
const PATTERN_DISPLAY_MODES = [
  { id: 'round', name: '圆豆' },
  { id: 'square', name: '方格' },
  { id: 'code', name: '编号' }
]
const CRAFT_STEPS = [
  { title: '核对图纸', detail: '确认学校名、底板尺寸、色卡品牌和颜色数量，先保存高清图纸。' },
  { title: '按清单配豆', detail: '按品牌、色号、颜色名和数量拿豆，建议每色多备 5% 到 8%。' },
  { title: '从中心摆放', detail: '校徽类图纸先摆中心图形，再摆外圈和文字边界，减少整体偏移。' },
  { title: '分区熨烫', detail: '覆盖熨烫纸，中低温短时多次压烫，冷却后再翻面补烫。' },
  { title: '装裱交付', detail: '大图建议背板固定；通知书主题可以加相框、亚克力或礼盒包装。' }
]
const IMAGE_SIZE_TIPS = [
  '上传图越大不一定越清楚，系统会先按底板比例居中裁切和降采样。',
  '校徽建议选正方形、背景干净、边缘完整的图片。',
  '录取通知书建议选横版正拍图，避免大角度透视和强反光。',
  '色数控制在 6 到 12 色，线下制作更容易买齐也更干净。'
]
const GRID_GAP_OPTIONS = [
  { name: '无缝', value: 0 },
  { name: '标准', value: 2 },
  { name: '打印', value: 4 }
]
const LOGO_CACHE_STORAGE_KEY = 'schoolLogoFileCacheV1'
const MAX_SAVED_LOGOS = 20

const clone = (value) => JSON.parse(JSON.stringify(value))

Page({
  data: {
    boardPresets: LOGO_BOARD_PRESETS,
    boardPresetIndex: 0,
    imageModes: IMAGE_MODES,
    imageModeIndex: 3,
    colorSets: COLOR_SETS,
    colorSetIndex: 0,
    patternDisplayModes: PATTERN_DISPLAY_MODES,
    patternDisplayModeIndex: 0,
    patternDisplayMode: PATTERN_DISPLAY_MODES[0].id,
    gridGapOptions: GRID_GAP_OPTIONS,
    gridGapIndex: 1,
    gridGap: GRID_GAP_OPTIONS[1].value,
    craftSteps: CRAFT_STEPS,
    imageSizeTips: IMAGE_SIZE_TIPS,
    cols: BOARD_PRESETS[0].cols,
    rows: BOARD_PRESETS[0].rows,
    pixelCanvasW: BOARD_PRESETS[0].pixelW,
    pixelCanvasH: BOARD_PRESETS[0].pixelH,
    beadMm: BOARD_PRESETS[0].beadMm,
    themes: THEMES,
    schoolStyles: SCHOOL_STYLES,
    schoolCatalog: SCHOOL_SEARCH_CATALOG,
    schoolOptions: SCHOOL_SEARCH_CATALOG.slice(0, 24),
    provinces: PROVINCES,
    provinceIndex: 0,
    schoolKeyword: '',
    activeFlow: 'logo',
    selectedSchool: null,
    motifText: '高清通知书版式、双层边框、标题区、正文区和圆章',
    theme: THEMES[0],
    templateMode: 'generated',
    tool: 'paint',
    beadCount: 0,
    boardNote: BOARD_PRESETS[0].note,
    sizeText: `${Math.round(BOARD_PRESETS[0].cols * BOARD_PRESETS[0].beadMm)}mm × ${Math.round(BOARD_PRESETS[0].rows * BOARD_PRESETS[0].beadMm)}mm`,
    uploadStatus: '上传学校校徽，生成方形拼豆图纸',
    imageModeNote: IMAGE_MODES[3].note,
    colorSetNote: COLOR_SETS[0].note,
    brightnessAdjustment: 0,
    contrastAdjustment: 0,
    saturationAdjustment: 0,
    aiNoticeAnalyzeEnabled: true,
    aiAnalyzeStatus: 'AI 会先理解学校名、标题、主色和版式，再生成拼豆图纸',
    aiRedrawColors: null,
    uploadedImagePath: '',
    uploadedImageInfoText: '',
    logoStatus: '上传学校校徽，生成方形拼豆图纸',
    logoSourceStatus: '校徽库待选择学校',
    logoSourceName: '',
    logoSourceUrl: '',
    selectedLogoSchool: null,
    textEnhanceEnabled: true,
    uploadTitle: '录取通知书',
    maxColorOptions: MAX_COLOR_OPTIONS,
    maxColorIndex: 1,
    ditherEnabled: false,
    aiSchoolName: '',
    aiReferencePath: '',
    aiStatus: '选择学校或填写院校名即可 AI 生成；上传校徽/通知书参考图会更贴近原校视觉',
    materialList: [],
    spareBeadCount: 0,
    form: {
      name: '未来的你',
      school: '',
      schoolShort: '',
      major: '快乐工程专业',
      year: '2026'
    },
    beads: []
  },

  onLoad() {
    this._logoMemoryCache = Object.create(null)
    this._logoFileCache = wx.getStorageSync(LOGO_CACHE_STORAGE_KEY) || {}
    this._logoLoadToken = 0
    this.resetDesign()
  },

  getCachedLogoPath(schoolName, sourceKey, onHit, onMiss) {
    const memoryEntry = this._logoMemoryCache[schoolName]
    if (memoryEntry && memoryEntry.sourceKey === sourceKey) {
      onHit(memoryEntry.path)
      return
    }

    const savedEntry = this._logoFileCache[schoolName]
    if (!savedEntry || savedEntry.sourceKey !== sourceKey || !savedEntry.path) {
      onMiss()
      return
    }

    wx.getFileSystemManager().access({
      path: savedEntry.path,
      success: () => {
        savedEntry.lastUsedAt = Date.now()
        this._logoMemoryCache[schoolName] = savedEntry
        wx.setStorageSync(LOGO_CACHE_STORAGE_KEY, this._logoFileCache)
        onHit(savedEntry.path)
      },
      fail: () => {
        delete this._logoFileCache[schoolName]
        wx.setStorageSync(LOGO_CACHE_STORAGE_KEY, this._logoFileCache)
        onMiss()
      }
    })
  },

  cacheLogoFile(schoolName, sourceKey, tempFilePath) {
    this._logoMemoryCache[schoolName] = {
      path: tempFilePath,
      sourceKey,
      lastUsedAt: Date.now()
    }

    wx.getFileSystemManager().saveFile({
      tempFilePath,
      success: (res) => {
        const previousEntry = this._logoFileCache[schoolName]
        this._logoFileCache[schoolName] = {
          path: res.savedFilePath,
          sourceKey,
          lastUsedAt: Date.now()
        }
        this._logoMemoryCache[schoolName] = this._logoFileCache[schoolName]

        if (previousEntry && previousEntry.path && previousEntry.path !== res.savedFilePath) {
          wx.getFileSystemManager().unlink({ path: previousEntry.path, fail: () => {} })
        }

        const cachedSchools = Object.keys(this._logoFileCache)
        if (cachedSchools.length > MAX_SAVED_LOGOS) {
          cachedSchools
            .sort((a, b) => this._logoFileCache[a].lastUsedAt - this._logoFileCache[b].lastUsedAt)
            .slice(0, cachedSchools.length - MAX_SAVED_LOGOS)
            .forEach((name) => {
              const entry = this._logoFileCache[name]
              delete this._logoFileCache[name]
              delete this._logoMemoryCache[name]
              if (entry && entry.path) {
                wx.getFileSystemManager().unlink({ path: entry.path, fail: () => {} })
              }
            })
        }
        wx.setStorageSync(LOGO_CACHE_STORAGE_KEY, this._logoFileCache)
      },
      fail: () => {}
    })
  },

  getBoardConfig() {
    return BOARD_PRESETS[this.data.boardPresetIndex] || BOARD_PRESETS[0]
  },

  getSizeText(config = this.getBoardConfig()) {
    return `${Math.round(config.cols * config.beadMm)}mm × ${Math.round(config.rows * config.beadMm)}mm`
  },

  getImageMode() {
    return IMAGE_MODES[this.data.imageModeIndex] || IMAGE_MODES[1]
  },

  getColorSet() {
    return COLOR_SETS[this.data.colorSetIndex] || COLOR_SETS[0]
  },

  getAvailableBeadColors() {
    const set = this.getColorSet()
    const palette = BEAD_PALETTES[set.paletteId] || BEAD_PALETTES.mard221
    if (!set.codes) return palette.colors
    return palette.colors.filter((item) => set.codes.includes(item.code))
  },

  buildPatternState(beads, theme = this.data.theme) {
    const normalizedBeads = this.normalizeBeadsToPalette(beads)
    const materialList = this.createMaterialList(normalizedBeads, theme)
    return {
      beads: this.annotateBeads(normalizedBeads, theme),
      beadCount: this.countBeads(normalizedBeads),
      materialList,
      spareBeadCount: this.getSpareBeadCount(materialList)
    }
  },

  normalizeBeadsToPalette(beads) {
    const colorCache = {}
    return beads.map((bead) => {
      if (!bead.on) return bead
      const sourceColor = String(bead.color || '').toLowerCase()
      if (!colorCache[sourceColor]) {
        colorCache[sourceColor] = this.findNearestBeadColor(this.hexToRgb(sourceColor))
      }
      return Object.assign({}, bead, { color: colorCache[sourceColor].color })
    })
  },

  annotateBeads(beads, theme) {
    return beads.map((bead) => {
      if (!bead.on) return Object.assign({}, bead, { displayCode: '' })
      const meta = this.getBeadMetaForColor(bead.color, theme, theme.palette.indexOf(bead.color))
      return Object.assign({}, bead, { displayCode: meta.symbol || meta.code })
    })
  },

  getSpareBeadCount(materialList) {
    return materialList.reduce((total, item) => total + Math.ceil(item.count * 0.08), 0)
  },

  getPatternTitle() {
    const school = this.data.selectedLogoSchool ? this.data.selectedLogoSchool.name : this.data.form.school
    return `${school || '学校校徽'}拼豆图纸`
  },

  changeBoardPreset(event) {
    const boardPresetIndex = Number(event.detail.value)
    const config = BOARD_PRESETS[boardPresetIndex] || BOARD_PRESETS[0]
    this.setData({
      boardPresetIndex,
      cols: config.cols,
      rows: config.rows,
      pixelCanvasW: config.pixelW,
      pixelCanvasH: config.pixelH,
      beadMm: config.beadMm,
      boardNote: config.note,
      sizeText: this.getSizeText(config),
      uploadStatus: `已切换为 ${config.name}：${config.cols} x ${config.rows}，成品约 ${this.getSizeText(config)}`
    }, () => {
      this.resetDesign()
    })
  },

  changeImageMode(event) {
    const imageModeIndex = Number(event.detail.value)
    const mode = IMAGE_MODES[imageModeIndex] || IMAGE_MODES[1]
    this.setData({
      imageModeIndex,
      imageModeNote: mode.note,
      uploadStatus: `已切换为 ${mode.name}：${mode.note}`,
      uploadedImageInfoText: this.data.uploadedImagePath
        ? this.data.uploadedImageInfoText.replace(/当前生成模式：.+$/, `当前生成模式：${mode.name}`)
        : this.data.uploadedImageInfoText
    })
  },

  changeColorSet(event) {
    const colorSetIndex = Number(event.detail.value)
    const set = COLOR_SETS[colorSetIndex] || COLOR_SETS[0]
    this.setData({
      colorSetIndex,
      colorSetNote: set.note,
      uploadStatus: `已切换为 ${set.name}，正在重新匹配实体豆颜色`
    }, () => {
      if (this.data.uploadedImagePath) {
        wx.showLoading({ title: '切换品牌' })
        wx.getImageInfo({
          src: this.data.uploadedImagePath,
          success: (info) => this.pixelateLogoImage(info.path || this.data.uploadedImagePath, info.width, info.height),
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '重新读取校徽失败', icon: 'none' })
          }
        })
        return
      }

      this.setData(Object.assign(
        {},
        this.buildPatternState(this.data.beads, this.data.theme),
        { logoStatus: `已按 ${set.name} 重新匹配豆子颜色与色号` }
      ))
    })
  },

  changePatternDisplayMode(event) {
    const patternDisplayModeIndex = Number(event.currentTarget.dataset.index)
    const mode = PATTERN_DISPLAY_MODES[patternDisplayModeIndex] || PATTERN_DISPLAY_MODES[0]
    this.setData({
      patternDisplayModeIndex,
      patternDisplayMode: mode.id
    })
  },

  changeGridGap(event) {
    const gridGapIndex = Number(event.detail.value)
    const option = GRID_GAP_OPTIONS[gridGapIndex] || GRID_GAP_OPTIONS[1]
    this.setData({
      gridGapIndex,
      gridGap: option.value
    })
  },

  changeBrightness(event) {
    this.setData({
      brightnessAdjustment: Number(event.detail.value)
    })
  },

  changeContrast(event) {
    this.setData({
      contrastAdjustment: Number(event.detail.value)
    })
  },

  changeSaturation(event) {
    this.setData({
      saturationAdjustment: Number(event.detail.value)
    })
  },

  filterSchools(keyword = this.data.schoolKeyword, provinceIndex = this.data.provinceIndex) {
    const query = keyword.trim().toLowerCase()
    const province = PROVINCES[provinceIndex]
    const schoolOptions = SCHOOL_SEARCH_CATALOG.filter((school) => {
      const matchesProvince = province === '全部' || school.province === province
      const matchesQuery = !query || school.name.toLowerCase().includes(query) || school.province.includes(query) || school.type.includes(query)
      return matchesProvince && matchesQuery
    }).slice(0, 60)

    this.setData({
      schoolKeyword: keyword,
      provinceIndex,
      schoolOptions
    })
  },

  switchFlow(event) {
    const activeFlow = event.currentTarget.dataset.flow
    const currentPreset = this.getBoardConfig()
    const shouldUseLogoPreset = activeFlow === 'logo' && !currentPreset.id.startsWith('logo-')
    const shouldUseNoticePreset = activeFlow !== 'logo' && currentPreset.id.startsWith('logo-')

    if (!shouldUseLogoPreset && !shouldUseNoticePreset) {
      this.setData({ activeFlow })
      return
    }

    const boardPresetIndex = shouldUseLogoPreset ? 0 : 2
    const config = BOARD_PRESETS[boardPresetIndex]
    this.setData({
      activeFlow,
      boardPresetIndex,
      cols: config.cols,
      rows: config.rows,
      pixelCanvasW: config.pixelW,
      pixelCanvasH: config.pixelH,
      beadMm: config.beadMm,
      boardNote: config.note,
      sizeText: this.getSizeText(config)
    }, () => {
      this.resetDesign()
    })
  },

  resetDesign() {
    if (this.data.activeFlow === 'logo') {
      const beads = this.createLogoPlaceholderPattern(this.data.theme)
      this.setData({
        templateMode: 'logo',
        motifText: '校徽方形图纸 · 上传校徽后自动量化',
        ...this.buildPatternState(beads, this.data.theme)
      })
      return
    }

    const motif = this.data.selectedSchool ? this.data.selectedSchool.motif : 'classic'
    const beads = this.createAdmissionPattern(this.data.theme, motif)
    this.setData({
      templateMode: 'generated',
      motifText: this.data.selectedSchool ? this.data.motifText : '高清通知书版式、双层边框、标题区、正文区和圆章',
      ...this.buildPatternState(beads, this.data.theme)
    })
  },

  createLogoPlaceholderPattern(theme) {
    const cols = this.data.cols
    const rows = this.data.rows
    const beads = []
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        beads.push({ id: `${x}-${y}`, x, y, on: true, color: theme.palette[3] || EMPTY })
      }
    }

    const put = (x, y, colorIndex = 0) => {
      if (x < 0 || x >= cols || y < 0 || y >= rows) return
      const index = y * cols + x
      beads[index].on = true
      beads[index].color = theme.palette[colorIndex] || theme.palette[0]
    }
    const circle = (cx, cy, radius, colorIndex = 0) => {
      for (let y = cy - radius; y <= cy + radius; y += 1) {
        for (let x = cx - radius; x <= cx + radius; x += 1) {
          const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
          if (Math.abs(distance - radius) < 0.8 || Math.abs(distance - radius * 0.68) < 0.8) put(x, y, colorIndex)
        }
      }
    }
    const line = (x1, y1, x2, y2, colorIndex = 0) => {
      const dx = Math.abs(x2 - x1)
      const dy = Math.abs(y2 - y1)
      const steps = Math.max(dx, dy)
      for (let step = 0; step <= steps; step += 1) {
        put(Math.round(x1 + (x2 - x1) * step / steps), Math.round(y1 + (y2 - y1) * step / steps), colorIndex)
      }
    }

    const cx = Math.floor(cols / 2)
    const cy = Math.floor(rows / 2)
    const radius = Math.floor(Math.min(cols, rows) * 0.36)
    circle(cx, cy, radius, 0)
    circle(cx, cy, Math.floor(radius * 0.55), 1)
    line(cx - Math.floor(radius * 0.35), cy, cx + Math.floor(radius * 0.35), cy, 2)
    line(cx, cy - Math.floor(radius * 0.35), cx, cy + Math.floor(radius * 0.35), 2)
    return beads
  },

  createLogoPendingPattern(theme) {
    const cols = this.data.cols
    const rows = this.data.rows
    const paper = theme.paper || theme.palette[3] || EMPTY
    const beads = []
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        beads.push({ id: `${x}-${y}`, x, y, on: true, color: paper })
      }
    }
    return beads
  },

  showLogoUnavailableState(school, theme, message, sourceStatus) {
    const beads = this.createLogoPendingPattern(theme)
    this.setData({
      motifText: `${school.name} · 真实校徽暂不可用`,
      templateMode: 'logo-unavailable',
      theme,
      uploadedImagePath: '',
      uploadedImageInfoText: '',
      ...this.buildPatternState(beads, theme),
      logoStatus: message,
      logoSourceStatus: sourceStatus || '没有可读的真实校徽图片，请上传校徽照片或先把该校徽缓存到云端'
    })
  },

  createAdmissionPattern(theme, motif = 'classic') {
    const cols = this.data.cols
    const rows = this.data.rows
    const beads = []
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        beads.push({
          id: `${x}-${y}`,
          x,
          y,
          on: false,
          color: EMPTY
        })
      }
    }

    const put = (x, y, colorIndex = 0) => {
      if (x < 0 || x >= cols || y < 0 || y >= rows) return
      const index = y * cols + x
      beads[index].on = true
      beads[index].color = theme.palette[colorIndex]
    }
    const line = (x1, y1, x2, y2, colorIndex = 0) => {
      const dx = Math.abs(x2 - x1)
      const dy = Math.abs(y2 - y1)
      const steps = Math.max(dx, dy)
      for (let step = 0; step <= steps; step += 1) {
        const x = Math.round(x1 + (x2 - x1) * step / steps)
        const y = Math.round(y1 + (y2 - y1) * step / steps)
        put(x, y, colorIndex)
      }
    }
    const rect = (left, top, right, bottom, colorIndex = 0) => {
      line(left, top, right, top, colorIndex)
      line(left, bottom, right, bottom, colorIndex)
      line(left, top, left, bottom, colorIndex)
      line(right, top, right, bottom, colorIndex)
    }
    const fillRect = (left, top, right, bottom, colorIndex = 0) => {
      for (let y = top; y <= bottom; y += 1) {
        for (let x = left; x <= right; x += 1) put(x, y, colorIndex)
      }
    }
    const circle = (cx, cy, radius, colorIndex = 0, fill = false) => {
      for (let y = cy - radius; y <= cy + radius; y += 1) {
        for (let x = cx - radius; x <= cx + radius; x += 1) {
          const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
          if (fill ? distance <= radius : Math.abs(distance - radius) < 0.72) put(x, y, colorIndex)
        }
      }
    }

    fillRect(0, 0, cols - 1, rows - 1, 3)
    rect(1, 1, cols - 2, rows - 2, 0)
    rect(3, 3, cols - 4, rows - 4, 1)
    rect(5, 5, cols - 6, rows - 6, 3)

    for (let x = 7; x <= cols - 8; x += 4) {
      put(x, 3, 0)
      put(x + 1, 3, 1)
      put(x, rows - 4, 0)
      put(x + 1, rows - 4, 1)
    }

    line(10, 8, 31, 8, 2)
    line(12, 9, 29, 9, 2)
    line(15, 11, 26, 11, 0)
    line(7, 14, cols - 8, 14, 1)

    this.drawMotif(motif, put, line, rect, fillRect, circle)

    rect(7, 33, 27, 45, 1)
    for (let y = 36; y <= 42; y += 3) {
      line(10, y, 24, y, 2)
      line(10, y + 1, 19, y + 1, 2)
    }
    line(8, 48, 23, 48, 1)
    line(11, 50, 20, 50, 2)

    circle(33, 42, 6, 0, false)
    circle(33, 42, 3, 1, false)
    line(30, 42, 36, 42, 0)
    line(33, 39, 33, 45, 0)

    for (let i = 0; i < 18; i += 1) {
      const x = 6 + (i * 7) % 30
      const y = 16 + (i * 11) % 15
      put(x, y, i % 2 === 0 ? 1 : 3)
    }

    return beads
  },

  drawMotif(motif, put, line, rect, fillRect, circle) {
    if (motif === 'gate') {
      line(10, 24, 31, 24, 2)
      line(12, 21, 29, 21, 0)
      line(14, 18, 27, 18, 1)
      line(16, 15, 25, 15, 0)
      for (let x = 13; x <= 29; x += 4) line(x, 24, x, 31, 2)
      rect(11, 25, 30, 31, 1)
      return
    }

    if (motif === 'tower') {
      line(21, 15, 15, 25, 0)
      line(21, 15, 27, 25, 0)
      fillRect(17, 25, 25, 31, 2)
      rect(16, 24, 26, 32, 0)
      line(13, 32, 29, 32, 1)
      line(19, 28, 23, 28, 3)
      return
    }

    if (motif === 'scroll') {
      rect(9, 17, 32, 30, 0)
      line(11, 20, 30, 20, 1)
      line(12, 24, 29, 24, 2)
      line(12, 27, 26, 27, 2)
      circle(9, 17, 3, 1, false)
      circle(32, 30, 3, 1, false)
      return
    }

    if (motif === 'bridge') {
      line(9, 29, 32, 29, 2)
      line(11, 29, 16, 22, 0)
      line(16, 22, 21, 29, 0)
      line(21, 29, 26, 22, 0)
      line(26, 22, 31, 29, 0)
      line(12, 25, 30, 25, 1)
      for (let x = 10; x <= 32; x += 3) put(x, 18, 3)
      return
    }

    if (motif === 'stars') {
      rect(9, 17, 32, 31, 2)
      for (let i = 0; i < 24; i += 1) {
        const x = 10 + (i * 7) % 21
        const y = 18 + (i * 5) % 12
        put(x, y, i % 3 === 0 ? 1 : 3)
      }
      line(12, 31, 30, 18, 0)
      line(18, 31, 31, 23, 1)
      return
    }

    rect(9, 17, 32, 31, 0)
    rect(11, 19, 30, 29, 1)
    line(13, 21, 28, 21, 2)
    line(13, 24, 28, 24, 2)
    line(13, 27, 24, 27, 2)
    circle(30, 29, 4, 0, false)
  },

  updateForm(event) {
    const key = event.currentTarget.dataset.key
    const value = event.detail.value
    const form = Object.assign({}, this.data.form, { [key]: value })
    if (key === 'school') {
      form.schoolShort = value.slice(0, 2) || '录取'
    }
    this.setData({ form })
  },

  updateAiSchool(event) {
    this.setData({
      aiSchoolName: event.detail.value
    })
  },

  changeMaxColors(event) {
    this.setData({
      maxColorIndex: Number(event.detail.value)
    })
  },

  toggleDither(event) {
    this.setData({
      ditherEnabled: event.detail.value
    })
  },

  toggleTextEnhance(event) {
    this.setData({
      textEnhanceEnabled: event.detail.value
    })
  },

  toggleAiNoticeAnalyze(event) {
    this.setData({
      aiNoticeAnalyzeEnabled: event.detail.value,
      aiAnalyzeStatus: event.detail.value
        ? 'AI 会先理解学校名、标题、主色和版式，再生成拼豆图纸'
        : '已关闭 AI 理解，将直接按本地规则生成图纸'
    })
  },

  updateUploadTitle(event) {
    this.setData({
      uploadTitle: event.detail.value
    })
  },

  chooseAiReferenceImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          aiReferencePath: res.tempFilePaths[0],
          aiStatus: '已添加校徽/通知书参考图，可以生成 AI 拼豆方案'
        })
      }
    })
  },

  generateWithAi() {
    const schoolName = this.data.aiSchoolName.trim() || this.data.form.school.trim()
    if (!schoolName) {
      wx.showToast({ title: '先填写院校名', icon: 'none' })
      return
    }

    if (!wx.cloud) {
      wx.showToast({ title: '请先配置微信云开发', icon: 'none' })
      return
    }

    wx.showLoading({ title: 'AI 生成中' })
    const callAiGenerate = (referenceFileID = '') => {
      wx.cloud.callFunction({
        name: 'aiGenerate',
        data: {
          schoolName,
          referenceFileID,
          cols: this.data.cols,
          rows: this.data.rows
        },
        success: (callRes) => {
          wx.hideLoading()
          const result = callRes.result || {}
          if (!result.ok) {
            this.setData({
              aiStatus: result.message || 'AI 生成失败，请检查云函数配置'
            })
            wx.showToast({ title: '生成失败', icon: 'none' })
            return
          }

          this.setData({
            aiStatus: referenceFileID ? 'AI 已基于参考图生成，正在量化' : 'AI 已按学校生成无校徽版，正在量化'
          })

          if (result.imageFileID) {
            wx.cloud.downloadFile({
              fileID: result.imageFileID,
              success: (downloadRes) => {
                wx.getImageInfo({
                  src: downloadRes.tempFilePath,
                  success: (info) => {
                    this.pixelateReferenceImage(downloadRes.tempFilePath, info.width, info.height)
                  },
                  fail: () => {
                    this.setData({ aiStatus: 'AI 图片已生成，但读取失败' })
                  }
                })
              },
              fail: () => {
                this.setData({ aiStatus: 'AI 图片已生成，但下载失败' })
              }
            })
          } else if (result.imageTempPath) {
            this.pixelateReferenceImage(result.imageTempPath, result.width || this.data.pixelCanvasW, result.height || this.data.pixelCanvasH)
          } else {
            this.setData({
              aiStatus: 'AI 方案已生成，请在后端返回可下载图片后自动量化'
            })
          }
        },
        fail: () => {
          wx.hideLoading()
          this.setData({
            aiStatus: '云函数调用失败，请确认 aiGenerate 已部署'
          })
          wx.showToast({ title: '云函数未就绪', icon: 'none' })
        }
      })
    }

    if (!this.data.aiReferencePath) {
      callAiGenerate()
      return
    }

    const cloudPath = `ai-reference/${Date.now()}-${Math.random().toString(16).slice(2)}.jpg`
    wx.cloud.uploadFile({
      cloudPath,
      filePath: this.data.aiReferencePath,
      success: (uploadRes) => {
        callAiGenerate(uploadRes.fileID)
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '参考图上传失败', icon: 'none' })
      }
    })
  },

  chooseTheme(event) {
    const id = event.currentTarget.dataset.id
    const theme = THEMES.find((item) => item.id === id) || THEMES[0]
    const beads = this.data.beads.map((bead) => {
      if (!bead.on) return bead
      const oldPaletteIndex = this.data.theme.palette.indexOf(bead.color)
      const nextIndex = oldPaletteIndex >= 0 ? oldPaletteIndex : 0
      return Object.assign({}, bead, { color: theme.palette[nextIndex] })
    })
    const motifText = this.data.templateMode === 'image'
      ? '上传参考图自动像素化 · 当前色盘量化 · 可继续手动微调'
      : '高清通知书版式、双层边框、标题区、正文区和圆章'

    this.setData({
      selectedSchool: null,
      motifText,
      theme,
      ...this.buildPatternState(beads, theme)
    })
  },

  chooseSchool(event) {
    const id = event.currentTarget.dataset.id
    const selectedSchool = SCHOOL_STYLES.find((item) => item.id === id)
    if (!selectedSchool) return

    const theme = selectedSchool.theme
    const beads = this.createAdmissionPattern(theme, selectedSchool.motif)
    const form = Object.assign({}, this.data.form, {
      school: selectedSchool.school,
      schoolShort: selectedSchool.short
    })

    this.setData({
      selectedSchool,
      motifText: selectedSchool.motifs.join(' · '),
      templateMode: 'generated',
      aiSchoolName: selectedSchool.school,
      aiStatus: `已选择 ${selectedSchool.school}，可直接 AI 生成；上传参考图会更贴近校徽/通知书`,
      theme,
      form,
      ...this.buildPatternState(beads, theme)
    })
  },

  searchSchool(event) {
    this.filterSchools(event.detail.value, this.data.provinceIndex)
  },

  changeProvince(event) {
    this.filterSchools(this.data.schoolKeyword, Number(event.detail.value))
  },

  chooseCatalogSchool(event) {
    const index = Number(event.currentTarget.dataset.index)
    const catalogSchool = this.data.schoolOptions[index]
    if (!catalogSchool) return

    const featured = SCHOOL_STYLES.find((item) => item.id === catalogSchool.style)
    if (featured) {
      const theme = featured.theme
      const beads = this.createAdmissionPattern(theme, featured.motif)
      const form = Object.assign({}, this.data.form, {
        school: featured.school,
        schoolShort: featured.short
      })

      this.setData({
        selectedSchool: featured,
        motifText: featured.motifs.join(' · '),
        templateMode: 'generated',
        aiSchoolName: featured.school,
        aiStatus: `已选择 ${featured.school}，可直接 AI 生成；上传参考图会更贴近校徽/通知书`,
        theme,
        form,
        ...this.buildPatternState(beads, theme)
      })
      return
    }

    const autoTheme = this.createAutoTheme(catalogSchool)
    const beads = this.createAdmissionPattern(autoTheme, autoTheme.motif)
    const form = Object.assign({}, this.data.form, {
      school: catalogSchool.name,
      schoolShort: catalogSchool.name.slice(0, 2)
    })

    this.setData({
      selectedSchool: {
        id: catalogSchool.name,
        name: catalogSchool.name,
        school: catalogSchool.name,
        short: catalogSchool.name.slice(0, 2),
        motif: autoTheme.motif,
        motifs: autoTheme.motifs
      },
      motifText: autoTheme.motifs.join(' · '),
      templateMode: 'generated',
      aiSchoolName: catalogSchool.name,
      aiStatus: `已选择 ${catalogSchool.name}，可直接 AI 生成；上传参考图会更贴近校徽/通知书`,
      theme: autoTheme,
      form,
      ...this.buildPatternState(beads, autoTheme)
    })
  },

  createAutoTheme(school) {
    const preset = AUTO_THEMES[school.type] || AUTO_THEMES['综合']
    return {
      id: `auto-${school.name}`,
      name: `${school.province}${preset.name}`,
      paper: '#fffdf8',
      palette: preset.palette,
      beadNames: preset.beadNames,
      motif: preset.motif,
      motifs: preset.motifs
    }
  },

  chooseTool(event) {
    this.setData({
      tool: event.currentTarget.dataset.tool
    })
  },

  paintBead(event) {
    const index = Number(event.currentTarget.dataset.index)
    const beads = clone(this.data.beads)
    const bead = beads[index]

    if (this.data.tool === 'erase') {
      bead.on = false
      bead.color = EMPTY
    } else {
      const palette = this.data.theme.palette
      const currentIndex = palette.indexOf(bead.color)
      bead.on = true
      bead.color = palette[(currentIndex + 1) % palette.length]
    }

    this.setData(this.buildPatternState(beads, this.data.theme))
  },

  sprinkleBeads() {
    const beads = clone(this.data.beads)
    const palette = this.data.theme.palette
    for (let i = 0; i < 120; i += 1) {
      const x = Math.floor(Math.random() * (this.data.cols - 4)) + 2
      const y = Math.floor(Math.random() * (this.data.rows - 4)) + 2
      const index = y * this.data.cols + x
      beads[index].on = true
      beads[index].color = palette[Math.floor(Math.random() * palette.length)]
    }
    this.setData(this.buildPatternState(beads, this.data.theme))
  },

  mirrorPattern(event) {
    const direction = event.currentTarget.dataset.direction
    const cols = this.data.cols
    const rows = this.data.rows
    const source = this.data.beads
    const beads = source.map((bead) => {
      const nextX = direction === 'x' ? cols - 1 - bead.x : bead.x
      const nextY = direction === 'y' ? rows - 1 - bead.y : bead.y
      const sourceIndex = nextY * cols + nextX
      const sourceBead = source[sourceIndex]
      return Object.assign({}, bead, {
        on: sourceBead.on,
        color: sourceBead.color
      })
    })
    this.setData(this.buildPatternState(beads, this.data.theme))
  },

  countBeads(beads) {
    return beads.filter((bead) => bead.on).length
  },

  createMaterialList(beads, theme) {
    const colors = Array.from(new Set(beads.filter((bead) => bead.on).map((bead) => bead.color)))
    return colors.map((color, index) => {
      const meta = this.getBeadMetaForColor(color, theme, index)
      return {
        code: meta.code,
        symbol: meta.symbol || meta.code,
        brand: meta.brand,
        color,
        name: meta.name,
        count: beads.filter((bead) => bead.on && bead.color === color).length,
        spare: 0
      }
    }).filter((item) => item.count > 0).map((item) => Object.assign({}, item, {
      spare: Math.ceil(item.count * 0.08)
    }))
  },

  getBeadMetaForColor(color, theme, index) {
    const available = this.getAvailableBeadColors()
    const exact = available.find((item) => item.color.toLowerCase() === color.toLowerCase())
    if (exact) return exact
    if (theme.beadItems) {
      const themed = theme.beadItems.find((item) => item.color.toLowerCase() === color.toLowerCase())
      if (themed) return themed
    }
    return this.findNearestBeadColor(this.hexToRgb(color))
  },

  chooseReferenceImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera'],
      success: (chooseRes) => {
        const imagePath = chooseRes.tempFilePaths[0]
        wx.showLoading({ title: '像素化中' })
        wx.getImageInfo({
          src: imagePath,
          success: (info) => {
            this.setData({
              uploadedImagePath: imagePath,
              uploadedImageInfoText: `原图 ${info.width} x ${info.height} · 当前生成模式：${this.getImageMode().name}`
            })
            if (this.data.aiNoticeAnalyzeEnabled && wx.cloud) {
              this.analyzeNoticeImage(imagePath, info)
            } else {
              this.pixelateReferenceImage(imagePath, info.width, info.height)
            }
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '读取图片失败', icon: 'none' })
          }
        })
      }
    })
  },

  chooseLogoImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera'],
      success: (chooseRes) => {
        const imagePath = chooseRes.tempFilePaths[0]
        const logoModeIndex = IMAGE_MODES.findIndex((mode) => mode.id === 'logo')
        const nextModeIndex = logoModeIndex >= 0 ? logoModeIndex : this.data.imageModeIndex
        wx.showLoading({ title: '生成校徽' })
        wx.getImageInfo({
          src: imagePath,
          success: (info) => {
            this.setData({
              imageModeIndex: nextModeIndex,
              imageModeNote: IMAGE_MODES[nextModeIndex].note,
              uploadedImagePath: imagePath,
              uploadedImageInfoText: `校徽原图 ${info.width} x ${info.height} · 当前生成模式：${IMAGE_MODES[nextModeIndex].name}`
            })
            this.pixelateLogoImage(imagePath, info.width, info.height)
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '读取校徽失败', icon: 'none' })
          }
        })
      }
    })
  },

  chooseLogoSchool(event) {
    const index = Number(event.currentTarget.dataset.index)
    const school = this.data.schoolOptions[index]
    if (!school) return

    const autoTheme = this.createAutoTheme(school)
    const logoRecord = SCHOOL_LOGO_MAP[school.name]
    const logoModeIndex = IMAGE_MODES.findIndex((mode) => mode.id === 'logo')
    const nextModeIndex = logoModeIndex >= 0 ? logoModeIndex : this.data.imageModeIndex
    const form = Object.assign({}, this.data.form, {
      school: school.name,
      schoolShort: school.name.slice(0, 2)
    })

    this.setData({
      selectedLogoSchool: school,
      form,
      theme: autoTheme,
      imageModeIndex: nextModeIndex,
      imageModeNote: IMAGE_MODES[nextModeIndex].note,
      uploadedImagePath: '',
      uploadedImageInfoText: '',
      logoStatus: `已选择 ${school.name}，正在读取校徽库`,
      logoSourceName: logoRecord ? logoRecord.sourceName : '',
      logoSourceUrl: logoRecord ? logoRecord.sourceUrl : '',
      logoSourceStatus: this.getLogoSourceStatus(logoRecord)
    }, () => {
      this.loadSchoolLogoRecord(school, autoTheme, logoRecord)
    })
  },

  getLogoSourceStatus(logoRecord) {
    if (!logoRecord) return '校徽库暂未收录真实源图，请上传校徽图片'
    if (logoRecord.cachedFileID) return `已收录云端校徽图 · 来源：${logoRecord.sourceName}`
    if (logoRecord.localPath) return `已存储本地校徽图 · 来源：${logoRecord.sourceName}`
    if (logoRecord.imageUrl) return `已收录校徽图片 URL · 来源：${logoRecord.sourceName}`
    if (logoRecord.downloadUrl) return `已找到校徽下载源，待转存为小程序可用图片 · ${logoRecord.sourceName}`
    if (logoRecord.status === 'source_pending') return '校徽库已有学校记录，官方校徽来源待采集'
    return `已收录官方来源，待缓存校徽图片 · ${logoRecord.sourceName}`
  },

  loadSchoolLogoRecord(school, theme, logoRecord) {
    if (!logoRecord || (!logoRecord.cachedFileID && !logoRecord.localPath && !logoRecord.imageUrl)) {
      const hasDownloadSource = logoRecord && logoRecord.downloadUrl
      this.showLogoUnavailableState(
        school,
        theme,
        hasDownloadSource
          ? `${school.name} 已找到校徽来源，但还没缓存成小程序可读图片`
          : `${school.name} 暂无可读真实校徽，请上传校徽图片`,
        hasDownloadSource
          ? `已找到校徽下载源，待转存为可直连图片或微信云缓存 · ${logoRecord.sourceName}`
          : '校徽库暂无可用真实图片，不能生成假校徽'
      )
      return
    }

    wx.showLoading({ title: '读取校徽' })
    const requestToken = ++this._logoLoadToken
    const sourceKey = logoRecord.cachedFileID || logoRecord.localPath || logoRecord.imageUrl
    const isCurrentRequest = () => requestToken === this._logoLoadToken

    const showReadFailure = () => {
      if (!isCurrentRequest()) return
      wx.hideLoading()
      this.showLogoUnavailableState(
        school,
        theme,
        `${school.name} 校徽图片读取失败，请上传该校真实校徽或重新缓存`,
        `源图不可用，待重新缓存 · 来源：${logoRecord.sourceName}`
      )
    }

    const handleLogoPath = (imagePath, shouldCache = false) => {
      if (!isCurrentRequest()) return
      wx.getImageInfo({
        src: imagePath,
        success: (info) => {
          if (!isCurrentRequest()) return
          // Canvas needs the local path returned by getImageInfo. Passing the
          // original https URL here makes remote logos render as a blank board.
          const drawablePath = info.path || imagePath
          this.setData({
            uploadedImagePath: drawablePath,
            uploadedImageInfoText: `${school.name} 校徽源图 ${info.width} x ${info.height} · 来源：${logoRecord.sourceName}`,
            logoStatus: `已读取 ${school.name} 校徽源图，正在生成拼豆图纸`
          })
          this.pixelateLogoImage(
            drawablePath,
            info.width,
            info.height,
            () => {
              if (shouldCache) this.cacheLogoFile(school.name, sourceKey, drawablePath)
            },
            isCurrentRequest
          )
        },
        fail: showReadFailure
      })
    }

    const downloadRemoteLogo = (imageUrl) => {
      wx.downloadFile({
        url: imageUrl,
        success: (res) => {
          if (!isCurrentRequest()) return
          if (res.statusCode >= 200 && res.statusCode < 300 && res.tempFilePath) {
            handleLogoPath(res.tempFilePath, true)
            return
          }
          // Some development environments allow getImageInfo to fetch a URL
          // even when downloadFile is restricted, so keep this compatibility path.
          handleLogoPath(imageUrl, true)
        },
        fail: () => handleLogoPath(imageUrl, true)
      })
    }

    const loadFromSource = () => {
      if (!isCurrentRequest()) return

      if (logoRecord.cachedFileID) {
        if (!wx.cloud) {
          wx.hideLoading()
          this.showLogoUnavailableState(
            school,
            theme,
            `${school.name} 校徽云缓存需要开启微信云开发后才能读取`,
            `已收录云端校徽图，但当前环境未开启云开发 · 来源：${logoRecord.sourceName}`
          )
          return
        }

        wx.cloud.downloadFile({
          fileID: logoRecord.cachedFileID,
          success: (res) => handleLogoPath(res.tempFilePath, true),
          fail: showReadFailure
        })
        return
      }

      if (logoRecord.localPath) {
        handleLogoPath(logoRecord.localPath)
        return
      }

      downloadRemoteLogo(logoRecord.imageUrl)
    }

    this.getCachedLogoPath(
      school.name,
      sourceKey,
      (cachedPath) => {
        if (!isCurrentRequest()) return
        this.setData({ logoStatus: `已从本地缓存读取 ${school.name} 校徽，正在生成拼豆图纸` })
        handleLogoPath(cachedPath)
      },
      loadFromSource
    )
  },

  generateSchoolLogoPattern(school, theme) {
    wx.showLoading({ title: '生成校徽' })
    const canvasW = this.data.pixelCanvasW
    const canvasH = this.data.pixelCanvasH
    const ctx = wx.createCanvasContext('pixelCanvas', this)
    this.drawSchoolLogoTemplate(ctx, school, theme)
    ctx.draw(false, () => {
      wx.canvasGetImageData({
        canvasId: 'pixelCanvas',
        x: 0,
        y: 0,
        width: canvasW,
        height: canvasH,
        success: (res) => {
          const preparedData = this.prepareImageData(res.data)
          const imageTheme = this.createImageTheme(preparedData)
          const beads = this.quantizeImageData(preparedData, imageTheme)
          this.setData({
            motifText: `${school.name} · 校徽模板样式 · ${school.type}`,
            templateMode: 'logo-school',
            theme: imageTheme,
            ...this.buildPatternState(beads, imageTheme),
            logoStatus: `已生成 ${school.name} 校徽拼豆样式，提取 ${imageTheme.palette.length} 色`
          })
          wx.hideLoading()
        },
        fail: () => {
          wx.hideLoading()
          wx.showToast({ title: '生成失败', icon: 'none' })
        }
      }, this)
    })
  },

  drawSchoolLogoTemplate(ctx, school, theme) {
    const canvasW = this.data.pixelCanvasW
    const canvasH = this.data.pixelCanvasH
    const centerX = canvasW / 2
    const centerY = canvasH / 2
    const radius = Math.round(Math.min(canvasW, canvasH) * 0.39)
    const palette = theme.palette
    const primary = palette[0] || '#1e6f6a'
    const secondary = palette[1] || '#d9ad49'
    const ink = palette[2] || '#24201f'
    const paper = palette[3] || '#fffaf0'
    const shortName = school.name.replace(/[（）()]/g, '').slice(0, 2)
    const typeMark = {
      理工: '工',
      综合: '学',
      师范: '师',
      医药: '医',
      财经: '财',
      农林: '农',
      语言: '文',
      政法: '法',
      艺术: '艺',
      民族: '民'
    }[school.type] || '校'

    ctx.setFillStyle(paper)
    ctx.fillRect(0, 0, canvasW, canvasH)

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.setFillStyle(primary)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(centerX, centerY, Math.round(radius * 0.83), 0, Math.PI * 2)
    ctx.setFillStyle(paper)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(centerX, centerY, Math.round(radius * 0.68), 0, Math.PI * 2)
    ctx.setStrokeStyle(primary)
    ctx.setLineWidth(Math.max(8, Math.round(canvasW * 0.025)))
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(centerX, centerY, Math.round(radius * 0.42), 0, Math.PI * 2)
    ctx.setFillStyle(secondary)
    ctx.fill()

    ctx.setTextAlign('center')
    ctx.setFillStyle(primary)
    ctx.setFontSize(this.fitTextSize(ctx, school.name, canvasW * 0.58, Math.round(canvasW * 0.062)))
    ctx.fillText(school.name, centerX, Math.round(centerY - radius * 0.58))

    ctx.setFillStyle(ink)
    ctx.setFontSize(Math.round(canvasW * 0.16))
    ctx.fillText(shortName, centerX, Math.round(centerY + canvasW * 0.035))

    ctx.setFillStyle(primary)
    ctx.setFontSize(Math.round(canvasW * 0.072))
    ctx.fillText(typeMark, centerX, Math.round(centerY + radius * 0.56))
  },

  pixelateLogoImage(imagePath, imageWidth, imageHeight, onComplete, isActive = () => true) {
    // Four source samples per bead are enough for edge/detail detection. The
    // previous 10x sampling processed 336,400 pixels for a 58x58 pattern.
    const canvasW = this.data.cols * 4
    const canvasH = this.data.rows * 4
    const side = Math.min(canvasW, canvasH)
    const targetSize = Math.round(side * 0.84)
    const imageRatio = imageWidth / imageHeight
    let dw = targetSize
    let dh = targetSize
    if (imageRatio > 1) {
      dh = targetSize / imageRatio
    } else {
      dw = targetSize * imageRatio
    }
    const dx = (canvasW - dw) / 2
    const dy = (canvasH - dh) / 2

    const ctx = wx.createCanvasContext('pixelCanvas', this)
    ctx.setFillStyle('#fffaf0')
    ctx.fillRect(0, 0, canvasW, canvasH)
    ctx.drawImage(imagePath, 0, 0, imageWidth, imageHeight, dx, dy, dw, dh)
    this.drawLogoGuide(ctx, canvasW, canvasH)
    ctx.draw(false, () => {
      if (!isActive()) return
      wx.canvasGetImageData({
        canvasId: 'pixelCanvas',
        x: 0,
        y: 0,
        width: canvasW,
        height: canvasH,
        success: (res) => {
          if (!isActive()) return
          const preparedData = this.prepareImageData(res.data)
          const imageTheme = this.createImageTheme(preparedData, canvasW, canvasH)
          const beads = this.quantizeImageData(preparedData, imageTheme, canvasW, canvasH)
          this.setData({
            selectedSchool: null,
            motifText: '校徽上传自动像素化 · 方形底板 · 校徽清晰模式',
            templateMode: 'logo',
            theme: imageTheme,
            ...this.buildPatternState(beads, imageTheme),
            logoStatus: `已生成 ${this.data.cols} x ${this.data.rows} 校徽拼豆图纸，提取 ${imageTheme.palette.length} 色`
          })
          wx.hideLoading()
          if (onComplete) onComplete()
        },
        fail: () => {
          if (!isActive()) return
          wx.hideLoading()
          wx.showToast({ title: '校徽量化失败', icon: 'none' })
        }
      }, this)
    })
  },

  drawLogoGuide(ctx, canvasW = this.data.pixelCanvasW, canvasH = this.data.pixelCanvasH) {
    const centerX = canvasW / 2
    const centerY = canvasH / 2
    const radius = Math.round(Math.min(canvasW, canvasH) * 0.43)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.setStrokeStyle('rgba(45, 33, 28, 0.2)')
    ctx.setLineWidth(Math.max(3, Math.round(canvasH * 0.006)))
    ctx.stroke()
  },

  analyzeNoticeImage(imagePath, info) {
    this.setData({
      aiAnalyzeStatus: '正在用 AI 理解通知书结构'
    })
    const cloudPath = `notice-analyze/${Date.now()}-${Math.random().toString(16).slice(2)}.jpg`
    wx.cloud.uploadFile({
      cloudPath,
      filePath: imagePath,
      success: (uploadRes) => {
        wx.cloud.callFunction({
          name: 'noticeAnalyze',
          data: {
            referenceFileID: uploadRes.fileID
          },
          success: (callRes) => {
            const result = callRes.result || {}
            if (!result.ok || !result.analysis) {
              this.setData({
                aiAnalyzeStatus: result.message || 'AI 理解失败，已改用本地生成'
              })
              this.pixelateReferenceImage(imagePath, info.width, info.height)
              return
            }
            this.applyNoticeAnalysis(result.analysis)
            this.pixelateReferenceImage(imagePath, info.width, info.height)
          },
          fail: () => {
            this.setData({
              aiAnalyzeStatus: 'AI 云函数调用失败，已改用本地生成'
            })
            this.pixelateReferenceImage(imagePath, info.width, info.height)
          }
        })
      },
      fail: () => {
        this.setData({
          aiAnalyzeStatus: '图片上传 AI 分析失败，已改用本地生成'
        })
        this.pixelateReferenceImage(imagePath, info.width, info.height)
      }
    })
  },

  applyNoticeAnalysis(analysis) {
    const form = Object.assign({}, this.data.form)
    const schoolName = (analysis.schoolName || '').trim()
    const title = (analysis.title || '').trim()
    if (schoolName) {
      form.school = schoolName
      form.schoolShort = schoolName.slice(0, 2)
    }

    const modeIndex = this.data.imageModeIndex
    this.setData({
      form,
      uploadTitle: title || this.data.uploadTitle,
      imageModeIndex: modeIndex,
      imageModeNote: IMAGE_MODES[modeIndex].note,
      aiRedrawColors: analysis.redraw || null,
      aiAnalyzeStatus: `AI 已识别：${schoolName || '未读出学校'} · ${title || '录取通知书'} · 置信度 ${Math.round((analysis.confidence || 0) * 100)}%`
    })
  },

  pixelateReferenceImage(imagePath, imageWidth, imageHeight) {
    const canvasW = this.data.pixelCanvasW
    const canvasH = this.data.pixelCanvasH
    const targetRatio = canvasW / canvasH
    const imageRatio = imageWidth / imageHeight
    let dx = 0
    let dy = 0
    let dw = canvasW
    let dh = canvasH

    if (imageRatio > targetRatio) {
      dh = canvasW / imageRatio
      dy = (canvasH - dh) / 2
    } else {
      dw = canvasH * imageRatio
      dx = (canvasW - dw) / 2
    }

    const ctx = wx.createCanvasContext('pixelCanvas', this)
    ctx.setFillStyle('#fffaf0')
    ctx.fillRect(0, 0, canvasW, canvasH)
    ctx.drawImage(imagePath, 0, 0, imageWidth, imageHeight, dx, dy, dw, dh)
    if (this.getImageMode().id === 'redraw') {
      this.drawAdmissionRedraw(ctx)
    } else {
      this.drawTextEnhancement(ctx)
    }
    ctx.draw(false, () => {
      wx.canvasGetImageData({
        canvasId: 'pixelCanvas',
        x: 0,
        y: 0,
        width: canvasW,
        height: canvasH,
        success: (res) => {
          const preparedData = this.prepareImageData(res.data)
          const imageTheme = this.createImageTheme(preparedData)
          const beads = this.quantizeImageData(preparedData, imageTheme)
          this.setData({
            selectedSchool: null,
            motifText: `上传参考图自动像素化 · ${this.getImageMode().name} · 已按照片主色生成拼豆色卡`,
            templateMode: 'image',
            theme: imageTheme,
            ...this.buildPatternState(beads, imageTheme),
            uploadStatus: `已按${this.getImageMode().name}模式提取 ${imageTheme.palette.length} 色，生成 ${this.data.cols} x ${this.data.rows} 拼豆图纸`
          })
          wx.hideLoading()
        },
        fail: () => {
          wx.hideLoading()
          wx.showToast({ title: '图片量化失败', icon: 'none' })
        }
      }, this)
    })
  },

  drawTextEnhancement(ctx) {
    if (!this.data.textEnhanceEnabled) return

    const school = (this.data.form.school || '').trim()
    const title = (this.data.uploadTitle || '').trim()
    if (!school && !title) return

    const canvasW = this.data.pixelCanvasW
    const canvasH = this.data.pixelCanvasH
    const centerX = canvasW / 2
    const startY = Math.round(canvasH * 0.38)

    ctx.setTextAlign('center')
    ctx.setFillStyle('rgba(0, 0, 0, 0.32)')
    ctx.fillRect(Math.round(canvasW * 0.24), startY - 90, Math.round(canvasW * 0.52), 205)

    if (school) {
      ctx.setFillStyle('#fffaf0')
      ctx.setFontSize(this.fitTextSize(ctx, school, canvasW * 0.46, Math.round(canvasH * 0.085)))
      ctx.fillText(school, centerX, startY)
    }

    if (title) {
      ctx.setFillStyle('#fffaf0')
      ctx.setFontSize(this.fitTextSize(ctx, title, canvasW * 0.56, Math.round(canvasH * 0.062)))
      ctx.fillText(title, centerX, startY + Math.round(canvasH * 0.09))
    }
  },

  drawAdmissionRedraw(ctx) {
    const canvasW = this.data.pixelCanvasW
    const canvasH = this.data.pixelCanvasH
    const colors = this.getAdmissionRedrawColors()
    const school = (this.data.form.school || this.data.aiSchoolName || '').trim()
    const schoolText = school || '理想大学'
    const titleText = (this.data.uploadTitle || '录取通知书').trim()
    const centerX = canvasW / 2
    const logoX = Math.round(canvasW * 0.31)
    const logoY = Math.round(canvasH * 0.32)
    const logoR = Math.round(canvasH * 0.07)

    ctx.setFillStyle(colors.paper)
    ctx.fillRect(0, 0, canvasW, canvasH)

    ctx.setStrokeStyle(colors.primary)
    ctx.setLineWidth(Math.max(4, Math.round(canvasH * 0.012)))
    ctx.strokeRect(Math.round(canvasW * 0.035), Math.round(canvasH * 0.055), Math.round(canvasW * 0.93), Math.round(canvasH * 0.89))
    ctx.setStrokeStyle(colors.gold)
    ctx.setLineWidth(Math.max(3, Math.round(canvasH * 0.007)))
    ctx.strokeRect(Math.round(canvasW * 0.055), Math.round(canvasH * 0.08), Math.round(canvasW * 0.89), Math.round(canvasH * 0.84))

    ctx.setFillStyle(colors.primary)
    ctx.fillRect(Math.round(canvasW * 0.09), Math.round(canvasH * 0.16), Math.round(canvasW * 0.82), Math.round(canvasH * 0.3))

    ctx.beginPath()
    ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2)
    ctx.setStrokeStyle(colors.light)
    ctx.setLineWidth(Math.max(3, Math.round(canvasH * 0.007)))
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(logoX, logoY, Math.round(logoR * 0.58), 0, Math.PI * 2)
    ctx.setStrokeStyle(colors.gold)
    ctx.stroke()
    ctx.setFillStyle(colors.light)
    ctx.setFontSize(Math.round(canvasH * 0.055))
    ctx.setTextAlign('center')
    ctx.fillText('★', logoX, logoY + Math.round(canvasH * 0.02))

    ctx.setFillStyle(colors.light)
    ctx.setTextAlign('left')
    ctx.setFontSize(this.fitTextSize(ctx, schoolText, canvasW * 0.43, Math.round(canvasH * 0.095)))
    ctx.fillText(schoolText, Math.round(canvasW * 0.4), Math.round(canvasH * 0.3))

    ctx.setFillStyle(colors.light)
    ctx.setFontSize(this.fitTextSize(ctx, titleText, canvasW * 0.68, Math.round(canvasH * 0.075)))
    ctx.setTextAlign('center')
    ctx.fillText(titleText, centerX, Math.round(canvasH * 0.42))

    ctx.setStrokeStyle(colors.gold)
    ctx.setLineWidth(Math.max(3, Math.round(canvasH * 0.006)))
    ctx.beginPath()
    ctx.moveTo(Math.round(canvasW * 0.18), Math.round(canvasH * 0.54))
    ctx.lineTo(Math.round(canvasW * 0.82), Math.round(canvasH * 0.54))
    ctx.stroke()

    ctx.setStrokeStyle(colors.ink)
    ctx.setLineWidth(Math.max(2, Math.round(canvasH * 0.004)))
    for (let i = 0; i < 4; i += 1) {
      const y = Math.round(canvasH * (0.61 + i * 0.065))
      ctx.beginPath()
      ctx.moveTo(Math.round(canvasW * 0.2), y)
      ctx.lineTo(Math.round(canvasW * 0.68), y)
      ctx.stroke()
    }

    const sealX = Math.round(canvasW * 0.76)
    const sealY = Math.round(canvasH * 0.72)
    const sealR = Math.round(canvasH * 0.08)
    ctx.beginPath()
    ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2)
    ctx.setStrokeStyle(colors.seal)
    ctx.setLineWidth(Math.max(4, Math.round(canvasH * 0.009)))
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(sealX, sealY, Math.round(sealR * 0.55), 0, Math.PI * 2)
    ctx.stroke()
    ctx.setFillStyle(colors.seal)
    ctx.setFontSize(Math.round(canvasH * 0.04))
    ctx.setTextAlign('center')
    ctx.fillText('录取', sealX, sealY + Math.round(canvasH * 0.015))
  },

  getAdmissionRedrawColors() {
    if (this.data.aiRedrawColors) {
      return this.data.aiRedrawColors
    }
    const school = `${this.data.form.school || ''}${this.data.aiSchoolName || ''}`
    if (school.includes('清华') || school.includes('南京大学')) {
      return { paper: '#4a278a', primary: '#34205f', gold: '#d9ad49', light: '#fffaf0', ink: '#d7c2ff', seal: '#f0c86a' }
    }
    if (school.includes('复旦') || school.includes('浙江大学') || school.includes('浙大')) {
      return { paper: '#f7fbff', primary: '#164f9c', gold: '#d9ad49', light: '#fffaf0', ink: '#182a42', seal: '#b7352b' }
    }
    if (school.includes('北大') || school.includes('北京大学')) {
      return { paper: '#fff4e6', primary: '#8f1d22', gold: '#d9ad49', light: '#fffaf0', ink: '#44261f', seal: '#b7352b' }
    }
    return { paper: '#fff4e6', primary: '#b7352b', gold: '#d9ad49', light: '#fffaf0', ink: '#44261f', seal: '#8f1d22' }
  },

  fitTextSize(ctx, text, maxWidth, startSize) {
    let size = startSize
    ctx.setFontSize(size)
    while (size > 30 && ctx.measureText(text).width > maxWidth) {
      size -= 4
      ctx.setFontSize(size)
    }
    return size
  },

  prepareImageData(data) {
    const mode = this.getImageMode()
    const next = new Uint8ClampedArray(data.length)
    for (let i = 0; i < data.length; i += 4) {
      const rgb = this.adjustRgb({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2]
      }, mode)
      next[i] = rgb.r
      next[i + 1] = rgb.g
      next[i + 2] = rgb.b
      next[i + 3] = data[i + 3]
    }
    return next
  },

  adjustRgb(rgb, mode) {
    const lum = this.luminance(rgb)
    const sat = this.saturation(rgb)
    const boost = (mode.saturationBoost || 1) + this.data.saturationAdjustment / 100
    const contrast = (mode.contrastBoost || 1) + this.data.contrastAdjustment / 120
    const brightness = this.data.brightnessAdjustment * 1.6
    const adjustChannel = (value) => {
      const contrasted = 128 + (value - 128) * contrast + brightness
      const saturated = lum + (contrasted - lum) * (sat < 0.08 ? 1 : boost)
      return this.clampColor(saturated)
    }
    return {
      r: adjustChannel(rgb.r),
      g: adjustChannel(rgb.g),
      b: adjustChannel(rgb.b)
    }
  },

  quantizeImageData(
    data,
    theme = this.data.theme,
    canvasW = this.data.pixelCanvasW,
    canvasH = this.data.pixelCanvasH
  ) {
    const cols = this.data.cols
    const rows = this.data.rows
    const cellW = canvasW / cols
    const cellH = canvasH / rows
    const palette = theme.palette
    const paletteRgb = palette.map((color) => this.hexToRgb(color))
    const mode = this.getImageMode()
    const beads = []
    const grid = []

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        let r = 0
        let g = 0
        let b = 0
        let weight = 0
        let brightR = 0
        let brightG = 0
        let brightB = 0
        let brightWeight = 0
        let darkR = 0
        let darkG = 0
        let darkB = 0
        let darkWeight = 0
        let edgeR = 0
        let edgeG = 0
        let edgeB = 0
        let edgeWeight = 0
        let minLum = 255
        let maxLum = 0
        const startX = Math.floor(x * cellW)
        const endX = Math.floor((x + 1) * cellW)
        const startY = Math.floor(y * cellH)
        const endY = Math.floor((y + 1) * cellH)

        for (let py = startY; py < endY; py += 1) {
          for (let px = startX; px < endX; px += 1) {
            const offset = (py * canvasW + px) * 4
            const alpha = data[offset + 3] / 255
            r += data[offset] * alpha
            g += data[offset + 1] * alpha
            b += data[offset + 2] * alpha
            weight += alpha

            const rgb = { r: data[offset], g: data[offset + 1], b: data[offset + 2] }
            const lum = this.luminance(rgb)
            minLum = Math.min(minLum, lum)
            maxLum = Math.max(maxLum, lum)
            const rightOffset = px + 1 < canvasW ? offset + 4 : offset
            const downOffset = py + 1 < canvasH ? offset + canvasW * 4 : offset
            const rightLum = this.luminance({ r: data[rightOffset], g: data[rightOffset + 1], b: data[rightOffset + 2] })
            const downLum = this.luminance({ r: data[downOffset], g: data[downOffset + 1], b: data[downOffset + 2] })
            const edgeStrength = Math.max(Math.abs(lum - rightLum), Math.abs(lum - downLum))
            if (edgeStrength > mode.edgeContrast) {
              edgeR += rgb.r * alpha
              edgeG += rgb.g * alpha
              edgeB += rgb.b * alpha
              edgeWeight += alpha
            }
            if (lum > 160) {
              brightR += rgb.r * alpha
              brightG += rgb.g * alpha
              brightB += rgb.b * alpha
              brightWeight += alpha
            }
            if (lum < 92) {
              darkR += rgb.r * alpha
              darkG += rgb.g * alpha
              darkB += rgb.b * alpha
              darkWeight += alpha
            }
          }
        }

        const avg = weight > 0
          ? { r: Math.round(r / weight), g: Math.round(g / weight), b: Math.round(b / weight) }
          : { r: 255, g: 255, b: 255 }
        grid.push(this.pickDetailAwareCellColor({
          avg,
          bright: brightWeight > 0 ? { r: Math.round(brightR / brightWeight), g: Math.round(brightG / brightWeight), b: Math.round(brightB / brightWeight) } : null,
          brightRatio: weight > 0 ? brightWeight / weight : 0,
          dark: darkWeight > 0 ? { r: Math.round(darkR / darkWeight), g: Math.round(darkG / darkWeight), b: Math.round(darkB / darkWeight) } : null,
          darkRatio: weight > 0 ? darkWeight / weight : 0,
          edge: edgeWeight > 0 ? { r: Math.round(edgeR / edgeWeight), g: Math.round(edgeG / edgeWeight), b: Math.round(edgeB / edgeWeight) } : null,
          edgeRatio: weight > 0 ? edgeWeight / weight : 0,
          contrast: maxLum - minLum
        }))
      }
    }

    const workingGrid = grid.map((color) => Object.assign({}, color))
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const index = y * cols + x
        const color = this.findNearestPaletteColor(workingGrid[index], palette, paletteRgb)
        const quantized = this.hexToRgb(color)

        beads.push({
          id: `${x}-${y}`,
          x,
          y,
          on: true,
          color
        })

        if (this.data.ditherEnabled) {
          const error = {
            r: workingGrid[index].r - quantized.r,
            g: workingGrid[index].g - quantized.g,
            b: workingGrid[index].b - quantized.b
          }
          this.diffuseColorError(workingGrid, x + 1, y, error, 7 / 16)
          this.diffuseColorError(workingGrid, x - 1, y + 1, error, 3 / 16)
          this.diffuseColorError(workingGrid, x, y + 1, error, 5 / 16)
          this.diffuseColorError(workingGrid, x + 1, y + 1, error, 1 / 16)
        }
      }
    }

    return beads
  },

  diffuseColorError(grid, x, y, error, factor) {
    const cols = this.data.cols
    const rows = this.data.rows
    if (x < 0 || x >= cols || y < 0 || y >= rows) return
    const index = y * cols + x
    grid[index].r = this.clampColor(grid[index].r + error.r * factor)
    grid[index].g = this.clampColor(grid[index].g + error.g * factor)
    grid[index].b = this.clampColor(grid[index].b + error.b * factor)
  },

  normalizeColoredShadow(rgb) {
    const sat = this.saturation(rgb)
    const lum = this.luminance(rgb)
    if (sat < 0.16 || lum >= 95) return rgb

    const boost = Math.min(1.55, 100 / Math.max(lum, 45))
    return {
      r: this.clampColor(rgb.r * boost),
      g: this.clampColor(rgb.g * boost),
      b: this.clampColor(rgb.b * boost)
    }
  },

  pickDetailAwareCellColor(cell) {
    const mode = this.getImageMode()
    const avgLum = this.luminance(cell.avg)
    const avgSat = this.saturation(cell.avg)
    const brightLum = cell.bright ? this.luminance(cell.bright) : 0
    const darkLum = cell.dark ? this.luminance(cell.dark) : 255
    const edgeLum = cell.edge ? this.luminance(cell.edge) : avgLum

    if (
      cell.edge &&
      cell.contrast > mode.edgeContrast &&
      cell.edgeRatio > mode.edgeRatio &&
      Math.abs(edgeLum - avgLum) > 24
    ) {
      return cell.edge
    }

    if (
      cell.bright &&
      cell.contrast > mode.contrast &&
      cell.brightRatio > mode.brightRatio &&
      cell.brightRatio < 0.68 &&
      avgLum < 178 &&
      brightLum - avgLum > 32
    ) {
      return cell.bright
    }

    if (
      cell.dark &&
      cell.contrast > mode.contrast &&
      cell.darkRatio > mode.darkRatio &&
      cell.darkRatio < 0.58 &&
      avgLum > 138 &&
      avgLum - darkLum > 32
    ) {
      return cell.dark
    }

    if (avgSat > 0.16) {
      return this.normalizeColoredShadow(cell.avg)
    }

    return cell.avg
  },

  createImageTheme(
    data,
    canvasW = this.data.pixelCanvasW,
    canvasH = this.data.pixelCanvasH
  ) {
    const buckets = {}
    const sampleStep = Math.max(1, Math.floor(Math.min(canvasW, canvasH) / 96))
    for (let y = 0; y < canvasH; y += sampleStep) {
      for (let x = 0; x < canvasW; x += sampleStep) {
        const offset = (y * canvasW + x) * 4
        if (data[offset + 3] < 120) continue
        const r = data[offset]
        const g = data[offset + 1]
        const b = data[offset + 2]
        const key = `${Math.round(r / 28)}-${Math.round(g / 28)}-${Math.round(b / 28)}`
        if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, count: 0 }
        buckets[key].r += r
        buckets[key].g += g
        buckets[key].b += b
        buckets[key].count += 1
      }
    }

    const colors = Object.keys(buckets).map((key) => {
      const bucket = buckets[key]
      const rgb = {
        r: Math.round(bucket.r / bucket.count),
        g: Math.round(bucket.g / bucket.count),
        b: Math.round(bucket.b / bucket.count)
      }
      return Object.assign({}, rgb, {
        count: bucket.count,
        lum: this.luminance(rgb),
        sat: this.saturation(rgb)
      })
    }).sort((a, b) => b.count - a.count)

    const picked = []
    const addColor = (candidate) => {
      if (!candidate) return
      const farEnough = picked.every((item) => this.colorDistance(candidate, item) > 34)
      if (farEnough) picked.push(candidate)
    }

    addColor(colors.find((color) => color.lum > 205))
    colors.filter((color) => color.sat > 0.18 && color.lum > 70).slice(0, 18).forEach(addColor)
    addColor(colors.find((color) => color.lum < 90 && color.sat > 0.18))
    addColor(colors.find((color) => color.lum < 75 && color.sat <= 0.18))
    colors.slice(0, 24).forEach(addColor)

    const maxColors = MAX_COLOR_OPTIONS[this.data.maxColorIndex]
    const fallback = ['#fffaf0', '#b7352b', '#d9ad49', '#24201f', '#8b7b70', '#f2e6cf']
    const paletteItems = []
    const addPaletteItem = (source) => {
      const item = this.findNearestBeadColor(source)
      if (paletteItems.every((pickedItem) => pickedItem.code !== item.code)) paletteItems.push(item)
    }

    addPaletteItem(this.hexToRgb('#fffaf0'))
    picked.forEach(addPaletteItem)
    fallback.map((color) => this.hexToRgb(color)).forEach(addPaletteItem)

    return {
      id: `image-${Date.now()}`,
      name: '照片匹配色',
      paper: paletteItems[0].color,
      palette: paletteItems.slice(0, maxColors).map((item) => item.color),
      beadNames: paletteItems.slice(0, maxColors).map((item) => item.name),
      beadItems: paletteItems.slice(0, maxColors)
    }
  },

  findNearestBeadColor(rgb) {
    const beadColors = this.getAvailableBeadColors()
    let best = beadColors[0] || BEAD_COLORS[0]
    let bestScore = Number.POSITIVE_INFINITY
    beadColors.forEach((item) => {
      const candidate = this.hexToRgb(item.color)
      const score = this.weightedColorScore(rgb, candidate)
      if (score < bestScore) {
        bestScore = score
        best = item
      }
    })
    return best
  },

  findNearestPaletteColor(rgb, palette, paletteRgb) {
    let bestIndex = 0
    let bestScore = Number.POSITIVE_INFINITY

    paletteRgb.forEach((candidate, index) => {
      const score = this.weightedColorScore(rgb, candidate)
      if (score < bestScore) {
        bestScore = score
        bestIndex = index
      }
    })

    return palette[bestIndex]
  },

  weightedColorScore(a, b) {
    const rDiff = a.r - b.r
    const gDiff = a.g - b.g
    const bDiff = a.b - b.b
    const rgbScore = rDiff * rDiff * 0.3 + gDiff * gDiff * 0.59 + bDiff * bDiff * 0.11
    const aSat = this.saturation(a)
    const bSat = this.saturation(b)
    const lumDiff = this.luminance(a) - this.luminance(b)
    const hueScore = this.hueDistanceScore(a, b)
    const neutralPenalty = aSat > 0.18 && bSat < 0.12 ? 5200 : 0
    const chromaPenalty = Math.abs(aSat - bSat) * 2600

    return rgbScore * 0.58 + lumDiff * lumDiff * 0.18 + hueScore + neutralPenalty + chromaPenalty
  },

  hueDistanceScore(a, b) {
    const aSat = this.saturation(a)
    const bSat = this.saturation(b)
    if (aSat < 0.12 || bSat < 0.12) return 0

    const aHue = this.hue(a)
    const bHue = this.hue(b)
    const diff = Math.abs(aHue - bHue)
    const circularDiff = Math.min(diff, 360 - diff)
    return circularDiff * circularDiff * 3.2
  },

  colorDistance(a, b) {
    return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)
  },

  luminance(rgb) {
    return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114
  },

  saturation(rgb) {
    const max = Math.max(rgb.r, rgb.g, rgb.b) / 255
    const min = Math.min(rgb.r, rgb.g, rgb.b) / 255
    if (max === 0) return 0
    return (max - min) / max
  },

  hue(rgb) {
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    if (delta === 0) return 0

    let hue = 0
    if (max === r) hue = ((g - b) / delta) % 6
    if (max === g) hue = (b - r) / delta + 2
    if (max === b) hue = (r - g) / delta + 4
    return (hue * 60 + 360) % 360
  },

  rgbToHex(rgb) {
    const toHex = (value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0')
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
  },

  clampColor(value) {
    return Math.max(0, Math.min(255, Math.round(value)))
  },

  hexToRgb(hex) {
    const normalized = hex.replace('#', '')
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    }
  },

  exportCoordinateGuide() {
    this.setData({
      patternDisplayModeIndex: 2,
      patternDisplayMode: 'code'
    }, () => {
      this.exportPoster()
    })
  },

  getPdfPayload() {
    const board = this.getBoardConfig()
    const selectedSchool = this.data.selectedLogoSchool
    return {
      title: this.getPatternTitle(),
      school: selectedSchool ? selectedSchool.name : this.data.form.school,
      schoolType: selectedSchool ? selectedSchool.type : '',
      sourceName: this.data.logoSourceName || '',
      boardName: board.name,
      boardNote: board.note,
      beadMm: board.beadMm,
      colorSetName: this.getColorSet().name,
      cols: this.data.cols,
      rows: this.data.rows,
      sizeText: this.data.sizeText,
      beadCount: this.data.beadCount,
      spareBeadCount: this.data.spareBeadCount,
      mode: 'code',
      beads: this.data.beads.map((bead) => ({
        x: bead.x,
        y: bead.y,
        on: bead.on,
        color: bead.color
      })),
      materialList: this.data.materialList,
      craftSteps: this.data.craftSteps
    }
  },

  exportPdf() {
    const payload = this.getPdfPayload()
    if (!wx.cloud) {
      this.exportPdfLocally(payload)
      return
    }

    wx.showLoading({ title: '生成 PDF' })
    wx.cloud.callFunction({
      name: 'exportPdf',
      data: payload,
      success: (callRes) => {
        const result = callRes.result || {}
        if (!result.ok || !result.fileID) {
          wx.hideLoading()
          this.exportPdfLocally(payload)
          return
        }

        wx.cloud.downloadFile({
          fileID: result.fileID,
          success: (downloadRes) => {
            wx.hideLoading()
            wx.openDocument({
              filePath: downloadRes.tempFilePath,
              fileType: 'pdf',
              showMenu: true,
              fail: () => {
                wx.showToast({ title: 'PDF 打开失败', icon: 'none' })
              }
            })
          },
          fail: () => {
            wx.hideLoading()
            this.exportPdfLocally(payload)
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        this.exportPdfLocally(payload)
      }
    })
  },

  exportPdfLocally(payload = this.getPdfPayload()) {
    wx.showLoading({ title: '本地生成 PDF' })
    try {
      const filePath = `${wx.env.USER_DATA_PATH}/bead-pattern-${Date.now()}.pdf`
      const fileData = buildPdfArrayBuffer(payload)
      wx.getFileSystemManager().writeFile({
        filePath,
        data: fileData,
        success: () => {
          wx.hideLoading()
          wx.openDocument({
            filePath,
            fileType: 'pdf',
            showMenu: true,
            fail: () => {
              wx.showToast({ title: 'PDF 打开失败', icon: 'none' })
            }
          })
        },
        fail: () => {
          wx.hideLoading()
          wx.showToast({ title: 'PDF 写入失败', icon: 'none' })
        }
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: 'PDF 生成失败', icon: 'none' })
    }
  },

  exportMaterialList() {
    wx.showLoading({ title: '生成清单' })
    const ctx = wx.createCanvasContext('posterCanvas', this)
    const width = 1600
    const height = 1400
    const margin = 72
    const lineHeight = 58
    const totalWithSpare = this.data.beadCount + this.data.spareBeadCount

    ctx.setFillStyle('#fffdf8')
    ctx.fillRect(0, 0, width, height)
    ctx.setStrokeStyle('#2d211c')
    ctx.setLineWidth(4)
    ctx.strokeRect(34, 34, width - 68, height - 68)

    ctx.setFillStyle('#2d211c')
    ctx.setTextAlign('left')
    ctx.setFontSize(48)
    ctx.fillText(`${this.getPatternTitle()} · 材料清单`, margin, 116)
    ctx.setFillStyle('#6f5b50')
    ctx.setFontSize(26)
    ctx.fillText(`${this.data.cols} x ${this.data.rows} · ${this.data.sizeText} · ${this.data.materialList.length} 色`, margin, 164)
    ctx.fillText(`实际用豆 ${this.data.beadCount} 颗 · 建议备豆 ${this.data.spareBeadCount} 颗 · 合计准备约 ${totalWithSpare} 颗`, margin, 204)

    ctx.setFillStyle('#e8eeec')
    ctx.fillRect(margin, 248, width - margin * 2, 64)
    ctx.setFillStyle('#2d211c')
    ctx.setFontSize(24)
    ctx.fillText('品牌', margin + 20, 289)
    ctx.fillText('色号', margin + 290, 289)
    ctx.fillText('颜色名', margin + 470, 289)
    ctx.fillText('用量', margin + 940, 289)
    ctx.fillText('建议备豆', margin + 1120, 289)

    this.data.materialList.forEach((item, index) => {
      const y = 352 + index * lineHeight
      ctx.beginPath()
      ctx.arc(margin + 24, y - 10, 18, 0, Math.PI * 2)
      ctx.setFillStyle(item.color)
      ctx.fill()
      ctx.setFillStyle('#2d211c')
      ctx.setFontSize(24)
      ctx.fillText(item.brand, margin + 58, y)
      ctx.fillText(item.code, margin + 290, y)
      ctx.fillText(item.name, margin + 470, y)
      ctx.fillText(`${item.count} 颗`, margin + 940, y)
      ctx.fillText(`${item.spare} 颗`, margin + 1120, y)
    })

    const footerY = height - 110
    ctx.setFillStyle('#6f5b50')
    ctx.setFontSize(24)
    ctx.fillText('线下配豆建议：优先按品牌和色号拿豆；不同品牌同色号不可直接混用，最终以实物色差为准。', margin, footerY)

    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'posterCanvas',
        width,
        height,
        destWidth: width,
        destHeight: height,
        success: (res) => {
          wx.hideLoading()
          wx.previewImage({
            urls: [res.tempFilePath],
            current: res.tempFilePath
          })
        },
        fail: () => {
          wx.hideLoading()
          wx.showToast({ title: '导出失败', icon: 'none' })
        }
      }, this)
    })
  },

  exportPoster() {
    wx.showLoading({ title: '生成图纸' })
    const ctx = wx.createCanvasContext('posterCanvas', this)
    const theme = this.data.theme
    const cols = this.data.cols
    const rows = this.data.rows
    const beadMm = this.data.beadMm
    const width = 2400
    const height = 1900
    const margin = 64
    const boardX = 118
    const boardY = 250
    const cellSize = Math.floor(Math.min((width - boardX - 92) / cols, (height - boardY - 240) / rows))
    const dotRadius = Math.max(3.2, cellSize * 0.36)
    const boardW = cols * cellSize
    const boardH = rows * cellSize
    const legendTop = boardY + boardH + 82
    const labelStepX = cols > 100 ? 4 : 2
    const labelStepY = rows > 80 ? 4 : 2

    ctx.setFillStyle('#fffdf8')
    ctx.fillRect(0, 0, width, height)
    ctx.setStrokeStyle('#2d211c')
    ctx.setLineWidth(4)
    ctx.strokeRect(36, 36, width - 72, height - 72)

    ctx.setFillStyle('#2d211c')
    ctx.setFontSize(48)
    ctx.setTextAlign('left')
    ctx.fillText(this.getPatternTitle(), margin, 112)
    ctx.setFillStyle('#6f5b50')
    ctx.setFontSize(24)
    ctx.fillText(`${this.data.form.school || '学校校徽'} · ${this.data.theme.name}`, margin, 154)
    ctx.fillText(`${cols} × ${rows} 横版底板 · 单颗约 ${beadMm}mm · 成品约 ${this.data.sizeText}`, margin, 190)
    ctx.fillText(`${this.data.theme.name} · ${this.data.boardNote} · ${this.data.motifText}`, margin, 226)

    ctx.setFillStyle('#4c3b34')
    ctx.setFontSize(14)
    ctx.setTextAlign('center')
    for (let x = 0; x < cols; x += 1) {
      if (x % labelStepX === 0) ctx.fillText(String(x + 1), boardX + x * cellSize + cellSize / 2, boardY - 10)
    }
    ctx.setTextAlign('right')
    for (let y = 0; y < rows; y += 1) {
      if (y % labelStepY === 0) ctx.fillText(String(y + 1), boardX - 10, boardY + y * cellSize + cellSize * 0.72)
    }

    ctx.setStrokeStyle('#d8c6b8')
    ctx.setLineWidth(1)
    for (let x = 0; x <= cols; x += 1) {
      const lineX = boardX + x * cellSize
      ctx.beginPath()
      ctx.moveTo(lineX, boardY)
      ctx.lineTo(lineX, boardY + boardH)
      ctx.stroke()
    }
    for (let y = 0; y <= rows; y += 1) {
      const lineY = boardY + y * cellSize
      ctx.beginPath()
      ctx.moveTo(boardX, lineY)
      ctx.lineTo(boardX + boardW, lineY)
      ctx.stroke()
    }

    this.data.beads.forEach((bead) => {
      const x = boardX + bead.x * cellSize
      const y = boardY + bead.y * cellSize
      if (!bead.on) return

      ctx.beginPath()
      ctx.arc(x + cellSize / 2, y + cellSize / 2, dotRadius, 0, Math.PI * 2)
      ctx.setFillStyle(bead.color)
      ctx.fill()

      const codeIndex = Math.max(0, theme.palette.indexOf(bead.color))
      const meta = this.getBeadMetaForColor(bead.color, theme, codeIndex)
      ctx.setFillStyle(this.getBeadLabelColor(bead.color))
      ctx.setFontSize(Math.max(7, Math.floor(cellSize * 0.42)))
      ctx.setTextAlign('center')
      ctx.fillText(meta.code, x + cellSize / 2, y + cellSize * 0.68)
    })

    ctx.setStrokeStyle('#2d211c')
    ctx.setLineWidth(3)
    ctx.strokeRect(boardX, boardY, boardW, boardH)

    ctx.setTextAlign('left')
    ctx.setFillStyle('#2d211c')
    ctx.setFontSize(30)
    ctx.fillText('材料清单', margin, legendTop)
    this.data.materialList.forEach((item, index) => {
      const x = margin + (index % 4) * 540
      const y = legendTop + 40 + Math.floor(index / 4) * 34
      ctx.beginPath()
      ctx.arc(x + 16, y - 8, 14, 0, Math.PI * 2)
      ctx.setFillStyle(item.color)
      ctx.fill()
      ctx.setFillStyle('#2d211c')
      ctx.setFontSize(20)
      ctx.fillText(`${item.brand} ${item.code} ${item.name}: ${item.count} 颗 + 备 ${item.spare}`, x + 46, y)
    })

    ctx.setFillStyle('#6f5b50')
    ctx.setFontSize(22)
    ctx.fillText('保存后带到线下店铺，按坐标和颜色编号摆豆；方形底板适合单独制作学校校徽。', margin, 1882)

    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'posterCanvas',
        width,
        height,
        destWidth: width,
        destHeight: height,
        success: (res) => {
          wx.hideLoading()
          wx.previewImage({
            urls: [res.tempFilePath],
            current: res.tempFilePath
          })
        },
        fail: () => {
          wx.hideLoading()
          wx.showToast({
            title: '导出失败',
            icon: 'none'
          })
        }
      }, this)
    })
  },

  getBeadLabelColor(color) {
    const rgb = this.hexToRgb(color)
    return this.luminance(rgb) < 120 ? '#ffffff' : '#2d211c'
  }
})
