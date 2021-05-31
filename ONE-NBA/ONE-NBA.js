// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: basketball-ball;
/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
 *******************************************************
 ************ © 2021 Copyright Nicolas-kings ************/
/********************************************************
 * script     : ONE-NBA.js
 * version    : 1.6
 * author     : thisisevanfox & Nicolas-kings
 * date       : 2021-05-09
 * github     : https://github.com/Nicolasking007/Scriptable
 * Changelog  :  v1.6 - 细节优化、适配中文比赛场地
 *               v1.5 - 优化背景图片缓存处理
                 v1.4 - 适配透明背景设置、图片背景高斯模糊等
                 v1.3 - 修复bug
                 v1.2 - 支持版本更新、脚本远程下载
                 v1.1 - api接口数据增加缓存，应对无网络情况下也能使用小组件
                 v1.0 - 首次发布
----------------------------------------------- */

const filename = `${Script.name()}.jpg`
const files = FileManager.local()
const path = files.joinPath(files.documentsDirectory(), filename)
const changePicBg = false  //选择false/true时，决定是否使用透明背景 
const ImageMode = true   //选择false/true时，决定是否使用必应壁纸
const previewSize = (config.runsInWidget ? config.widgetFamily : "medium");// medium、small、large 预览大小
const colorMode = false // 选择false/true时，是否是纯色背景
const bgColor = new Color("000000") // 小组件背景色
const blurStyle = "light" // 高斯样式：light/dark


/************************************************************
 ********************用户设置 *********************
 ************请在首次运行之前进行修改************
 ***********************************************************/
const MY_NBA_TEAM = "LAL"; ///在此处输入你喜欢的NBA球队的缩写。 具体配置 详见公众号内推文---曰坛


const padding = {
  top: 10,
  left: 10,
  bottom: 10,
  right: 10
}
const versionData = await getversion()
let needUpdated = await updateCheck(1.6)
const DARK_MODE = Device.isUsingDarkAppearance();


//指示是否应显示实时得分。
//如果您不想被破坏，请将其设置为false。
//默认值：true 

const SHOW_LIVE_SCORES = true;

//指示是否应显示所有分数和统计数据。
//如果您不想被破坏，请将其设置为false。
//默认值：true 
const SHOW_STATS_AND_STANDINGS = true;

//当前季节的开始年份
//对于2020-21赛季，该值必须为“ 2020”
//对于2021-22赛季，该值必须为“ 2021”
const CURRENT_SEASON_START_YEAR = "2020";

//分享应用的网址
//默认值：“ https://m.china.nba.com”
//如果您不想打开任何内容，请输入：
//const WIDGET_URL =“”; 
const WIDGET_URL = "https://m.china.nba.com";
//设置小部件的外观。默认外观设置为系统配色方案。
//Device.isUsingDarkAppearance（）=系统配色方案（默认）
//true =窗口小部件将处于黑暗模式。
//false =窗口小部件将处于亮灯模式。

/*
****************************************************************************
* 这里是图片逻辑，不用修改
****************************************************************************/
const widget = await createWidget()
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
  // const url = hotcommentsData.data.picurl   //使用歌曲封面作为背景，，请注释上面
  // const url = "http://p1.music.126.net/uarVFKgUlrI9Z1nr-50cAw==/109951162843608471.jpg"     //固定一张图片,这里我选用城南花已开的封面,图片不能太大，容易崩溃
  // const i = await new Request(url);
  // const bgImgs = await i.loadImage();
  const bgImgs = await getImageByUrl('https://area.sinaapp.com/bingImg/', `ONE-NBA-bg`,false)
  bgImg = await blurImage(bgImgs, blurStyle, 100)
  widget.backgroundImage = bgImg
  // widget.backgroundImage = await shadowImage(img)
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


async function createWidget() {
  const widget = new ListWidget();
  if (previewSize === "small") {
    await addSmallWidgetData(widget);
    widget.url = WIDGET_URL;
  }
  else if (previewSize == "medium") {
    await addMediumWidgetData(widget);
    widget.url = WIDGET_URL;
  } else {
    const title = widget.addText(`\u8fd9\u4e2a\u5c3a\u5bf8\u5931\u8054\u4e86`);
    const oHeadingStack = widget.addStack();
    oHeadingStack.layoutVertically();
    oHeadingStack.setPadding(7, 7, 7, 7);
    const oHeadingText = oHeadingStack.addText(
      `\u5f53\u524d\u4e0d\u652f\u6301\u5927\u5c3a\u5bf8\u5c0f\u7ec4\u4ef6\u3002\u4ec5\u652f\u6301\u4e2d\u5c0f\u5c3a\u5bf8\u5c0f\u7ec4\u4ef6\u3002\u4e0d\u77e5\u9053\u5982\u4f55\u4f7f\u7528\uff1f\u5355\u51fb\u5c0f\u7ec4\u4ef6\u4ee5\u9605\u8bfb\u5b89\u88c5\u8bf4\u660e .`
    );
    oHeadingText.font = Font.systemFont(16);
    oHeadingText.textColor = Color.white();
    title.centerAlignText();
    widget.url = "https://mp.weixin.qq.com/s/xwa4P39JQzjFO6SCqBX_fQ";
  }

  return widget;

}


const WIDGET_BACKGROUND = DARK_MODE ? new Color("#ff7f00") : new Color("#FFFFFF");
const STACK_BACKGROUND = DARK_MODE
  ? new Color("#1D1D1D")
  : new Color("#FFFFFF"); //Smaller Container Background

/**
 * Add data to small sized widget.
 *
 * @param {ListWidget} widget
 */
async function addSmallWidgetData(widget) {
  const oGameData = await prepareData();

  if (oGameData != null) {
    const oTeamData = getTeamData();
    const sMyTeam = oTeamData[MY_NBA_TEAM].abbreviation;
    let oMyTeam;
    let oOpponentTeam;
    if (oGameData.homeTeam.abbreviation == sMyTeam) {
      oMyTeam = oGameData.homeTeam;
      oOpponentTeam = oGameData.awayTeam;
    } else {
      oOpponentTeam = oGameData.homeTeam;
      oMyTeam = oGameData.awayTeam;
    }

    const oUpperStack = widget.addStack();
    oUpperStack.layoutHorizontally();

    const oUpperTextStack = oUpperStack.addStack();
    oUpperTextStack.layoutVertically();

    const dGameDate = new Date(oGameData.gameDate);
    const dLocalDate = dGameDate.toLocaleString([], {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const oGameDateText = oUpperTextStack.addText(
      `NBA赛事资讯`
    );
    oGameDateText.font = Font.boldSystemFont(12);
    oGameDateText.textColor = getColorForCurrentAppearance();
    const oGameTimeText = oUpperTextStack.addText(
      `${dLocalDate.split(",")[0]}`
    );
    oGameTimeText.font = Font.boldSystemFont(9);
    oGameTimeText.textColor = getColorForCurrentAppearance();
    const oVenueText = oUpperTextStack.addText(`📍 ${oGameData.venue}`);
    oVenueText.font = Font.boldSystemFont(9);
    oVenueText.textColor = getColorForCurrentAppearance();

    oUpperStack.addSpacer();

    const oOpponentLogoImage = await loadLogo(
      oOpponentTeam.logoLink,
      oOpponentTeam.abbreviation
    );
    const oOpponentLogo = oUpperStack.addImage(oOpponentLogoImage);
    oOpponentLogo.imageSize = new Size(25, 25);

    if (SHOW_STATS_AND_STANDINGS) {
      widget.addSpacer(4);

      const oOpponentTeamStatsText = widget.addText(
        "胜: " +
        oOpponentTeam.record.wins +
        " - 负: " +
        oOpponentTeam.record.losses
      );
      oOpponentTeamStatsText.font = Font.systemFont(9);
      oOpponentTeamStatsText.textColor = getColorForCurrentAppearance();

      const oOpponentTeamStandingsText = widget.addText(
        "联盟: " +
        oOpponentTeam.record.confRank +
        "." +
        " | 分区: " +
        oOpponentTeam.record.divRank +
        "."
      );
      oOpponentTeamStandingsText.font = Font.systemFont(9);
      oOpponentTeamStandingsText.textColor = getColorForCurrentAppearance();

      if (oOpponentTeam.topscorer.name != null) {
        const oOpponentTeamTopScorerText = widget.addText(
          `${oOpponentTeam.topscorer.name} (${oOpponentTeam.topscorer.value})`
        );
        oOpponentTeamTopScorerText.font = Font.systemFont(9);
        oOpponentTeamTopScorerText.textColor = getColorForCurrentAppearance();
      }
    }

    if (SHOW_STATS_AND_STANDINGS) {
      const oDivider = widget.addText(`___________________________`);
      oDivider.font = Font.boldSystemFont(6);
      oDivider.textColor = getColorForCurrentAppearance();

      widget.addSpacer(6);

      const oBottomStack = widget.addStack();
      oBottomStack.layoutHorizontally();

      const oBottomTextStack = oBottomStack.addStack();
      oBottomTextStack.layoutVertically();

      const oMyTeamStatsText = oBottomTextStack.addText(
        "胜: " + oMyTeam.record.wins + " - 负: " + oMyTeam.record.losses
      );
      oMyTeamStatsText.font = Font.systemFont(9);
      oMyTeamStatsText.textColor = getColorForCurrentAppearance();

      const oMyTeamStandingsText = oBottomTextStack.addText(
        "联盟: " +
        oMyTeam.record.confRank +
        "." +
        " | 分区: " +
        oMyTeam.record.divRank +
        "."
      );
      oMyTeamStandingsText.font = Font.systemFont(9);
      oMyTeamStandingsText.textColor = getColorForCurrentAppearance();

      if (oMyTeam.topscorer.name != null) {
        const oMyTeamTopScorerText = oBottomTextStack.addText(
          `${oMyTeam.topscorer.name} (${oMyTeam.topscorer.value})`
        );
        oMyTeamTopScorerText.font = Font.systemFont(9);
        oMyTeamTopScorerText.textColor = getColorForCurrentAppearance();
      }

      oBottomStack.addSpacer();

      const oMyTeamLogoImage = await loadLogo(
        oMyTeam.logoLink,
        oMyTeam.abbreviation
      );
      const oMyTeamLogo = oBottomStack.addImage(oMyTeamLogoImage);
      oMyTeamLogo.imageSize = new Size(25, 25);
    }
  } else {
    const oHeadingText = widget.addText(`没有即将举行的比赛——赛季结束.`);
    oHeadingText.font = Font.boldSystemFont(11);
    oHeadingText.textColor = getColorForCurrentAppearance();

    widget.addSpacer();
  }
}

/**
 * Add data to medium sized widget.
 *
 * @param {ListWidget} widget
 */
async function addMediumWidgetData(widget) {
  const oGameData = await prepareData();

  const oTopRow = widget.addStack();
  // await setStackBackground(oTopRow);
  oTopRow.cornerRadius = 12;
  oTopRow.size = new Size(308, 15);
  oTopRow.setPadding(7, 7, 7, 7);
  oTopRow.layoutVertically();

  const oSpacerStack1 = oTopRow.addStack();
  oSpacerStack1.layoutHorizontally();
  oSpacerStack1.addSpacer();

  if (oGameData != null) {
    const oHeadingStack = oTopRow.addStack();
    oHeadingStack.layoutHorizontally();
    oHeadingStack.addSpacer();
    oHeadingStack.setPadding(7, 7, 7, 7);

    let oHeadingText;
    if (
      oGameData.gameStatus != undefined &&
      oGameData.gameStatus != "" &&
      oGameData.homeTeam.liveScore != "-" &&
      SHOW_LIVE_SCORES
    ) {
      oHeadingText = oHeadingStack.addText(`${oGameData.gameStatus}`);
    } else {
      const dGameDate = new Date(oGameData.gameDate);
      const dLocalDate = dGameDate.toLocaleString([], {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      oHeadingText = oHeadingStack.addText(
        `${dLocalDate} · 📍${oGameData.venue}`
      );
    }
    oHeadingText.font = Font.boldSystemFont(11);
    oHeadingText.textColor = getColorForCurrentAppearance();

    oHeadingStack.addSpacer();

    const oSpacerStack2 = oTopRow.addStack();
    oSpacerStack2.layoutHorizontally();
    oSpacerStack2.addSpacer();

    widget.addSpacer();

    const oNextGameStack = widget.addStack();
    oNextGameStack.layoutHorizontally();
    oNextGameStack.cornerRadius = 12;

    const oHomeTeamStack = oNextGameStack.addStack();
    oHomeTeamStack.layoutVertically();
    oHomeTeamStack.centerAlignContent();
    oHomeTeamStack.setPadding(7, 7, 7, 7);
    // await setStackBackground(oHomeTeamStack);
    oHomeTeamStack.cornerRadius = 12;
    oHomeTeamStack.size = new Size(150, 0);

    const oHomeTeamLogoStack = oHomeTeamStack.addStack();
    oHomeTeamLogoStack.layoutHorizontally();

    const oHomeLogoImage = await loadLogo(
      oGameData.homeTeam.logoLink,
      oGameData.homeTeam.abbreviation
    );
    const oHomeLogo = oHomeTeamLogoStack.addImage(oHomeLogoImage);
    oHomeLogo.imageSize = new Size(40, 40);

    if (SHOW_LIVE_SCORES) {
      const iHomeTeamLiveScore = oGameData.homeTeam.liveScore;
      const iHomeTeamLiveScoreSpacer =
        iHomeTeamLiveScore < 99 || iHomeTeamLiveScore === "-" ? 45 : 25;
      oHomeTeamLogoStack.addSpacer(iHomeTeamLiveScoreSpacer);
      const oHomeTeamGoalsText = oHomeTeamLogoStack.addText(
        `${iHomeTeamLiveScore}`
      );
      oHomeTeamGoalsText.font = Font.boldSystemFont(35);
      oHomeTeamGoalsText.textColor = getColorForCurrentAppearance();
    }

    if (SHOW_STATS_AND_STANDINGS) {
      const oHomeTeamStatsText = oHomeTeamStack.addText(
        "胜: " +
        oGameData.homeTeam.record.wins +
        " - 负: " +
        oGameData.homeTeam.record.losses
      );
      oHomeTeamStatsText.font = Font.systemFont(11);
      oHomeTeamStatsText.textColor = getColorForCurrentAppearance();

      const oHomeTeamStandingsText = oHomeTeamStack.addText(
        "联盟排名: " +
        oGameData.homeTeam.record.confRank +
        "." +
        " | 分区排名: " +
        oGameData.homeTeam.record.divRank +
        "."
      );
      oHomeTeamStandingsText.font = Font.systemFont(9);
      oHomeTeamStandingsText.textColor = getColorForCurrentAppearance();

      if (oGameData.homeTeam.topscorer.name != null) {
        const oHomeTeamTopScorerText = oHomeTeamStack.addText(
          `${oGameData.homeTeam.topscorer.name} (${oGameData.homeTeam.topscorer.value})`
        );
        oHomeTeamTopScorerText.centerAlignText();
        oHomeTeamTopScorerText.font = Font.systemFont(9);
        oHomeTeamTopScorerText.textColor = getColorForCurrentAppearance();
      }
    }
    oNextGameStack.addSpacer();

    const oAwayTeamStack = oNextGameStack.addStack();
    oAwayTeamStack.layoutVertically();
    oAwayTeamStack.centerAlignContent();
    oAwayTeamStack.setPadding(7, 7, 7, 7);
    // await setStackBackground(oAwayTeamStack);
    oAwayTeamStack.cornerRadius = 12;
    oAwayTeamStack.size = new Size(150, 0);

    const oAwayTeamLogoStack = oAwayTeamStack.addStack();
    oAwayTeamLogoStack.layoutHorizontally();

    const oAwayLogoImage = await loadLogo(
      oGameData.awayTeam.logoLink,
      oGameData.awayTeam.abbreviation
    );
    const oAwayLogo = oAwayTeamLogoStack.addImage(oAwayLogoImage);
    oAwayLogo.imageSize = new Size(40, 40);

    if (SHOW_LIVE_SCORES) {
      const iAwayTeamLiveScore = oGameData.awayTeam.liveScore;
      const iSpacer =
        iAwayTeamLiveScore < 99 || iAwayTeamLiveScore === "-" ? 25 : 5;
      oAwayTeamLogoStack.addSpacer(iSpacer);

      const oAwayTeamGoalsText = oAwayTeamLogoStack.addText(
        `${iAwayTeamLiveScore}`
      );
      oAwayTeamGoalsText.font = Font.boldSystemFont(35);
      oAwayTeamGoalsText.textColor = getColorForCurrentAppearance();
    }

    if (SHOW_STATS_AND_STANDINGS) {
      const oAwayTeamStatsText = oAwayTeamStack.addText(
        "胜: " +
        oGameData.awayTeam.record.wins +
        " - 负: " +
        oGameData.awayTeam.record.losses
      );
      oAwayTeamStatsText.font = Font.systemFont(11);
      oAwayTeamStatsText.textColor = getColorForCurrentAppearance();

      const oAwayTeamStandingsText = oAwayTeamStack.addText(
        "联盟排名: " +
        oGameData.awayTeam.record.confRank +
        "." +
        " | 分区排名: " +
        oGameData.awayTeam.record.divRank +
        "."
      );
      oAwayTeamStandingsText.font = Font.systemFont(9);
      oAwayTeamStandingsText.textColor = getColorForCurrentAppearance();

      if (oGameData.awayTeam.topscorer.name != null) {
        const oAwayTeamTopScorerText = oAwayTeamStack.addText(
          `${oGameData.awayTeam.topscorer.name} (${oGameData.awayTeam.topscorer.value})`
        );
        oAwayTeamTopScorerText.font = Font.systemFont(9);
        oAwayTeamTopScorerText.textColor = getColorForCurrentAppearance();
      }
    }

    widget.addSpacer();

    const oFutureGamesStack = widget.addStack();
    oFutureGamesStack.layoutHorizontally();
    oFutureGamesStack.centerAlignContent();
    // await setStackBackground(oFutureGamesStack);
    oFutureGamesStack.cornerRadius = 12;
    oFutureGamesStack.setPadding(3, 7, 3, 7);
    oFutureGamesStack.addSpacer();
    oFutureGamesStack.size = new Size(308, 0);

    for (let i = 0; i < oGameData.nextGames.length; i++) {
      const oNextGame = oGameData.nextGames[i];

      const oFutureGame = oFutureGamesStack.addStack();
      oFutureGame.layoutHorizontally();
      oFutureGame.addSpacer();

      const oFutureGameLogoImage = await loadLogo(
        oNextGame.opponent.logoLink,
        oNextGame.opponent.abbreviation
      );
      const oNextGameLogo = oFutureGame.addImage(oFutureGameLogoImage);
      oNextGameLogo.imageSize = new Size(15, 15);

      const dGameDate = new Date(oNextGame.gameDate);
      const dLocalDate = dGameDate.toLocaleString([], {
        month: "numeric",
        day: "numeric",
      });
      const oNextGameText = oFutureGame.addText(` ${dLocalDate}`);
      oNextGameText.font = Font.systemFont(11);
      oNextGameText.textColor = getColorForCurrentAppearance();

      oFutureGame.addSpacer();
    }

    oFutureGamesStack.addSpacer();
  } else {
    const oHeadingStack = oTopRow.addStack();
    oHeadingStack.layoutHorizontally();
    oHeadingStack.addSpacer();
    oHeadingStack.setPadding(7, 7, 7, 7);

    const oHeadingText = oHeadingStack.addText(
      `没有即将举行的比赛——赛季结束`
    );
    oHeadingText.font = Font.boldSystemFont(11);
    oHeadingText.textColor = getColorForCurrentAppearance();

    oHeadingStack.addSpacer();

    const oSpacerStack2 = oTopRow.addStack();
    oSpacerStack2.layoutHorizontally();
    oSpacerStack2.addSpacer();

    widget.addSpacer();
  }
}

/**
 * Prepares data.
 *
 * @return {Object[]}
 */
async function prepareData() {
  const oData = {
    gameDate: "",
    gameStatus: "",
    venue: "",
    nextGames: [],
    homeTeam: {
      abbreviation: "",
      logoLink: "",
      record: {
        wins: "",
        losses: "",
        confRank: "",
        divRank: "",
      },
      liveScore: "",
      topscorer: {
        name: null,
        value: "",
      },
    },
    awayTeam: {
      abbreviation: "",
      logoLink: "",
      record: { wins: "", losses: "", confRank: "", divRank: "" },
      liveScore: "",
      topscorer: {
        name: null,
        value: "",
      },
    },
  };

  const oTeamData = getTeamData();
  let aScheduleData = await fetchScheduleData(oTeamData);

  if (aScheduleData && aScheduleData.length > 0) {
    const oNextGame = aScheduleData[0];
    const aAllPlayers = await fetchPlayers();

    if (oNextGame != undefined) {
      const aStandings = await fetchStandings();
      const oHomeTeam = filterTeamDataById(oNextGame.h.tid, oTeamData);
      const oHomeTeamStandings = filterStandingsById(
        oNextGame.h.tid,
        aStandings
      );
      const oHomeTeamTopScorer = await fetchTopScorer(oHomeTeam, aAllPlayers);

      const oAwayTeam = filterTeamDataById(oNextGame.v.tid, oTeamData);
      const oAwayTeamStandings = filterStandingsById(
        oNextGame.v.tid,
        aStandings
      );
      const oAwayTeamTopScorer = await fetchTopScorer(oAwayTeam, aAllPlayers);

      oData.gameDate = oNextGame.utctm;
      oData.venue = oHomeTeam.location;
      oData.nextGames = getNextGames(aScheduleData, oTeamData);
      oData.homeTeam.abbreviation = oHomeTeam.abbreviation;
      oData.homeTeam.logoLink = oHomeTeam.logo;
      oData.homeTeam.record = {
        wins: oHomeTeamStandings.win,
        losses: oHomeTeamStandings.loss,
        confRank: oHomeTeamStandings.confRank,
        divRank: oHomeTeamStandings.divRank,
      };
      oData.awayTeam.abbreviation = oAwayTeam.abbreviation;
      oData.awayTeam.logoLink = oAwayTeam.logo;
      oData.awayTeam.record = {
        wins: oAwayTeamStandings.win,
        losses: oAwayTeamStandings.loss,
        confRank: oAwayTeamStandings.confRank,
        divRank: oAwayTeamStandings.divRank,
      };
      if (oHomeTeamTopScorer.name != null) {
        oData.homeTeam.topscorer.name = oHomeTeamTopScorer.name;
        oData.homeTeam.topscorer.value = oHomeTeamTopScorer.value;
      }
      if (oAwayTeamTopScorer.name != null) {
        oData.awayTeam.topscorer.name = oAwayTeamTopScorer.name;
        oData.awayTeam.topscorer.value = oAwayTeamTopScorer.value;
      }

      if (SHOW_LIVE_SCORES) {
        const oLiveData = await fetchLiveData(oNextGame.gid, oNextGame.etm);
        oData.homeTeam.liveScore = oLiveData.homeTeamScore;
        oData.awayTeam.liveScore = oLiveData.awayTeamScore;
        oData.gameStatus = oLiveData.statusText;
      }
    }
  } else {
    return null;
  }

  return oData;
}

/**
 * Filters team data by its id.
 *
 * @param {String} sTeamId
 * @param {Object} oTeamData
 * @return {Object}
 */
function filterTeamDataById(sTeamId, oTeamData) {
  for (let key in oTeamData) {
    if (oTeamData[key].id == sTeamId) {
      return oTeamData[key];
    }
  }

  return {};
}

/**
 * 按团队ID进行排名.
 *
 * @param {String} sTeamId
 * @param {Object[]} aStandings
 * @return {Object[]}
 */
function filterStandingsById(sTeamId, aStandings) {
  return aStandings.filter((standing) => sTeamId == standing.teamId)[0];
}

/**
 * 下一场比赛数据.
 *
 * @param {Object[]} aGames
 * @param {Object} oTeamData
 * @return {Object[]}
 */
function getNextGames(aGames, oTeamData) {
  const sMyTeamId = oTeamData[MY_NBA_TEAM].id;
  const aNextGames = [];
  const iLength = aGames.length < 5 ? aGames.length : 5;

  for (let i = 1; i < iLength; i++) {
    let oData = {
      gameDate: "",
      opponent: {
        abbreviation: "",
        logoLink: "",
      },
    };

    const oGame = aGames[i];
    oData.gameDate = oGame.etm;

    if (oGame.h.tid == sMyTeamId) {
      const oAwayTeam = filterTeamDataById(oGame.v.tid, oTeamData);
      oData.opponent.abbreviation = oAwayTeam.abbreviation;
      oData.opponent.logoLink = oAwayTeam.logo;
    } else {
      const oHomeTeam = filterTeamDataById(oGame.h.tid, oTeamData);
      oData.opponent.abbreviation = oHomeTeam.abbreviation;
      oData.opponent.logoLink = oHomeTeam.logo;
    }

    aNextGames.push(oData);
  }

  return aNextGames;
}

/**
 * 从NBA API获取时间表数据.
 *
 * @param {Object} oTeamData
 * @return {Object[]}
 */
async function fetchScheduleData(oTeamData) {
  const sMyTeam = oTeamData[MY_NBA_TEAM].simpleName.toLowerCase();
  const sCurrentSeasonStartYear = CURRENT_SEASON_START_YEAR;
  const sUrl = `https://data.nba.com/data/v2015/json/mobile_teams/nba/${sCurrentSeasonStartYear}/teams/${sMyTeam}_schedule.json`;
  const oRequest = new Request(sUrl);
  const oResponse = await oRequest.loadJSON();

  if (oResponse) {
    const dStartDate = new Date();

    // Games in Europe are after midnight, so subtract 6 hours
    dStartDate.setHours(dStartDate.getHours() - 6);

    const aAllGames = oResponse.gscd.g;
    const aNextGames = aAllGames.filter((game) => {
      const dDate = new Date(game.gdte);

      if (
        new Date(dDate.toDateString()) >= new Date(dStartDate.toDateString())
      ) {
        game.utctm = game.gdtutc + "T" + game.utctm + ":00Z";
        return game;
      }
    });
    return aNextGames;
  }

  return [];
}

/**
 *从NBA API获取所有球员数据.
 *
 * @return {Object[]}
 */
async function fetchPlayers() {
  const sCurrentSeasonStartYear = CURRENT_SEASON_START_YEAR;
  const sUrl = `http://data.nba.net/data/10s/prod/v1/${sCurrentSeasonStartYear}/players.json`;
  const oRequest = new Request(sUrl);
  const oResponse = await oRequest.loadJSON();
  return oResponse.league.standard;
}

/**
 * 从NBA API获取当前的排名数据.
 *
 * @return {Object[]}
 */
async function fetchStandings() {
  const sUrl = `http://data.nba.net/data/10s/prod/v1/current/standings_all.json`;
  const oRequest = new Request(sUrl);
  const oResponse = await oRequest.loadJSON();
  return oResponse.league.standard.teams;
}

/**
 * 从NBA API获取最高得分手数据.
 *
 * @param {string} sTeamId
 * @return {Object}
 */
async function fetchTopScorer(oTeamData, aAllPlayers) {
  const sCurrentSeasonStartYear = CURRENT_SEASON_START_YEAR;
  const sUrl = `https://data.nba.net/data/10s/prod/v1/${sCurrentSeasonStartYear}/teams/${oTeamData.shortName}/leaders.json`;
  const oRequest = new Request(sUrl);
  const oTopScorers = await oRequest.loadJSON();

  let oResult = {
    name: null,
    value: "",
  };
  if (oTopScorers) {
    const oTopScorer = oTopScorers.league.standard.ppg[0];
    const sPlayerId = oTopScorer.personId;
    const oPlayer = aAllPlayers.filter(
      (player) => player.personId == sPlayerId
    )[0];

    oResult.name = `${oPlayer.firstName} ${oPlayer.lastName}`;
    oResult.value = oTopScorer.value;
  }

  return oResult;
}

/**
 * 从NBA API获取实时排名数据.
 *
 * @param {string} sGameId
 * @return {Object}
 */
async function fetchLiveData(sGameId, sDate) {
  const sUrl = `https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json`;
  const oRequest = new Request(sUrl);
  const oLiveData = await oRequest.loadJSON();
  if (oLiveData !== undefined) {
    const aGamesToday = oLiveData.scoreboard.games;
    const oGameToday = aGamesToday.filter((game) => game.gameId == sGameId);
    if (oGameToday.length > 0) {
      const oGame = oGameToday[0];
      return {
        statusText: oGame.gameStatusText,
        homeTeamScore:
          oGame.period === 0 ? "-" : calculateScore(oGame.homeTeam.periods),
        awayTeamScore:
          oGame.period === 0 ? "-" : calculateScore(oGame.awayTeam.periods),
      };
    }
  }

  return {
    statusText: null,
    homeTeamScore: "***",
    awayTeamScore: "***",
  };
}

/**
 * Calculates score for live data.
 *
 * @param {Object[]} aPeriodScores
 * @return {Number}
 */
function calculateScore(aPeriodScores) {
  let iResultScore = 0;
  aPeriodScores.forEach(
    (oPeriodScore) => (iResultScore += parseInt(oPeriodScore.score))
  );
  return iResultScore;
}

/**
 * Loads image from thesportsdb.com or from local cache.
 *
 * @param {String} sImageUrl
 * @param {String} sTeamAbbreviation
 * @return {Object}
 */
async function loadLogo(sImageUrl, sTeamAbbreviation) {
  // 设置文件管理器.
  const oFiles = FileManager.local();

  // 设置缓存
  const sCachePath = oFiles.joinPath(
    oFiles.cacheDirectory(),
    sTeamAbbreviation + "_NBA"
  );
  const bCacheExists = oFiles.fileExists(sCachePath);

  let oResult;
  try {
    if (bCacheExists) {
      oResult = oFiles.readImage(sCachePath);
    } else {
      const oRequest = new Request(sImageUrl);
      oResult = await oRequest.loadImage();
      try {
        oFiles.writeImage(sCachePath, oResult);
        console.log("缓存logo " + sTeamAbbreviation);
      } catch (e) {
        console.log(e);
      }
    }
  } catch (oError) {
    console.error(oError);
    if (bCacheExists) {
      oResult = oFiles.readImage(sCachePath);
    } else {
      console.log("获取logo缓存 " + sTeamAbbreviation + " 失败.");
    }
  }

  return oResult;
}

/**
 * 设置堆栈的背景.
 *
 * @param {String} oStack
 */
async function setStackBackground(oStack) {
  if (
    NO_BACKGROUND_INSTALLED &&
    NO_BACKGROUND_ACTIVE &&
    NO_BACKGROUND_FULL_ACTIVE
  ) {
    oStack.backgroundImage = await transparent(Script.name());
  } else {
    oStack.backgroundColor = STACK_BACKGROUND;
  }
}

/**
 * 返回颜色对象，具体取决于是否启用了暗模式.
 *
 * @return {Object}
 */
function getColorForCurrentAppearance() {
  return DARK_MODE ? Color.white() : Color.white();
}

/**
 * 当未安装no-background.js时的占位符功能.
 *
 * @return {Object}
 */
function emptyFunction() {

  return {};
}

/**
 * Returns static team data.
 *
 * @return {Object}
 */
function getTeamData() {
  return {
    ATL: {
      id: 1610612737,
      abbreviation: "ATL",
      teamName: "Atlanta Hawks",
      simpleName: "Hawks",
      shortName: "hawks",
      location: "菲利浦体育馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/cfcn1w1503741986.png/preview",
    },
    BOS: {
      id: 1610612738,
      abbreviation: "BOS",
      teamName: "Boston Celtics",
      simpleName: "Celtics",
      shortName: "celtics",
      location: "TD北岸花园球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/051sjd1537102179.png/preview",
    },
    BKN: {
      id: 1610612751,
      abbreviation: "BKN",
      teamName: "Brooklyn Nets",
      simpleName: "Nets",
      shortName: "nets",
      location: "巴克莱中心",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/h0dwny1600552068.png/preview",
    },
    CHA: {
      id: 1610612766,
      abbreviation: "CHA",
      teamName: "Charlotte Hornets",
      simpleName: "Hornets",
      shortName: "hornets",
      location: "时代华纳中心球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/xqtvvp1422380623.png/preview",
    },
    CHI: {
      id: 1610612741,
      abbreviation: "CHI",
      teamName: "Chicago Bulls",
      simpleName: "Bulls",
      shortName: "bulls",
      location: "联合中心球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/yk7swg1547214677.png/preview",
    },
    CLE: {
      id: 1610612739,
      abbreviation: "CLE",
      teamName: "Cleveland Cavaliers",
      simpleName: "Cavaliers",
      shortName: "cavaliers",
      location: "速贷球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/a2pp4c1503741152.png/preview",
    },
    DAL: {
      id: 1610612742,
      abbreviation: "DAL",
      teamName: "Dallas Mavericks",
      simpleName: "Mavericks",
      shortName: "mavericks",
      location: "美国航线中心",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/yqrxrs1420568796.png/preview",
    },
    DEN: {
      id: 1610612743,
      abbreviation: "DEN",
      teamName: "Denver Nuggets",
      simpleName: "Nuggets",
      shortName: "nuggets",
      location: "丹佛百事中心",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/8o8j5k1546016274.png/preview",
    },
    DET: {
      id: 1610612765,
      abbreviation: "DET",
      teamName: "Detroit Pistons",
      simpleName: "Pistons",
      shortName: "pistons",
      location: "奥本山宫殿球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/12612u1511101660.png/preview",
    },
    GSW: {
      id: 1610612744,
      abbreviation: "GSW",
      teamName: "Golden State Warriors",
      simpleName: "Warriors",
      shortName: "warriors",
      location: "奥克兰体育馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/irobi61565197527.png/preview",
    },
    HOU: {
      id: 1610612745,
      abbreviation: "HOU",
      teamName: "Houston Rockets",
      simpleName: "Rockets",
      shortName: "rockets",
      location: "丰田中心球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/yezpho1597486052.png/preview",
    },
    IND: {
      id: 1610612754,
      abbreviation: "IND",
      teamName: "Indiana Pacers",
      simpleName: "Pacers",
      shortName: "pacers",
      location: "银行家生活球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/v6jzgm1503741821.png/preview",
    },
    LAC: {
      id: 1610612746,
      abbreviation: "LAC",
      teamName: "Los Angeles Clippers",
      simpleName: "Clippers",
      shortName: "clippers",
      location: "斯台普斯中心",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/jv7tf21545916958.png/preview",
    },
    LAL: {
      id: 1610612747,
      abbreviation: "LAL",
      teamName: "Los Angeles Lakers",
      simpleName: "Lakers",
      shortName: "lakers",
      location: "斯台普斯中心",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/44ubym1511102073.png/preview",
    },
    MEM: {
      id: 1610612763,
      abbreviation: "MEM",
      teamName: "Memphis Grizzlies",
      simpleName: "Grizzlies",
      shortName: "grizzlies",
      location: "联邦快递球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/m64v461565196789.png/preview",
    },
    MIA: {
      id: 1610612748,
      abbreviation: "MIA",
      teamName: "Miami Heat",
      simpleName: "Heat",
      shortName: "heat",
      location: "美航球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/5v67x51547214763.png/preview",
    },
    MIL: {
      id: 1610612749,
      abbreviation: "MIL",
      teamName: "Milwaukee Bucks",
      simpleName: "Bucks",
      shortName: "bucks",
      location: "布拉德利中心",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/qgyz6z1503742649.png/preview",
    },
    MIN: {
      id: 1610612750,
      abbreviation: "MIN",
      teamName: "Minnesota Timberwolves",
      simpleName: "Timberwolves",
      shortName: "timberwolves",
      location: "标靶中心球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/b6a05s1503742837.png/preview",
    },
    NOP: {
      id: 1610612740,
      abbreviation: "NOP",
      teamName: "New Orleans Pelicans",
      simpleName: "Pelicans",
      shortName: "pelicans",
      location: "新奥尔良球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/f341s31523700397.png/preview",
    },
    NYK: {
      id: 1610612752,
      abbreviation: "NYK",
      teamName: "New York Knicks",
      simpleName: "Knicks",
      shortName: "knicks",
      location: "麦迪逊广场花园",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/wyhpuf1511810435.png/preview",
    },
    OKC: {
      id: 1610612760,
      abbreviation: "OKC",
      teamName: "Oklahoma City Thunder",
      simpleName: "Thunder",
      shortName: "thunder",
      location: "切萨皮克能源球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/xpswpq1422575434.png/preview",
    },
    ORL: {
      id: 1610612753,
      abbreviation: "ORL",
      teamName: "Orlando Magic",
      simpleName: "Magic",
      shortName: "magic",
      location: "安利中心",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/txuyrr1422492990.png/preview",
    },
    PHI: {
      id: 1610612755,
      abbreviation: "PHI",
      teamName: "Philadelphia 76ers",
      simpleName: "76ers",
      shortName: "sixers",
      location: "瓦乔维亚中心球场",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/71545f1518464849.png/preview",
    },
    PHX: {
      id: 1610612756,
      abbreviation: "PHX",
      teamName: "Phoenix Suns",
      simpleName: "Suns",
      shortName: "suns",
      location: "美航中心",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/qrtuxq1422919040.png/preview",
    },
    POR: {
      id: 1610612757,
      abbreviation: "POR",
      teamName: "Portland Trail Blazers",
      simpleName: "trail_blazers",
      shortName: "blazers",
      location: "摩达中心",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/mbtzin1520794112.png/preview",
    },
    SAC: {
      id: 1610612758,
      abbreviation: "SAC",
      teamName: "Sacramento Kings",
      simpleName: "Kings",
      shortName: "kings",
      location: "阿科球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/nf6jii1511465735.png/preview",
    },
    SAS: {
      id: 1610612759,
      abbreviation: "SAS",
      teamName: "San Antonio Spurs",
      simpleName: "Spurs",
      shortName: "spurs",
      location: "AT&T中心球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/crit1q1511809636.png/preview",
    },
    TOR: {
      id: 1610612761,
      abbreviation: "TOR",
      teamName: "Toronto Raptors",
      simpleName: "Raptors",
      shortName: "raptors",
      location: "加拿大航空中心体育馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/gitpi61503743151.png/preview",
    },
    UTA: {
      id: 1610612762,
      abbreviation: "UTA",
      teamName: "Utah Jazz",
      simpleName: "Jazz",
      shortName: "jazz",
      location: "能源方案球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/9p1e5j1572041084.png/preview",
    },
    WAS: {
      id: 1610612764,
      abbreviation: "WAS",
      teamName: "Washington Wizards",
      simpleName: "Wizards",
      shortName: "wizards",
      location: "Verizon威瑞森中心球馆",
      logo:
        "https://www.thesportsdb.com/images/media/team/badge/m2qhln1503743635.png/preview",
    },
  };
}



async function getImage(url) {

  const request = new Request(url);
  const image = await request.loadImage();
  return image;
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

// **
//  * 图片高斯模糊
//  * @param {Image} img 
//  * @param {string} style light/dark
//  * @return {Image} 图片
//  */
async function blurImage(img, style, blur = 100) {
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
  log('[+]最新版本：' + uC['ONE-NBA'].version)
  let needUpdate = false
  if (uC['ONE-NBA'].version != version) {
    needUpdate = true
    log("[+]检测到有新版本！")
    if (!config.runsInWidget) {
      log("[+]执行更新步骤")
      let upd = new Alert()
      upd.title = "检测到有新版本！"
      upd.addDestructiveAction("暂不更新")
      upd.addAction("立即更新")
      upd.add
      upd.message = uC['ONE-NBA'].notes
      if (await upd.present() == 1) {
        const req = new Request(uC['ONE-NBA'].cdn_scriptURL)
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