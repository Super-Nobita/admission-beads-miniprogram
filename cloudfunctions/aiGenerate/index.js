const cloud = require('wx-server-sdk')
const OpenAI = require('openai')
const { toFile } = require('openai/uploads')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const buildPrompt = (schoolName, hasReference) => [
  `为${schoolName}生成一张可转拼豆图纸的录取通知书风格参考图。`,
  hasReference
    ? '必须以用户上传的校徽或录取通知书参考图为唯一校徽依据；不要发明、替换或改写校徽。'
    : '用户没有上传校徽参考图，因此不要生成官方校徽、伪校徽或看起来像真实校徽的图案；可以使用校名文字徽章、学校名称、录取通知书版式、校园建筑剪影和抽象纹样。',
  '如果没有清晰校徽依据，只保留校名、通知书版式、边框、印章感、校园建筑/纹样等非校徽元素。',
  '画面为竖版 3:4，正面平铺，无透视，无手持，无背景场景。',
  '风格是干净的拼豆像素稿：边缘清晰，大色块优先，最多 6 种主色，适合 42 x 56 或 60 x 80 拼豆底板。',
  '不要生成真实录取资格、二维码、编号、公章细节或可冒充官方文件的信息。'
].join('\n')

exports.main = async (event) => {
  const { schoolName, referenceFileID } = event

  if (!schoolName || !schoolName.trim()) {
    return { ok: false, message: '缺少院校名' }
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      ok: false,
      message: '云函数未配置 OPENAI_API_KEY，无法调用 AI 图像模型'
    }
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  let result
  if (referenceFileID) {
    const reference = await cloud.downloadFile({
      fileID: referenceFileID
    })
    const referenceFile = await toFile(reference.fileContent, 'school-reference.png', {
      type: 'image/png'
    })

    result = await client.images.edit({
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      image: referenceFile,
      prompt: buildPrompt(schoolName.trim(), true),
      size: '1024x1536'
    })
  } else {
    result = await client.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      prompt: buildPrompt(schoolName.trim(), false),
      size: '1024x1536'
    })
  }

  const b64 = result.data && result.data[0] && result.data[0].b64_json
  if (!b64) {
    return { ok: false, message: 'AI 未返回图片数据' }
  }

  const upload = await cloud.uploadFile({
    cloudPath: `ai-output/${Date.now()}-${Math.random().toString(16).slice(2)}.png`,
    fileContent: Buffer.from(b64, 'base64')
  })

  return {
    ok: true,
    imageFileID: upload.fileID,
    message: referenceFileID ? 'AI 参考图已生成' : 'AI 无校徽版参考图已生成'
  }
}
