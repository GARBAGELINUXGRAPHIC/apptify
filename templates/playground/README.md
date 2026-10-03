# Apptify 应用模板

可编辑的 Vue 应用，包含导航、账号表单、外观设置、404 与组件示例。建议 Node.js 22 或 24 LTS。

```sh
npm install
npm run dev
```

检查：`npm run typecheck`、`npm run build`。

- 页面：`playground/views/`，文件路由自动生成。
- 布局与导航：`playground/App.vue` 的 `navigation` 数组。
- 账号表单：`playground/components/UserMenu.vue`，需要接入自己的后端。
- 样式：`playground/style.css`；图片与来源：`public/images/`。

可删除 `views/index.vue` 和 `views/components.vue`，再添加业务页面；删除后重启开发服务。删除组件总览后，可一并删除 `ComponentDemo.vue`、`catalog.ts` 和 `components/ComponentIndex.vue`。

复制命令在 `vendor/` 保存库归档，移动整个项目后仍可独立安装。使用 npm 更新库：`npm install apptify@latest`。手工复制模板时，将 `gitignore` 重命名为 `.gitignore`。

部署时将页面请求回退到 `index.html`，保留 API 与静态资源路由。
