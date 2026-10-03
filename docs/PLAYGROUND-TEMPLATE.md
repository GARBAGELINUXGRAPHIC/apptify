# 完整 playground 应用模板

apptify 包既提供组件库，也携带完整的可编辑应用模板。模板源码在包内 templates/playground/，包括导航与页面布局、账号菜单与登录/注册表单、主题/动效/玻璃设置、404 纸片故事、全部示例页面及图片资源。

这些应用文件不增加组件库的公开 exports。复制出的项目通过 apptify 和 apptify/vite 使用已打包组件库，不能导入原仓库的 src。

## 从本地包创建应用

当前尚未发布 npm。使用 Node.js 22 或 24 LTS，先在库仓库生成包：

~~~sh
npm ci
npm pack --pack-destination /tmp
~~~

npm pack 会先执行构建与模板准备。将输出的实际 tgz 路径代入以下命令；在一个用于安装组件库的空目录执行：

~~~sh
npm init -y
npm install /tmp/apptify-0.4.0.tgz
npx --no-install apptify-playground ../my-app
cd ../my-app
npm install
npm run typecheck
npm run build
npm run dev
~~~

复制命令要求目标目录不存在或为空，拒绝覆盖已有项目。复制过程不会自动安装项目依赖。

my-app/vendor/ 会携带组件库 tgz，应用依赖使用相对 file: 依赖。可以把整个 my-app 移动到另一目录或发给其他使用者；后续安装无需原仓库或用于调用命令的安装目录。运行与构建所需依赖全部声明在应用的 package.json。更新库时可把新 tgz 放入 vendor/ 并调整该相对依赖。

也可手工复制包内 templates/playground/，把 gitignore 重命名为 .gitignore，再将模板 package.json 中的 apptify 版本依赖改为本地 tgz；复制命令会自动完成这些步骤。仓库内 templates/playground 是打包时生成的目录，开发者应编辑 playground 源文件；使用者复制出的项目可以直接编辑。

## 开始业务开发

可以只删除以下两页，然后编写自己的页面：

~~~text
playground/views/index.vue
playground/views/components.vue
~~~

文件路由从 playground/views/ 自动生成，不存在对这两页的硬导入。删除后重启开发服务即可；模板导航自动隐藏不存在的页面，品牌链接回到第一个保留的导航项，404 的“返回首页”在没有首页时回到设置。

新页面例如 playground/views/orders.vue 会得到 /orders 路由。将入口加入 playground/App.vue 的 navigation 数组即可出现在顶部导航。自己的 index.vue 仍对应首页。生产服务器需把 history 路由请求回退到 index.html。

删除组件总览后，ComponentDemo.vue、catalog.ts 和 components/ComponentIndex.vue 可以留着，也可按需删除；设置、账号、404 与布局不依赖它们。不需要清理库组件依赖或维护手写路由列表。

| 可编辑位置 | 用途 |
| --- | --- |
| playground/App.vue | 公共导航、品牌、账号入口和页面进入动效 |
| playground/router/index.ts | 滚动恢复、hash 定位和页面标题 |
| playground/components/UserMenu.vue | 账号菜单、登录/注册、邮箱验证码和忘记密码入口 |
| playground/views/settings.vue | 外观、动效和玻璃偏好 |
| playground/views/[...all].vue 与 components/not-found-paper-* | 404 页面与故事 |
| playground/style.css | 应用布局与页面样式 |
| public/images/ | 示例图片与来源说明 |

账户操作仍是 UI 演示，需要接入使用者自己的后端。图片来源说明随模板保留在 public/images/SOURCES.md。

## 本地交付验证

在库仓库执行：

~~~sh
npm run test:package
~~~

此检查会构建原库消费者、生成真实 npm tarball、检查每份 playground 源码和静态资源都在包内，并在临时空目录安装包后调用复制命令。随后删除最初的安装目录，独立安装、类型检查、构建和启动复制项目，实测导航、图片、设置、登录及 404；再删除首页、组件总览及其可选演示文件，重复类型检查、构建和浏览器验证。原库消费测试仍单独执行。

source-snapshot.json 记录本次复制前各源码与资源的 SHA-256。构建前后与验收末尾都会比对库、模板、资源及配置；若用户在打包中途编辑，检查要求重新取最新快照，不会回写或恢复旧源码。命令打印临时目录与验收 JSON 路径，失败时也保留该目录用于检查。

已生成的具体 tgz 也可直接复验：运行 node tooling/test-playground-package.mjs /absolute/path/apptify-0.4.0.tgz。验收结果记录该文件 SHA-256，避免并行构建替换了被验证对象。
