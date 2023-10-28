// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: user-shield;
/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
 *******************************************************
 ************ © 2023 Copyright Nicolas-kings ************/
/********************************************************
 * script     : ONE-DayMatter.js
 * version    : 1.0.1
 * author     : Nicolas-kings
 * date       : 2023-08-27
 * github     : https://github.com/Nicolasking007/Scriptable
 * desc       : 具体配置说明，详见微信公众号-曰(读yue)坛
 * Changelog  :  20231028 - v1.0.1 - 优化处理倒数日跨年情况
 *               20230827 - v1.0.0 - 首次发布
 *******************************************************/
//##############公共参数配置模块############## 


const previewSize = (config.runsInWidget ? config.widgetFamily : "medium");

/*
* 定义要读取的图片文件夹路径
*/
const fm = FileManager.iCloud();
const dir = fm.joinPath(fm.documentsDirectory(), "Cover");
if (!fm.fileExists(dir)) fm.createDirectory(dir);



/*
* 小组件倒计时部分
*/
const fuelType = "celebrate";  // love
const symbolColor = Color.orange()
const stationColor = Color.blue()
const primaryColor = Color.dynamic(Color.black(), Color.white())
const secondaryColor = Color.gray()
const dangerColor = Color.red()
const successColor = Color.green()

/*
* 小组件日历部分
*/
const spaceBetween = 2
const dateTextSize = 8
const dateSize = 18
const padding = 2
const cornerRadius = 2
const color = Color.dynamic(Color.lightGray(), Color.darkGray())
const weekColor = Color.blue()
const todayColor = Color.red()
const textColor = Color.white()
const titleColor = Color.white()

/*
* CALENDAR PREFERENCES
* change the below variables to change how the calendar behaves
*/

// Only show the days in the month or show the week leading to the first day in the month and the week leaving the last
const showOnlyMonth = true

// 小尺寸组件默认显示 日历信息
const showcalendar = args.widgetParameter || true

// 每周起始日 默认周一
const weekStartsMonday = true

/*
* 节假日信息数组
*/
const holidays = [
  { name: "元旦", month: 1, day: 1 },
  { name: "除夕", month: 2, day: 9 },
  { name: "春节", month: 2, day: 10 },
  { name: "元宵节", month: 2, day: 24 },
  { name: "清明节", month: 4, day: 4 },
  { name: "劳动节", month: 5, day: 1 },
  { name: "端午节", month: 6, day: 10 },
  { name: "七夕节", month: 8, day: 22 },
  { name: "中秋节", month: 9, day: 29 },
  { name: "国庆节", month: 10, day: 1 },
  { name: "程序员节", month: 10, day: 24 },
  // 继续添加更多节假日...
];

/*
* Set fuelTypeString
*/
const fuelTypeStringList = {
  "love": [
    "i.square", "l.square", "o.square", "v.square", "e.square", "y.square", "o.square", "u.square"
  ],
  "celebrate": [
    "c.square", "e.square", "l.square", "e.square", "b.square", "r.square", "a.square", "t.square", "e.square"
  ]
};
const widget = await createWidget()


/*
* Create the widget
*/
if (!config.runsInWidget) {
  switch (previewSize) {
    case "small":
      await widget.presentSmall();
      break;
    case "medium":
      await widget.presentMedium();
      break;
    case "accessoryRectangular":
      await widget.presentAccessoryRectangular();
      break;
  }
}
Script.setWidget(widget)
// 完成脚本
Script.complete()
// 预览


/*
* Design of the widget
*/
async function createWidget() {
  const widget = new ListWidget();
  const date = new Date(Date.now());
  const currentDate = new Date();
  const holidayInfo = getNextHolidayCountdown(holidays);
  const { weekNumber, dayOfYear, currentDateTime } = getWeekNumberAndDayOfYear(currentDate);


  switch (previewSize) {
    case 'small':
      if (showcalendar) {
        setupcalendarWidget(widget, weekStartsMonday, showOnlyMonth)
      } else {
        const pumpImage = await getRandomImageAsync();
        setupSmallWidget(widget, holidayInfo, weekNumber, dayOfYear, currentDateTime, pumpImage);
      }
      break;

    case 'medium':
      widget.size = new Size(300, 150); // 小组件大小

      const horizontalStack = widget.addStack();
      horizontalStack.layoutHorizontally();

      // 创建左侧视图（小组件部分）
      const leftStack = horizontalStack.addStack();
      leftStack.layoutVertically(); // 垂直布局
      leftStack.size = new Size(widget.size.width / 2, widget.size.height); // 左侧大小
      const pumpImages = await getRandomImageAsync();
      setupSmallWidget(leftStack, holidayInfo, weekNumber, dayOfYear, currentDateTime, pumpImages); // 调用设置小组件部分的函数

      horizontalStack.addSpacer(4); // 添加间隔

      // 创建右侧视图（日历部分）
      const rightStack = horizontalStack.addStack();
      rightStack.layoutVertically(); // 垂直布局
      rightStack.size = new Size(widget.size.width / 2, widget.size.height); // 右侧大小
      setupcalendarWidget(rightStack, weekStartsMonday, showOnlyMonth); // 调用设置日历部分的函数

      break;

    case 'accessoryRectangular':
      setupAccessoryRectangularWidget(widget, date, holidayInfo);
      break;

    default:
      throw new Error('Invalid widget size');
  }


  return widget;
}



/*
* 日历小组件布局
*/
function setupcalendarWidget(widget, weekStartsMonday, showOnlyMonth) {

  // Start making the widget
  // const widget = new ListWidget()
  // get the calendar data
  const calendarData = calendar(weekStartsMonday)

  // Add the top day titles
  let columnTitle = widget.addStack()
  columnTitle.layoutHorizontally()
  columnTitle.spacing = spaceBetween
  columnTitle.addSpacer()

  const dayTitles = weekStartsMonday
    ? ["一", "二", "三", "四", "五", "六", "日"]
    : ["日", "一", "二", "三", "四", "五", "六"]
  for (let title of dayTitles) {
    const titleStack = columnTitle.addStack()
    titleStack.setPadding(padding, padding, padding, padding)
    titleStack.backgroundColor = weekColor
    titleStack.size = new Size(dateSize, dateSize)
    titleStack.centerAlignContent()
    titleStack.cornerRadius = cornerRadius

    const titleText = titleStack.addText(title)
    titleText.font = Font.boldSystemFont(dateTextSize)
    titleText.textColor = titleColor
  }
  columnTitle.addSpacer()

  widget.addSpacer(spaceBetween * 3)

  // Add the days for each week
  for (let week of calendarData) {
    const weekStack = widget.addStack()
    widget.addSpacer(spaceBetween)

    weekStack.layoutHorizontally()
    weekStack.addSpacer()
    weekStack.spacing = spaceBetween

    for (let day of week) {
      const dayStack = weekStack.addStack()
      dayStack.setPadding(padding, padding, padding, padding)
      dayStack.backgroundColor = day.isToday ? todayColor : color
      dayStack.size = new Size(dateSize, dateSize)
      dayStack.centerAlignContent()
      dayStack.cornerRadius = cornerRadius

      if (showOnlyMonth && !day.isInMonth) {
        dayStack.backgroundColor = new Color("#000", 0)
        continue
      }

      const dayText = dayStack.addText(day.day.toString())
      dayText.font = Font.regularSystemFont(dateTextSize)
      dayText.textColor = textColor
    }
    weekStack.addSpacer()
  }

}

/*
* 小尺寸小组件布局
*/
function setupSmallWidget(widget, holidayInfo, weekNumber, dayOfYear, currentDateTime, pumpImage) {

  // widget.setPadding(2, 1, 1, 1); // padding
  const frame = widget.addStack();
  frame.layoutVertically();
  frame.addSpacer(1);

  const pumpStack = frame.addStack();
  pumpStack.layoutHorizontally();
  pumpStack.addSpacer(6);

  const pumpIconStack = pumpStack.addStack();
  pumpIconStack.layoutVertically();
  // const base64Image = ""
  // const imgData = Data.fromBase64String(base64Image);
  // const pumpIcon = Image.fromData(imgData);
  // const randomImage = getRandomImageFromFolder(imageFolderPath, imageSize);


  const imageSize = new Size(45, 45);
  const pumpImageView = pumpIconStack.addImage(pumpImage);
  pumpImageView.imageSize = imageSize
  pumpIconStack.addSpacer(4);
  const pumpText = pumpIconStack.addText("还有:");
  pumpText.textColor = primaryColor;
  pumpText.font = Font.mediumSystemFont(11);

  pumpStack.addSpacer();

  const countdownStack = pumpStack.addStack();
  // 垂直居中对齐
  countdownStack.layoutVertically();
  countdownStack.centerAlignContent(); 

  const countdownText = countdownStack.addText(` ${holidayInfo.year}年${holidayInfo.name} `);
  countdownText.textColor = symbolColor;
  countdownText.font = Font.mediumSystemFont(13);

  const countdownRow = countdownStack.addStack();
  // 水平居中对齐
  //   countdownRow.layoutHorizontally();
  //   countdownRow.centerAlignContent(); 

  console.log(holidayInfo.daysLeft.toString())
  const days = countdownRow.addText(holidayInfo.daysLeft.toString());
  days.textColor = holidayInfo.daysLeft >= 0 ? successColor : dangerColor;
  days.font = holidayInfo.daysLeft >= 0 ? Font.boldRoundedSystemFont(45) : Font.boldRoundedSystemFont(33);

  const currency = countdownRow.addText("天");
  currency.textColor = primaryColor;
  currency.font = Font.mediumSystemFont(12);
  // 靠右对齐
  currency.rightAlignText();

  frame.addSpacer(3);

  const iconsRow = frame.addStack();
  iconsRow.layoutHorizontally();
  // 在开始位置添加 Spacer，使图标居中
  iconsRow.addSpacer();

  for (let iconName of fuelTypeStringList[fuelType]) {
    let icon = iconsRow.addImage(SFSymbol.named(iconName).image);
    icon.tintColor = (iconsRow.length > 4 && fuelType === "love") ? dangerColor : secondaryColor;
    icon.imageSize = new Size(16, 16);
    if (iconsRow.length === 5 && fuelType === "love") {
      iconsRow.addSpacer(4);
    }
  }
  // 在结束位置添加 Spacer，使图标居中
  iconsRow.addSpacer();
  frame.addSpacer(3);

  const stationsRow = frame.addStack();
  stationsRow.layoutHorizontally();
  // 在开始位置添加 Spacer，使文本居中
  stationsRow.addSpacer();
  addStationInfo(stationsRow, "本年周数", weekNumber);
  stationsRow.addSpacer();
  addStationInfo(stationsRow, "本年天数", dayOfYear);
  stationsRow.addSpacer();

  frame.addSpacer(7);

  const dateRow = frame.addStack();
  dateRow.layoutHorizontally();
  dateRow.addSpacer();
  const dateTexts = dateRow.addText(`↻ ${currentDateTime}`);
  dateTexts.textColor = secondaryColor;
  dateTexts.font = Font.mediumSystemFont(9);
  dateRow.addSpacer();

}

/*
* 锁屏小组件布局
*/
function setupAccessoryRectangularWidget(widget, holidayInfo) {
  const titleStack = widget.addStack();
  titleStack.layoutHorizontally();

  const title = titleStack.addText('倒数日');
  title.font = Font.mediumRoundedSystemFont(14.5);

  const pumpIcon = SFSymbol.named("flag.2.crossed").image;
  const icon = titleStack.addImage(pumpIcon);
  icon.imageSize = new Size(25, 25);

  const race = widget.addText(`${holidayInfo.year}年${holidayInfo.name}`);
  race.font = Font.boldSystemFont(14.5);

  const dateText = widget.addText(`剩余：${holidayInfo.daysLeft.toString()}`);
  dateText.font = Font.mediumSystemFont(14);

}


function addStationInfo(stack, stationName, priceText) {
  const stationStack = stack.addStack();
  stationStack.layoutVertically();
  // 居中对齐内容
  stationStack.centerAlignContent();

  const station = stationStack.addText(` ${stationName}:`);
  station.font = Font.mediumSystemFont(12);
  station.textColor = stationColor;


  const price = stationStack.addText(` ${priceText} `);
  price.textColor = primaryColor;
  price.font = Font.mediumSystemFont(12);

}

/*
* 计算倒数日
*/

function getNextHolidayCountdown(holidays) {
  const currentDate = new Date();

  let upcomingHoliday = null;
  let upcomingHolidayDate = null;

  for (const holiday of holidays) {
    const holidayYear = currentDate.getFullYear();
    const holidayMonth = holiday.month;
    const holidayDay = holiday.day;
    const holidayDate = new Date(holidayYear, holidayMonth - 1, holidayDay);

    if (holidayDate >= currentDate) {
      upcomingHoliday = holiday;
      upcomingHolidayDate = holidayDate;
      break;
    }
  }

  if (!upcomingHoliday) {
    // If there are no holidays left this year, find the next year's first holiday.
    for (const holiday of holidays) {
      const holidayYear = currentDate.getFullYear() + 1;
      const holidayMonth = holiday.month;
      const holidayDay = holiday.day;
      const holidayDate = new Date(holidayYear, holidayMonth - 1, holidayDay);

      if (holidayDate >= currentDate) {
        upcomingHoliday = holiday;
        upcomingHolidayDate = holidayDate;
        break;
      }
    }
  }

  if (upcomingHoliday) {
    const timeDiff = upcomingHolidayDate.getTime() - currentDate.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return { name: upcomingHoliday.name, daysLeft: daysLeft, year: upcomingHolidayDate.getFullYear() };
  } else {
    return { name: "无即将到来的节假日", daysLeft: '-', year: currentYear + 1 };
  }
}


function calendar(weekStartsMonday = false) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // 获取以星期一为起始的周开始的数值
  const weekStart = weekStartsMonday ? 1 : 0

  // 对于月份不以周开始的情况，提前设置天数计数
  // 设置为-6是因为它将立即递增到-5，它将在月份的第一天之前获得6天，因为0不是月份的第一天
  let dayCount = -6

  // 存储日期和周
  const days = []

  // 循环以获取日历的所有日期
  while (true) {
    dayCount++
    // 获取下一个日期
    let date = new Date(currentYear, currentMonth, dayCount)

    // 如果是第一个日期且不是周开始的日子，则不添加该日期
    if (days.length === 0 && date.getDay() !== weekStart) {
      continue

      // 如果达到不是当前月份的周开始日期，退出循环
    } else if (
      days.length !== 0 &&
      date.getDay() === weekStart &&
      date.getMonth() !== currentMonth
    ) {
      break
    }

    // 将日期信息添加到日期数组中

    /*
    * 额外的日期数据
    * 在这里，你可以包括该日期的其他数据（例如，对于体育日历，`isGame: bool` 表示当天是否有比赛）
    */
    days.push({
      day: date.getDate(),
      isInMonth: date.getMonth() === currentMonth,
      isToday:
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth()
    })
  }

  // 存储一个包含周数组和一周七天的二维数组
  const month = []
  for (let i = 0; i < days.length; i += 7) {
    month.push(days.slice(i, i + 7))
  }

  return month
}





function getWeekNumberAndDayOfYear(date) {
  const year = date.getFullYear();

  const startOfYear = new Date(year, 0, 1); // January 1st of the current year
  const daysSinceStartOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000)) + 1;

  const firstDayOfYear = new Date(year, 0, 1); // January 1st of the current year
  const daysSinceFirstDay = Math.floor((date - firstDayOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  // const seconds = date.getSeconds().toString().padStart(2, '0');

  const currentDateTime = `${year}.${date.getMonth() + 1}.${date.getDate()} ${hours}:${minutes}`;

  return { weekNumber, dayOfYear: daysSinceStartOfYear, currentDateTime };
}




async function getRandomImage() {
  // 支持的图片格式数组，可以根据需要添加其他格式
  const supportedFormats = ["png", "jpg", "jpeg"]; 
  const files = fm.listContents(dir, supportedFormats);
  if (files.length === 0) {
    throw new Error("文件夹中没有符合格式的图片文件。");
  }

  // 随机选择一个文件
  const randomIndex = Math.floor(Math.random() * files.length);
  const randomImageName = files[randomIndex];
  // 获取图片
  const img = await getImageFor(randomImageName);

  return img;
}


function getRandomImageAsync() {
  return new Promise(async (resolve, reject) => {
    try {
      const image = await getRandomImage();
      resolve(image);
    } catch (error) {
      reject(error);
    }
  });
}


async function getImageFor(name) {
  const imgPath = fm.joinPath(dir, name);
  await fm.downloadFileFromiCloud(imgPath);
  const img = await fm.readImage(imgPath);
  return img;
}



/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
 *******************************************************
 ************ © 2023 Copyright Nicolas-kings ************/