// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: clock;

/********************************************************
 * script     : ONE-Today.js
 * version    : 1.1.
 * author     : Nicolas-kings
 * date       : 2021-03-29
 * github     : https://github.com/Nicolasking007/Scriptable
 *******************************************************/

/************************************************************
 ********************用户设置 *********************
 ************请在首次运行之前进行修改************
 ***********************************************************/
 const filename = `${Script.name()}.jpg`
 const files = FileManager.local()
 const path = files.joinPath(files.documentsDirectory(), filename)
 const changePicBg = false  //选择true时，使用透明背景 
 const ImageMode = false   //选择true时，使用必应壁纸
 const previewSize = "Medium"  //预览大小
 const colorMode = false // 是否是纯色背景
 const bgColor = new Color("000000") // 小组件背景色
 
 let smallsize = 80  // 昨天明天字体大小
 let bigsize = 85 // 今天字体大小
 
 // 获取农历信息
 let date = new Date()
 const lunarInfo = await getLunar(date.getDate() - 1)
 let lunarJoinInfo = "农历" + lunarInfo.infoLunarText + "·"+lunarInfo.lunarYearText+ " "+lunarInfo.holidayText
 const honeyData = await gethoney()// 
 let needUpdated = await updateCheck(1.1)
 const str = date.getFullYear() + "年" + (date.getMonth() + 1) + "月"
 let day = new Date().getDate().toString()
 let stamp = new Date().getTime() - 60 * 60 * 24 * 1000
 let stamp1 = new Date().getTime() + 60 * 60 * 24 * 1000
 let prev = new Date(stamp).getDate().toString()
 let next = new Date(stamp1).getDate().toString()
 // const lunarData = await getLunarData()
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
   widget.backgroundColor = bgColor
 } else if (ImageMode) {
   const url = "https://area.sinaapp.com/bingImg/"   //使用必应壁纸作为背景时，请注释下面
   // const url = "http://p1.music.126.net/uarVFKgUlrI9Z1nr-50cAw==/109951162843608471.jpg"     //固定一张图片,这里我选用城南花已开的封面,图片不能太大，容易崩溃
   const i = await new Request(url);
   const img = await i.loadImage();
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
   let widget = new ListWidget()
   let full = widget.addText(str + '·' + `${lunarJoinInfo}`)
   full.font = new Font('Menlo', 14)
   full.lineLimit = 1
   full.centerAlignText()
   full.textColor = new Color("#ffffff")
 
   let body = widget.addStack()
   body.bottomAlignContent()
 
   addDate(
     prev,
     smallsize,
     body)
   body.addSpacer()
   addDate(
     day,
     bigsize,
     body)
   body.addSpacer()
   addDate(
     next,
     smallsize,
     body)
 
   let honey = widget.addText(`${honeyData.tts}`)
   honey.textColor = new Color('#ffffff')
   honey.font = new Font('Menlo', 11)
   honey.centerAlignText()
   honey.lineLimit = 1
 
   return widget
 }
 
 function addDate(name, size, r) {
   let stack = r.addStack()
   //   stack.layoutVertically()
 
   let wname = stack.addText(name)
   //   wname.font = Font.semiboldRoundedSystemFont(size)
   wname.font = new Font('Cabin Sketch', size)
   wname.textColor = new Color("#ffffff")
 
   //   stack.backgroundColor=new Color("#ccc")
 
   if (size === smallsize) {
     let size = new Size(100, 100)
     stack.size = size
     stack.setPadding(0, 0, 0, 0)
     wname.textColor = new Color("#999", 0.6)
   }
 }
 //获取农历时间
 // async function getLunarData() {
 //   const url = 'https://api.xlongwei.com/service/datetime/convert.json'
 //   const request = new Request(url)
 //   const res = await request.loadJSON()
 //   return `${res.ganzhi}${res.shengxiao}年 农历${res.chinese.replace(/.*年/, '')}`
 // }
 
 async function getLunar(day) {
   // 缓存key
   const cacheKey = "NK-lunar-cache"
   // 万年历数据
   let response = undefined
   try {
     const request = new Request("https://wannianrili.51240.com/")
     const defaultHeaders = {
       "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36"
     }
     request.method = 'GET'
     request.headers = defaultHeaders
     const html = await request.loadString()
     let webview = new WebView()
     await webview.loadHTML(html)
     var getData = `
             function getData() {
                 try {
                     infoLunarText = document.querySelector('div#wnrl_k_you_id_${day}.wnrl_k_you .wnrl_k_you_id_wnrl_nongli').innerText
                     holidayText = document.querySelectorAll('div.wnrl_k_zuo div.wnrl_riqi')[${day}].querySelector('.wnrl_td_bzl').innerText
                     lunarYearText = document.querySelector('div.wnrl_k_you_id_wnrl_nongli_ganzhi').innerText
                     lunarYearText = lunarYearText.slice(0, lunarYearText.indexOf('年')+1)
                     if(infoLunarText.search(holidayText) != -1) {
                         holidayText = ''
                     }
                 } catch {
                     holidayText = ''
                 }
                 return {infoLunarText: infoLunarText,  lunarYearText: lunarYearText,  holidayText: holidayText }
             }
             
             getData()`
 
     // 节日数据  
     response = await webview.evaluateJavaScript(getData, false)
     console.log(`[+]欢迎使用：${Script.name()}小组件`);
     console.log("[+]遇到问题，请前往公众号：曰坛 反馈");
     Keychain.set(cacheKey, JSON.stringify(response))
     console.log(`[+]农历输出：${JSON.stringify(response)}`);
   } catch (e) {
     console.error(`[+]农历请求出错：${e}`)
     if (Keychain.contains(cacheKey)) {
       const cache = Keychain.get(cacheKey)
       response = JSON.parse(cache)
     }
   }
 
   return response
 }
 
 async function gethoney() {
   const poetryCachePath = files.joinPath(files.documentsDirectory(), "holiday-NK")
   var poetryData
   try {
     poetryData = await new Request("http://timor.tech/api/holiday/tts").loadJSON()
     files.writeString(poetryCachePath, JSON.stringify(poetryData))
     log("[+]tts获取成功:" + JSON.stringify(poetryData))
   } catch (e) {
     poetryData = JSON.parse(files.readString(poetryCachePath))
     log("[+]获取tts失败，使用缓存数据")
   }
 
   return poetryData
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
 
 async function updateCheck(version) {
   let updateCheck = new Request('https://cdn.jsdelivr.net/gh/Nicolasking007/CDN@latest/Scriptable/UPDATE.json')
   let uC = await updateCheck.loadJSON()
 
   log('[+]' + uC['ONE-Today'].version)
   let needUpdate = false
   if (uC['ONE-Today'].version != version) {
     needUpdate = true
     log("[+]检测到有新版本！")
     if (!config.runsInWidget) {
       log("[+]执行更新步骤")
       let upd = new Alert()
       upd.title = "检测到有新版本！"
       upd.addDestructiveAction("暂不更新")
       upd.addAction("立即更新")
       upd.add
       upd.message = uC['ONE-Today'].notes
       if (await upd.present() == 1) {
         const req = new Request(uC['ONE-Today'].cdn_scriptURL)
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
 
 