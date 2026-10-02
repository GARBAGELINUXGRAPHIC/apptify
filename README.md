# Apptify

面向桌面与移动端的个人 Vue 3 组件库。统一使用 `<apple-*>` 前缀，保留 Vuetify 的 Ripple 指令，而不继承它的整套 Material 组件外观。

设计借鉴 Apple 网站的排版、留白、层次与交互节奏；不是 Apple 官方产品，也不声称全部控件都与 Apple 网站逐像素一致。表格、级联选择、验证码、下拉刷新等能力是在同一套视觉语言下的扩展。

当前导出并注册 **69 个组件**：基础 9 个、表单 18 个、内容与移动交互 30 个、弹层 10 个、动效 2 个。其中 `AppleOverlayHost` 是由 Provider 自动挂载的基础设施，通常直接使用其余 68 个即可。完整实际 API 见 [组件参考](docs/COMPONENTS.md)。

## 本地运行与安装

项目尚未发布到 npm。不要把 `npm install apptify` 当成已发布包的安装方式。

建议使用 Node.js 22 LTS 或 24 LTS；测试工具不支持奇数版本的 Node.js。

在本仓库执行：

```sh
npm ci
npm run dev
```

开发服务器地址以终端输出为准。开发页面是可交互的组件工作台，不是组件库的业务页面模板。

在另一个项目中使用本地包：

```sh
# 在本仓库构建并生成 apptify-0.1.0.tgz
npm run build
npm pack

# 在消费项目执行，将路径替换为实际包路径
npm install /absolute/path/apptify/apptify-0.1.0.tgz
npm install vue@^3.5 vuetify@^3.9
```

Vue 与 Vuetify 是 peer dependencies。图标使用 `lucide-vue-next`，桌面图片预览的缩放与手势使用 `@panzoom/panzoom`，手机端使用图片边界约束的 Pointer Events 手势。本库没有要求安装 Vuetify 插件或导入其完整样式，也不需要 `<v-app>`。

## 接入应用

JavaScript 和 TypeScript 项目都可直接使用。消费项目不需要 TypeScript、`tsconfig.json` 或 `<script setup>`；普通 `<script>` 与 Options API 是完整支持的用法。随包提供的类型声明也可以为 JavaScript 编辑器提供补全。

```js
// src/main.js
import { createApp } from 'vue'
import { createAppleUI } from 'apptify'
import 'apptify/style.css'
import App from './App.vue'

const apple = createAppleUI({
  theme: 'system',
  motion: 'auto',
  persist: true,
  storageKey: 'my-app:appearance',
})

createApp(App).use(apple).mount('#app')
```

```vue
<!-- App.vue -->
<template>
  <apple-provider>
    <main>
      <apple-container>
        <apple-card title="个人资料" subtitle="保持联系。">
          <apple-input v-model="name" label="姓名" autocomplete="name" />
          <template #actions>
            <apple-button @click="save">保存</apple-button>
          </template>
        </apple-card>
      </apple-container>
    </main>
  </apple-provider>
</template>

<script>
export default {
  data: () => ({ name: '' }),
  methods: {
    save() {
      this.$apple.notify('资料已保存', { tone: 'success' })
    },
  },
}
</script>
```

这是 Options API 用法。插件注册 PascalCase 名称，Vue 模板同时支持 `<AppleCard>` 和 `<apple-card>`。所有组件也可命名导入并局部注册。

`AppleProvider` 应包住业务 UI。它应用主题变量、监听系统偏好、提供同主题的 Teleport 目标，并自动渲染 `AppleOverlayHost`。**不要在同一上下文再额外渲染一份 Host。** 根 Provider 不传属性时复用插件上下文；嵌套 Provider 或显式指定 `theme` / `motion` 的 Provider 会建立局部上下文。嵌套 Provider 未指定的主题与动效属性跟随父级更新。

`this.$apple` 始终指向插件级上下文。局部 Provider 内的组件如需使用局部主题、通知或弹层，使用 Options API 注入：

```js
import { appleKey } from 'apptify'

export default {
  inject: { apple: { from: appleKey } },
  methods: {
    showMessage() {
      this.apple.notify('使用当前 Provider 的通知')
    },
  },
}
```

也导出 `useApple()` 供 Composition API 的 `setup()` 使用，但不需要为接入组件库重写现有 Options API 页面。

## 自动路由（与 Vuetify 项目相同）

采用 `vite-plugin-pages` + Vue Router 4，默认扫描 `src/views`。新页面自动生成路由，不需要维护 routes 数组；普通 JavaScript 和 Options API 页面同样适用。

```sh
npm install vue-router@^4.5
npm install -D vite-plugin-pages@^0.32.4
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import apptifyRoutes from 'apptify/vite'

export default defineConfig({
  plugins: [apptifyRoutes(), vue()],
})
```

```js
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
```

```js
// src/main.js
import { createApp } from 'vue'
import { createAppleUI } from 'apptify'
import 'apptify/style.css'
import App from './App.vue'
import router from './router'

createApp(App).use(createAppleUI()).use(router).mount('#app')
```

```vue
<!-- src/App.vue：全局主题和弹层跨页面保留 -->
<template>
  <apple-provider>
    <router-view />
  </apple-provider>
</template>
```

| 页面文件 | 路由 |
| --- | --- |
| `src/views/index.vue` | `/` |
| `src/views/about.vue` | `/about` |
| `src/views/users/[id].vue` | `/users/:id` |
| `src/views/[...all].vue` | 未匹配地址（404 页面） |

页面内使用 `<router-link to="/about">关于</router-link>`，Options API 可通过 `this.$router.push('/about')` 跳转、通过 `this.$route.params.id` 读取参数。页面无需再包根 `apple-provider`。

TypeScript 项目在 `src/vite-env.d.ts` 增加 `/// <reference types="vite-plugin-pages/client" />`。需要改扫描目录时传入 `apptifyRoutes({ dirs: [{ dir: 'src/pages', baseRoute: '' }] })`；支持其余 Pages 选项，包括排除文件和扩展路由。

已经接入 `Pages()` 的项目继续使用现有配置即可，避免重复添加生成插件。`apptify/vite` 只负责构建时生成路由，浏览器组件入口不加载此插件。

本仓库演示也使用同一套机制：`playground/App.vue` 放 Provider 与 RouterView，`playground/router/index.ts` 创建 Router，工作台页面位于 `playground/views/index.vue`。演示扫描目录设为 `playground/views`。

使用 history 模式部署时，服务器需要将页面 URL 回退到 `index.html`，并保留 `/api` 和静态资源自己的处理规则；你的 Spring Boot 项目同样需要配置该回退。无法配置回退时，可改用 `createWebHashHistory(import.meta.env.BASE_URL)`。

## 主题与动效

共享响应式状态统一使用 `ref`：`theme`、`motion`、`overlays.entries` 和 `portalTarget`。在 JavaScript 中通过 `.value` 访问；嵌套访问（如 `$apple.theme.value.name`）也需显式使用 `.value`。

内置主题为 `light`、`dark`、`graphite`、`rose`；`system` 表示跟随系统浅深色。主题即时生效，不需要刷新页面。设置 `persist: true` 才会保存主题名称、动效等级并同步其他标签页的同名存储设置；自定义主题定义应通过初始化 `themes` 配置或启动时的 `register()` 再次提供。

```js
this.$apple.theme.value.set('dark')
this.$apple.theme.value.register('forest', {
  accent: '#237047',
  'accent-text': '#ffffff',
  bg: '#f4f7f5',
  surface: '#ffffff',
}, 'light')
this.$apple.theme.value.set('forest')
this.$apple.motion.value.set('reduced')
```

`register(name, tokens, scheme)` 自动补齐对应浅色或深色主题的默认 token。可覆盖 `bg`、`surface`、`surface-alt`、`text`、`secondary`、`border`、`accent`、`accent-text`、`danger`、`success`、`warning`、`shadow`、`radius`，对应 `--apple-*` CSS 变量。注册后先调用 `set()` 才会切换；`system` 是保留名称。

| 动效值 | 行为 |
| --- | --- |
| `auto` | 自动遵循系统减少动态效果偏好。 |
| `full` | 在全局策略与系统偏好允许时使用完整动效。 |
| `reduced` | 减少位移、缩放和持续动态，保留必要状态反馈。 |
| `none` | 关闭动效，包括按钮 Ripple。 |
| `inherit` | 组件默认值，继承当前 Provider 的策略；不是全局配置值。 |

全局 `none` / `reduced` 是动效上限，安全优先。组件可以再降低动效，但 `motion="full"` 不能越过全局限制或系统的减少动态效果偏好。支持 `motion` 的组件以 [API 表](docs/COMPONENTS.md) 为准；静态布局组件不需要动效属性。

```vue
<apple-card motion="none" zoom="none" title="静态内容" />
<apple-button :ripple="false">仅关闭这个按钮的波纹</apple-button>
```

## Dialog 与反向通道

```js
const dialog = this.$apple.dialog({
  title: '删除文件？',
  message: '此操作不能撤销。',
  confirmText: '删除',
  cancelText: '取消',
  tone: 'danger',
})

const confirmed = await dialog.result
// 默认确认返回 true，取消返回 false，关闭按钮 / Escape 返回 undefined。
if (confirmed === true) this.$apple.notify('文件已删除', { tone: 'success' })
```

每次调用创建独立层。`dialog` 句柄含 `id`、`close(value?)`、`update(patch)` 与 `result` Promise。`this.$apple.overlays.closeTop()` 只关闭最上面的非通知弹层；已有层不会被新层覆盖。声明式 `<apple-dialog v-model="opened">` 与命令式弹层共享焦点栈和滚动锁。

自定义弹层组件接收 `close`、`sendMessage` 两个 prop。下面的编辑组件通过反向通道请求父调用方保存，父调用方再打开第二层确认。

```vue
<!-- ProfileEditor.vue -->
<template>
  <apple-input v-model="name" label="姓名" />
  <apple-button :loading="saving" @click="save">保存资料</apple-button>
</template>

<script>
export default {
  props: {
    initialName: { type: String, default: '' },
    close: { type: Function, required: true },
    sendMessage: { type: Function, required: true },
  },
  data() { return { name: this.initialName, saving: false } },
  methods: {
    async save() {
      this.saving = true
      try {
        const result = await this.sendMessage('profile:save', { name: this.name })
        if (result?.saved) this.close(result)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
```

```js
import ProfileEditor from './ProfileEditor.vue'

export default {
  methods: {
    async editProfile() {
      const editor = this.$apple.dialog({
        title: '编辑资料',
        component: ProfileEditor,
        props: { initialName: '小明' },
        confirmText: '',
        cancelText: '取消',
        onMessage: async (channel, payload) => {
          if (channel !== 'profile:save') return
          const confirmation = this.$apple.dialog({
            title: '保存修改？',
            message: `将姓名更新为 ${payload.name}。`,
          })
          if (await confirmation.result !== true) return { saved: false }
          // 在这里执行实际业务请求；该示例只返回结果。
          return { saved: true, name: payload.name }
        },
      })
      const result = await editor.result
      if (result?.saved) this.$apple.notify('资料已保存', { tone: 'success' })
    },
  },
}
```

通用消息总线也有真实的返回值通道，而不只是单向通知：

```js
const unsubscribe = this.$apple.onMessage('profile:read', () => ({ name: '小明' }))
const responses = this.$apple.sendMessage('profile:read')
console.log(responses[0].name)
unsubscribe()
```

`sendMessage()` 同步调用监听器，返回所有监听器返回值组成的数组；异步监听器返回 Promise，可用 `Promise.all()` 等待。动态弹层的 `sendMessage()` 若有专属 `onMessage`，直接返回该回调结果；未设置时才回退到当前上下文消息总线。长期监听请在 `beforeUnmount` 中调用取消订阅函数。

## 通知与图片

```js
const notice = this.$apple.notify('正在同步', { duration: 0 })
notice.update({ message: '同步完成', tone: 'success', duration: 2500 })
// 或 notice.close()
```

通知独立堆叠，默认 4 秒，`duration: 0` 常驻，悬停或键盘焦点进入时暂停倒计时。需要动作按钮时直接使用 `<apple-snackbar action="撤销" @action="undo" />`；命令式 `notify()` 当前没有 action 配置。

```vue
<apple-image
  src="/images/workspace.webp"
  alt="桌面工作区"
  :gallery="['/images/workspace.webp', '/images/detail.webp']"
  :index="0"
  gallery-layout="compact"
/>

<apple-image-viewer
  v-model="previewOpen"
  v-model:index="previewIndex"
  :images="[{ src: '/images/workspace.webp', alt: '桌面工作区' }]"
  loop
/>
```

示例图片路径需要替换为业务资源。`AppleImage` 默认支持点击预览，可用 `:preview="false"` 关闭。手机端的图片组支持 `gallery-layout="compact"`（固定框内横滑，默认）和 `gallery-layout="tiled"`（横向平铺，溢出时显示随主题变化的圆角滚动条，支持拖动、轨道点击及键盘操作），组内每张预览图都会渲染。省空间（compact）模式桌面触控板支持自由连续横滑，一次手势可跨越多张图片，垂直滚动仍交给页面；快速连续点击翻页会沿当前画面的位置和速度继续。点击小点跨多张时，直接在当前画面和目标图之间滑动一屏，不快速扫过中间图片；小点保持选中目标，连续改选从当前动画画面衔接。预览支持双指缩放与同时平移、双击放大或恢复、松手边界回弹、左右滑动切图、单击或下滑退出，顶部显示序号。手机单击等待 200ms 区分双击；双击围绕点击位置放大至 2 倍，再次双击恢复；拖动、双指操作、切图及关闭会取消等待中的单击。按钮、键盘和静止松手后的切图使用接近小窗横滑的先加速、后减速曲线，时长随移动距离调整；滑动松手仍以带初速度的阻尼曲线延续手势，快速轻扫也能翻页，翻页、缩放和边界回弹均可由下一次触摸接住；循环首尾只移动相邻图片。打开和关闭通过固定尺寸图片的 transform 与裁剪连接原图位置，避免逐帧修改布局尺寸；退出前同步横滑预览的位置，当前缩略图保持黑色占位直到落回。`AppleImage` 统一使用同一组件入口，根据 `navigator.maxTouchPoints` 或 `(any-pointer: coarse)` 判断触屏能力，不按屏幕宽度区分；触屏设备使用手势预览，非触屏设备保留缩放、拖动、旋转、左右按钮与键盘控制。双端共用图片专用的阻尼节奏：打开 360ms、关闭 300ms、双击缩放 300ms，翻页根据剩余距离与松手速度调整；这些时长独立于通用 UI 过渡。桌面端按钮缩放、双击缩放与旋转平滑过渡，拖动可接住缩放中的实际位置，滚轮仍直接跟随输入。减少动态效果时不执行大幅位移或缩放，关闭动效时立即更新。双端预览按钮均使用半透明背景、backdrop blur 和 200% 饱和度。独立 Viewer 可传入 `:origin="index => thumbnailElements[index]"` 接入原位动画。

## 移动端与边界

- 弹层、抽屉、底部面板和通知考虑安全区；布局基于可用宽度，而不是把屏幕横竖方向等同于设备类型。
- 提供下拉刷新、无限加载、侧滑操作、验证码、级联选择、ActionSheet 等组件，保留桌面按钮或键盘入口。
- 日期、时间、颜色和基础 Select 使用浏览器原生选择能力；弹出界面随操作系统变化，不宣称它们在所有平台都长得完全一样。
- Upload 负责本地文件选择、拖放与限制校验，不自动上传文件；Table 支持客户端排序、分页、固定行高虚拟滚动与列宽拖拽，不含服务端分页协议。
- 导入阶段避免直接访问浏览器全局；这不等于已完成 SSR 全部组件的服务端渲染、hydration、跨请求隔离和主题首屏验证。SSR 接入时每个请求创建独立实例，并自行验证水合行为。
- 本项目不是浏览器、屏幕阅读器和实体设备兼容矩阵认证。即使桌面/移动视口检查通过，也不代表已覆盖 iOS Safari、Android WebView、触控笔、软键盘与所有真机组合。

## 从旧项目迁移

| 旧方式 | 新方式与差异 |
| --- | --- |
| `<apple-card title subtitle text icon icon-color>` | 保留这些属性与默认 slot，并增加 `media`、`title`、`icon`、`actions` slots。 |
| `zoom="big/small/none"`、`shadow="normal/static/focused/none"` | 继续支持；新默认 `zoom="small"`，不保证旧尺寸和缩放数值完全一致。 |
| `icon="mdi-home"` | 不再识别 MDI 字符串。导入 Lucide 组件并通过 `:icon="Home"` 传入；Card 的字符串 icon 被当作图片 URL。 |
| `globalTheme` / `fancyAnimation` 模块常量 | 改用响应式 `theme.value.set()` / `motion.value.set()`；不需要刷新，也不要再直接读写旧 localStorage 键。 |
| `sendMessage('showSnackbar', { type, text })` | 在 `this.$apple.sendMessage()` 或当前注入上下文上兼容；`showSnackBar`、`showMessage` 别名也保留。 |
| `sendMessage('showDiag', { title, message })` | 仍可通过当前上下文发送；推荐使用返回独立句柄与 Promise 的 `dialog()`。 |
| `btn: [{ bgColor, text, clickEvent }]` | **不直接兼容**。简单对话框用 `confirmText` / `cancelText`，复杂交互用声明式 `#footer` 或动态组件。 |
| `sendMessage('closeDiag')` | 关闭当前上下文最上面的非通知弹层；不会一次关闭全部层。 |
| `<e-img src squared gallery index>` | 改为 `<apple-image>`，并补上必需的 `alt`；不注册旧 `e-img` 名称。 |

## 验证命令

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run test:package
```

命令是否通过以当前执行结果为准。`build` 生成组件库 `dist/`、类型声明与工作台 `site/`。源码中的行为测试不代替消费项目的业务测试与真机验证。
