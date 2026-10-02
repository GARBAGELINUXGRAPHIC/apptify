# Apptify 本机修复验收清单

项目：`/Users/quitsense/web/apptify`。参考：`/Users/quitsense/web/BJUT-auto-login/refrences/vuetify-project`。

本清单以用户最新要求覆盖早期版本。状态“专项通过”表示相关测试已通过，最终全量仍需等待全部并行任务稳定。没有提交、推送、发布或部署。

| 要求 | 对应文件 | 验证与当前状态 |
| --- | --- | --- |
| 保留原有用户工作 | 工作区全部文件 | 改动前 `baseline/source-before.tar.gz`、`tracked.diff`、`status.txt` 已保存；未重置工作树 |
| 库 Tree 目录、aside 搜索、定位/刷新/滚动高亮 | `playground/components/ComponentIndex.vue`、`views/components.vue` | 专项通过；右侧 68 个预览保持，多列同排高亮验证 |
| 宽屏卡片自动多列扩展 | `views/components.vue` | 320/390/768 单列，1440 双列，1920 三列，2240 四列，2560 五列；集成外观 9 项通过 |
| 目录 hover 只有单层圆角渐变，无缩放 | `ComponentIndex.vue` | 专项和集成通过；移入移出/快速跨行几何不变 |
| Router/aside 同步进入，快速切换与返回 | `playground/App.vue`、`src/core/motion.ts` | 专项通过；hash 不重放，main/aside 同步、navbar 固定；reduced/none 验证 |
| 顶部 Navibar 切换动画 | `src/styles/navibar.css`、`tests/e2e/navibar.spec.ts` | 用户已接受原菜单切换动画；最新背景始终实白/实黑，不参与玻璃设置、无blur或背景过渡，菜单height/关闭语义保留。Navibar及组件旧回归16项通过 |
| 首页/设置/登录/全站控件使用库组件 | `views/index.vue`、`settings.vue`、`components.vue`、`[...all].vue`、`UserMenu.vue` | CTA、主题选择、工具栏、404、账号动作已改库组件。代码/API 用 AppleAccordion，复制功能通过；合理原生扩展保留 |
| 登录/注册布局、a 标记、密码及入口 | `UserMenu.vue` | 专项通过；忘记密码/邮箱验证码入口、登录注册互转、清密码/焦点；真实后端未接入并有反馈 |
| 账号触发无 border；菜单/auth 实底 | `UserMenu.vue` | 明暗、320/1440、dark+opacity100 专项通过；菜单/弹窗24px，表单并排按钮8px |
| 搜索列表/表格 items 不飞动，只容器高度 | `src/components/content.ts`、`src/styles/content.css` | AppleList 移除 TransitionGroup；Table 接 AutoSize；列表/表格快速反转专项通过 |
| 设置展开预览仅容器高度 | `views/settings.vue` | 内层 Transition 已移除；相关专项通过 |
| Transition 示例双向同时切换 | `playground/ComponentDemo.vue` | 同时淡入淡出和相反方向位移；快速反向/none 专项通过 |
| Tag 内容尺寸、50:50正文与右侧一体X | `src/styles/content.css`、`content.ts` Tag区段、`ComponentDemo.vue` | 正文border/theme text精确50:50；X26px贴右内边界、仅右圆角、共享中性ripple、focus inset。Tag9+glass9浏览器及40单测通过；添加按钮同字体/文字基线/44px触达的3宽度回归通过 |
| 玻璃 opacity/blur/持久化/reset | `src/core/context.ts`、`foundation.ts`、`settings.vue` | opacity0..100，默认80/255×100；blur2..22 默认12；跨路由/reload/reset/嵌套 Provider 专项通过 |
| 玻璃按主题黑/白；Navibar实底例外 | `context.ts`、`navibar.css`、三类popup CSS | 浅色白色、深色黑色+同一alpha，saturate2；Navibar/账号菜单/auth保持实底。深色白玻璃六色补丁已撤销，玻璃9项最新回归通过 |
| 设置预览大量细碎小物体 | `settings.vue` | 内嵌SVG16类小物件，无外部请求；2/12/22px截图已检查，设置相关17项通过 |
| 下拉选中无背景，hover透灰，透明ripple | `forms.css`、`date-picker.css`、`overlays.css` | 选中透明，hover8%/press12%中性灰；date hoverTrail同步；仅keyboard-active显示outline。相关专项通过；Autocomplete跨卡片透底效果正按用户截图做真实像素诊断 |
| 输入内按钮无缝拼接、只外侧圆角 | `forms.css`、`forms.ts` | 已撤销本轮错误padding/gap/全圆角；320/390/1440、前后缀/clear/eye/日期/stepper专项通过 |
| Slider 白点hover/拖动两灰，无光晕 | `forms.css` | 填色与无光晕通过；最新边框中灰#c4c4c8、320/390/1440实测专项通过 |
| Color picker 开合性能、HEX draft+Apply | `forms.ts`、`forms.css` | 逐键不提交，Apply/Enter/IME/非法草稿/关闭重开通过；20浏览器+35单测专项通过 |
| Steps 仅圆点/文字响应，空白无ripple | `content.ts`、`content.css` Steps区段 | 图标复用AppleButton，勾/数字中心误差0，文字单独点击、空白无事件，完成圆点描边/hover实底；全部专项通过 |
| Pagination 输入+Apply与活动指示器 | `content.ts`、`content.css` Pagination区段 | draft/Apply/Enter/非法/disabled及共享indicator快速反向通过；320自适应页码数量，保持44×44触达；20浏览器/33单测通过。最新indicator直接使用accent，明暗与Apply同为rgb(0,113,227)，专项2/2通过 |
| 所有彩色在明暗主题保持同源 | `context.ts` 与组件彩色规则 | dark删除四彩色覆盖，继承light；6色×3载体computed一致及custom/Alert/Badge/Progress专项通过。Tag正文已被最新50:50要求覆盖，不再以旧纯中性正文对比结果验收 |
| 全局ripple裁剪/层级/灰色来源 | `src/core/motion.ts` ripple区段、`src/styles/ripple.css`、Accordion/List圆角 | 专项完成：11项真实PNG裁剪/层级/生命周期回归通过，删除input父裁剪后的2组13caller矩阵也通过；104相关单测通过 |
| AppleImage compact 自由连续触控板滚动 | `foundation.ts` AppleImage区段、`base.css` | 一页锁/helper已移除，图内原生滚动、箭头/Shift完整delta转发，scroll-snap-stop:always移除。固定图/箭头43wheel跨多图、反向、边界的12项Chrome/WebKit回归及6单测通过；实体触控板未复验 |
| html/body主题与macOS回弹背景 | `index.html`、`playground/App.vue`、`style.css` | root/body同色，initial/reload/system/返回通过；阻止主脚本加载的专项确认初始背景正确；未禁用overscroll，真实硬件回弹未模拟 |
| 容器resize不短暂横向溢出 | `src/core/motion.ts` AppleSelection | resize同步重测，普通选择仍动画；1280→320连续24帧scrollWidth保持320，通过 |
| 轮播并入AppleImage模式 | `foundation.ts` AppleImage及公共导出/目录/文档 | 由图片原任务统一实现carousel属性及共享清理：content仅旧AppleSlide/AppleCarousel/注册、content.css旧carousel、base.css新image-carousel、content.test旧Carousel3项迁移、catalog对应行、ComponentDemo的Image/Carousel区段、README/docs与计数及旧demo-layout忽略项。其它Tabs/BackTop/Tag区段不动；集成停止写这些范围 |
| Upload整块点击与ripple | `forms.ts` AppleUpload、forms.css upload区段 | 新增要求由forms子任务upload_click独占，待专项与最终集成；本任务不并写 |
| BackTop平滑滚动最长2秒 | `content.ts` AppleBackTop、新专测 | 专项完成：最长2000ms、距离相关、wheel/touch/键盘可打断、重复不叠加、卸载/target/motion变更清理；none/reduced即时。12浏览器及35相关单测通过；区段已释放 |
| 日期/时间切换复用AppleTabBar | `src/components/date-picker.ts`、`tabs.ts`、对应CSS | 集成已原样提取Tabs到tabs.ts，content保留import/reexport、日期直接导入tabs，消除循环；typecheck通过。日期子任务获准独占tabs.ts activeValue采样/onBeforeEnter及content.css两组enter-from方向变量修复，保留其他公共motion。待其逐帧快速回切回归 |
| 404纸片松鼠叙事动画 | `views/[...all].vue`、两个not-found-paper组件、专测 | 源码稳定。11项Chrome专项通过：真实故事+循环、DOM/循环数量不增长、暂停/可见性/退出清理、none/reduced/OS偏好、320/390/768/1440；typecheck通过。待最终全站集成 |
| 最终 lint/typecheck/build/tests | 仓库 scripts 与全部测试 | 当前快照18文件158单测通过、全量E2E279/280通过；唯一测试脚本误结束无限动画已修正，相关桌面图片/导航10/10复跑通过。图片/日期/404稳定后再最终全量；仓库未配置lint脚本 |
| 本机浏览器与像素检查 | 独立Vite 5187、IAB/Chrome、部分WebKit专项 | 已实测搜索/导航/抽屉/快速切换、宽窄屏；需最终稳定后再交互。未测实体触屏/实体触控板硬件 |
| Library参考PNG在本机读取 | `libfile_83fe78a7f1fc8191b61952395a144b5b` | 已确认image(5).png；支持的本机materialize及一次重试均失败，未声称本机像素已读；父任务已提供其实际查看后的布局描述 |

## 执行与证据

- 本机过程日志、基线和集成截图：`/Users/quitsense/Documents/Codex/2026-10-02/task/`。
- 玻璃截图：`/tmp/apptify-glass-pattern-{light,dark}-{2,12,22}px.png`，以及 `/tmp/apptify-glass-dark-select-{60,100}-{320,1440}.png`。
- 输入拼接截图：`/tmp/apptify-forms-task/input-buttons-joined-{1440,390,320}.png`。
- 目录hover：`/tmp/apptify-hover-check/card-hover-sidebar.png`。
- 最终结果将在所有新增专项稳定后更新到本清单。
