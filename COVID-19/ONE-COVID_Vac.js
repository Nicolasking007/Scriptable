// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic;

/********************************************************
 * script     : ONE-COVID_Vac.js
 * version    : 1.0
 * author     : Nicolas-kings
 * date       : 2021-05-23
 * github     : https://github.com/Nicolasking007/Scriptable
 * Changelog  : v1.0 - 首次发布
 *******************************************************/
const filename = `${Script.name()}.jpg`
const files = FileManager.local()
const path = files.joinPath(files.documentsDirectory(), filename)
const previewSize = "Medium"  // Medium、Small 预览大小
const COLORS = {
    blynk : '#2edbad',
    bg1 : '#29323c',
    bg2 : '#1c1c1c'
}
const type = args.widgetParameter || '中国'    //中国、全球
const versionData = await getversion()
let needUpdated = await updateCheck(1.0) 
const CVTData = await getVcT_TopData()
const Tol_cvt = (Math.floor(CVTData.total_vaccinations / 10000) / 10000).toFixed(1)
const New_cvt = Math.floor( CVTData.new_vaccinations / 100) / 100           
let widget = await createWidget()
//config.widgetFamily = config.widgetFamily || 'medium'

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

async function createWidget(){
    const widget = new ListWidget()
    if(previewSize == 'Medium' || config.widgetFamily === "medium"){
       
        widget.setPadding(10,10,10,10)
        const bgColor = new LinearGradient()
        bgColor.colors = [new Color(COLORS.bg1), new Color(COLORS.bg2)]
        bgColor.locations = [0.0, 1.0]
        widget.backgroundGradient = bgColor;
            
        const timeFormatter = new DateFormatter();
        timeFormatter.locale = "en";
        timeFormatter.useNoDateStyle();
        timeFormatter.useShortTimeStyle();

        let titleRow = widget.addStack() 
        titleRow.centerAlignContent()
        const title = titleRow.addText(`实时疫苗接种数据 · ${type}`)
        title.font = Font.boldSystemFont(16)
        title.textColor = new Color(COLORS.blynk)
        titleRow.addSpacer()
            
        const dateLine = titleRow.addText(`↻ ${timeFormatter.string(new Date())}`);
        dateLine.font = Font.boldSystemFont(10)
        dateLine.textColor = Color.white();
        dateLine.textOpacity = 0.7;
            
        widget.addSpacer(15)

        let row = widget.addStack() 

        batteryColumn = row.addStack()
        batteryColumn.layoutVertically()
        batteryColumn.centerAlignContent()

        const batteryLine = batteryColumn.addText(`累计接种(亿)`)
        batteryLine.font = Font.lightSystemFont(12)
        batteryLine.textColor = Color.white()

        const batteryLabel = batteryColumn.addText(`${Tol_cvt}`)
        batteryLabel.font = Font.regularSystemFont(20)
        batteryLabel.textColor = Color.white()

        row.addSpacer()

        //Create temperatue column & set its properties
        tempColumn = row.addStack()
        tempColumn.layoutVertically()
        tempColumn.centerAlignContent()

        const tempLine = tempColumn.addText(`较上日新增`)
        tempLine.font = Font.lightSystemFont(12)
            tempLine.textColor = Color.white()

        const tempLabel = tempColumn.addText(`${New_cvt}w`)
        tempLabel.font = Font.regularSystemFont(20)
        tempLabel.textColor = Color.white()

        row.addSpacer()    
    //      Create humidity column & set its properties
        humColumn = row.addStack()
        humColumn.layoutVertically()
        humColumn.centerAlignContent()

        const humLine = humColumn.addText(`每百人接种`)
        humLine.font = Font.lightSystemFont(12)
        humLine.textColor = Color.white()

        const humLabel = humColumn.addText(`${CVTData.total_vaccinations_per_hundred}`)
        humLabel.font = Font.regularSystemFont(20)
        humLabel.textColor = Color.white()
        humLabel.leftAlignText()
            
        widget.addSpacer(15)
            
        const deviceLine = widget.addText(versionData['ONE-COVID_Vac'].notice)
        deviceLine.font = Font.mediumSystemFont(8)
        deviceLine.textColor = Color.white()
              
    }else if(previewSize == 'Small'|| config.widgetFamily === "small"){
        const widget = new ListWidget()
        const bgColor = new LinearGradient()
        bgColor.colors = [new Color(COLORS.bg1), new Color(COLORS.bg2)]
        bgColor.locations = [0.0, 1.0]
        widget.backgroundGradient = bgColor;

        const timeFormatter = new DateFormatter();
        timeFormatter.locale = "en";
        timeFormatter.useNoDateStyle();
        timeFormatter.useShortTimeStyle();

        const title = widget.addText(`实时疫苗接种数据 · ${type}`)
        title.font = Font.boldSystemFont(14)
        title.textColor = new Color(COLORS.blynk)
        widget.addSpacer(10)

        const batteryLine = widget.addText(`累计接种(亿)`)
        batteryLine.font = Font.lightSystemFont(10)
        batteryLine.textColor = Color.white()

        const batteryLabel = widget.addText(`${Tol_cvt}`)
        batteryLabel.font = Font.regularSystemFont(14)
        batteryLabel.textColor = Color.white()

        widget.addSpacer(5)

        const tempLine = widget.addText(`较上日新增`)
        tempLine.font = Font.lightSystemFont(10)
        tempLine.textColor = Color.white()

        const tempLabel = widget.addText(`${New_cvt}w`)
        tempLabel.font = Font.regularSystemFont(14)
        tempLabel.textColor = Color.white()

        widget.addSpacer(5)

        const deviceLine = widget.addText(`每百人接种`)
        deviceLine.font = Font.lightSystemFont(10)
        deviceLine.textColor = Color.white()

        const connectionLine = widget.addText(`${CVTData.total_vaccinations_per_hundred}`)
        connectionLine.font = Font.regularSystemFont(14)
        connectionLine.textColor = Color.white()
        widget.addSpacer(10)
        const dateLine = widget.addText(`↻  ${timeFormatter.string(new Date())}`);
        dateLine.font = Font.boldSystemFont(10)
        dateLine.textColor = Color.white();
        // dateLine.rightAlignText();
        dateLine.textOpacity = 0.7;
       
    }else{
        const bgColor = new LinearGradient()
        bgColor.colors = [new Color(COLORS.bg1), new Color(COLORS.bg2)]
        bgColor.locations = [0.0, 1.0]
        const error = widget.addText("\u62b1\u6b49\uff0c\u8be5\u5c3a\u5bf8\u5c0f\u7ec4\u4ef6\u4f5c\u8005\u6682\u672a\u9002\u914d")
        error.font = Font.blackMonospacedSystemFont(12)
        error.textColor = Color.white()
        error.centerAlignText()
        widget.url = 'https://mp.weixin.qq.com/mp/homepage?__biz=MzU3MTcyMDM1NA==&hid=1&sn=95931d7607893e42afc85ede24ba9fe5&scene=18'
        widget.backgroundGradient = bgColor;
    }
    return widget
}


 async function getVcT_TopData() {
    const VTDataCachePath = files.joinPath(files.documentsDirectory(), "VaccineTopData-NK")
    var VTData
    try {
      VTData = await new Request("https://api.inews.qq.com/newsqa/v1/automation/modules/list?modules=VaccineTopData").loadJSON()
        files.writeString(VTDataCachePath, JSON.stringify(VTData))
        log("[+]疫苗信息获取成功")
    } catch (e) {
      VTData = JSON.parse(files.readString(VTDataCachePath))
        log("[+]获取疫苗信息失败，使用缓存数据")
    }
  
    return VTData.data.VaccineTopData[type]
  }
  async function getversion() {
    const versionCachePath = files.joinPath(files.documentsDirectory(), "version-NK")
    var versionData
    try {
        versionData = await new Request("https://cdn.jsdelivr.net/gh/Nicolasking007/CDN@latest/Scriptable/UPDATE.json").loadJSON()
        files.writeString(versionCachePath, JSON.stringify(versionData))
        console.log(`===>欢迎使用：${versionData.author}制作的小组件<===`);
        console.log("[+]遇到问题，请前往公众号：曰坛 反馈");
        log("[+]版本信息获取成功")
    } catch (e) {
        versionData = JSON.parse(files.readString(versionCachePath))
        log("[+]获取版本信息失败，使用缓存数据")
    }

    return versionData
}


async function updateCheck(version) {

    const uC = versionData
    log('[+]当前版本：' + uC['ONE-COVID_Vac'].version)
    let needUpdate = false
    if (uC['ONE-COVID_Vac'].version != version) {
        needUpdate = true
        log("[+]检测到有新版本！")
        if (!config.runsInWidget) {
            log("[+]执行更新步骤")
            let upd = new Alert()
            upd.title = "检测到有新版本！"
            upd.addDestructiveAction("暂不更新")
            upd.addAction("立即更新")
            upd.add
            upd.message = uC['ONE-COVID_Vac'].notes
            if (await upd.present() == 1) {
                const req = new Request(uC['ONE-COVID_Vac'].cdn_scriptURL)
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