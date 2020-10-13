// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: grin-squint;

// Configs
// Modify the array below and your own contacts
// There are 5 types of services that you can use at the moment:
// "sms", "facetime", "facetime-audio", "call", "whatsapp"
const contacts_list = [
  {
    name: "Placeholder",
    phone: "+0123456789",
    type: "sms",
    photo: "1.png",
  },
  {
    name: "Placeholder",
    phone: "+0123456789",
    type: "facetime",
    photo: "2.png",
  },
  {
    name: "Placeholder",
    phone: "+0123456789",
    type: "call",
    photo: "3.png",
  },
  {
    name: "Placeholder",
    qq_number: "+0123456789",
    type: "qq",
    photo: "4.png",
  },
];
// end of config

// show only the first 4 contacts
let contacts = contacts_list.slice(0, 4);

// If you want shuffle your contacts you can do something like this:
// let shuffle = [...contacts].sort(() => 0.5 - Math.random()).slice(0, 4);
// the widget will be refreshed periodically and your contacts will
// be shuffled.

async function getImg(image) {
  let fm = FileManager.iCloud();
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir + "/Conversable", image);
  let download = await fm.downloadFileFromiCloud(path);
  let isDownloaded = await fm.isFileDownloaded(path);

  if (fm.fileExists(path)) {
    return fm.readImage(path);
  } else {
    console.log("Error: File does not exist.");
  }
}

let w = new ListWidget();
/// set the background color of the widget 
// 纯色背景
// w.backgroundColor = new Color("#151515", 1);
// w.useDefaultPadding();
// 图片背景
const background = "https://area.sinaapp.com/bingImg/"   //使用必应壁纸作为背景时，请注释下面
//const background = "https://i.imgur.com/reV3412.png" 
let img = new Request(background)
bgimg = await img.loadImage()
w.useDefaultPadding();
w.backgroundImage = bgimg

w.addSpacer();

let titleStack = w.addStack();
titleStack.centerAlignContent();

titleStack.addSpacer();

let title = titleStack.addText("Start a conversation with");
title.font = Font.boldRoundedSystemFont(16);
title.textColor = Color.white();
title.centerAlignText();

titleStack.addSpacer();

w.addSpacer();

let wrapperStack = w.addStack();
wrapperStack.layoutVertically();
wrapperStack.centerAlignContent();

async function CreateContact(contact, row) {
  let contactStack = row.addStack();
  contactStack.layoutVertically();

  let serviceUrl;
  let icon;

  switch (contact.type) {
    case "sms":
      serviceUrl = `sms://${contact.phone}`;
      icon = "icons/sms.png";
      break;
    case "call":
      serviceUrl = `tel://${contact.phone}`;
      icon = "icons/phone.png";
      break;
    case "mail":
      serviceUrl = `mailto://${contact.email}`;
      icon = "icons/mail.png";
      break;
    case "facetime":
      serviceUrl = `facetime://${contact.phone}`;
      icon = "icons/facetime.png";
      break;
    case "facetime-audio":
      serviceUrl = `facetime-audio://${contact.phone}`;
      icon = "icons/facetime.png";
      break;
    case "whatsapp":
      serviceUrl = `whatsapp://send?text=&phone=${contact.phone}`;
      icon = "icons/whatsapp.png";
      break;
    case "twitter":
      serviceUrl = `twitter://messages/compose?recipient_id=${contact.twitter_id}`;
      icon = "icons/twitter.png";
      break;
    case "telegram":
      serviceUrl = `tg://resolve?domain=${contact.telegram_username}`;
      icon = "icons/telegram.png";
      break;
    case "qq":
      serviceUrl = `mqq://im/chat?chat_type=wpa&uin=${contact.qq_number}&version=1&src_type=web`;
      icon = "icons/qq.png";
      break;
  }

  contactStack.url = serviceUrl;

  // contact photo
  let imgPath = await getImg(contact.photo);

  let photoStack = contactStack.addStack();
  photoStack.centerAlignContent();

  photoStack.addSpacer();

  let photo_size = 64;
  let photo = photoStack.addImage(imgPath);
  photo.imageSize = new Size(photo_size, photo_size);
  photo.applyFillingContentMode();
  photo.cornerRadius = photo_size / 2;

  photoStack.addSpacer();
  // end of contact photo

  contactStack.addSpacer(4);

  // contact name
  let nameStack = contactStack.addStack();
  nameStack.centerAlignContent();

  nameStack.addSpacer();

  let iconPath = await getImg(icon);
  let appIcon = nameStack.addImage(iconPath);
  appIcon.imageSize = new Size(12, 12);

  nameStack.addSpacer(4);

  let name = nameStack.addText(contact.name);
  name.font = Font.mediumSystemFont(12);
  name.textColor = Color.white();

  nameStack.addSpacer();
  // end of contact name
}

// row of contacts
wrapperStack.addSpacer();

let rowStack = wrapperStack.addStack();
rowStack.centerAlignContent();

for (contact of contacts) {
  CreateContact(contact, rowStack);
}

wrapperStack.addSpacer();
// end of row of contacts

// present medium sized widget for preview when debugging
// comment w.presentMedium() out if you don't need any preview
w.presentMedium();