const cloud = require('wx-server-sdk')
const { buildPdfString } = require('./pdfBuilder')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event) => {
  const title = String(event.title || '拼豆图纸').slice(0, 80)
  const pdfBuffer = Buffer.from(buildPdfString(Object.assign({}, event, { title })), 'binary')
  const upload = await cloud.uploadFile({
    cloudPath: `pattern-pdf/${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`,
    fileContent: pdfBuffer
  })

  return {
    ok: true,
    fileID: upload.fileID,
    size: pdfBuffer.length,
    pages: 8,
    message: '完整制作包 PDF 已生成'
  }
}
