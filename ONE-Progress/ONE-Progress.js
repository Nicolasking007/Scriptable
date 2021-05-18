// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: stopwatch;

/********************************************************
 * script     : ONE-Progress.js
 * version    : 1.2
 * author     : Nicolas-kings
 * date       : 2021-03-06
 * github     : https://github.com/Nicolasking007/Scriptable
 * desc       : 具体配置，详见微信公众号-曰(读yue)坛
 * color      : #FFA400, #FF7500, #0AA344, #4B5CC4, #B25D25
 * Changelog  :  v1.2 - 优化背景图片缓存处理
 *               v1.1 - 支持版本更新、脚本远程下载
 *               v1.0 - 首次发布
----------------------------------------------- */
/************************************************************
 ********************用户设置 *********************
 ************请在首次运行之前进行修改************
 ***********************************************************/

const filename = `${Script.name()}.jpg`
const files = FileManager.local()
const path = files.joinPath(files.documentsDirectory(), filename)
const changePicBg = true  //选择true时，使用透明背景 
const ImageMode = false  //选择true时，使用必应壁纸
const previewSize = "Medium"  //预览大小
const colorMode = false // 是否是纯色背景
const life_expectancy = 77.3  //采用2020年中国人均预期寿命77.3岁

/************************************************************
 ********************用户设置 *********************
 ************请在首次运行之前进行修改************
 ***********************************************************/
////////////////////////
const LIFE_BIRTHDAY = '1995-09-30'; //在这里输入您的出生年月  
////////////////////////
const FONT_SIZE = 16;
const LINE_HEIGHT = 16;
const LABEL_WIDTH = 100;
const SPACER_SIZE = 10;
const BAR_WIDTH = 180;
const BAR_HEIGHT = 12;
const COLOR_LIGHT_GRAY = new Color('#E5E7EB', 1);
const COLOR_DARK_GRAY = new Color('#374151', 1);
const COLOR_BAR_BACKGROUND = Color.dynamic(COLOR_LIGHT_GRAY, COLOR_DARK_GRAY);


const versionData = await getversion()
let needUpdated = await updateCheck(1.2)
//渐变色  #3B82F6,#10B981,#FBBF24,#EF4444
const DEFAULT_Color = new LinearGradient()
DEFAULT_Color.colors = [new Color('#3B82F6'), new Color('#FBBF24'), new Color('#10B981'),]
DEFAULT_Color.locations = [0.0, 0.5, 1.0]
const COLOR_BAR_DEFAULT = DEFAULT_Color

// Process parameters
const params = (args.widgetParameter + '').split('|');

// Parameter: Colors
let colors = [];
if (params[0] !== '' && params[0] !== 'null') {
  colors = params[0].split(',').map(color => color.trim());
  colors = colors.map(color => new Color(color, 1));
} else {
  colors.push(COLOR_BAR_DEFAULT);
}
function getColors(index) {
  return colors[index % colors.length];
}

// Parameter: The week starts on Sunday
let isWeekStartsOnSunday = false;
if (params.length > 2 && params[2].toLowerCase() === 'true') {
  isWeekStartsOnSunday = true;
}

// Parameter: Labels
const now = new Date();
const labels = ['今天', '本周', '本月', '今年', '一生'];
const calcWeekOfYear = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfFirstDay = firstDayOfYear.getDay();
  const firstWeekStart = new Date(date.getFullYear(), 0, firstDayOfYear.getDay() > 3 ? 8 - dayOfFirstDay : 1 - dayOfFirstDay);
  const dateValue = isWeekStartsOnSunday ? date.valueOf() : date.valueOf() - 86400000;
  const weekNum = Math.floor((dateValue - firstWeekStart.valueOf()) / 86400000 / 7) + 1;
  return weekNum;
};
const labelsTemplate = {
  dayOfMonth: date => {
    return date.getDate();
  },
  dayOfMonthWithZero: date => {
    const dayNum = date.getDate();
    return dayNum < 10 ? '0' + dayNum : dayNum;
  },
  dayCn: date => {
    return ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'][date.getDay()];
  },
  dayEn: date => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  },
  weekOfYear: date => {
    let weekNum = calcWeekOfYear(date);
    if (weekNum === 0) {
      weekNum = calcWeekOfYear(new Date(date.getFullYear(), 0, 0));
    }
    return weekNum;
  },
  weekOfYearWithZero: date => {
    let weekNum = calcWeekOfYear(date);
    if (weekNum === 0) {
      weekNum = calcWeekOfYear(new Date(date.getFullYear(), 0, 0));
    }
    return weekNum < 10 ? '0' + weekNum : weekNum;
  },
  monthNum: date => {
    return date.getMonth() + 1;
  },
  monthNumWithZero: date => {
    const monthNum = date.getMonth() + 1;
    return monthNum < 10 ? '0' + monthNum : monthNum;
  },
  monthEn: date => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
  },
  monthCn: date => {
    return ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'][date.getMonth()];
  },
  year: date => {
    return date.getFullYear();
  },
};
if (params.length > 1 && params[1] !== '') {
  const paramLabels = params[1].split(',').map(label => label.trim());
  const templateRegExp = /(\${[^{}]+})/;
  for (let i = 0; i < paramLabels.length; i++) {
    while (paramLabels[i].match(templateRegExp)) {
      const template = paramLabels[i].match(templateRegExp)[0];
      const templateKey = template.replace('${', '').replace('}', '');
      const templateValue = labelsTemplate[templateKey](now);
      paramLabels[i] = paramLabels[i].replace(template, templateValue);
    }
    labels[i] = paramLabels[i];
  }
}

// Calculate date progress
function calcProgress(start, end, progress) {
  return (progress - start) / (end - start);
}

function getAge(LIFE_BIRTHDAY) {
  //LIFE_BIRTHDAY必须为"1995/6/15"这种字符串格式，不可为"2020-6-15"，这种格式在Safari中会报错
  const birthDate = new Date(LIFE_BIRTHDAY);
  const momentDate = new Date();
  momentDate.setHours(0, 0, 0, 0); //因为new Date()出来的时间是当前的时分秒。我们需要把时分秒重置为0。使后面时间比较更精确
  const thisYearBirthDate = new Date(
    momentDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );
  const aDate = thisYearBirthDate - birthDate;
  const bDate = momentDate - birthDate;
  let tempAge = momentDate.getFullYear() - birthDate.getFullYear();
  let age = null;
  if (bDate < aDate) {
    tempAge = tempAge - 1;
    age = tempAge < 0 ? 0 : tempAge;
  } else {
    age = tempAge;
  }
  return age;

}


// LIFE_BIRTHDAY = nesdate.parse(LIFE_BIRTHDAY.replace('/-/g', "/"));
// if (LIFE_BIRTHDAY) {
//   var year = 1000 * 60 * 60 * 24 * 365;
//   var birthday = new date(LIFE_BIRTHDAY);
//   var age = parseint((now - birthday) / year);
// }


const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
const dayProgress = calcProgress(dayStart, dayEnd, now);

let weekDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
if (isWeekStartsOnSunday) {
  weekDay = now.getDay();
}
const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weekDay);
const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);
const weekProgress = calcProgress(weekStart, weekEnd, now);

const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const monthProgress = calcProgress(monthStart, monthEnd, now);

const yearStart = new Date(now.getFullYear(), 0, 1);
const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
const yearProgress = calcProgress(yearStart, yearEnd, now);

let age = getAge(LIFE_BIRTHDAY);
log(age)
const lifeStart = age
const lifeEnd = life_expectancy
const lifeProgress = Math.floor(lifeStart / lifeEnd * 1000) / 1000;
// Create Widget
const font = Font.systemFont(FONT_SIZE);
const padding = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0
}

let widget = await createWidget()

/*
****************************************************************************
* 这里是图片逻辑，不用修改
****************************************************************************
*/
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
    let crop = { w: "", h: "", x: "", y: "" }
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


//////////////////////////////////////
// 组件End
// 设置小组件的背景
if (colorMode) {
  widget.backgroundColor = COLOR_BAR_BACKGROUND
} else if (ImageMode) {
  // const url = "https://area.sinaapp.com/bingImg/"   //使用必应壁纸作为背景时，请注释下面
  // const url = "http://p1.music.126.net/uarVFKgUlrI9Z1nr-50cAw==/109951162843608471.jpg"     //固定一张图片,这里我选用城南花已开的封面,图片不能太大，容易崩溃
  // const i = await new Request(url);
  const img = await getImageByUrl('https://area.sinaapp.com/bingImg/', `ONE-Progress-bg`)
  widget.backgroundImage = await shadowImage(img)
}
else {
  widget.backgroundImage = files.readImage(path)
}
// 设置边距(上，左，下，右)
widget.setPadding(padding.top, padding.left, padding.bottom, padding.right)
// 设置组件
Script.setWidget(widget)
// 完成脚本
Script.complete()
// 预览
if (previewSize == "Large") {
  widget.presentLarge()
} else if (previewSize == "Medium") {
  widget.presentMedium()
} else {
  widget.presentSmall()
}
async function createWidget() {
  const widget = new ListWidget();

  widget.spacing = SPACER_SIZE;

  function addProgress(name, progress, color) {
    const percent = (progress * 100).toFixed(1); // 1/2 保留两位小数

    const line = widget.addStack();
    line.centerAlignContent();

    const label = line.addStack();
    label.size = new Size(LABEL_WIDTH, LINE_HEIGHT);
    label.centerAlignContent();

    const labelName = label.addText(name);
    labelName.font = font



    label.addSpacer();

    const labelPercent = label.addText(percent + '%');
    labelPercent.font = new Font('Menlo', FONT_SIZE);
    labelPercent.font = Font.boldRoundedSystemFont(FONT_SIZE)
    labelPercent.textOpacity = 0.6
    line.addSpacer(SPACER_SIZE);

    const barBackground = line.addStack();
    barBackground.size = new Size(BAR_WIDTH, BAR_HEIGHT);
    barBackground.backgroundColor = COLOR_BAR_BACKGROUND;
    barBackground.cornerRadius = BAR_HEIGHT / 2;
    barBackground.topAlignContent();
    barBackground.layoutVertically();

    const barProgressWidth = BAR_WIDTH * progress;
    const barProgress = barBackground.addStack();
    barProgress.size = new Size(barProgressWidth, BAR_HEIGHT);
    if (params[0] !== '' && params[0] !== 'null') {
      barProgress.backgroundColor = color;
    } else {
      barProgress.backgroundGradient = DEFAULT_Color;
    }

    barProgress.cornerRadius = BAR_HEIGHT / 2;
  }


  if (previewSize === "Small" || config.widgetFamily === "small") {
    //   const widget = new ListWidget();
    const error = widget.addText("\u62b1\u6b49\uff0c\u8be5\u5c3a\u5bf8\u5c0f\u7ec4\u4ef6\u4f5c\u8005\u6682\u672a\u9002\u914d")
    error.font = Font.blackMonospacedSystemFont(12)
    error.textColor = Color.white()
    error.centerAlignText()

    widget.backgroundColor = COLOR_BAR_BACKGROUND

  } else if (previewSize == "Large" || config.widgetFamily == "large") {
    //   const widget = new ListWidget();
    const error = widget.addText("\u62b1\u6b49\uff0c\u8be5\u5c3a\u5bf8\u5c0f\u7ec4\u4ef6\u4f5c\u8005\u6682\u672a\u9002\u914d")
    error.font = Font.blackMonospacedSystemFont(16)
    error.centerAlignText()
    const error2 = widget.addText("\u5982\u60a8\u8feb\u5207\u9700\u8981\u9002\u914d\u8be5\u5c3a\u5bf8\uff0c\u8bf7\u5c1d\u8bd5\u5728\u4f5c\u8005\u516c\u4f17\u53f7\u7559\u8a00\u53cd\u9988.")
    error2.font = Font.systemFont(10)
    error2.centerAlignText()
    //   error2.textColor = Color.gray()
    const error3 = widget.addText("\u6211\u5728\u66f0\u575b\u7b49\u4f60😎")
    error3.font = Font.systemFont(10)
    error3.textOpacity = 0.8
    error3.centerAlignText()
    widget.url = 'https://mp.weixin.qq.com/mp/homepage?__biz=MzU3MTcyMDM1NA==&hid=1&sn=95931d7607893e42afc85ede24ba9fe5&scene=18'
    widget.backgroundColor = COLOR_BAR_BACKGROUND

  } else {

    addProgress(labels[0], dayProgress, getColors(0));
    addProgress(labels[1], weekProgress, getColors(1));
    addProgress(labels[2], monthProgress, getColors(2));
    addProgress(labels[3], yearProgress, getColors(3));
    addProgress(labels[4], lifeProgress, getColors(4));
  }


  return widget
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

async function loadImage(imgUrl) {
  let req = new Request(imgUrl)
  let image = await req.loadImage()
  return image
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
    "2340": { // 12mini
      "小号": 436,
      "中号": 936,
      "大号": 980,
      "左边": 72,
      "右边": 570,
      "顶部": 212,
      "中间": 756,
      "底部": 1300,
    },

    "2532": { // 12/12 Pro
      "小号": 472,
      "中号": 1012,
      "大号": 1058,
      "左边": 78,
      "右边": 618,
      "顶部": 230,
      "中间": 818,
      "底部": 1408,
    },

    "2778": { // 12 Pro Max
      "小号": 518,
      "中号": 1114,
      "大号": 1162,
      "左边": 86,
      "右边": 678,
      "顶部": 252,
      "中间": 898,
      "底部": 1544,
    },

    "2688": {
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
      "小号": 465,
      "中号": 987,
      "大号": 1035,
      "左边": 69,
      "右边": 591,
      "顶部": 213,
      "中间": 783,
      "底部": 1353
    },

    "2208": {
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

async function getversion() {
  const versionCachePath = files.joinPath(files.documentsDirectory(), "version-NK")
  var versionData
  try {
    versionData = await new Request("https://cdn.jsdelivr.net/gh/Nicolasking007/CDN@latest/Scriptable/UPDATE.json").loadJSON()
    files.writeString(versionCachePath, JSON.stringify(versionData))
    log("[+]版本信息获取成功")
  } catch (e) {
    versionData = JSON.parse(files.readString(versionCachePath))
    log("[+]获取版本信息失败，使用缓存数据")
  }

  return versionData
}


async function updateCheck(version) {

  const uC = versionData
  log('[+]' + uC['ONE-Progress'].version)
  let needUpdate = false
  if (uC['ONE-Progress'].version != version) {
    needUpdate = true
    log("[+]检测到有新版本！")
    if (!config.runsInWidget) {
      log("[+]执行更新步骤")
      let upd = new Alert()
      upd.title = "检测到有新版本！"
      upd.addDestructiveAction("暂不更新")
      upd.addAction("立即更新")
      upd.add
      upd.message = uC['ONE-Progress'].notes
      if (await upd.present() == 1) {
        const req = new Request(uC['ONE-Progress'].cdn_scriptURL)
        const codeString = await req.loadString()
        files.writeString(module.filename, codeString)
        const n = new Notification()
        n.title = "下载更新成功"
        n.body = "请点击左上角Done完成，重新进入脚本即可~"
        n.schedule()

      }
      Script.complete()
    }

  } else {
    log("[+]当前版本已是最新")
  }

  return needUpdate
}