# AppleInput API 页面样板

当前验收入口：<http://127.0.0.1:5201/component-docs/apple-input>。也可以从组件总览的 AppleInput 卡片底部 AppleLink「代码与 API」进入。第一阶段只注册 AppleInput，未扩面、未提交、未发布，404 与已有工作保持原样。

## 当前交互

- 独立页面，顶部使用 AppleBreadcrumbs；四边 padding 统一40px。顶部组件演示、左侧 AppleTree 列出全部属性、事件、插槽和方法，点击定位并高亮；支持键盘展开/折叠，不再显示单独的 API tab。总览入口与相邻展开栏的高度、字号、字重、颜色和padding一致。
- 17 条公开接口：11 个 props、3 个 events、2 个 slots、focus() 方法。均有源码核实的类型、默认值（适用时）、解释和行为边界。
- 示例按需提供。Vue 原生 v-model 与原生 placeholder 只解释，不另做专门示例；15 个组件相关例子通过 AppleAccordion 展开。
- 示例标题、功能和操作说明全部放在 Accordion 的展开内容内。
- 桌面左侧效果、右侧 Vue SFC；720px 以下上下排列。三项输入类型使用 AppleSegmentedControl；五项动效模式使用 AppleSelect，状态切换使用 AppleSwitch，示例容器使用 AppleCard，操作使用 AppleButton。
- API 文档按页面加载；编译器、CodeMirror、运行资源直到展开示例才加载。任意时刻只有一个编辑器与 iframe，折叠/切换销毁实例，草稿仅保存本页内代码文本，离开页面丢弃。恢复示例返回原始文本。
- 移除了组件源码编辑 tab。源码提取工具与可选 implementation 契约保留供后续确需源码的示例使用，当前页面不下载源码快照。

## 可复用边界

`playground/editor/contract.ts` 定义 ComponentDocument：name/source、props/events/slots/methods/notes。ApiEntry 必须提供 id/name/type/description，default 与完整 SFC example 可选。不要为了填满页面给所有原生 API 制作重复示例。

`playground/editor/documents.ts` 是轻量注册表，每项提供名称、标签、分组、说明、异步文档 loader，以及可选预览组件。组件总览根据注册表自动显示文档入口；没有注册的组件保持原来的展开区。

`playground/views/component-docs/[component].vue` 是共用文件路由：根据 slug 读取注册表、加载文档、生成导航与演示。没有 AppleInput 的专属布局逻辑，也不依赖总览的 ComponentDemo/catalog。删除总览及其演示文件时，独立文档仍可构建。

`ComponentDocumentLink.vue` 只负责卡片底部 AppleLink 与 Vue Router 导航。`ComponentWorkshop.vue` 接收 doc prop，统一渲染 API、Accordion、单个活动示例和文本草稿。`LiveVueEditor.vue` 只接收 files、activeFile、baselineFiles，负责官方 REPL、主题、恢复/复制和错误显示。

后续接入步骤：从组件真实源码列举接口 → 编写符合契约的文档和必要 SFC 例子 → 提供可选轻量预览 → 注册 slug。页面/入口/编辑器不需要复制或重写。当前注册表只含 AppleInput，待样板验收后再按组件分块实施。

## 编译方案、依赖与资源

使用 [Vue 官方 @vue/repl](https://github.com/vuejs/repl) 4.7.2、官方 CodeMirror、useStore/Sandbox/compiler-sfc。不自造正则编译器。用户代码在本地浏览器编译，不上传第三方。支持 template、script setup、普通 CSS/scoped CSS、响应式状态及组件库 ESM 导入。

[Vuetify Play](https://play.vuetifyjs.com/) 作为交互依据；已检查官方发布页面/入口，使用 Vue REPL 与异步 MonacoWrapper。本样板选择较轻的官方 CodeMirror，避免 Monaco 的额外 CDN 类型加载。

开发依赖：固定 @vue/repl 4.7.2、es-module-shims ^2.8.4、esbuild ^0.25.12、postcss ^8.5.28；esbuild/PostCSS 原已作为传递依赖安装，现声明为构建工具直接依赖。未升级无关依赖，不加入组件库生产入口。

当前生产 gzip 约：文档数据 4.8KB；共享路由 JS/CSS 3.8KB；展开时编辑器/compiler/CodeMirror JS 417.6KB、CSS 4.3KB；预览 Vue 41.9KB、Apptify runtime 79.6KB、库 CSS 16.2KB、shim 23KB。展开新增约583KB gzip。额外 TS/JSX 转换块约1.05MB gzip，仅相关语法触发时加载。下载缓存关闭后仍保留，运行实例销毁。

`tooling/playground-editor.mjs` 将本地库及依赖打包为浏览器 ESM，Vue 单独映射；消费者使用公开 apptify/apptify/style.css，不依赖仓库外路径。模板同步包含注册表、页面、共享编辑器、预览与文档数据。Vite dev/preview 自动给 assets/editor/* 添加公开资源 CORS；静态部署也需设置这些资源的 CORS。

## 隔离与限制

固定版本 REPL 的 sandbox 收紧为 allow-scripts，其余权限删除，上游结构变化时构建失败，未改官方编译器。opaque iframe 隔离父文档/存储及预览 CSS，普通编译/运行错误在编辑器中展示。CSP 默认禁止资源，允许 inline/blob/本机运行资源；不自动解析任意 npm、不请求 CDN。严格父 CSP 需要兼容 srcdoc、inline 模块与 blob；本样板不修改父服务器策略。

iframe 可能共享浏览器进程，同步死循环、超大编译输入、内存耗尽仍可能卡住标签页；刷新可恢复，不能承诺完全隔离。CSP 允许当前 origin 请求，不隔离同源 API 副作用，不运行不可信代码。无 Sass/Less、任意 npm 解析、服务端 API 与文件系统。

真实表单导航被禁用；required 例子使用原生 reportValidity() 模拟提交校验。重新编译会 unmount 旧 Vue 应用，代码创建的资源须在 onUnmounted 清理；重新运行重建 iframe，折叠/离开销毁运行 realm。auto-resize=false 避免上游每次 mount 额外注册未清理的 resize handler；CodeMirror 自身一次性共享处理器保留。

用户截图中的 import map 报错已修复：useStore 之前同步建立文件/map，以 App.vue 开始编译再切换活动文件，设置 welcomeSFC 防止官方默认欢迎页替换入口。恢复带完整 map 并串行应用。

## 验证

`tests/e2e/input-workshop.spec.ts` 验证总览底部 AppleLink 导航、直接访问文档路由、无多余 tab、面包屑、40px padding、相邻底栏样式一致性、17 个接口/15 个 Accordion、展开前无编辑器/编译器资源、同一时间一个编辑器、每个例子的实际组件显示、代码修改、编译/运行错误恢复、清空、required/focus、草稿保留/恢复、反复运行、dark 主题、桌面左右/手机上下几何位置、390px 无溢出、折叠/离开销毁。最终生产回归14.6秒通过，pageErrors为空。文档页DOM：展开前441 → 展开764 → 折叠447；编辑器与iframe均为0 → 1 → 0。折叠后保留下载资源缓存。

最新截图和原始 DOM/资源数据：`artifacts/input-workshop/api-page-desktop.png`、`api-page-mobile.png`、`metrics-v3.json`。早期弹窗证据保留为历史记录，不代表当前界面。

类型检查、生产构建、消费者完整模板/删减模板与库消费验证通过；归档验证目录为`/var/folders/y3/wc0kb5h13yl41wyj6nrf3vv00000gp/T/apptify-package-9m8mVc`。早期全库单元测试179通过、1个既有404动画frames失败；按要求未修改该内容。

所有接口与示例说明改用直白中文：先说明用途与操作，再解释必要的边界。树形导航和正文共用 sections.ts 分组契约，不需要逐页维护导航节点。

预览动效跟随页面设置，并通过组件库上下文监听系统减少动效偏好。预览根节点应用与 AppleProvider 一致的公共样式和解析后的动效模式；卸载时停止偏好监听。Playwright 验证 full 模式下分段切换存在实际动画，none 模式下没有运行中的动画。
