# 应用模板

npm 包包含完整可编辑的 Vue 应用：导航、账号表单、主题/动效/玻璃设置、404、组件示例与图片资源。

## 创建与运行

```sh
npm create apptify@latest ./my-app
cd my-app
npm install
npm run dev
```

也可运行 `npx --package=apptify apptify-playground ./my-app`。

使用 Node.js 22 或 24 LTS。目标目录必须不存在或为空；复制命令不会安装依赖。

项目的 `vendor/` 保存组件库 tgz，`package.json` 使用相对 `file:` 依赖，移动整个项目后仍可独立安装。改用 npm 更新库时，在新项目执行 `npm install apptify@latest`。

## 开始开发

| 位置 | 用途 |
| --- | --- |
| `src/App.vue` | 布局、导航项与账号入口 |
| `src/views/` | 页面与自动生成的路由 |
| `src/router/index.ts` | 滚动恢复、hash 定位与页面标题 |
| `src/components/UserMenu.vue` | 账号菜单与登录/注册表单 |
| `src/views/settings.vue` | 主题、动效与玻璃设置 |
| `src/views/[...all].vue` | 404 页面 |
| `src/style.css` | 应用样式 |
| `public/images/` | 示例图片与来源说明 |

可删除 `views/index.vue` 和 `views/components.vue`，再创建业务页面。删除后重启开发服务；导航会隐藏不存在的页面。删除组件总览后，可一并删除 `ComponentDemo.vue`、`catalog.ts` 和 `components/ComponentIndex.vue`。

例如 `src/views/orders.vue` 自动对应 `/orders`；在 `App.vue` 的 `navigation` 数组添加入口即可显示导航。`index.vue` 对应首页。

组件通过 `apptify` 导入，样式通过 `apptify/style.css` 导入；`apptify/vite` 提供文件路由插件。已有项目接入时需安装 `vue-router` 和 `vite-plugin-pages`，模板已配置这些依赖。

账号表单需要接入自己的后端。部署使用 history 路由，服务器需将页面请求回退到 `index.html`，保留 API 与静态资源路由。图片来源说明位于 `public/images/SOURCES.md`。

## 检查与本地打包

复制出的应用使用 `npm run typecheck` 和 `npm run build` 检查。

库开发者编辑原仓库的 `playground/`，打包时将其映射为模板的 `src/`。`npm pack` 自动构建组件库并准备模板；本地安装生成的 tgz 后，也可运行 `npx --no-install apptify-playground ../my-app`。

`npm run test:package` 验证包内容、独立安装、模板复制、类型检查、构建与浏览器交互，并检查删除示例页面后的行为。命令输出临时目录与验收结果路径。验证指定归档：

```sh
node tooling/test-playground-package.mjs /absolute/path/apptify-<version>.tgz
```
