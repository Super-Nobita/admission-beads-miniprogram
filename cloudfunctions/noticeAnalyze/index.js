const cloud = require('wx-server-sdk')
const OpenAI = require('openai')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const schema = {
  name: 'admission_notice_analysis',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      schoolName: { type: 'string' },
      title: { type: 'string' },
      noticeKind: { type: 'string' },
      primaryTone: { type: 'string', enum: ['red', 'purple', 'blue', 'green', 'cream', 'dark', 'unknown'] },
      layout: { type: 'string', enum: ['cover', 'certificate', 'letter', 'box', 'unknown'] },
      hasLogoOrSeal: { type: 'boolean' },
      logoPosition: { type: 'string', enum: ['left', 'center', 'right', 'top', 'unknown'] },
      suggestedMode: { type: 'string', enum: ['redraw', 'notice', 'flat', 'photo'] },
      confidence: { type: 'number' },
      redraw: {
        type: 'object',
        additionalProperties: false,
        properties: {
          paper: { type: 'string' },
          primary: { type: 'string' },
          gold: { type: 'string' },
          light: { type: 'string' },
          ink: { type: 'string' },
          seal: { type: 'string' }
        },
        required: ['paper', 'primary', 'gold', 'light', 'ink', 'seal']
      },
      warnings: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    required: [
      'schoolName',
      'title',
      'noticeKind',
      'primaryTone',
      'layout',
      'hasLogoOrSeal',
      'logoPosition',
      'suggestedMode',
      'confidence',
      'redraw',
      'warnings'
    ]
  },
  strict: true
}

const normalizeHex = (value, fallback) => {
  if (typeof value !== 'string') return fallback
  const match = value.trim().match(/^#[0-9a-fA-F]{6}$/)
  return match ? value.trim() : fallback
}

exports.main = async (event) => {
  const { referenceFileID } = event

  if (!referenceFileID) {
    return { ok: false, message: '缺少参考图 fileID' }
  }

  if (!process.env.OPENAI_API_KEY) {
    return { ok: false, message: '云函数未配置 OPENAI_API_KEY，无法调用视觉模型' }
  }

  const downloaded = await cloud.downloadFile({
    fileID: referenceFileID
  })

  const imageBase64 = downloaded.fileContent.toString('base64')
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const response = await client.responses.create({
    model: process.env.OPENAI_VISION_MODEL || 'gpt-5.6-luna',
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: [
              '分析这张录取通知书或通知书参考图，用于生成拼豆图纸。',
              '只提取图片中可见的信息；不确定就留空字符串或 unknown，不要编造学校、校徽、公章、编号或录取信息。',
              '重点识别：学校名、通知书标题、主色调、版式、校徽/印章大致位置。',
              'redraw 颜色必须给出适合拼豆重绘的 6 个十六进制颜色。'
            ].join('\n')
          },
          {
            type: 'input_image',
            image_url: `data:image/png;base64,${imageBase64}`
          }
        ]
      }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: schema.name,
        schema: schema.schema,
        strict: schema.strict
      }
    }
  })

  let analysis
  try {
    analysis = JSON.parse(response.output_text || '{}')
  } catch (error) {
    return { ok: false, message: '视觉模型返回格式解析失败' }
  }

  const redraw = analysis.redraw || {}
  return {
    ok: true,
    analysis: Object.assign({}, analysis, {
      schoolName: analysis.schoolName || '',
      title: analysis.title || '录取通知书',
      confidence: Math.max(0, Math.min(1, Number(analysis.confidence) || 0)),
      redraw: {
        paper: normalizeHex(redraw.paper, '#fff4e6'),
        primary: normalizeHex(redraw.primary, '#b7352b'),
        gold: normalizeHex(redraw.gold, '#d9ad49'),
        light: normalizeHex(redraw.light, '#fffaf0'),
        ink: normalizeHex(redraw.ink, '#44261f'),
        seal: normalizeHex(redraw.seal, '#8f1d22')
      }
    })
  }
}
