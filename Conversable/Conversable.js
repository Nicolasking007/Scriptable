// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: grin-squint;
// initialize contacts
/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
 *******************************************************
 ************ © 2021 Copyright Nicolas-kings ************/
const contacts_list = [
  {
    name: "Placeholder",
    phone: "+0123456789",
    type: "sms",
    photo: "PO1",
  },
  {
    name: "Placeholder",
    phone: "+0123456789",
    type: "facetime",
    photo: "3.png",
  },
  {
    name: "Placeholder",
    phone: "+0123456789",
    type: "qq",
    photo: "3.png",
  },
  {
    name: "Placeholder",
    phone: "+0123456789",
    type: "whatsapp",
    photo: "3.png",
  },
];

const sms = await base64Image("sms");
const call = await base64Image("call");
const mail = await base64Image('mail');
const facetime = await base64Image("facetime");
const whatsapp = await base64Image("whatsapp");
const twitter = await base64Image("twitter");
const telegram = await base64Image("telegram");
const facetime_audio = await base64Image("facetime_audio");
const qq = await base64Image("qq");

const SETTINGS = {
  BG_COLOR: "#151515",
  BG_IMAGE: {
    SHOW_BG: false,
    IMAGE_PATH: "bg.png",
  },
  BG_OVERLAY: {
    SHOW_OVERLAY: false,
    OVERLAY_COLOR: "#111111",
    OPACITY: 0.5,
  },
  PADDING: 8,
  TITLE_FONT_SIZE: 18,
  PHOTO_SIZE: 60,
  NAME_FONT_SIZE: 11,
  RANDOMIZE_CONTACTS: false,
  NO_OF_CONTACTS_TO_SHOW: 4,
};

// check if RANDOMIZE_CONTACTS is enabled. If it's set to `true`, randomize the contacts_list array.
if (SETTINGS.RANDOMIZE_CONTACTS == true) {
  contacts = [...contacts_list]
    .sort(() => 0.5 - Math.random())
    .slice(0, SETTINGS.NO_OF_CONTACTS_TO_SHOW);
} else {
  contacts = [...contacts_list].slice(0, SETTINGS.NO_OF_CONTACTS_TO_SHOW);
}

// A function to download images
async function getImg(image) {
  const url = await getImages(name);
  // let folderName = "Conversable";

  // let fm = FileManager.iCloud();
  // let dir = fm.documentsDirectory();
  // let path = fm.joinPath(dir + "/" + folderName, image);
  // let download = await fm.downloadFileFromiCloud(path);
  // let isDownloaded = await fm.isFileDownloaded(path);

  // if (fm.fileExists(path)) {
  //   return fm.readImage(path);
  // } else {
  //   console.log("错误：文件不存在.");
  // }
  // const url = "https://area.sinaapp.com/bingImg/"   //使用必应壁纸作为背景时，请注释下面
  // const url = hotcommentsData.data.picurl   //使用歌曲封面作为背景，，请注释上面
  // const url = "http://p1.music.126.net/uarVFKgUlrI9Z1nr-50cAw==/109951162843608471.jpg"     //固定一张图片,这里我选用城南花已开的封面,图片不能太大，容易崩溃
  const i = await new Request(url);
  const bgImgs = await i.loadImage();
  return image;


}

async function CreateAction(contact) {
  let { phone, email, twitter_id, telegram_username, qq_number } = contact;
  let serviceUrl;
  let icon;

  switch (contact.type) {
    case "sms":
      serviceUrl = `sms://${phone}`;
      icon = sms;
      break;
    case "call":
      serviceUrl = `tel://${phone}`;
      icon = call;
      break;
    case "mail":
      serviceUrl = `mailto://${email}`;
      icon = mail;
      break;
    case "facetime":
      serviceUrl = `facetime://${phone}`;
      icon = facetime;
      break;
    case "facetime_audio":
      serviceUrl = `facetime-audio://${phone}`;
      icon = facetime_audio;
      break;
    case "whatsapp":
      serviceUrl = `whatsapp://send?text=&phone=${phone}`;
      icon = whatsapp;
      break;
    case "twitter":
      serviceUrl = `twitter://messages/compose?recipient_id=${twitter_id}`;
      icon = twitter;
      break;
    case "telegram":
      serviceUrl = `tg://resolve?domain=${telegram_username}`;
      icon = telegram;
      break;
    case "qq":
      serviceUrl = `mqq://im/chat?chat_type=wpa&uin=${qq_number}&version=1&src_type=web`;
      icon = qq;
      break;
  }

  return { serviceUrl, icon };
}

async function base64Image(name) {
  let data;
  switch (name) {
    case "sms":
      data = "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";
      break;
    case "call":
      data = "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";
      break;
    case "mail":
      data = "iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVISURBVHgBxVjda1xFFP/N3E3aVJNsk6IoqcRiocaHRlI1FaW7CEkRsXloQPCptPXFlyb+A9F3u49CbREfRMEiikrbCN1Eq0n0oe1LFRW7tBERJa6JhqSb7HjOnZl7507ubj6lB86drzNnzvzmzLkzI5BCjxRUTggcoWxOAFkoYkG8OSozK6BE6TWl8MnPQ2LMFxJuYV9BdaoA75ABuahV1eihvHaxxrpkfUksI//DkCj56tFVUN3LAYpbgMR6qVyVyP/0qrgWGcTIiAZcVQiXJn02tcqRFqQjAy/vkorEy6qCxxkpGdZsQ1FJMkaajlKz8Mq2XcgUGbfe9BEiJS90Xjjy4djbyVW4ed9boQMXE7NzZ5U2O1UHhdX8BzX06SSfkQEGOKccIVUFFmeApXmgeod4yRuolnH+oF6dbCBuBBpbNSdkEaI2kKHPfgUDKVG1Aszd0mmsCStJrdKW4j/VZeIFmijxAk24+SHqnknIHpK0fp3WF9iouWnd0fUTn22bCFLkhK6PfC9w+gSxHKPOYymLkAjbs4xQ1sK2OEsC1hgjM/ICcPIZbAm9fYX0fRaXeaxFCpdN7RFKWckGhTOlisqcM9NA8+kiMF3Gpun2X6Tr8kr9S4tmdTRnpbtNl5fjDrt36vpZ6nD0LKUL2DDdpgkNniMdd4zuNkTLVLVjmrK08YBT+r/oPFl+/gTQukPnpwm54+9jwzRygXTMat2sk3VbVKyL2Ngk/WBoHa+DPOv15+P6iVsE+TjWTdzn0o+Iloh1sm5bRpAcXwqZtNCWmQa7geFc3FYg5R9ex5qJZU9/GetnXayTKTGeM66EE97dbWlp+BBwcE88m5EvCP6/V7UllGFZGxb6H9W6Igq88SIfkg4q7vI5dPYowbxT189SwBx8Tzt7PWNCmYruw31H+jwhL66tRMhFKUj2bdlO8L9MaZOWYSc/8VG6UVw3clnLsGzLDt23o9UTTEGHOSMcNIRETWKjeIfMVXTHyV+Bw+8CQ08Dj92n2yfZ8b8xO8pMqrVJt/mU+Ps742YSP0trbQoNX6KB/kECPS6/NpoiLGI9LDN8kZb9iCcTePImTfpQilMzFSaB0V/itr69ZuvKdOZl6t8bl0dvah0JSvMh4SIkkpZaOkcHy8JU3D70JHGvXpYJ+jme/17nmTpagN4OCqK0tVu2aSMK35pJTemlO97tGJRypEn6UAaJM8yNP4E3rsT+0LdHG2MHH+zSXItY9saMQRda10EyuGuX0WmOJq4N0j2m2t+G3UmvXEQEK++SN5/Duon77HaW9+QFswP1cSMxdpj2fK4iTGZ+MwczEupodpaC8h+8qNONEBvw0qdGH+u+12wQpQ9obQ/GstJ1rKABkWNP/4soJp05vHFj7ITO9Du65xHFvKARCYR4yco2JjSYwOfyqR5a83ZsmljHqQOA/zPf3hzHJErLomdU3aR8Z3gmp8P9zO/6jOJfHurl3bKbupTWRhcMtD0QC5BBpUyIkL2w0Xpm76db2x/mpmE0CMRahGOJP2hK1KjZxsZkdyG6XJiGEp+px6lgowMy5Eft5GQL85r5FBme6lQN7fXuaEACUjYiIG6kGNV0D5XlCsSviwNFlZOKLor+YP49K226a7koYu16aFXyYdVTY4oNyuHuUmkqJx7m2AzyoWPVAFcF6rx81How2AKiSFiWVeRDW2zlE1+rbqos1jXqfzKGfDT/Xd55jrHUO6E6UQ39qRPrpY0gqDCGCo5N5lMerBKGfUUvIhID9ACxn40T/pPeag6b1k5IKA58+mlvnK4/H08+u/JJ7z8kEaKihVeIywAAAABJRU5ErkJggg==";
      break;
    case "facetime":
      data = "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";
      break;
    case "facetime_audio":
      data = "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";
      break;
    case "whatsapp":
      data = "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";
      break;
    case "twitter":
      data = "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";
      break;
    case "telegram":
      data = "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";
      break;
    case "qq":
      data = "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";
      break;
    default:
      data = "";
      break;
  }
  return Image.fromData(Data.fromBase64String(data));
}

async function getImages(name) {
  let url;
  switch (name) {
    case "PO1":
      url = "https://www.thesportsdb.com/images/media/team/badge/xqtvvp1422380623.png/preview";
      break;
    case "PO2":
      url = "https://www.thesportsdb.com/images/media/team/badge/xqtvvp1422380623.png/preview";
      break;
    case "PO3":
      url = "https://www.thesportsdb.com/images/media/team/badge/xqtvvp1422380623.png/preview";
      break;
    case "PO4":
      url = "https://www.thesportsdb.com/images/media/team/badge/xqtvvp1422380623.png/preview";
      break;
    case "PO5":
      url = "";
      break;
    case "PO6":
      url = "";
      break;
    case "PO7":
      url = "";
      break;
    case "PO8":
      url = "";
      break;
    case "PO9":
      url = "";
      break;
    case "PO10":
      url = "";
      break;

  }
  // console.log(url)
  // const i = await new Request(url);
  // const bgImgs = await i.loadImage();
  return url;
  
}



// A function to create contacts (to be displayed in the widget).
async function CreateContact(contact, row) {
  let { PHOTO_SIZE, NAME_FONT_SIZE } = SETTINGS;

  let { photo, name } = contact;
  let { serviceUrl, icon } = await CreateAction(contact);

  let contactStack = row.addStack();
  contactStack.layoutVertically();

  contactStack.url = serviceUrl;

  let photoStack = contactStack.addStack();

  photoStack.addSpacer();

  let img = await getImg(photo);
  let contactPhoto = photoStack.addImage(img);
  contactPhoto.imageSize = new Size(PHOTO_SIZE, PHOTO_SIZE);
  contactPhoto.cornerRadius = PHOTO_SIZE / 2;
  contactPhoto.applyFillingContentMode();

  photoStack.addSpacer();

  contactStack.addSpacer(4);

  let nameStack = contactStack.addStack();

  nameStack.addSpacer();

  let iconPath = icon;
  let appIcon = nameStack.addImage(iconPath);
  appIcon.imageSize = new Size(12, 12);

  nameStack.addSpacer(4);

  let contactName = nameStack.addText(name);
  contactName.font = Font.mediumSystemFont(NAME_FONT_SIZE);
  contactName.lineLimit = 1;

  nameStack.addSpacer();
}

async function CreateWidget(contacts) {
  let { BG_COLOR, BG_IMAGE, BG_OVERLAY, PADDING, TITLE_FONT_SIZE } = SETTINGS;

  let w = new ListWidget();
  w.backgroundColor = new Color(BG_COLOR);
  w.setPadding(PADDING, PADDING, PADDING, PADDING);

  // Show background image if SHOW_BG is set to `true`.
  if (BG_IMAGE.SHOW_BG == true) {
    let bg = await getImg(BG_IMAGE.IMAGE_PATH);
    w.backgroundImage = bg;
  }

  // Show overlay if SHOW_OVERLAY is set to `true`. For light background images, it is recommended that you turn overlay on so that the contact names and text remain legible.
  if (BG_OVERLAY.SHOW_OVERLAY == true) {
    let overlayColor = new Color(
      BG_OVERLAY.OVERLAY_COLOR,
      BG_OVERLAY.OPACITY || 0.3
    );
    let gradient = new LinearGradient();
    gradient.colors = [overlayColor, overlayColor];
    gradient.locations = [0, 1];
    w.backgroundGradient = gradient;
  }

  w.addSpacer();

  let containerStack = w.addStack();
  containerStack.layoutVertically();

  let titleStack = containerStack.addStack();

  titleStack.addSpacer();

  let title = titleStack.addText("Start a conversation with");
  title.font = Font.boldRoundedSystemFont(TITLE_FONT_SIZE);

  titleStack.addSpacer();

  containerStack.addSpacer(16);

  let contactRowStack = containerStack.addStack();
  contactRowStack.centerAlignContent();

  contactRowStack.addSpacer();

  contacts.map((contact) => {
    CreateContact(contact, contactRowStack);
  });

  contactRowStack.addSpacer();

  w.addSpacer();

  Script.setWidget(w);

  return w;
}

let w = await CreateWidget(contacts);
w.presentMedium();
Script.complete();

/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
 *******************************************************
 ************ © 2021 Copyright Nicolas-kings ************/