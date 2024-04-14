var keyword = "wather"
if (args.widgetParameter) {
  keyword = args.widgetParameter
}
const result = await get({ url: "https://api.unsplash.com/search/photos?page=2&per_page=20&query=" + keyword + "&collections&orientation=portrait", headers: { "Accept-Encoding": "gzip, deflate, br", "Accept-Language": "zh-cn", "Authorization": "Client-ID 9657b2982a53f8bf4b567fe7899da7354456296f0d91a2f918a1bbcfec8a021e", "Connection": "keep-alive", "Cookie": "ugid=12cbed22cf668302ec43f4b7536e66235337523", "Host": "api.unsplash.com", "User-Agent": "Unsplash/73 CFNetwork/1197 Darwin/20.0.0", } })

const total = result.results.length
const index = Math.floor(Math.random() * total)
const imgUrl = result.results[index].urls.regular
const req = await new Request(imgUrl);
const img = await req.loadImage();
const w = new ListWidget()
w.backgroundImage = img
w.url = imgUrl
let widget = w
Script.setWidget(widget)
Script.complete()
w.presentMedium()

async function get(opts) {
  const request = new Request(opts.url)
  request.headers = {
    ...opts.headers,
    ...this.defaultHeaders
  }
  var result = await request.loadJSON()
  console.log(result)
  return result

}