# Apptify 可编辑应用模板

完整源码位于 playground/，静态图片与来源说明位于 public/images/。导航、账号/登录、设置、404 和页面动效均可直接编辑复用。

通过 apptify-playground 复制命令创建时，vendor/ 包含本地组件库 tgz，package.json 使用相对 file: 依赖；移动整个项目后仍可独立安装。

运行 npm install、npm run typecheck、npm run build；开发使用 npm run dev。请使用 Node.js 22 或 24 LTS。

开始业务开发可直接删除 playground/views/index.vue 和 playground/views/components.vue，再添加自己的页面；文件路由自动生成，导航自动隐藏已删除页面，品牌链接回到第一个保留的导航页面。删除页面后重启开发服务。

导航项在 playground/App.vue 的 navigation 数组；页面文件在 playground/views/；布局和账号入口在 App.vue 与 playground/components/UserMenu.vue。

设置保留主题、动效与玻璃偏好。404 在 playground/views/[...all].vue；首页和组件总览没有被其他页面硬导入。ComponentDemo.vue、catalog.ts 和 ComponentIndex.vue 可以保留，也可在删除总览页后按需删除。

登录、注册、忘记密码、邮箱验证码仍为 UI 演示入口，需要接入自己的后端。部署采用 history 路由，服务器应把未知页面路径回退到 index.html。

若手工复制包内 templates/playground，先将 package.json 的 apptify 依赖替换为实际本地 tgz 路径，或安装自己的正式发布版本；当前项目尚未发布 npm。
