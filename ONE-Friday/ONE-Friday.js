// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: hospital-symbol;
/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
 *******************************************************
 ************ © 2021 Copyright Nicolas-kings ************/
/********************************************************
 * script     : ONE-Friday.js
 * version    : 1.1
 * author     : Nicolas-kings
 * date       : 2020-11-14
 * github     : https://github.com/Nicolasking007/Scriptable
 * Changelog  : v1.1 - 优化背景图片缓存处理
                v1.0 - 首次发布
----------------------------------------------- */
//##############公共参数配置模块############## 
const filename = `${Script.name()}.jpg`
const files = FileManager.local()
const path = files.joinPath(files.documentsDirectory(), filename)
const changePicBg = true //选择true时，使用透明背景 
const ImageMode = false //选择true时，使用必应壁纸
const previewSize = "small" // 预览大小 medium、small、large
const colorMode = false // 是否是纯色背景
const bgColor = new Color("000000") // 小组件背景色
const padding = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0
}
const widget = await createWidget()

//#####################背景模块-START#####################

if (!colorMode && !ImageMode && !config.runsInWidget && changePicBg) {
  const okTips = "您的小部件背景已准备就绪"
  let message = "图片模式支持相册照片&背景透明"
  let options = ["图片选择", "透明背景"]
  let isTransparentMode = await generateAlert(message, options)
  if (!isTransparentMode) {
    let img = await Photos.fromLibrary()
    message = okTips
    const resultOptions = ["好的"]
    await generateAlert(message, resultOptions)
    files.writeImage(path, img)
  } else {
    message = "以下是【透明背景】生成步骤，如果你没有屏幕截图请退出，并返回主屏幕长按进入编辑模式。滑动到最右边的空白页截图。然后重新运行！"
    let exitOptions = ["继续(已有截图)", "退出(没有截图)"]

    let shouldExit = await generateAlert(message, exitOptions)
    if (shouldExit) return

    // Get screenshot and determine phone size.
    let img = await Photos.fromLibrary()
    let height = img.size.height
    let phone = phoneSizes()[height]
    if (!phone) {
      message = "您似乎选择了非iPhone屏幕截图的图像，或者不支持您的iPhone。请使用其他图像再试一次!"
      await generateAlert(message, ["好的！我现在去截图"])
      return
    }

    // Prompt for widget size and position.
    message = "您想要创建什么尺寸的小部件？"
    let sizes = ["小号", "中号", "大号"]
    let size = await generateAlert(message, sizes)
    let widgetSize = sizes[size]

    message = "您想它在什么位置？"
    message += (height == 1136 ? " (请注意，您的设备仅支持两行小部件，因此中间和底部选项相同。)" : "")

    // Determine image crop based on phone size.
    let crop = {
      w: "",
      h: "",
      x: "",
      y: ""
    }
    if (widgetSize == "小号") {
      crop.w = phone.小号
      crop.h = phone.小号
      let positions = ["顶部 左边", "顶部 右边", "中间 左边", "中间 右边", "底部 左边", "底部 右边"]
      let position = await generateAlert(message, positions)

      // Convert the two words into two keys for the phone size dictionary.
      let keys = positions[position].split(' ')
      crop.y = phone[keys[0]]
      crop.x = phone[keys[1]]

    } else if (widgetSize == "中号") {
      crop.w = phone.中号
      crop.h = phone.小号

      // 中号 and 大号 widgets have a fixed x-value.
      crop.x = phone.左边
      let positions = ["顶部", "中间", "底部"]
      let position = await generateAlert(message, positions)
      let key = positions[position].toLowerCase()
      crop.y = phone[key]

    } else if (widgetSize == "大号") {
      crop.w = phone.中号
      crop.h = phone.大号
      crop.x = phone.左边
      let positions = ["顶部", "底部"]
      let position = await generateAlert(message, positions)

      // 大号 widgets at the 底部 have the "中间" y-value.
      crop.y = position ? phone.中间 : phone.顶部
    }

    // Crop image and finalize the widget.
    let imgCrop = cropImage(img, new Rect(crop.x, crop.y, crop.w, crop.h))

    message = "您的小部件背景已准备就绪，退出到桌面预览。"
    const resultOptions = ["好的"]
    await generateAlert(message, resultOptions)
    files.writeImage(path, imgCrop)
  }

}


//#####################背景模块-设置小组件的背景#####################

if (colorMode) {
  widget.backgroundColor = bgColor
} else if (ImageMode) {

  const img = await getImageByUrl('https://api.dujin.org/bing/1366.php', `ONE-Friday-bg`, false)
  widget.backgroundImage = await shadowImage(img)
} else {
  widget.backgroundImage = files.readImage(path)
}
// 设置边距(上，左，下，右)
widget.setPadding(padding.top, padding.left, padding.bottom, padding.right)
// 设置组件
Script.setWidget(widget)
// 完成脚本
Script.complete()
// 预览
if (previewSize == "large") {
  widget.presentLarge()
} else if (previewSize == "medium") {
  widget.presentMedium()
} else {
  widget.presentSmall()
}

//#####################内容模块-创建小组件内容#####################

async function createWidget() {
  const widget = new ListWidget()

  function isFriday() {
    let day = new Date().getDay()
    if (day === 5) {
      return true
    } else {
      return false
    }
  }
  const q = "今天是周五吗？"

  let question = widget.addText(q)
  question.font = Font.boldSystemFont(18)

  if (isFriday()) {
    let answer = widget.addText('是😏')
    answer.font = Font.boldSystemFont(60)
    answer.textColor = new Color("#F79709")
  } else {
    let answer = widget.addText('不是😶')
    answer.font = Font.boldSystemFont(40)
  }
  return widget
}

//#####################背景模块-逻辑处理部分#####################

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


async function generateAlert(message, options) {
  let alert = new Alert()
  alert.message = message

  for (const option of options) {
    alert.addAction(option)
  }

  let response = await alert.presentAlert()
  return response
}

// Crop an image into the specified rect.
function cropImage(img, rect) {
  let draw = new DrawContext()
  draw.size = new Size(rect.width, rect.height)
  draw.drawImageAtPoint(img, new Point(-rect.x, -rect.y))
  return draw.getImage()
}

async function getImageByUrl(url, cacheKey, useCache = true) {
  const cacheFile = FileManager.local().joinPath(FileManager.local().temporaryDirectory(), cacheKey)
  const exists = FileManager.local().fileExists(cacheFile)
  // 判断是否有缓存
  if (useCache && exists) {
    return Image.fromFile(cacheFile)
  }
  try {
    const req = new Request(url)
    const img = await req.loadImage()
    // 存储到缓存
    FileManager.local().writeImage(cacheFile, img)
    return img
  } catch (e) {
    console.error(`图片加载失败：${e}`)
    if (exists) {
      return Image.fromFile(cacheFile)
    }
    // 没有缓存+失败情况下，返回黑色背景
    let ctx = new DrawContext()
    ctx.size = new Size(100, 100)
    ctx.setFillColor(Color.black())
    ctx.fillRect(new Rect(0, 0, 100, 100))
    return await ctx.getImage()
  }
}


// Pixel sizes and positions for widgets on all supported phones.
function phoneSizes() {
  let phones = {
    "2796": {
      "models": ["14 Pro Max"],
      "小号": 510,
      "中号": 1092,
      "大号": 1146,
      "左边": 99,
      "右边": 681,
      "顶部": 282,
      "中间": 918,
      "底部": 1554,
    },

    "2556": {
      "models": ["14 Pro"],
      "小号": 474,
      "中号": 1014,
      "大号": 1062,
      "左边": 82,
      "右边": 622,
      "顶部": 270,
      "中间": 858,
      "底部": 1446,
    },
    "2532": {
      "models": ["12", "12 Pro", "13", "13 Pro", "14"],
      "小号": 474,
      "中号": 1014,
      "大号": 1062,
      "左边": 78,
      "右边": 618,
      "顶部": 231,
      "中间": 819,
      "底部": 1407,
    },

    "2778": {
      "models": ["12 Pro Max", "13 Pro Max"],
      "小号": 510,
      "中号": 1092,
      "大号": 1146,
      "左边": 96,
      "右边": 678,
      "顶部": 246,
      "中间": 882,
      "底部": 1518,
    },

    "2688": {
      "models": ["Xs Max", "11 Pro Max"],
      "小号": 507,
      "中号": 1080,
      "大号": 1137,
      "左边": 81,
      "右边": 654,
      "顶部": 228,
      "中间": 858,
      "底部": 1488
    },

    "1792": {
      "models": ["11", "Xr"],
      "小号": 338,
      "中号": 720,
      "大号": 758,
      "左边": 54,
      "右边": 436,
      "顶部": 160,
      "中间": 580,
      "底部": 1000
    },

    "2436": {
      x: {
        "models": ["X", "Xs", "11 Pro"],
        "小号": 465,
        "中号": 987,
        "大号": 1035,
        "左边": 69,
        "右边": 591,
        "顶部": 213,
        "中间": 783,
        "底部": 1353
      },

      mini: {
        "models": ["12 mini","13 mini"],
        "小号": 465,
        "中号": 987,
        "大号": 1035,
        "左边": 69,
        "右边": 591,
        "顶部": 231,
        "中间": 801,
        "底部": 1371
      }
    },

    "2208": {
      "models": ["6+", "6s+", "7+", "8+"],
      "小号": 471,
      "中号": 1044,
      "大号": 1071,
      "左边": 99,
      "右边": 672,
      "顶部": 114,
      "中间": 696,
      "底部": 1278
    },

    "1334": {
      "models": ["6", "6s", "7", "8", "SE2"],
      "小号": 296,
      "中号": 642,
      "大号": 648,
      "左边": 54,
      "右边": 400,
      "顶部": 60,
      "中间": 412,
      "底部": 764
    },

    "1136": {
      "models": ["5", "5s", "5c", "SE"],
      "小号": 282,
      "中号": 584,
      "大号": 622,
      "左边": 30,
      "右边": 332,
      "顶部": 59,
      "中间": 399,
      "底部": 399
    }
  }
  return phones
}


/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
 *******************************************************
 ************ © 2021 Copyright Nicolas-kings ************/