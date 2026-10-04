# Apptify

面向桌面与移动端的 Vue 3 组件库，基于 Vuetify Material UI 融合 Apple 风格设计，统一使用 `<apple-*>` 标签。

[npm](https://www.npmjs.com/package/apptify) · [组件 API](docs/COMPONENTS.md) · [应用模板](docs/PLAYGROUND-TEMPLATE.md)

## 快速开始

```sh
npm create apptify
```

安装后会自带所有组件说明的样例站。Bundle 包含以下组件之外的内容：
- 自动根据 src/views 生成 routes
- lucide icons
- 竖屏、触屏布尔状态
- 全局广播通道 `sendMessage`
- 错误页
- 外观设置页
- 各组件示例与源码等，有问题可以直接抄

## 常用 API

```js
this.$apple.theme.value.set('dark')
this.$apple.motion.value.set('reduced')
this.$apple.ripple.value.set(false) // 全局关闭点击波纹
this.$apple.notify('保存成功', { tone: 'success' })

const dialog = this.$apple.dialog({ title: '保存修改？', cancelText: '取消' })
const confirmed = await dialog.result // 确认 true，取消 false，关闭 undefined
```

内置主题：`light`、`dark`、`graphite`、`rose`；`system` 跟随系统。全局动效：`auto`、`full`、`reduced`、`none`。共享状态使用 ref，在 JavaScript 中通过 `.value` 访问。

可通过 `createAppleUI({ ripple: false })` 或 `apple.ripple.value.set(false)` 全局禁用点击波纹。切换到 `reduced` 或系统开启减少动态效果时，波纹自动关闭，但可手动开启；只有 `none` 模式禁止开启。`persist: true` 会同时保存该偏好。

Props、事件、插槽、自定义主题与弹层消息回传见[组件 API](docs/COMPONENTS.md)。

## LICENSE

MIT