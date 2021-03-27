// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: code;
/********************************************************
 * script     : ONE-oilprice.js
 * version    : 1.0.0
 * author     : Nicolas-kings
 * date       : 2020-12-20
 * desc       : 具体配置说明，详见微信公众号-曰(读yue)坛
 * github     : https://github.com/Nicolasking007/Scriptable
 *******************************************************/
/************************************************************
 ********************用户设置 *********************
 ************请在首次运行之前进行修改************
 ***********************************************************/
const filename = `${Script.name()}.jpg`
const files = FileManager.local()
const path = files.joinPath(files.documentsDirectory(), filename)
const changePicBg = true  //选择true时，使用透明背景 
const ImageMode = false   //选择true时，使用必应壁纸
const previewSize = "Medium"  //预览大小  Small/Medium
const colorMode = false // 是否使用纯色背景
const bgColor = new Color("000000") // 小组件背景色

//*********使用前准备工作*********//
const prov = '广东'  //输入要查询的省份 
const api_key = ''   //前往天行数据申请apikey https://www.tianapi.com/apiview/104

const size = previewSize
let data = await fetchData()
console.log(`\u6b22\u8fce\u4f7f\u7528\u6bcf\u65e5\u6cb9\u4ef7\u0026\u0023\u0031\u0038\u0033\u003b\u6765\u6e90\u4e8e\u516c\u4f17\u53f7\u0020\u002d\u0020\u66f0\u575b`)
function colorConfig() {
  // general
  const tintLogo = true; // 对logo着色
  const tintColor = new Color('#FC6D26');

  // dark mode
  const darkBackgroud = new Color('#1A1B1E');
  const darkText = new Color('#E3E3E3');

  // light mode
  const lightBackgroud = new Color('#FFFFFF');
  const lightText = new Color('#000000');
  
  return {
    bgColor: Color.dynamic(lightBackgroud, darkBackgroud),
    textColor: Color.dynamic(lightText, darkText),
    titlecolor: Color.dynamic(lightText, darkText),
    tintColor: tintColor,
    tintLogo: tintLogo,
  };
}


const padding = {
  top: 5,
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
  if (size == 'Small') {
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
    titleElement.textColor = Color.titlecolor;
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
      size
    );
    leftColumn.addSpacer();
    addItem(oilprice92IconPath,
      '',
      `${data.newslist[0].p92}`,

      leftColumn,
      size
    );

    // right column
    addItem(
      oilprice95IconPath,
      '',
      `${data.newslist[0].p95}`,

      rightColumn,
      size
    );

    rightColumn.addSpacer();
    // addItem(oilprice98Symbol.image, '', `${data.newslist[0].p98}`, '', rightColumn, size);
    addItem(
      oilprice98IconPath,
      '',
      `${data.newslist[0].p98}`,

      rightColumn,
      size
    );
  }
  // medium size
  else if (size == 'Medium') {
    // widget.setPadding(5, 5, 15, 0);
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
    titleElement.textColor = Color.titlecolor;
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
      size
    );

    contentStack.addSpacer(30);

    addItem(
      oilprice92IconPath,
      '',
      `${data.newslist[0].p92}`,
      contentStack,
      size
    );

    contentStack.addSpacer(30);

    addItem(
      oilprice95IconPath,
      '',
      `${data.newslist[0].p95}`,
      contentStack,
      size
    );

    contentStack.addSpacer(30);

    addItem(
      oilprice98IconPath,
      '',
      `${data.newslist[0].p98}`,
      contentStack,
      size
    );

    contentStack.addSpacer(8);
    widget.addSpacer(2);
    let date = new Date();
    let lastRanDateAndTime = date.toLocaleString('chinese', { hour12: false })
    let lastRanText = widget.addText('↻'+''+lastRanDateAndTime + "");
    lastRanText.textColor = Color.titlecolor;
    lastRanText.textOpacity = .7;
    lastRanText.font = Font.regularSystemFont(8)
    lastRanText.lineLimit = 1;
    lastRanText.rightAlignText();

  } else {
    const title = widget.addText(`\u8fd9\u4e2a\u5c3a\u5bf8\u5931\u8054\u4e86`);
    title.font = Font.boldRoundedSystemFont(20);
    title.textColor = colors.textColor;
    title.centerAlignText();
    const url = "https://area.sinaapp.com/bingImg/"   //使用必应壁纸作为背景时，请注释下面
    // const url = "http://p1.music.126.net/uarVFKgUlrI9Z1nr-50cAw==/109951162843608471.jpg"     //固定一张图片,这里我选用城南花已开的封面,图片不能太大，容易崩溃
    const i = await new Request(url);
    const img = await i.loadImage();
    widget.backgroundImage = await shadowImage(img)
  }
  return widget;
}

function addItem(img, description, count, stack, size) {
  const colors = colorConfig();
  // small size
  if (size == 'Small') {
    const line = stack.addStack();
    line.layoutVertically();
    // line.url = link;

    const wimg = line.addImage(img);
    wimg.imageSize = new Size(20, 20);
    wimg.tintColor = colors.tintColor;

    line.addSpacer(3);
    const wname = line.addText(count);
    wname.font = Font.boldSystemFont(20);
    wname.textColor = colors.textColor;
  }
  // medium size
  else if (size == 'Medium') {
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
    wname.font = Font.boldSystemFont(25);
    wname.textColor = colors.textColor;
  }
}

async function fetchData() {
  let wakeUrl = `https://api.tianapi.com/txapi/oilprice/index?key=${api_key}&prov=${encodeURI(prov)}`
  let wakeRequest = new Request(wakeUrl)
  wakeRequest.method = 'get'
  wakeRequest.headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    "Accept": "*/*",
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  return await wakeRequest.loadJSON()

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