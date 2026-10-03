# Apptify

面向桌面与移动端的 Vue 3 组件库，采用 Apple 风格设计，统一使用 `<apple-*>` 标签。支持主题切换、减少动效、表单、图片预览与多层弹窗；支持 JavaScript、TypeScript 和 Options API。

[npm](https://www.npmjs.com/package/apptify) · [组件 API](docs/COMPONENTS.md) · [应用模板](docs/PLAYGROUND-TEMPLATE.md)

## 安装

```sh
npm install apptify vue@^3.5 vuetify@^3.9
```

Vue 与 Vuetify 是 peer dependencies。Vuetify 仅用于 Ripple，无需安装其插件、导入完整样式或使用 `<v-app>`。

## 快速接入

```js
// src/main.js
import { createApp } from 'vue'
import { createAppleUI } from 'apptify'
import 'apptify/style.css'
import App from './App.vue'

createApp(App)
  .use(createAppleUI({ theme: 'system', motion: 'auto', persist: true }))
  .mount('#app')
```

```vue
<!-- App.vue -->
<template>
  <apple-provider>
    <apple-container>
      <apple-card title="个人资料">
        <apple-input v-model="name" label="姓名" />
        <template #actions>
          <apple-button @click="save">保存</apple-button>
        </template>
      </apple-card>
    </apple-container>
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

`AppleProvider` 提供主题与弹层宿主，无需额外添加 `AppleOverlayHost`。插件全局注册组件，也支持命名导入并局部注册。嵌套 Provider 内可用 `appleKey` 注入局部上下文，或在 `setup()` 中使用 `useApple()`。

## 常用 API

```js
this.$apple.theme.value.set('dark')
this.$apple.motion.value.set('reduced')
this.$apple.notify('保存成功', { tone: 'success' })

const dialog = this.$apple.dialog({ title: '保存修改？', cancelText: '取消' })
const confirmed = await dialog.result // 确认 true，取消 false，关闭 undefined
```

内置主题：`light`、`dark`、`graphite`、`rose`；`system` 跟随系统。全局动效：`auto`、`full`、`reduced`、`none`。共享状态使用 ref，在 JavaScript 中通过 `.value` 访问。

Props、事件、插槽、自定义主题与弹层消息回传见[组件 API](docs/COMPONENTS.md)。

## 创建完整应用

```sh
npm create apptify@latest ./my-app
cd my-app
npm install
npm run dev
```

也可运行 `npx --package=apptify apptify-playground ./my-app`。

目标目录需为空。模板含导航、设置、账号表单、404 和组件示例，可直接编辑；账号功能需接入自己的后端。复制项目携带库归档，可独立安装。页面开发与部署见[应用模板](docs/PLAYGROUND-TEMPLATE.md)。

## 本地开发

```sh
npm ci
npm run dev
```

建议 Node.js 22 或 24 LTS。检查使用 `npm run typecheck`、`npm test`、`npm run build`、`npm run test:e2e` 和 `npm run test:package`；`npm pack` 自动构建并准备模板。生成器位于 [`packages/create-apptify`](packages/create-apptify/README.md)，使用 `npm run test:create` 验证。历史验证记录见[验证文档](docs/VALIDATION.md)。

MIT 许可。Apptify 不是 Apple 官方产品。
