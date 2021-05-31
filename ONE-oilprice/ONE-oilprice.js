// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: code;
/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
 *******************************************************
 ************ © 2021 Copyright Nicolas-kings ************/
/********************************************************
 * script     : ONE-oilprice.js
 * version    : 1.5
 * author     : Nicolas-kings
 * date       : 2021-03-31
 * desc       : 具体配置说明，详见微信公众号-曰(读yue)坛
 * github     : https://github.com/Nicolasking007/Scriptable
 *Changelog   : v1.5 - 细节优化、字体调整
                v1.4 - 部分UI细节调整
                v1.3 - 优化背景图片缓存处理
                v1.2 - 支持版本更新、脚本远程下载
                v1.1 - api接口数据增加缓存，应对无网络情况下也能使用小组件
                v1.0 - 首次发布
----------------------------------------------- */
/************************************************************
 ********************用户设置 *********************
 ************请在首次运行之前进行修改************
 ***********************************************************/
 const filename = `${Script.name()}.jpg`
 const files = FileManager.local()
 const path = files.joinPath(files.documentsDirectory(), filename)
 const changePicBg = false  //选择true时，使用透明背景 
 const ImageMode = true   //选择true时，使用必应壁纸
 const previewSize = (config.runsInWidget ? config.widgetFamily : "medium");// medium、small、large 预览大小
 const colorMode = false // 是否使用纯色背景
 const bgColor = new Color("000000") // 小组件背景色
 
 //*********使用前准备工作*********//
 const prov = '广东'  //输入要查询的省份 
 const api_key = '请在这里输入apikey'   //前往天行数据申请apikey https://www.tianapi.com/apiview/104
 //  ***********************************************************/
 
 const versionData = await getversion()
 let needUpdated = await updateCheck(1.5)
 let data = await fetchData()
 

 function colorConfig() {
   // general
   const tintLogo = true; // 对logo着色
   const tintColor = new Color('#FC6D26');
 
   // dark mode
   const darkBackgroud = new Color('#1A1B1E');
   const darkText = new Color('#FFFFFF');
 
   // light mode
   const lightBackgroud = new Color('#1A1B1E');
   const lightText = new Color('#FFFFFF');
 
   return {
     bgColor: Color.dynamic(lightBackgroud, darkBackgroud),
     textColor: Color.dynamic(lightText, darkText),
     titlecolor: Color.dynamic(lightText, darkText),
     tintColor: tintColor,
     tintLogo: tintLogo,
   };
 }
 
 
 const padding = {
   top: 15,
   left: 10,
   bottom: 5,
   right: 15
 }
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
   widget.backgroundColor = bgColor
 } else if (ImageMode) {
   // const url = "https://area.sinaapp.com/bingImg/"   //使用必应壁纸作为背景时，请注释下面
   // const url = "http://p1.music.126.net/uarVFKgUlrI9Z1nr-50cAw==/109951162843608471.jpg"     //固定一张图片,这里我选用城南花已开的封面,图片不能太大，容易崩溃
   // const i = await new Request(url);
   // const img = await i.loadImage();
   const img = await getImageByUrl('https://area.sinaapp.com/bingImg/', `ONE-oilprice-bg`, false)
   widget.backgroundImage = await shadowImage(img)
 }
 else {
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
 
 // if (config.runsInWidget) {
 //   const size = config.widgetFamily;
 //   const widget = await createWidget(size);
 
 //   Script.setWidget(widget);
 //   Script.complete();
 // } else {
 //   // choose any size for debugging
 //   // const size = 'small'
 
 
 //   const widget = await createWidget(size);
 
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
     let titleElement = titleStack.addText(`\u6bcf\u65e5\u6cb9\u4ef7·${data.newslist[0].prov}`);
     titleElement.textColor = Color.white();
     titleElement.font = Font.boldSystemFont(12);
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
       `${data.newslist[0].p89}`,
 
       leftColumn,
       previewSize
     );
     leftColumn.addSpacer();
     addItem(oilprice92IconPath,
       '',
       `${data.newslist[0].p92}`,
 
       leftColumn,
       previewSize
     );
 
     // right column
     addItem(
       oilprice95IconPath,
       '',
       `${data.newslist[0].p95}`,
 
       rightColumn,
       previewSize
     );
 
     rightColumn.addSpacer();
     // addItem(oilprice98Symbol.image, '', `${data.newslist[0].p98}`, '', rightColumn, size);
     addItem(
       oilprice98IconPath,
       '',
       `${data.newslist[0].p98}`,
 
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
     let titleElement = titleStack.addText(`\u6bcf\u65e5\u6cb9\u4ef7·${data.newslist[0].prov}`);
     titleElement.textColor = Color.white();
     titleElement.font = Font.boldSystemFont(16);
     titleElement.lineLimit = 1;
     // titleElement.url = widgeturl
     titleStack.addSpacer();
     widget.addSpacer();
 
     let contentStack = widget.addStack();
     contentStack.layoutHorizontally();
 
     contentStack.addSpacer();
 
     addItem(
       oilprice89IconPath,
       '',
       `${data.newslist[0].p89}`,
       contentStack,
       previewSize
     );
 
     contentStack.addSpacer(30);
 
     addItem(
       oilprice92IconPath,
       '',
       `${data.newslist[0].p92}`,
       contentStack,
       previewSize
     );
 
     contentStack.addSpacer(30);
 
     addItem(
       oilprice95IconPath,
       '',
       `${data.newslist[0].p95}`,
       contentStack,
       previewSize
     );
 
     contentStack.addSpacer(30);
 
     addItem(
       oilprice98IconPath,
       '',
       `${data.newslist[0].p98}`,
       contentStack,
       previewSize
     );
 
     contentStack.addSpacer(8);
     widget.addSpacer(6);
     let date = new Date();
     let lastRanDateAndTime = date.toLocaleString('chinese', { hour12: false })
     let lastRanText = widget.addText('↻' + '' + lastRanDateAndTime + "");
     lastRanText.textColor = Color.textColor;
     lastRanText.textOpacity = .7;
     lastRanText.font = Font.regularSystemFont(8)
     lastRanText.lineLimit = 1;
     lastRanText.rightAlignText();
 
   } else {
     const title = widget.addText(`\u8fd9\u4e2a\u5c3a\u5bf8\u5931\u8054\u4e86`);
     title.font = Font.boldRoundedSystemFont(20);
     title.textColor = colors.textColor;
     title.centerAlignText();
     // const url = "https://area.sinaapp.com/bingImg/"   //使用必应壁纸作为背景时，请注释下面
     // // const url = "http://p1.music.126.net/uarVFKgUlrI9Z1nr-50cAw==/109951162843608471.jpg"     //固定一张图片,这里我选用城南花已开的封面,图片不能太大，容易崩溃
     // const i = await new Request(url);
     // const img = await i.loadImage();
     // widget.backgroundImage = await shadowImage(img)
   }
   return widget;
 }
 
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
     wname.font = new Font("Chalkduster",20);
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
     wname.font = new Font("Chalkduster",22);
     wname.textColor = colors.textColor;
   }
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
 
 async function getImage(name) {
   let data = '';
   switch (name) {
     case '89':
       data =
         'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADeUlEQVRYR61Xy1XbUBC983wss4spAOFsEnkVUwGmgkAFcSqIqQCnAqCCkAoCFcRUgLPCyQYhCojZYfmgyRlJT3qW5CcbopVlvc+dO587Q6h4pm7zDKAvVd/i/5jH3sPioPj9T6fZiyL6AaCzci/gK8VH7/zFRNZQceHUbQ0BPrUckGAAvnaDcGSum+44ExA+1O0F0bV3P++XAIgFz2i0KYp+1hzySIwBNdgXS+46aM+j5gmg7tcA/8hKHVLEPS+Yn2UMJIc4NwBfAcoH4XAVCCYaURSdgnkmrvjtOhcMfALomMA9Jlrpgngv8wjM+0rxXgbApF4+aB9Vx4hzCeCjfGupcHseOX/TdTMvCLdt7Jn3iBtzALutsaCSzbUAjLWs1EHmMsO3q0Dcus6IgBMdR5UAvCAsBedSsLmOD2A3PmRDAFM3Zy9xWfpMDavWAMB6HzGOmCCpBzO6VzFg3hODzwC4zgzAG3lfGwDRNTOPNaUEfH8fhANrDBTdZwDQVt17QWgrJJi6TrK2AKCqNpTqTC2AmkC67Wx1KIruXgxAg08zyHRBZpWuUlVU3na2+mbUE7Of1IDq6lhiwAAgro4BpDX8Zp1AMgHEeUzU1+krQdX1n8b2OpC6L421MgPgcy9YDFfmscEAM38mQk8LV139SKttUrRSVxsAmmdg6nNDDW1akFkdcdt7CHtpTEyYeaiI+tod1QbwOYNmBAxaKuy99SG/8yelV3K6baNRcj9qqEnXf5KChFSMRlYJTw+UvVrEYiIqANQqoahZ0de1PUR6kcRJA8+zUj8QKxrzLkhd2SQ19jtoyIRLsx+IWeDWpQ7IKgZlb+qm/ZYK9zIXLEV2TSQbltYqXzkFzWaHjrN+wKSvLpU20YwigKISCoNxDBQFwpbLrwGQNy550SoBqBUio++rW1unA2Lo5gAKpdSWrusD2MCqTAkZv6QQ/R8AuVWPXhBai5ApxTbRqgKW7TXavsQFhr7bDq2q5RsxUOG+jQAUpfg1DOgAfjGAdbofk50l9oCs69IARFTaomiUNheV1EqZZh7I+GVKb9xPPMM6zjHRNYHbIlhSkrsPi4tMjITa+EWmHYi+r35iJQS39QH5RGUdSJMWIO6gqSMlWN+w3A/YJmKtZoWhdKmbqo3IcrNTnA1lZI4HjmoX5FPtkozvNAdE9M1+f3Wn9Q97DoCdFZZO4gAAAABJRU5ErkJggg==';
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
 
 async function fetchData() {
   const fetchCachePath = files.joinPath(files.documentsDirectory(), "oilprice-NK")
   var fetchData
   try {
   let wakeUrl = `https://api.tianapi.com/txapi/oilprice/index?key=${api_key}&prov=${encodeURI(prov)}`
   let wakeRequest = new Request(wakeUrl)
   wakeRequest.method = 'get'
   wakeRequest.headers = {
     'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
     "Accept": "*/*",
     'Content-Type': 'application/x-www-form-urlencoded'
   }
   fetchData = await wakeRequest.loadJSON()
   files.writeString(fetchCachePath, JSON.stringify(fetchData))
   }catch (e) {
     fetchData = JSON.parse(files.readString(fetchCachePath))
     log("[+]获取油价数据失败，使用缓存数据")
   }
   return fetchData
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
     console.log(`[+]欢迎使用：${versionData.author}制作小组件`);
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
   log('[+]最新版本：' + uC['ONE-oilprice'].version)
   let needUpdate = false
   if (uC['ONE-oilprice'].version != version) {
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
 
   } else {
     log("[+]当前版本已是最新")
   }
 
   return needUpdate
 }

/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
 *******************************************************
 ************ © 2021 Copyright Nicolas-kings ************/