# 组件 API 参考

本页按 `src/index.ts` 合并的组件注册表列出当前 **68 个导出组件**，不是未来功能清单。组件名均可换成 kebab-case 模板标签，例如 `AppleOtpInput` 对应 `<apple-otp-input>`。

## 公共约定

`secondary` 与 `outline` 都是描边按钮，`ghost` 是纯文字按钮且始终不启用 Ripple。所有 API 可直接从 JavaScript 和普通 Vue `<script>` 使用，TypeScript 不是消费前提。

Tabs、TabBar、SegmentedControl、DatePicker 日期/时间页签均不使用 Ripple；保留选中指示器位移与内容切换动画。

- `v-model` 表示 `modelValue` + `update:modelValue`；表格、树等命名模型在各行列出。
- `motion`（下文记为 M）接受 `inherit | auto | full | reduced | none`，默认 `inherit`。全局与系统减少动态效果策略是上限，局部只能进一步收敛。表中未列 M 的静态组件不提供该 prop。
- 每个输入应提供 `label` 或 `aria-label`。基础表单属性（下文记为 F）为 `label`、`hint`、`error`、`disabled`、`loading`、`required`、M。`error` / `hint` 为字符串，不是校验规则数组。
- 表单选项类型为 `AppleOption = { label: string; value: string | number; disabled?: boolean }`。数字值不会被基础 Select 强制转成字符串。
- 内容选项类型为 `AppleItem = { label; value; disabled?; description?; href?; content? }`；`value` 为唯一的 `string | number`。
- 组件并非 Vuetify 同名组件的透传包装。只依赖这里声明的接口，不假设任意 `v-*` prop、slot 或事件都可直接使用。

## 动效组件 · 2

| 组件 | Props | 说明 |
| --- | --- | --- |
| `AppleAutoSize` | M；`axis=height`（height/both） | ResizeObserver 测量内容，通过实际像素尺寸连续动画；default slot。 |
| `AppleTransition` | M；`name=slide-y`（page/slide-x/slide-y/fade）、`mode=out-in`、`appear=true` | Vue Transition 包装，用于局部内容切换；单根 default slot。 |

全局入场使用 `v-apple-entrance="pageKey"` 放在一个页面容器上：首次挂载及 key 改变时整体由下向上 14px，不复制旧页、不执行离场、不改变透明度。不应嵌套应用到同一页面的多层内容。

另提供 `v-apple-ripple` 和 `v-apple-selection`；后者移动到后代 `[data-apple-selected="true"]`，也可传 `{selector}`。全局 none/reduced 与系统减少动态效果限制同样生效。

## 基础组件 · 9

| 组件 | 主要 Props | Events / Slots / 说明 |
| --- | --- | --- |
| `AppleProvider` | `theme?: string`、`motion?: auto/full/reduced/none` | default slot；应用主题并自动挂载弹层宿主。无显式属性时复用插件上下文。 |
| `AppleButton` | M；`variant=primary`（primary/secondary/outline/ghost/danger）、`size=medium`（small/medium/large）、`icon: Component`、`iconOnly`、`label`、`disabled`、`loading`、`ripple=true`、`href`、`type=button` | `click(event)`；default slot。纯图标按钮须提供 label。只有允许完整动效时启用 Ripple。 |
| `AppleLink` | `href`、`external`、`disabled` | default slot；external 使用新窗口并设置 `noopener noreferrer`。 |
| `AppleCard` | M；`title`、`subtitle`、`text`、`eyebrow`、`icon: Component 或图片 URL`、`iconColor`、`image`、`imageAlt`、`href`、`zoom=small`（big/small/none）、`shadow=normal`（normal/static/focused/none） | default、media、icon、title、actions slots；href 为标题链接，不会把所有嵌套控件变成一个大按钮。 |
| `AppleImage` | M；必填 `src`、`alt`；`preview=true`、`gallery: string[]`、`index=0`、`squared`、`aspectRatio='4/3'`、`fit=cover`（cover/contain） | caption slot；默认点击预览；图片错误状态；squared 覆盖 aspectRatio。 |
| `AppleSearch` | `v-model: string`、`placeholder='搜索'`、`label='搜索'`、`disabled` | `search(value)` 在 Enter 时发出；清空更新 model。 |
| `AppleContainer` | `width=1200`（number/string） | default slot；数字宽度按 px，宽度不会超过可用空间。 |
| `AppleStack` | `direction=column`、`gap=16`、`align=stretch`、`wrap=true` | default slot；Flex 布局；数字 gap 按 px。 |
| `AppleGrid` | `min=240`、`gap=20` | default slot；基于最小列宽的自适应网格，两项单位均为 px。 |

## 表单组件 · 18

| 组件 | 主要 Props | Events / Slots / 方法 |
| --- | --- | --- |
| `AppleInput` | F；`v-model: string/number`、`type=text`、`placeholder`、`clearable` | `change(value)`、`clear()`；prefix/suffix slots；`focus()`；输入事件实际返回字符串。password 类型带显隐按钮。 |
| `AppleTextarea` | F；`v-model: string`、`placeholder`、`rows=4`、`maxlength`、`counter`、`resize=true` | `change(value)`；`focus()`；resize=true 允许纵向缩放。 |
| `AppleSelect` | F；`v-model: string/number/null`、`items: AppleOption[]`、`placeholder='请选择'` | `change(value)`；自绘半透明模糊下拉，支持键盘导航和 required 校验。 |
| `AppleAutocomplete` | F；`v-model: string/number/null`、`items`、`placeholder`、`emptyText`、`clearable=true`、`filter(query,item)` | `change(value)`、`search(query)`；`focus()`；方向键/Enter/Escape；是单选过滤，不是多选标签输入。 |
| `AppleCheckbox` | F；`v-model: boolean`、`indeterminate` | `change(checked)`；default slot 替代 label 文本。 |
| `AppleRadioGroup` | F；`v-model: string/number/null`、`items`、`inline`、`name` | `change(value)`；原生 radio group。 |
| `AppleSwitch` | F；`v-model: boolean` | `change(checked)`；default slot 替代 label 文本。 |
| `AppleSlider` | F；`v-model: number`、`min=0`、`max=100`、`step=1`、`showValue=true`、`formatValue(value)` | `change(value)`；单值原生 range，不是双滑块范围选择。 |
| `AppleStepper` | F；`v-model: number`、`min=-Infinity`、`max=Infinity`、`step=1` | `change(value)`；减/加按钮及可编辑数值输入；提交时约束范围。 |
| `AppleSegmentedControl` | F；`v-model: string/number/null`、`items`、`name` | `change(value)`；基于 radio 的单选分段控件，不是 tabs 内容容器。 |
| `AppleDatePicker` | F；`v-model: string`、`min`、`max`、`format`、`granularity`、`type=date`（date/month/datetime-local） | `change(value)`；自绘分段输入、年月日历与时间页签；输入不自动跳段，占位时间在创建时冻结。 |
| `AppleColorPicker` | F；`v-model: string='#0071e3'`、`showValue=true` | `change(value)`；自绘色板和 HEX 输入，不打开原生颜色弹窗。 |
| `AppleUpload` | F；`v-model: File[]`、`accept`、`multiple`、`maxSize=Infinity`、`maxFiles=Infinity`、`capture=user/environment`、`buttonText` | `change(files)`、`reject({file,reason}[])`、`remove(file)`；default slot；maxSize 单位为字节；不发送网络请求。 |
| `AppleForm` | M；`disabled`、`loading`、`validator(FormData): boolean/string/Promise` | `submit(FormData)`、`invalid({type,message?})`、`reset()`；default slot `{loading}`；实例方法 `validate(): Promise<boolean>`、`submit()`、`reset()`。 |
| `AppleFormField` | F；`for` | default slot `{id,disabled,required,'aria-invalid','aria-describedby'}`；用于关联自定义输入及提示。 |
| `AppleOtpInput` | F；`label='验证码'`、`v-model: string`、`length=6`（1–12）、`numeric=true`、`name`、`mask` | `change(value)`、`complete(value)`；`focus(index=0)`；支持粘贴、退格、方向键与验证码自动填充提示。 |
| `AppleCascader` | F；`v-model: (string/number)[]`、`items: AppleCascaderOption[]`、`placeholder`、`levelLabels: string[]`、`name` | `change(path)`、`complete(path)`；选项递归增加 `children`；不内置行政区划数据。 |
| `AppleRate` | F；`label='评分'`、`v-model: number`、`max=5`（渲染 1–10）、`readonly`、`allowClear=true`、`name` | `change(value)`；整数星级；allowClear 时再次选择当前值返回 0；不支持半星。 |

原生 `name`、`autocomplete`、`inputmode` 等属性可用于输入控件；提交 `AppleForm` 的 FormData 时必须为需要提交的控件设置 name。`AppleForm.reset()` 重置浏览器控件并发出 reset，但不会替应用重置所有 Vue model，应在 `@reset` 中同步业务状态。

```vue
<apple-form :validator="validateProfile" @submit="submitProfile" @reset="resetProfile">
  <apple-input v-model="email" name="email" label="邮箱" type="email" required />
  <apple-select v-model="region" name="region" label="地区" :items="regions" required />
  <apple-button type="submit">保存</apple-button>
</apple-form>
```

validator 返回 `true` 才通过；字符串作为错误信息，`false` 显示默认错误。原生约束校验通过后才执行自定义 validator。

日期格式示例：`YYYY/MM`、`YYYY/MM/DD`、`YYYY/MM/DD HH:mm`、`YYYY/MM/DD HH:mm:ss`、`HH:mm`、`HH:mm:ss`。显示格式与模型格式分离：模型依次返回 `YYYY-MM`、`YYYY-MM-DD`、`YYYY-MM-DDTHH:mm[:ss]` 或 `HH:mm[:ss]`。独立 `AppleTimePicker` 已移除，纯时间使用 `<apple-date-picker format="HH:mm" />`；不支持原生 ISO week 模式及日期范围选择。

## 内容与移动交互 · 29

以下组件均接受 M。

| 组件 | 主要 Props | Events / Slots / 说明 |
| --- | --- | --- |
| `AppleNavibar` | `v-model: string/number`、`items: AppleItem[]`、`brand`、`brandHref='/'`、`label='主导航'`、`fixed=true`、`breakpoint=640` | `change(value,item)`、`toggle(open)`；brand、item `{item,active}`、actions `{close}` slots。固定模式自带占位；栏宽不超过 breakpoint 时折叠为三横杠菜单；选择、Escape、外部点击或焦点移出后收起。`fixed=false` 可嵌入容器。 |
| `AppleTabs` | `v-model: string/number`、`items`、`label`、`disabled` | `change(value)`；`panel-${value}` slot `{item}` 或 default `{item,value}`；可非受控；方向键/Home/End。 |
| `AppleTabBar` | 与 AppleTabs 相同 | 顶角圆角页签，移动选中背景与内容滑动。 |
| `AppleBreadcrumbs` | `items`、`label='当前位置'` | `click(item,event)`；非最后项使用 item.href 或按钮；最后项为当前页文本；无下划线。 |
| `ApplePagination` | `v-model: number=1`、`total=0`、`pageSize=10`、`disabled`、`label` | `change(page)`；页码从 1 开始，total 是总条目数。 |
| `AppleAccordion` | `v-model: string/number/array`、`items`、`multiple`、`disabled` | `change(value)`；`item-${value}` 或 item slot `{item,open}`；默认内容使用 item.content；multiple 时模型为数组。 |
| `AppleTable` | `columns: AppleColumn[]`、`rows: Record[]`、`rowKey=id`、`label`、`selectable`、`v-model:selected`、`v-model:sort-by`、`v-model:sort-direction`、`v-model:page`、`pageSize=0`、`loading`、`disabled`、`emptyText` | `sort({key,direction})`、`row-click(row)`；`cell-${key}` slot `{row,value,index}`、empty slot；本地排序/分页；pageSize=0 不分页。 |
| `AppleTree` | `items: AppleTreeItem[]`、`v-model`、`v-model:expanded`、`disabled`、`label` | `select(item)`；item slot `{item,expanded,selected}`；递归 children；单选与键盘树导航，不含勾选联动。 |
| `AppleList` | `items`、`v-model`、`selectable`、`disabled`、`label` | `select(item)`；item slot `{item,selected}`；selectable 时更新模型，否则 href 生成链接。 |
| `AppleAvatar` | `src`、`name='用户'`、`size=40`、`square` | `error(event)`；default slot；图片失败回退到姓名前两个字符。 |
| `AppleAvatarGroup` | `items: {name,src?,value?}[]`、`max=4`、`size=36`、`label` | default slot 可替换头像集合；超出数量显示 +N。 |
| `AppleBadge` | `value: string/number`、`max=99`、`dot`、`showZero`、`label`、`tone=danger` | default slot 为被标记内容；无 slot 可独立显示。 |
| `AppleTag` | `tone=neutral`、`closable`、`disabled`、`label` | `close(event)`；default slot；关闭事件不自动删除父级数据。 |
| `AppleAlert` | `v-model: boolean=true`、`title`、`message`、`tone=info`（info/success/warning/danger）、`closable` | `close()`；default slot 替代 message。 |
| `AppleProgress` | `modelValue: number=0`、`max=100`、`label`、`indeterminate`、`showValue`、`tone=accent` | 用 `:model-value` 传入只读进度，不主动发出 update；不定进度省略 aria-valuenow。 |
| `AppleSpinner` | `size=22`、`label='正在加载'` | default slot；状态语义与无动效退化。 |
| `AppleSkeleton` | `variant=text`（text/avatar/card/list/table/image）、`lines=3`、`rows=3`、`columns=4`、`width`、`height`、`avatar`、`animated=true`、`label` | lines 约束为 1–20；尺寸为数字时按 px。 |
| `AppleEmpty` | `title`、`description` | icon/default slots。 |
| `AppleDivider` | `label`、`vertical` | default slot；水平或垂直分隔语义。 |
| `AppleSteps` | `v-model: number=0`、`items`、`clickable`、`disabled`、`label` | `change(index)`；模型是从 0 开始的步骤位置，不是 item.value。 |
| `AppleTimeline` | `items: AppleTimelineItem[]`、`orientation=vertical`（horizontal/vertical）、`label` | item slot `{item}`；选项增加 `time?` 和 `tone?: default/success/danger`。 |
| `AppleCarousel` | `items: AppleSlide[]`、`v-model: number`、`label`、`disabled` | `change(index)`；item slot `{item,index,active}`；选项增加 src/alt；滚动吸附与按钮/键盘，不自动播放。 |
| `ApplePullRefresh` | `v-model: boolean`、`disabled`、`threshold=72`、`label` | `refresh(done)`；default slot `{refresh,refreshing}`；在滚动顶部下拉，也提供刷新按钮；完成必须调用 done 或将 model 设为 false。 |
| `AppleInfiniteScroll` | `loading`、`error: boolean/string`、`finished`、`disabled`、`distance=120`、`finishedText` | `load(done)`、`retry(done)`；default slot；IntersectionObserver 及手动加载按钮；完成后调用 done，或令 loading 从 true 回到 false。 |
| `AppleSwipeCell` | `v-model: boolean`、`disabled`、`label` | default、actions slot `{close}`；横向手势或操作按钮展开，Escape 关闭。 |
| `AppleBackTop` | `target: CSS selector=''`、`threshold=300`、`label`、`disabled` | `click(event)`；default slot；空 target 使用 window，达到滚动阈值才显示。 |
| `AppleFloatingGroup` | `backTop=true`、`threshold=300`、`target`、`label` | default slot 放附加操作，回顶按钮始终排最下；默认固定右下并考虑安全区。 |
| `AppleMarquee` | `text`、`duration=24`、`paused`、`label` | default slot；duration 单位为秒；带暂停按钮；减少动态效果时停止连续滚动。 |
| `AppleStatistic` | 必填 `label`；`value: string/number`、`prefix`、`suffix`、`precision=0`、`locale=zh-CN`、`description` | default slot；数值本地化格式，不会自动请求统计数据。 |

`AppleColumn = { key: string; label: string; sortable?: boolean; align?: 'left'|'center'|'right'; width?: number|string; minWidth?: number; maxWidth?: number; resizable?: boolean }`。表格 rows 应提供稳定唯一的 `rowKey`。

Table 另支持 `virtual=false`、`height=360`、`rowHeight=48`、`overscan=5`、`resizable=true` 和 `column-resize({key,width})`。列分隔线可拖拽，也可键盘左右调整。虚拟模式基于 TanStack Virtual，采用固定行高；与分页同时启用时，只虚拟化当前页。大列表通常设置 `pageSize=0`。不支持自动测量变高行或服务端分页协议。

```vue
<apple-table
  :columns="columns"
  :rows="rows"
  row-key="id"
  selectable
  v-model:selected="selected"
  v-model:page="page"
  :page-size="10"
>
  <template #cell-name="{ row, value }">
    <a :href="`/members/${row.id}`">{{ value }}</a>
  </template>
</apple-table>
```

## 弹层组件 · 10

以下组件除 Host 外均接受 M。

| 组件 | 主要 Props | Events / Slots / 说明 |
| --- | --- | --- |
| `AppleDialog` | `v-model: boolean=false`；以下 Modal 公共属性 | 默认显示确认/取消 footer。 |
| `AppleDrawer` | 同 Modal；`placement=right`（left/right）；`width=440` | 默认无 footer；全高侧边抽屉。 |
| `AppleSheet` | 同 Modal；`width=440` | 默认无 footer；底部面板，移动端全宽；桌面样式最小设计宽度 540px，仍受可用宽度约束。 |
| `AppleSnackbar` | `v-model: boolean=true`、`message`、`title`、`tone=default`（default/info/success/warning/danger/error）、`duration=4000`、`action`、`closable=true` | `close(value,reason)`、`action()`；default slot；duration 单位毫秒，0 常驻；直接使用时位置由业务布局决定。 |
| `AppleOverlayHost` | 无公开配置 | 自动渲染当前上下文 overlays.entries；Provider 已包含，不要重复挂载。 |
| `ApplePopover` | `v-model?: boolean`、`label='更多'`、`disabled`、`placement=bottom`（top/bottom/left/right）、`align=start`（start/center/end）、`width=280`、`role=dialog`、`openOnHover`、`trapFocus=true`、`panelClass` | `open()`、`close()`；activator `{props,open,close,isOpen}`、default `{close}`；支持非受控模式与屏幕边缘避让。 |
| `AppleTooltip` | 必填 `text`；`placement=top`、`disabled` | default slot 为触发元素；悬停/焦点显示，Escape 关闭；短文本提示。 |
| `AppleMenu` | `v-model?: boolean`、`label='操作'`、`items: AppleMenuItem[]`、`selected`、`disabled` | `select(value,item)`；activator slot 同 Popover、item slot `{item}`；选择后关闭，方向键/Home/End。 |
| `AppleActionSheet` | `v-model: boolean`、`title`、`message`、`items: AppleMenuItem[]`、`cancelText='取消'` | `select(value,item)`、`close(value,reason)`；默认插槽支持自定义模板，提供 `select(item)`、`close(value)`，覆盖 items 内容；取消按钮保留。无拖拽指示条。 |
| `AppleImageViewer` | `v-model: boolean`、`images: (string/AppleViewerImage)[]`、`v-model:index=0`、`loop` | `change(index)`、`close()`、`error(event)`；缩放与手势来自 @panzoom/panzoom，滚轮按实际滚动量连续缩放并保持鼠标焦点。 |

Modal 公共属性：`title`、`message`、`ariaLabel='对话框'`、`persistent`、`loading`、`closeOnConfirm=true`、`confirmText='确定'`、`cancelText='取消'`、`showFooter`、`closable=true`、`width`、`tone=default`。Dialog 默认 width 为 480px。空按钮文本会隐藏对应按钮。

Modal 事件：`update:modelValue`、`open()`、`after-close()`、`confirm(true)`、`cancel(false)`、`close(value,reason)`。reason 为 `escape | backdrop | cancel | confirm | close`。`persistent` 阻止 Escape 和背景关闭，不会禁用显式关闭按钮；`loading` 阻止交互关闭。

Modal slots：`title`、default `{close}`、footer `{close,confirm,cancel}`。带自定义 footer 时无需同时开启 showFooter。异步确认使用 `:close-on-confirm="false"` 与 loading，由应用完成请求后修改 model。

```vue
<apple-dialog
  v-model="opened"
  title="保存修改"
  :loading="saving"
  :close-on-confirm="false"
  @confirm="save"
>
  <apple-input v-model="name" label="姓名" />
</apple-dialog>

<apple-menu :items="actions" @select="performAction">
  <template #activator="{ props }">
    <apple-button v-bind="props" variant="secondary">操作</apple-button>
  </template>
</apple-menu>
```

`AppleMenuItem = { label; value: string|number; disabled?; danger?; description?; icon?: Component }`。

`AppleViewerImage = { src: string; alt?: string; title?: string }`。数组字符串是 URL；需要可访问描述或标题时传对象。index 从 0 开始。

## 上下文与服务

`createAppleUI(options)` 创建可安装插件；`createApple(options)` 创建独立上下文，不执行组件注册。`appleKey` 用于 Options API 注入，`useApple()` 用于 setup。可单独导入 `createMessageBus()`、`createOverlayService()`、`resolveMotion()`、`themeStyle()`、`builtInThemes` 及公开类型。

| API | 作用 |
| --- | --- |
| `theme.set(name)` | 切换注册主题或 system。未知名称抛出错误。 |
| `theme.register(name,tokens,scheme='light')` | 注册自定义主题并补齐基础 token。 |
| `theme.name / resolved / current / themes` | 当前配置名、解析后名称、主题内容、主题注册表。 |
| `motion.set(mode)` | 即时修改全局动效策略。 |
| `onMessage(channel,listener)` | 注册监听器，返回取消订阅函数。 |
| `sendMessage(channel,payload?)` | 返回该 channel 全部监听器的返回值数组。 |
| `dialog(options)` | 打开 dialog 并返回独立句柄。 |
| `notify(message,options?)` | 打开通知，默认 duration=4000。 |
| `overlays.open(options)` | 支持 kind 为 dialog/drawer/sheet/snackbar。 |
| `overlays.close(id,value?) / closeTop(value?) / clear()` | 精确关闭、关闭顶层非通知、清空当前上下文。 |

`OverlayOptions` 实际字段为 `kind?`、`title?`、`message?`、`component?`、`props?`、`onMessage?`、`persistent?`、`confirmText?`、`cancelText?`、`tone?`、`duration?`。不要把声明式组件的 width、loading、action 等属性假定成当前服务参数；需要这些控制时使用声明式组件或自定义内容。

返回的 `OverlayHandle<T>` 为 `{ id, close(value?), update(patch), result: Promise<T | undefined> }`。`props` 传给动态内容组件；宿主额外注入 `close` 和 `sendMessage`。`onMessage(channel,payload)` 可返回普通值或 Promise，实现双向请求与响应，示例见 [README](../README.md#dialog-与反向通道)。

## 验证边界

这是当前接口清单，不是全平台兼容认证。自动化测试覆盖了部分状态与键盘交互；真实输入法、软键盘、触屏滚动、读屏器和各 WebView 行为需要在应用目标设备上验证。导入安全与服务端渲染 / hydration 是不同结论；当前不承诺未经验证的完整 SSR 支持。
