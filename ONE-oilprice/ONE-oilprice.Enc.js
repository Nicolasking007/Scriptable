// @ts-nocheck
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: code;
/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
 *******************************************************
 ************ © 2023 Copyright Nicolas-kings ************/
/********************************************************
 * script     : ONE-oilprice.js
 * version    : 2.1.1
 * author     : Nicolas-kings
 * date       : 2021-03-31
 * desc       : 具体配置说明，详见微信公众号-曰(读yue)坛
 * github     : https://github.com/Nicolasking007/Scriptable
 * Changelog  : v2.1.1 - 适配上游接口
 *              v2.1 - 适配中石化接口字段调整
 *              v2.0 - 新增油价数据源，默认采用中石化数据，调整展示的油价类型
 *              v1.9 - 新增自定义配置项、UI细节调整
 *              v1.8 - 修复背景报错，新增多个图片背景选项
                v1.7 - 压缩代码，便于复制
                v1.6 - 优化背景逻辑
                v1.5 - 细节优化、字体调整
                v1.4 - 部分UI细节调整
                v1.3 - 优化背景图片缓存处理
                v1.2 - 支持版本更新、脚本远程下载
                v1.1 - api接口数据增加缓存，应对无网络情况下也能使用小组件
                v1.0 - 首次发布
----------------------------------------------- */
//##############公共参数配置模块############## 
// 选择true时，使用透明背景
const changePicBg = false
// 选择true时，使用必应壁纸  
const ImageMode = false
// 预览大小  small/medium/large
const previewSize = (config.runsInWidget ? config.widgetFamily : "medium");
// 是否使用纯色背景
const colorMode = false
// 小组件背景色
const bgColor = new Color('#223A70', 1)
// 高斯样式：light/dark
const blurStyle = "dark"
// 模糊程度 参数范围 1~150
const blursize = 100
// 1：图片加蒙板 2：unsplash壁纸  3：Bing 壁纸
const Imgstyle = 1
// 仅当选项为Unsplash有效 即Imgstyle = 2
const IMAGE_SEARCH_TERMS = "nature,wather"
// 切换油价数据源  默认中石化方式二 可多选
const Switch_data = true   
// 底部格言
const greeting = '我命油我，不油天'   
//##############天行数据api方式一 |  获取今日油价##############
// 输入要查询的省份 
const prov = '广东'  
// 前往天行数据申请apikey https://www.tianapi.com/apiview/104
const api_key = ''
//##############中石化方式二 | 获取今日油价##############
// 省份数据，可前往公众号获取具体参数配置
const provinceId = '44'   
//上下左右间距
const padding = {
  top: 5,
  left: 10,
  bottom: 5,
  right: 15
}

function colorConfig() {
  // 标题
  const tintLogo = true; // 对logo着色
  const tintColor = new Color('#FC6D26');

  // dark mode
  const darkBackgroud = new Color('#1A1B1E');
  const darkText = new Color('#FFFFFF');

  // light mode
  const lightBackgroud = new Color('#1A1B1E');
  const lightText = new Color('#FFFFFF');
  // 小尺寸 标题字体/大小
  const Stitlefont = Font.boldSystemFont(12);
  // 小尺寸 标题字体颜色
  const Stitlefontcolor = Color.white();
  // 小尺寸 油价字体/大小
  const Swnamefont = new Font("Chalkduster", 20);
  // 中尺寸 标题字体/大小
  const Mtitlefont = Font.boldSystemFont(16);
  // 中尺寸 标题字体颜色
  const Mtitlefontcolor = Color.white();
  // 中尺寸 油价字体/大小
  const Mwnamefont = new Font("Chalkduster", 20);
  // 中尺寸 底部格言字体/大小
  const lastRanTextfont = Font.boldRoundedSystemFont(10);
  // 中尺寸 底部格言字体颜色
  const lastRanTextfontcolor = Color.white();
  // 中尺寸 底部格言文字行数
  const lastRanTextsize = 1 ;
  return {
    bgColor: Color.dynamic(lightBackgroud, darkBackgroud),
    textColor: Color.dynamic(lightText, darkText),
    titlecolor: Color.dynamic(lightText, darkText),
    tintColor: tintColor,
    tintLogo: tintLogo,
    Stitlefont: Stitlefont,
    Stitlefontcolor: Stitlefontcolor,
    Swnamefont: Swnamefont,
    Mtitlefont: Mtitlefont,
    Mtitlefontcolor: Mtitlefontcolor,
    Mwnamefont: Mwnamefont,
    lastRanTextfont:lastRanTextfont,
    lastRanTextfontcolor:lastRanTextfontcolor,
    lastRanTextsize:lastRanTextsize

  };
}

//⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈⇈
//##############用户自定义参数配置模块-结束##############
const filename = `${Script.name()}.jpg`
const files = FileManager.local()
const localversion = '2.1.1'
const path = files.joinPath(files.documentsDirectory(), filename)
const versionData = await getversion()
const needUpdated = await updateCheck(localversion)
const data = await fetchData()
const widget = await createWidget()

//#####################背景模块-START#####################

if (!colorMode && !ImageMode && !config.runsInWidget && changePicBg) {
  const okTips = "您的小部件背景已准备就绪"
  let message = "开始之前，请回到主屏幕并进入编辑模式。 滑到最右边的空白页并截图。"
  let options = ["图片选择", "透明背景", "配置文档", "取消"]
  let response = await generateAlert(message, options)
  if (response == 3) return
  if (response == 0) {
    let img = await Photos.fromLibrary()
    message = okTips
    const resultOptions = ["好的"]
    await generateAlert(message, resultOptions)
    files.writeImage(path, img)
  }
  if (response == 2) {
    Safari.openInApp(versionData['ONE-oilprice'].wxurl, false);
  }
  if (response == 1) {
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
    if (height == 2436) {
      let files = FileManager.local()
      let cacheName = "nk-phone-type"
      let cachePath = files.joinPath(files.libraryDirectory(), cacheName)
      if (files.fileExists(cachePath)) {
        let typeString = files.readString(cachePath)
        phone = phone[typeString]
      } else {
        message = "你使用什么型号的iPhone？"
        let types = ["iPhone 12 mini", "iPhone 11 Pro, XS, or X"]
        let typeIndex = await generateAlert(message, types)
        let type = (typeIndex == 0) ? "mini" : "x"
        phone = phone[type]
        files.writeString(cachePath, type)
      }
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
    const resultOptions = ["导出到相册", "预览组件"]
    const exportToFiles = await generateAlert(message, resultOptions)
    if (exportToFiles) {
      files.writeImage(path, imgCrop)
    } else {
      Photos.save(imgCrop)
    }
  }

}


//#####################背景模块-设置小组件的背景#####################


if (colorMode) {
  widget.backgroundColor = bgColor
} else if (ImageMode) {
  switch (Imgstyle) {
    case 1:
      const blugImgs = await getImageByUrl("https://source.unsplash.com/random/800x373?" + IMAGE_SEARCH_TERMS, `_${Script.name()}-bg`, false)
      bgImg = await blurImage(blugImgs, blurStyle, blursize)
      widget.backgroundImage = bgImg
      break;
    case 2:
      const unsplashurl = "https://source.unsplash.com/random/800x373?" + IMAGE_SEARCH_TERMS
      const orginImgs = await getImageByUrl(unsplashurl, `_${Script.name()}-orginImgs-bg`, false)
      bgImg = await shadowImage(orginImgs)
      widget.backgroundImage = bgImg
      break;
    case 3:
      const bingurl = "https://api.dujin.org/bing/1366.php"
      const bingImgs = await getImageByUrl(bingurl, `_${Script.name()}-bingImgs-bg`, false)
      bgImg = await shadowImage(bingImgs)
      widget.backgroundImage = bgImg
      break;
  }

} else {
  widget.backgroundImage = files.readImage(path)
}
// 设置边距(上，左，下，右)
widget.setPadding(padding.top, padding.left, padding.bottom, padding.right)
// 设置组件
if (!config.runsInWidget) {
  switch (previewSize) {
    case "small":
      await widget.presentSmall();
      break;
    case "medium":
      await widget.presentMedium();
      break;
    case "large":
      await widget.presentLarge();
      break;
  }
}
Script.setWidget(widget)
// 完成脚本
Script.complete()
// 预览

//#####################内容模块-创建小组件内容#####################

async function createWidget() {
  const colors = colorConfig();
  const widget = new ListWidget();


  // images
  const oilprice89IconPath = await getImage('89');
  const oilprice92IconPath = await getImage('92');
  const oilprice95IconPath = await getImage('95');
  const oilpriceLogo = await getImage('oilprice-logo');
  const oilprice98IconPath = await getImage('98');
  // const oilprice98Symbol = await getImage('98');

  // widget.backgroundColor = colors.bgColor;

  // small size
  if (previewSize == 'small') {
    // widget.setPadding(5, 5, 15, 2);
    let titleStack = widget.addStack()
    titleStack.layoutHorizontally();
    const titlelogo = titleStack.addImage(oilpriceLogo);
    titlelogo.imageSize = new Size(16, 16);
    titlelogo.leftAlignImage();
    if (colors.tintLogo) {
      titlelogo.tintColor = colors.tintColor;
    }
    titleStack.addSpacer(8);
    let topElement = titleStack.addText("今日油价 · ");
    topElement.textColor = colors.Stitlefontcolor
    topElement.font = colors.Stitlefont
    let titleElement = titleStack.addText(Switch_data ? `${data.data.provinceCheck.PROVINCE_NAME}` : `${data.newslist[0].prov}`);
    titleElement.textColor = colors.tintColor
    titleElement.font = colors.Stitlefont
    titleElement.lineLimit = 1;
    // titleElement.url = widgeturl
    titleStack.addSpacer();
    widget.addSpacer();

    const contentStack = widget.addStack();
    contentStack.layoutHorizontally();

    contentStack.addSpacer();

    let leftColumn = contentStack.addStack();
    leftColumn.layoutVertically();

    contentStack.addSpacer();

    let rightColumn = contentStack.addStack();
    rightColumn.layoutVertically();

    contentStack.addSpacer();

    // left column
    addItem(
      oilprice89IconPath,
      '',
      Switch_data ? `${data.data.provinceData.CHECHAI_0}` : `${data.newslist[0].p0}`,
      leftColumn,
      previewSize
    );
    leftColumn.addSpacer();
    addItem(oilprice92IconPath,
      '',
      Switch_data ? `${data.data.provinceData.GAS_92}` : `${data.newslist[0].p92}`,
      leftColumn,
      previewSize
    );

    // right column
    addItem(
      oilprice95IconPath,
      '',
      Switch_data ? `${data.data.provinceData.GAS_95}` : `${data.newslist[0].p95}`,
      rightColumn,
      previewSize
    );

    rightColumn.addSpacer();
    // addItem(oilprice98Symbol.image, '', `${data.newslist[0].p98}`, '', rightColumn, size);
    addItem(
      oilprice98IconPath,
      '',
      Switch_data ? `${data.data.provinceData.GAS_98}` : `${data.newslist[0].p98}`,
      // `${data.data.provinceData.GAS_98}`,
      rightColumn,
      previewSize
    );
  }
  // medium size
  else if (previewSize == 'medium') {
    // widget.setPadding(5, 5, 15, 0);
    let titleStack = widget.addStack()
    titleStack.layoutHorizontally();
    const titlelogo = titleStack.addImage(oilpriceLogo);
    titlelogo.imageSize = new Size(20, 20);
    titlelogo.leftAlignImage();
    if (colors.tintLogo) {
      titlelogo.tintColor = colors.tintColor;
    }
    titleStack.addSpacer(8);
    let topElement = titleStack.addText("今日油价 · ");
    topElement.textColor = colors.Mtitlefontcolor
    topElement.font = colors.Mtitlefont
    let titleElement = titleStack.addText(Switch_data ? `${data.data.provinceCheck.PROVINCE_NAME}` : `${data.newslist[0].prov}`);
    titleElement.textColor = colors.tintColor
    titleElement.font = colors.Mtitlefont
    titleElement.lineLimit = 1;
    // titleElement.url = widgeturl
    titleStack.addSpacer();

    const timeFormatter = new DateFormatter();
    timeFormatter.locale = "en";
    timeFormatter.useNoDateStyle();
    timeFormatter.useShortTimeStyle();
    const dateLine = titleStack.addText(`↻ ${timeFormatter.string(new Date())}`);
    dateLine.font = new Font("Chalkduster", 12);
    dateLine.textColor = Color.white();
    dateLine.textOpacity = 0.7;

    widget.addSpacer(10);

    let contentStack = widget.addStack();
    contentStack.layoutHorizontally();

    contentStack.addSpacer();

    addItem(
      oilprice89IconPath,
      '',
      Switch_data ? `${data.data.provinceData.CHECHAI_0}` : `${data.newslist[0].p0}`,
      contentStack,
      previewSize
    );

    contentStack.addSpacer(30);

    addItem(
      oilprice92IconPath,
      '',
      Switch_data ? `${data.data.provinceData.GAS_92}` : `${data.newslist[0].p92}`,
      contentStack,
      previewSize
    );

    contentStack.addSpacer(30);

    addItem(
      oilprice95IconPath,
      '',
      Switch_data ? `${data.data.provinceData.GAS_95}` : `${data.newslist[0].p95}`,
      contentStack,
      previewSize
    );

    contentStack.addSpacer(30);

    addItem(
      oilprice98IconPath,
      '',
      Switch_data ? `${data.data.provinceData.GAS_98}` : `${data.newslist[0].p98}`,
      contentStack,
      previewSize
    );

    contentStack.addSpacer(8);
    widget.addSpacer(6);
    // let date = new Date();
    // let lastRanDateAndTime = date.toLocaleString('chinese', { hour12: false })
    let lastRanText = widget.addText(`${greeting}`);
    lastRanText.textColor = colors.lastRanTextfontcolor
    lastRanText.textOpacity = .7;
    lastRanText.font = colors.lastRanTextfont //
    lastRanText.lineLimit = colors.lastRanTextsize;
    lastRanText.centerAlignText();

  } else {
    const title = widget.addText(`\u8fd9\u4e2a\u5c3a\u5bf8\u5931\u8054\u4e86`);
    title.font = Font.regularSystemFont(20)
    title.textColor = colors.textColor;
    title.centerAlignText();
  }
  return widget;
}

//#####################事务逻辑处理模块#####################

function addItem(img, description, count, stack, previewSize) {
  const colors = colorConfig();
  // small size
  if (previewSize == 'small') {
    const line = stack.addStack();
    line.layoutVertically();
    // line.url = link;

    const wimg = line.addImage(img);
    wimg.imageSize = new Size(20, 20);
    wimg.tintColor = colors.tintColor;

    line.addSpacer(3);
    const wname = line.addText(count);
    wname.font = colors.Swnamefont
    wname.textColor = colors.textColor;
  }
  // medium size
  else if (previewSize == 'medium') {
    const item = stack.addStack();
    item.layoutVertically();
    // item.url = link;

    const wimg = item.addImage(img);
    wimg.imageSize = new Size(30, 30);
    wimg.tintColor = colors.tintColor;

    const wname2 = item.addText(description);
    wname2.font = Font.thinRoundedSystemFont(13);
    wname2.textColor = colors.textColor;
    item.addSpacer(3);

    const wname = item.addText(count);
    wname.font = colors.Mwnamefont
    wname.textColor = colors.textColor;
  }
}

async function fetchData() {
  const fetchCachePath = files.joinPath(files.documentsDirectory(), "oilprice-NK")
  var fetchData
  try {
    if (Switch_data) {

      const apiurl = `https://oilprice.ecc.net.cn/data/switchProvince`
      const eccrequest = new Request(apiurl)
      const defaultHeaders = {
        "Content-Type":"application/json;charset=UTF-8",
        "Host": "oilprice.ecc.net.cn",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1"
      }
      eccrequest.method = 'POST'
      eccrequest.headers = defaultHeaders
      eccrequest.body = JSON.stringify({
        "provinceId": provinceId
      })
      fetchData = await eccrequest.loadJSON()
      files.writeString(fetchCachePath, JSON.stringify(fetchData))
      console.log(`[+]中石化：油价数据输出成功`);


    } else {

      let wakeUrl = `https://api.tianapi.com/txapi/oilprice/index?key=${api_key}&prov=${encodeURI(prov)}`
      let wakeRequest = new Request(wakeUrl)
      wakeRequest.method = 'get'
      wakeRequest.headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        "Accept": "*/*",
        'Content-Type': 'application/x-www-form-urlencoded'
      }
      fetchData = await wakeRequest.loadJSON()
      console.log(`[+]天行：油价数据输出成功`);
      files.writeString(fetchCachePath, JSON.stringify(fetchData))

    }

  } catch (e) {
    fetchData = JSON.parse(files.readString(fetchCachePath))
    log("[+]获取油价数据失败，使用缓存数据")
  }
  return fetchData
}



// // // ######获取中国石化油价数据 - document方法- 失效 #######
// async function getoilprice(provinceId) {
//   // 缓存key
//   const cacheKey = "NK-oilprice-cache"

//   let response = undefined
//   try {
//       const apiurl = `https://m.saclub.com.cn/oilPriceAction.do?provinceId=${provinceId}&from=saclub`
//       const request = new Request(apiurl)
//       const defaultHeaders = {
//         "Accept": "*/*",
//         "Accept-Encoding": "gzip, deflate, br",
//         "Accept-Language": "zh-CN,zh-Hans;q=0.9",
//         "Connection": "keep-alive",
//         "Content-Length": 0,
//         "Cookie": "Hm_lpvt_baecc77bbfcd7cda6a84aadced6933a6=1647579112; Hm_lvt_baecc77bbfcd7cda6a84aadced6933a6=1647579112; JSESSIONID=7A9957E9119339B0B692C5E985F515D8",
//         "Host": "m.saclub.com.cn",
//         "Origin": "https://m.saclub.com.cn",
//         "Referer": apiurl,
//         "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
//         "X-Requested-With": "XMLHttpRequest"
//       }
//       request.method = 'GET'
//       request.headers = defaultHeaders
//       const html = await request.loadString()
//       let webview = new WebView()
//       await webview.loadHTML(html)
//       var getData = `
//           function getData() {
//               try {

//                   timetext = document.querySelector('.top_box p').innerText
//                   provtext = document.querySelector('.right span').innerText
//                   p0 = document.querySelectorAll('.bottom_ul.bo_ul')[0].innerText
//                   p92 = document.querySelector(".bottom_ul").children[0].innerText
//                   p95 = document.querySelector(".bottom_ul").children[1].innerText
//                   p98 = document.querySelector(".bottom_ul").children[2].innerText

//               } catch {
//                 provtext = "中国"
//               }
//               return {timetext: timetext , provtext: provtext , zerooilprice: p0, p92oilprice: p92 ,p95oilprice: p95 ,p98oilprice: p98  }
//           }

//           getData()`


//       // 节日数据       
//       response = await webview.evaluateJavaScript(getData, false)
//       Keychain.set(cacheKey, JSON.stringify(response))
//       console.log(`[+]油价输出：${JSON.stringify(response)}`);
//   } catch (e) {
//       console.error(`[+]油价请求出错：${e}`)
//       if (Keychain.contains(cacheKey)) {
//           const cache = Keychain.get(cacheKey)
//           response = JSON.parse(cache)
//       }
//   }

//   return response
// }


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

async function getImage(name) {
  let data = '';
  switch (name) {
    case '89':
      data =
        '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';
      break;
    case '92':
      data =
        'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADCklEQVRYR91XzVXbQBCeGZ6FbyEFIJRLkE+BCgIVhFQQqABcQUwFgQpiV4CpIKYCfLPJBSEaEDeQX3bydvXj0SLrxxzyXvZk7+6Mvp2/bwbBWnO3cwGAp/a++B8xc7/3uBiW3Zl53QNU6ldTeZQXZ64zQIDvFcL50SbF7z8EEMm79x5svSjnHgC26nRk8jmAubt5xoRTVGoMAO+qFDDAOTAHthVSAEETeQSM/PDlwgC423aOGOEKmCcMMEKi45UAWE2ZYYqIPzWQXhgP5F2ji/CsSh6AAgD+wcwnBsB8Z3MCzJ/1byY67AXPk1UKfnudPaXw1pwj3vgPLwd15pbnUl4/IAHgOtpsO00AFIJsDQBSXgLgDGVZcBUCVUb5OgC2O8fafeaxwgI5AD+MC5lhm3cmFKzjAplpyxhwneYARKqWBWFdPBQAEB2iVTie/DCuzOGCgpIseBuABj59K4C56+g68yUL+KIFGgAoKGA+WVWSV1lCpryOt/YAWtSMMhDVAAD7ujxW+VEoeGKivV7wrGtI45XLp9bOCtEYGDzeoLMaJpsyUV/fQYavu4+x9mdh3bnOkAG+rUAUIcMJIwyJ+OBjsJgaAJpEnqG7h0pd1TEZAgwV0XnZyxuxKcKYkfqZfF50GvB4Uv4BRopoYANImLAzqOkljPxuGOdk17YfuGbmsWFCQVopDd8y8zkianY0vPJ68aUfLgpMWVl2X5Vhr+uhUrrhKDBhnpoN0tjW2RbAst0SH5tnpfy/B5B3TsIFVvBe+2F81LgoJEHdfBXTLAkou8GwW7Q67WsDyKj4nwOQblmnP2hlgQITpr2A3eG0Zcd2AEqY0O5wqjrqsnhYGwAR72sykQCyvbrAk+diMupcAMOnlcKEESoYmQFGFJwl+/ElA0aYzhelhRhgZLsomYyqKTTXZZiQ+aa7sRhnc2HK73pgNRxR8/qIifYlkaEhkj/OBLDi9UutD34Ye/Ijeppm2hjX9BGZyFPWB2QbxgLpuKTHsaqh9IGIj7TfJYBZQlB6VKudiMuamL/vRTEfv7o30AAAAABJRU5ErkJggg==';
      break;
    case '95':
      data =
        'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADNElEQVRYR71XzXnaQBCdWT4EtzgFGMuXRJxiVxBcQUgFdioIVBC7gtgVBCowriCigpATJBdj3ADcbPF5X75Z/SApQkiyE91YdqU3b2bem2VKPbNW/ZKIP6fXY7+XAPrt+/VA1m5t2ltT3daaXSJ6lXNu8xfgOvfrE1ng+IFpyzpnoi9FXtJQ3uvDOS2ndrOjtD7VwJiZvxU56+/BlbNY9yIAs1ajB8UT1nq0KxIQXRAwFxYEAGv9HcAnZjrawV6ET/bLeQPg177VBdM1AS6IhqzU2dZIoCcATSRaA0QpVwDIfqVwDM09MNt5TEDrQZhCA2B20HAJeG+IUeqkPX+QfGY+v+36kdb8w/zJPAbgRmljHjt3j53iaQhqYNay5kR0UARASPlLA0CIOiyubVH8cwDOwkt0RhrIdL9+FlU785iAJRF9iFd2lRREDOwEEGtVKUJm7kT1Q3TRXnjnpQAkKCVaOQtvL+8Fca14eQAFqvgvAKAuMb3zQXPfWTxeVmegAIBZyxKhMjn3xWejfrtaOAsYp6t6Vx+nNSMUoSItvBtAAQpjAFZQ6oi1FtEyGiJK+Ga+npRKgVFCoRVko6Z68YgyXjSBUn3Zw6CPb++9USjjkg7F3AHR6VYAgKtq1I+DND0vlvpATYnmmohyu4CJBlqpi/b8QdTTPCLPxgPyPr5BNW8o71ic1JRtuJ5qx61BMNFQK3UeB2BYjPlJbgpAP4Xp0G/KzgM3AEbGCVOmJSw+akuGlEAVM2AEH/eZxjAxDxQpnKndtFnrW7/lyztfUG9CvZmcxHdydT8NqmzLZgU1a1mR7AuL/xVAYpbwZ4/DUgCiyaliCtKFLsZXCkByaPWHyiK1s63TngVAnLCs9SYYDJy3MgNVACQYDLqoFICEE1Zg4PkASkzPWbWRuvjcOAuvW46BGIAqzpfFYOxmVL8khJNNBn7FS9Y0NBeYlAqa/n6ir7kdoXgJVleB2xorFz/xb0Yta1DEyYwTAuNmbT0K3SwQF7kZ5bqoL980gsZNrUaT0JLZmMiT5W7mutw47pyFl7h2Jcb0AqKQTp1hIIhi1/X6Til0syaeggyuAPTCO2GI9Q+eRymsXRistgAAAABJRU5ErkJggg==';
      break;
    case 'oilprice-logo':
      data =
        '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';
      break;
    case '98':
      // return SFSymbol.named('square.grid.4x3.fill');
      data =
        'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADb0lEQVRYR71XzXnaQBCdWT4EtzgFWJEvsTiFVBBcgUkFiSsIriC4AtsVBFcQXEGgApMTci6W5QKCb0Z87OSbRSuvlJWQcL7oBNL+vJl5+94sQu4J3OY5AA7y743/CyI67TysRrYxFebPWiI+OghhwfPRXGTuOkME+FqyefqpJeLXehH98nbf6RPC923zEeDqMIo/ZwAEbmtAAmco5RgAXpUtQgBnQBSaWZh7bQ8AvArzH0mIfgPWi7fhaqYykCInmhDAFQqh0FkfkjMimCHiNwbSieIhjwtc5wYQQpJ0XTafpBwh4hcA2POj+EABCN60JkD0gX+TEEed8GlStP8vr9mVEm/Ud8Spf7/szfebnxkQvxKC3nNkRfMDt3kBoACosRsArnPH6asCYO61eyjljwwAgzvbAjCDNQGQRmwjV4aoFgCB6zBvjqsEYALwoxh1BlIA/LKMgGa6dQlyJTzohE9hYQmMcu8GwEx3QsJ8VGUBBK7zmwnIYxSATE0BHv0oVh+LHlMr9CmoCUBnW+2VBZCwujYA16lcwkCPTfaqDSBDOKITFqN0UYKf/kPc3VKCDdidAVg0Ix9VYfksJyjHATz1o+VFaQTPAFhSu8z4wHXYWFi+r/0o7lcSMdjspY/hGAg8aohBKjL2VWYkxCmPQYKPhw8xn39gHwGgIWs8SslmVEBkukTAPQLotUTcZTNTAO482HuCdrd88gYRAoykEGf5s55INMtxKQcYODYo1HKdik7uOBZWga1UCjEsAMAeUuqkDMBpxJNd+4FrIhorJzRMK9GGYyK61KZki4CITlDgMRIsDqP4JMloGeWy39jzUUo2rvQYme7IGxR1SgZXzhPPUJJdqvt5aC91wlvXGRHApwSAsv3/CsDWd9QCkOn5EiWzRVXVCetzINO00qUfrQYvseIXAdjRCdPOS/cdtUrwr624dgYyTqibEaOf3NZN2UyrVgZsLE4XBbj3o1g1toUkzPUC9TNgWLFuv2tY8bOIGa6ZZkDd6ajESAQuUMKVunoZnVOSla5ywvW68FpHiFPcGBVLceqkm5uR6/Atp/g2lORUOSHRtN1YjbWZbKRY9ACIFW6rExKiZ/YcyFa8XDsTQHhXwRWsdc606uWL/NWwqAwkhrLNSu+FoL7t2qWCoNZYX++sGBCnLVz28zfqP7ucqZ0+ejd5AAAAAElFTkSuQmCC';
      break;
    default:
      data = '';
      break;
  }
  return Image.fromData(Data.fromBase64String(data));
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

// **
//  * 图片高斯模糊
//  * @param {Image} img 
//  * @param {string} style light/dark
//  * @return {Image} 图片
//  */
async function blurImage(img, style, blur = blursize) {
  const js = `
 var mul_table=[512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,289,287,285,282,280,278,275,273,271,269,267,265,263,261,259];var shg_table=[9,11,12,13,13,14,14,15,15,15,15,16,16,16,16,17,17,17,17,17,17,17,18,18,18,18,18,18,18,18,18,19,19,19,19,19,19,19,19,19,19,19,19,19,19,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24];function stackBlurCanvasRGB(id,top_x,top_y,width,height,radius){if(isNaN(radius)||radius<1)return;radius|=0;var canvas=document.getElementById(id);var context=canvas.getContext("2d");var imageData;try{try{imageData=context.getImageData(top_x,top_y,width,height)}catch(e){try{netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");imageData=context.getImageData(top_x,top_y,width,height)}catch(e){alert("Cannot access local image");throw new Error("unable to access local image data: "+e);return}}}catch(e){alert("Cannot access image");throw new Error("unable to access image data: "+e);}var pixels=imageData.data;var x,y,i,p,yp,yi,yw,r_sum,g_sum,b_sum,r_out_sum,g_out_sum,b_out_sum,r_in_sum,g_in_sum,b_in_sum,pr,pg,pb,rbs;var div=radius+radius+1;var w4=width<<2;var widthMinus1=width-1;var heightMinus1=height-1;var radiusPlus1=radius+1;var sumFactor=radiusPlus1*(radiusPlus1+1)/2;var stackStart=new BlurStack();var stack=stackStart;for(i=1;i<div;i++){stack=stack.next=new BlurStack();if(i==radiusPlus1)var stackEnd=stack}stack.next=stackStart;var stackIn=null;var stackOut=null;yw=yi=0;var mul_sum=mul_table[radius];var shg_sum=shg_table[radius];for(y=0;y<height;y++){r_in_sum=g_in_sum=b_in_sum=r_sum=g_sum=b_sum=0;r_out_sum=radiusPlus1*(pr=pixels[yi]);g_out_sum=radiusPlus1*(pg=pixels[yi+1]);b_out_sum=radiusPlus1*(pb=pixels[yi+2]);r_sum+=sumFactor*pr;g_sum+=sumFactor*pg;b_sum+=sumFactor*pb;stack=stackStart;for(i=0;i<radiusPlus1;i++){stack.r=pr;stack.g=pg;stack.b=pb;stack=stack.next}for(i=1;i<radiusPlus1;i++){p=yi+((widthMinus1<i?widthMinus1:i)<<2);r_sum+=(stack.r=(pr=pixels[p]))*(rbs=radiusPlus1-i);g_sum+=(stack.g=(pg=pixels[p+1]))*rbs;b_sum+=(stack.b=(pb=pixels[p+2]))*rbs;r_in_sum+=pr;g_in_sum+=pg;b_in_sum+=pb;stack=stack.next}stackIn=stackStart;stackOut=stackEnd;for(x=0;x<width;x++){pixels[yi]=(r_sum*mul_sum)>>shg_sum;pixels[yi+1]=(g_sum*mul_sum)>>shg_sum;pixels[yi+2]=(b_sum*mul_sum)>>shg_sum;r_sum-=r_out_sum;g_sum-=g_out_sum;b_sum-=b_out_sum;r_out_sum-=stackIn.r;g_out_sum-=stackIn.g;b_out_sum-=stackIn.b;p=(yw+((p=x+radius+1)<widthMinus1?p:widthMinus1))<<2;r_in_sum+=(stackIn.r=pixels[p]);g_in_sum+=(stackIn.g=pixels[p+1]);b_in_sum+=(stackIn.b=pixels[p+2]);r_sum+=r_in_sum;g_sum+=g_in_sum;b_sum+=b_in_sum;stackIn=stackIn.next;r_out_sum+=(pr=stackOut.r);g_out_sum+=(pg=stackOut.g);b_out_sum+=(pb=stackOut.b);r_in_sum-=pr;g_in_sum-=pg;b_in_sum-=pb;stackOut=stackOut.next;yi+=4}yw+=width}for(x=0;x<width;x++){g_in_sum=b_in_sum=r_in_sum=g_sum=b_sum=r_sum=0;yi=x<<2;r_out_sum=radiusPlus1*(pr=pixels[yi]);g_out_sum=radiusPlus1*(pg=pixels[yi+1]);b_out_sum=radiusPlus1*(pb=pixels[yi+2]);r_sum+=sumFactor*pr;g_sum+=sumFactor*pg;b_sum+=sumFactor*pb;stack=stackStart;for(i=0;i<radiusPlus1;i++){stack.r=pr;stack.g=pg;stack.b=pb;stack=stack.next}yp=width;for(i=1;i<=radius;i++){yi=(yp+x)<<2;r_sum+=(stack.r=(pr=pixels[yi]))*(rbs=radiusPlus1-i);g_sum+=(stack.g=(pg=pixels[yi+1]))*rbs;b_sum+=(stack.b=(pb=pixels[yi+2]))*rbs;r_in_sum+=pr;g_in_sum+=pg;b_in_sum+=pb;stack=stack.next;if(i<heightMinus1){yp+=width}}yi=x;stackIn=stackStart;stackOut=stackEnd;for(y=0;y<height;y++){p=yi<<2;pixels[p]=(r_sum*mul_sum)>>shg_sum;pixels[p+1]=(g_sum*mul_sum)>>shg_sum;pixels[p+2]=(b_sum*mul_sum)>>shg_sum;r_sum-=r_out_sum;g_sum-=g_out_sum;b_sum-=b_out_sum;r_out_sum-=stackIn.r;g_out_sum-=stackIn.g;b_out_sum-=stackIn.b;p=(x+(((p=y+radiusPlus1)<heightMinus1?p:heightMinus1)*width))<<2;r_sum+=(r_in_sum+=(stackIn.r=pixels[p]));g_sum+=(g_in_sum+=(stackIn.g=pixels[p+1]));b_sum+=(b_in_sum+=(stackIn.b=pixels[p+2]));stackIn=stackIn.next;r_out_sum+=(pr=stackOut.r);g_out_sum+=(pg=stackOut.g);b_out_sum+=(pb=stackOut.b);r_in_sum-=pr;g_in_sum-=pg;b_in_sum-=pb;stackOut=stackOut.next;yi+=width}}context.putImageData(imageData,top_x,top_y)}function BlurStack(){this.r=0;this.g=0;this.b=0;this.a=0;this.next=null}
       // https://gist.github.com/mjackson/5311256
     
       function rgbToHsl(r, g, b){
           r /= 255, g /= 255, b /= 255;
           var max = Math.max(r, g, b), min = Math.min(r, g, b);
           var h, s, l = (max + min) / 2;
     
           if(max == min){
               h = s = 0; // achromatic
           }else{
               var d = max - min;
               s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
               switch(max){
                   case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                   case g: h = (b - r) / d + 2; break;
                   case b: h = (r - g) / d + 4; break;
               }
               h /= 6;
           }
     
           return [h, s, l];
       }
     
       function hslToRgb(h, s, l){
           var r, g, b;
     
           if(s == 0){
               r = g = b = l; // achromatic
           }else{
               var hue2rgb = function hue2rgb(p, q, t){
                   if(t < 0) t += 1;
                   if(t > 1) t -= 1;
                   if(t < 1/6) return p + (q - p) * 6 * t;
                   if(t < 1/2) return q;
                   if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                   return p;
               }
     
               var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
               var p = 2 * l - q;
               r = hue2rgb(p, q, h + 1/3);
               g = hue2rgb(p, q, h);
               b = hue2rgb(p, q, h - 1/3);
           }
     
           return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
       }
       
       function lightBlur(hsl) {
       
         // Adjust the luminance.
         let lumCalc = 0.35 + (0.3 / hsl[2]);
         if (lumCalc < 1) { lumCalc = 1; }
         else if (lumCalc > 3.3) { lumCalc = 3.3; }
         const l = hsl[2] * lumCalc;
         
         // Adjust the saturation. 
         const colorful = 2 * hsl[1] * l;
         const s = hsl[1] * colorful * 1.5;
         
         return [hsl[0],s,l];
         
       }
       
       function darkBlur(hsl) {
     
         // Adjust the saturation. 
         const colorful = 2 * hsl[1] * hsl[2];
         const s = hsl[1] * (1 - hsl[2]) * 3;
         
         return [hsl[0],s,hsl[2]];
         
       }
     
       // Set up the canvas.
       const img = document.getElementById("blurImg");
       const canvas = document.getElementById("mainCanvas");
     
       const w = img.naturalWidth;
       const h = img.naturalHeight;
     
       canvas.style.width  = w + "px";
       canvas.style.height = h + "px";
       canvas.width = w;
       canvas.height = h;
     
       const context = canvas.getContext("2d");
       context.clearRect( 0, 0, w, h );
       context.drawImage( img, 0, 0 );
       
       // Get the image data from the context.
       var imageData = context.getImageData(0,0,w,h);
       var pix = imageData.data;
       
       var isDark = "${style}" == "dark";
       var imageFunc = isDark ? darkBlur : lightBlur;
     
       for (let i=0; i < pix.length; i+=4) {
     
         // Convert to HSL.
         let hsl = rgbToHsl(pix[i],pix[i+1],pix[i+2]);
         
         // Apply the image function.
         hsl = imageFunc(hsl);
       
         // Convert back to RGB.
         const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
       
         // Put the values back into the data.
         pix[i] = rgb[0];
         pix[i+1] = rgb[1];
         pix[i+2] = rgb[2];
     
       }
     
       // Draw over the old image.
       context.putImageData(imageData,0,0);
     
       // Blur the image.
       stackBlurCanvasRGB("mainCanvas", 0, 0, w, h, ${blur});
       
       // Perform the additional processing for dark images.
       if (isDark) {
       
         // Draw the hard light box over it.
         context.globalCompositeOperation = "hard-light";
         context.fillStyle = "rgba(55,55,55,0.2)";
         context.fillRect(0, 0, w, h);
     
         // Draw the soft light box over it.
         context.globalCompositeOperation = "soft-light";
         context.fillStyle = "rgba(55,55,55,1)";
         context.fillRect(0, 0, w, h);
     
         // Draw the regular box over it.
         context.globalCompositeOperation = "source-over";
         context.fillStyle = "rgba(55,55,55,0.4)";
         context.fillRect(0, 0, w, h);
       
       // Otherwise process light images.
       } else {
         context.fillStyle = "rgba(255,255,255,0.4)";
         context.fillRect(0, 0, w, h);
       }
     
       // Return a base64 representation.
       canvas.toDataURL(); 
       `

  // Convert the images and create the HTML.
  let blurImgData = Data.fromPNG(img).toBase64String()
  let html = `
       <img id="blurImg" src="data:image/png;base64,${blurImgData}" />
       <canvas id="mainCanvas" />
       `

  // Make the web view and get its return value.
  let view = new WebView()
  await view.loadHTML(html)
  let returnValue = await view.evaluateJavaScript(js)

  // Remove the data type from the string and convert to data.
  let imageDataString = returnValue.slice(22)
  let imageData = Data.fromBase64String(imageDataString)

  // Convert to image and crop before returning.
  let imageFromData = Image.fromData(imageData)
  // return cropImage(imageFromData)
  return imageFromData
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
    "2556": {
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



//#####################版本更新模块#####################

async function getversion() {
  const versionCachePath = files.joinPath(files.documentsDirectory(), "version-NK")
  var versionData
  try {
    versionData = await new Request("https://fastly.jsdelivr.net/gh/Nicolasking007/CDN@latest/Scriptable/UPDATE.json").loadJSON()
    files.writeString(versionCachePath, JSON.stringify(versionData))
    console.log(`[+]欢迎使用：${versionData.author}制作小组件`);
    console.log("[+]遇到问题，请前往公众号：曰坛 反馈");
    log("[+]版本信息获取成功")
  } catch (e) {
    versionData = JSON.parse(files.readString(versionCachePath))
    log("[+]获取版本信息失败，使用缓存数据")
  }

  return versionData
}

// 版本比较
function version_compare(v1, v2) {
  // 将两个版本号拆成数组
  var arr1 = v1.split('.'),
    arr2 = v2.split('.');
  var minLength = Math.min(arr1.length, arr2.length);
  // 依次比较版本号每一位大小
  for (var i = 0; i < minLength; i++) {
    if (parseInt(arr1[i]) != parseInt(arr2[i])) {
      return (parseInt(arr1[i]) > parseInt(arr2[i])) ? 1 : -1;
    }
  }
  // 若前几位分隔相同，则按分隔数比较。
  if (arr1.length == arr2.length) {
    return 0;
  } else {
    return (arr1.length > arr2.length) ? 1 : -1;
  }
}

async function updateCheck(localversion) {

  let uC = versionData
  let originversion = uC['ONE-oilprice'].version
  let status = version_compare(originversion, localversion)
  log('[+]最新版本：' + originversion)
  let needUpdate = false
  if (status == 1) {
    needUpdate = true
    log("[+]检测到有新版本！")
    if (!config.runsInWidget) {
      log("[+]执行更新步骤")
      let upd = new Alert()
      upd.title = "检测到有新版本！"
      upd.addDestructiveAction("暂不更新")
      upd.addAction("立即更新")
      upd.add
      upd.message = uC['ONE-oilprice'].notes
      if (await upd.present() == 1) {
        const req = new Request(uC['ONE-oilprice'].cdn_scriptURL)
        const codeString = await req.loadString()
        files.writeString(module.filename, codeString)
        const n = new Notification()
        n.title = "下载更新成功"
        n.body = "请点击左上角Done完成，重新进入脚本即可~"
        n.schedule()

      }
      Script.complete()
    }

  } else if (status == 0) {
    log("[+]当前版本已是最新")
  } else {
    const n = new Notification()
    n.title = "作者肯定是打瞌睡啦！"
    n.body = "哎呀！赶紧去公众号反馈吧~"
    n.schedule()
  }

  return needUpdate
}

/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
 *******************************************************
 ************ © 2023 Copyright Nicolas-kings ************/