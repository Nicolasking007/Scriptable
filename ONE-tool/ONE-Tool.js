// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: fingerp
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: fingerprint;
/********************************************************
 * script     : ONE-Tool.js
 * version    : 1.4
 * author     : Nicolas-kings
 * date       : 2021-04-05
 * desc       : 具体配置说明，详见微信公众号-曰(读yue)坛
 * github     : https://github.com/Nicolasking007/Scriptable
 * Changelog  : v1.4 - api所有接口数据增加缓存，简化使用流程 
                v1.3 - 支持版本更新、脚本远程下载
                v1.2 - api接口数据增加缓存，应对无网络情况下也能使用小组件
                v1.1 - 替换api接口
                v1.0 - 首次发布
----------------------------------------------- */
const filename = `${Script.name()}.jpg`
const files = FileManager.local()
const path = files.joinPath(files.documentsDirectory(), filename)
const changePicBg = true  //选择true时，使用透明背景 
const ImageMode = false    //选择true时，使用必应壁纸
const previewSize = "Medium"  //预览大小
const colorMode = false // 是否是纯色背景
const refreshInterval = 30   //刷新间隔  时间单位：分钟

/************************************************************
********************用户设置 *********************
************请在首次运行之前进行修改************
***********************************************************/
const User = 'Nicolas-kings'//昵称
const WeatherKey = ' ' // 和风天气api-key 申请地址： https://dev.heweather.com/
//  ***********************************************************/

const padding = {
    top: 10,
    left: 10,
    bottom: 10,
    right: 10
}

const currentDate = new Date()
const tencentApiKey = ""   // 腾讯位置服务apiKey，自带官方key，也可以使用自己申请的
const lockLocation = false  //是否锁定定位信息
const LOCATION = await getLocation()
const areaData = await getLocationArea()
const city = areaData.result.address_component.city
const district = areaData.result.address_component.district
const lunarInfo = await getLunar(currentDate.getDate() - 1)
let lunarJoinInfo = "农历" + lunarInfo.infoLunarText + "·" + lunarInfo.lunarYearText + " " + lunarInfo.holidayText
const versionData = await getversion()
let needUpdated = await updateCheck(1.3)
const weatherData = await getWeather()
const honeyData = await gethoney()

const widget = await createWidget()
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
    const bgColor = new LinearGradient()
    bgColor.colors = [new Color('#2c5364'), new Color('#203a43'), new Color('#0f2027')]
    bgColor.locations = [0.0, 0.5, 1.0]
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
    const widget = new ListWidget()
    widget.setPadding(12, 12, 12, 0)
    widget.spacing = 6

    const time = new Date()

    const hour = time.getHours()
    const isMidnight = hour < 8 && 'midnight'
    const isMorning = hour >= 8 && hour < 12 && 'morning'
    const isAfternoon = hour >= 12 && hour < 19 && 'afternoon'
    const isEvening = hour >= 19 && hour < 21 && 'evening'
    const isNight = hour >= 21 && 'night'

    const dfTime = new DateFormatter()
    dfTime.locale = 'zh-cn'
    dfTime.useMediumDateStyle()
    dfTime.useNoTimeStyle()

    if (previewSize === "Small" || config.widgetFamily === "small") {
        //   const widget = new ListWidget();
        const error = widget.addText("\u62b1\u6b49\uff0c\u8be5\u5c3a\u5bf8\u5c0f\u7ec4\u4ef6\u4f5c\u8005\u6682\u672a\u9002\u914d")
        error.font = Font.blackMonospacedSystemFont(12)
        error.textColor = Color.white()
        error.centerAlignText()
        widget.url = 'https://mp.weixin.qq.com/mp/homepage?__biz=MzU3MTcyMDM1NA==&hid=1&sn=95931d7607893e42afc85ede24ba9fe5&scene=18'
        widget.backgroundColor = bgColor

    } else {

        const hello = widget.addText(`[🤖]Hi, ${User}. Good ${isMidnight || isMorning || isAfternoon || isEvening || isNight}!`)
        hello.textColor = new Color('#ffffff')
        hello.font = new Font('Menlo', 11)

        const enTime = dfTime.string(time)
        const lunartime = widget.addText(`[📅]${enTime} ${lunarJoinInfo}`)
        lunartime.textColor = new Color('#C6FFDD')
        lunartime.font = new Font('Menlo', 11)

        const honey = widget.addText(`[🐷]${honeyData.ishan}`)
        honey.textColor = new Color('#BBD676')
        honey.font = new Font('Menlo', 11)
        honey.lineLimit = 1

        const weather = widget.addText(`[🌤]${city}·${district} ${weatherData.now.text} T:${weatherData.now.temp}°  F:${weatherData.now.feelsLike}° ${weatherData.now.windDir}`)
        weather.textColor = new Color('#FBD786')
        weather.font = new Font('Menlo', 11)

        const Battery = widget.addText(`[${Device.isCharging() ? '⚡️' : '🔋'}]${renderBattery()} Battery`)
        Battery.textColor = new Color('#00FF00')
        Battery.font = new Font('Menlo', 11)

        const Progress = widget.addText(`[⏳]${renderYearProgress()} YearProgress`)
        Progress.textColor = new Color('#f19c65')
        Progress.font = new Font('Menlo', 11)

        let nextRefresh = Date.now() + 1000 * 60 * parseInt(refreshInterval)// add 30 min to now
        console.log('刷新时间戳==》' + nextRefresh)
        widget.refreshAfterDate = new Date(nextRefresh) //下次刷新时间
        console.log('刷新时间==》' + new Date(nextRefresh))

        // // // // // // // // // // // // // // 
        // let lastUpdatedStack = widget.addStack()
        // widget.addSpacer(2)
        // let currentDate = new Date()
        // let lastUpdated = currentDate.toLocaleString("chinese", { hour12: false })
        // let lastUpdatedElement = widget.addText('↻' + `${lastUpdated}`+'')
        // lastUpdatedElement.textColor = Color.white()
        // lastUpdatedElement.font = Font.systemFont(8)
        // lastUpdatedElement.rightAlignText()
        // lastUpdatedElement.lineLimit = 1


    }

    return widget
}

// ######获取万年历数据#######
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

//获取农历时间
// async function getLunarData() {
//   const url = 'https://api.xlongwei.com/service/datetime/convert.json'
//   const request = new Request(url)
//   const res = await request.loadJSON()
//   return `${res.ganzhi}${res.shengxiao}年 农历${res.chinese.replace(/.*年/, '')}`
// }

// ######获取定位信息#######
async function getLocation() {
    // 设定位置缓存数据路径
    const locationPath = files.joinPath(files.documentsDirectory(), "Mylocation-NK")
    var latitude, longitude
    var locationString
    // 如果位置设定保存且锁定了，从缓存文件读取信息
  
    if (lockLocation && files.fileExists(locationPath)) {
      locationString = files.readString(locationPath)
      log("[+]位置锁定，使用缓存数据" + locationString)
      // return locationString
      // 否则，从系统获取位置信息
    } else {
      try {
        const location = await Location.current()
        latitude = location.latitude
        longitude = location.longitude
        locationString = longitude + "," + latitude
        files.writeString(locationPath, locationString)
        log("[+]定位成功")
      }
      catch (e) {
        locationString = files.readString(locationPath)
        log("[+]无法定位，使用缓存定位数据")
      }
      locationString = locationString
  
      //   return locationString
    }
    log("[+]地址" + locationString)
    return locationString
  }

// ######获取和风天气数据#######
async function getWeather() {
    // 设定天气数据缓存路径
    const cachePath = files.joinPath(files.documentsDirectory(), "HFcache-NK")
    // log("彩云缓存："+cachePath)
    const cacheExists = files.fileExists(cachePath)
    const cacheDate = cacheExists ? files.modificationDate(cachePath) : 0
    var data
    // 假设存储器已经存在且距离上次请求时间不足60秒，使用存储器数据
    if (cacheExists && (currentDate.getTime() - cacheDate.getTime()) < 60000) {
      log("[+]请求时间间隔过小，使用缓存数据")
      const cache = files.readString(cachePath)
      data = JSON.parse(cache)
      // 否则利用 api 得到新的数据
    } else {
  
      try {
        const weatherReq = "https://devapi.heweather.net/v7/weather/now?location="+LOCATION +"&key="+ WeatherKey+"&lang=zh-cn"
        const dataToday = await new Request(weatherReq).loadJSON()
        log(JSON.stringify(weatherReq))
        data = dataToday
        files.writeString(cachePath, JSON.stringify(data))
        log("[+]天气信息请求成功")
      }
      catch (e) {
        data = JSON.parse(files.readString(cachePath))
        log("[+]天气信息请求失败，使用缓存数据")
      }
    }
    return data
  }  

// ######获取定位的地址#######
async function getLocationArea() {
    // 加个缓存
    let cachePath = files.joinPath(files.documentsDirectory(), "areaCache-NK");
    // 	log("Tencent缓存："+cachePath)
    let cacheExists = files.fileExists(cachePath)
    let cacheDate = cacheExists ? files.modificationDate(cachePath) : 0;
    let data;
    // 假设存储器已经存在且距离上次请求时间不足60秒，使用存储器数据	
    if (cacheExists && (currentDate.getTime() - cacheDate.getTime()) < 60000) {
      log("[+]腾讯位置API请求时间间隔过小，使用缓存数据");
      return data = JSON.parse(files.readString(cachePath))
    }
    let locationString = await getLocation();
    let locationLs = locationString.split(",");
    let area;
    try {
      // 官方文档的key
      let testKey = "OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77"
      let apiKey = tencentApiKey == "" ? testKey : tencentApiKey
      let areaReq = "https://apis.map.qq.com/ws/geocoder/v1/?location=" + locationLs[1] + "," + locationLs[0] + "&key=" + apiKey + "&get_poi=0";
      let areaRequest = new Request(areaReq);
      let header = { "Referer": "https://lbs.qq.com/" }
      areaRequest.method = 'GET';
      areaRequest.headers = header;
      area = await areaRequest.loadJSON();
      log("[+]腾讯位置API请求成功：" + areaReq);
      files.writeString(cachePath, JSON.stringify(area))
      // 		log("信息：" + JSON.stringify(area));
    } catch (err) {
      log("[+]getLocationArea出错：" + err.message);
      area = JSON.parse(files.readString(cachePath));
    }
    return area;
  }

// ######情话#######
async function gethoney() {
    const honeyCachePath = files.joinPath(files.documentsDirectory(), "honey-NK")
    var honeyData
    try {
        honeyData = await new Request("https://api.vvhan.com/api/love?type=json").loadJSON()
      files.writeString(honeyCachePath, JSON.stringify(honeyData))
      log("[+]情话获取成功:" + JSON.stringify(honeyData))
    } catch (e) {
        honeyData = JSON.parse(files.readString(honeyCachePath))
      log("[+]获取情话失败，使用缓存数据")
    }
  
    return honeyData
  }


// ######电量#######
function renderProgress(progress) {
    const used = '▓'.repeat(Math.floor(progress * 24))
    const left = '░'.repeat(24 - used.length)
    return `${used}${left} ${Math.floor(progress * 100)}%`
}

function renderBattery() {
    const batteryLevel = Device.batteryLevel()
    return renderProgress(batteryLevel)
}

function renderYearProgress() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1) // Start of this year
    const end = new Date(now.getFullYear() + 1, 0, 1) // End of this year
    const progress = (now - start) / (end - start)
    return renderProgress(progress)
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
    log('[+]' + uC['ONE-Tool'].version)
    let needUpdate = false
    if (uC['ONE-Tool'].version != version) {
        needUpdate = true
        log("[+]检测到有新版本！")
        if (!config.runsInWidget) {
            log("[+]执行更新步骤")
            let upd = new Alert()
            upd.title = "检测到有新版本！"
            upd.addDestructiveAction("暂不更新")
            upd.addAction("立即更新")
            upd.add
            upd.message = uC['ONE-Tool'].notes
            if (await upd.present() == 1) {
                const req = new Request(uC['ONE-Tool'].cdn_scriptURL)
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