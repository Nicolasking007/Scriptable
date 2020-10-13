// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;
// author:Nicolas-kings
// ver:0.1.2
const res = await getData();
const files = FileManager.local()
const imageBackground = false  //对于自定义图片背景，设置为true；默认设置为false.
const widgetPreview = "medium"
const forceImageUpdate = true  
//const url = "https://area.sinaapp.com/bingImg/"   //使用必应壁纸作为背景时，请注释下面
//const url = res.data.picurl   //使用歌曲封面作为背景，，请注释上面
const url = "http://p1.music.126.net/uarVFKgUlrI9Z1nr-50cAw==/109951162843608471.jpg"     //固定一张图片,这里我选用城南花已开的封面,图片不能太大，容易崩溃
const i = await new Request(url);
const img = await i.loadImage();
// 如果不是在组件执行，则显示预览
// if (!config.runsInWidget) {
//   await widget.presentMedium()
// }
// 设置桌面组件
let widget = await createWidget(res)
if (imageBackground) {

  const path = files.joinPath(files.documentsDirectory(), "hot-comments-image")
  const exists = files.fileExists(path)

  // 如果存在并且不强制进行更新，将使用缓存。
  if (exists && (config.runsInWidget || !forceImageUpdate)) {
    widget.backgroundImage = files.readImage(path)

    // 如果在小部件中运行时缺少它，请使用灰色背景。
  } else if (!exists && config.runsInWidget) {

    widget.backgroundColor = Color.gray()
    // 但是，如果我们在应用程序中运行，则提示用户输入图像。
  } else {
    const img = await Photos.fromLibrary()
    widget.backgroundImage = img
    files.writeImage(path, img)
  }

}
else {
  widget.backgroundImage = await shadowImage(img)
}

Script.setWidget(widget)
if (widgetPreview == "small") { widget.presentSmall() }
else if (widgetPreview == "medium") { widget.presentMedium() }
else if (widgetPreview == "large") { widget.presentLarge() }

Script.complete()

// 创建组件
async function createWidget() {
  let w = new ListWidget()
  w.backgroundColor = new Color("#222222", 1)

  //  标题
  let title = w.addText("\u7f51\u6613\u4e91\u70ed\u8bc4")
  title.font = Font.boldMonospacedSystemFont(20)
  title.textColor = Color.white()
  title.url = "orpheuswidget://"
  w.addSpacer(12)

  //  内容
  let body = w.addText(`❝${res.data.content}❞ `)
  body.font = Font.lightMonospacedSystemFont(18)
  body.textColor = Color.white()
  body.textOpacity = 0.88
  // body.url = res.music_url     //跳转直链播放
  body.url = `orpheus://song/${res.data.url.split('?')[1].split('=')[1].split('.')[0]}`     //默认跳转网易云音乐进行播放
  w.addSpacer(8)

  let foot = w.addText(`—— 评论来自歌曲「${res.data.name}」`);
  foot.font = Font.lightMonospacedSystemFont(12)
  foot.textColor = Color.orange();
  foot.textOpacity = 0.88;
  foot.rightAlignText();

  return w
}

async function getData() {
  const url = 'https://api.uomg.com/api/comments.163'
  const request = new Request(url)
  const res = await request.loadJSON()
  console.log(res)
  return res

}

async function shadowImage(img) {
  let ctx = new DrawContext()
  // 把画布的尺寸设置成图片的尺寸
  ctx.size = img.size
  // 把图片绘制到画布中
  ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
  // 设置绘制的图层颜色，为半透明的黑色
  ctx.setFillColor(new Color('#000000', 0.5))
  // 绘制图层
  ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))

  // 导出最终图片
  return await ctx.getImage()
}