# Conversable for Scriptable
iOS14桌面组件神器（Scriptable）汉化脚本，精美作品分享！
 
![效果预览](https://ae05.alicdn.com/kf/H33a5f3de043348b39974d80d01531f95G.png)

注意:这个脚本需要 `Scriptable`的`1.5.1`版本，因为它依赖于一些新添加的api，比如 `.addStack()` and `.url()`

[`原作者：andyngo`](https://github.com/andyngo/conversable-for-scriptable)  在此感谢分享、我的工作仅汉化并加上了`qq` 配置、自动更换背景
## 它能做什么?

`Conversable`是一个用`Scriptable` 编写的简单聊天widget。使用`Conversable`，您可以快速\*:

1. 为一个联系人打开一个iMessage对话
2. 与一个联系人开始Facetime通话
3.与联系人启动一个Facetime音频呼叫
4. 给你的联系人打电话
5. 为联系人打开一个WhatsApp对话
6. 指定打开某个人的QQ

\* 警告:iOS 14的标准限制适用于此：任何通过widget打开的URL都需要其主机应用程序先启动URL才能打开。

## 脚本

1. 下载这个存储库的内容并将其解压缩到iCloud驱动器中`Scriptable`的文件夹中。

你的脚本文件夹结构应该是这样的:

``` 
iCloud Drive/
├─ Scriptable/
│  ├─ Conversable.js
│  ├─ Conversable/
│  │  ├─ 1.png
│  │  ├─ 2.png
│  │  ├─ 3.png
│  │  ├─ 4.png
│  │  ├─ icons/

......

```

2. 启动`Scriptable`并确保在Scripts视图中列出了`Conversable.js`。

3. 继续运行它，如果一切正常，您应该会看到这个中型widget的预览。

4. 要定制联系人，在脚本编辑器中打开`Conversable.js`并修改`contacts_list` 数组。例如：

```
// 默认配置
const contact_list = [
  {
    name: "Nicolas-kings",
    phone: "+1234567890",
    type: "sms",
    photo: "1.png"
  },
  // 重复上面的操作，最多4个
]
```

和你自己的类似的东西：

```
const contact_list = [
  {
    name: "Nicolas-kings", // 联系人的名字
    phone: "+0123456789", // 输入您联系人的电话号码，如有必要，请输入国家代码
    type: "sms", // 你喜欢的沟通方式。请参阅下面的支持服务。
    photo: "john.png" // 联系人的照片。图片文件进入Conversable的文件夹查看，其中1.png, 2.png等为默认图片。
  },
  // 重复上面的操作，最多4个
]
```

5. 重复以上步骤，最多可重复4次。`Conversable`目前支持显示最多4个联系人在一行。如果需要向一行添加更多联系人，且你有能力的话，请随意修改代码。

6. 配置好所有内容后，运行脚本并验证所有内容都正常工作。

7. 回到主屏幕并添加一个中等尺寸 `Scriptable` widget。

8. 编辑`Scriptable`widget并选择 `Conversable` 作为脚本。接下来，将“当交互时”设置为“run script”，您应该已经设置好并准备就绪。

![效果预览](https://ae05.alicdn.com/kf/H33a5f3de043348b39974d80d01531f95G.png)

---

## 支持服务(应用)

| 支持服务(应用) | type             | accepts           |
| --------------- | ---------------- | ----------------- |
| iMessage/SMS    | sms            | phone             |
| Mail            | mail           | mail              |
| Facetime        | facetime       | phone             |
| Facetime Audio  | facetime-audio | phone             |
| Telephone       | call           | phone             |
| Telegram        | telegram       | telegram_username |
| Twitter         | twitter        | twitter_id        |
| WhatsApp        | whatsapp       | phone             |
| QQ        | qq       | qq_number             |

QQ的例子:

```
{
  name: "Nicolas-kings",   //widget上显示的昵称
  qq_number: "11009532", //  这里填写QQ号  字段支持 phone、mail、telegram_username、twitter_id、qq_number
  type: "qq",   //类型
  photo: "1.png"  //封面头像
}
```
Telegram的例子:

```
{
  name: "Nicolas-kings",   //widget上显示的昵称
  telegram_username: "笑你二大爷", //  这里填写TG昵称   字段支持 phone、mail、telegram_username、twitter_id、qq_number
  type: "telegram",   //类型
  photo: "1.png"  //封面头像
}
```
其他类型 参照上面实例即可

我还在`/icons` 文件夹中添加了一些图标，如果你想办法向列表中添加更多的服务，这些图标可能会很有用。

---

## 已知问题

- 有时图片会下载失败。如果发生这种情况，请检查`iCloud`驱动器中的`Conversable`文件夹，以确保图片被正确上传。如果你看到“等待……”在你的文件中，试着打开或关闭飞行模式来重启上传。
- 现在widget只支持中等尺寸的widget。我将研究如何使它适用于小尺寸和大尺寸。

---

## 关于这个项目

这个脚本是由[@andyngo](https://twitter.com/andyngo) 编写的，它是一个有趣的小项目，用来测试`Scriptable`的脚本编写能力。事实证明，使用`Scriptable`可以做很多事情，我打算制作一些更有趣的小部件，就像这样。

---

<center>
    <img src="https://ae04.alicdn.com/kf/H697021382f264fd2ad0476c7e817b309g.png" style="width: 100px;">
</center>

**更多好玩的脚本正在码字中...`尽情期待！`**