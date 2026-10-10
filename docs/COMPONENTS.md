# 组件 API 参考

本页按 `src/index.ts` 合并的组件注册表列出当前 **65 个导出组件**，不是未来功能清单。组件名均可换成 kebab-case 模板标签，例如 `AppleOtpInput` 对应 `<apple-otp-input>`。

## 公共约定

`secondary` 与 `outline` 都是描边按钮，纯文字操作使用 `AppleLink`，始终不启用 Ripple。所有 API 可直接从 JavaScript 和普通 Vue `<script>` 使用，TypeScript 不是消费前提。

Tabs、TabBar、SegmentedControl、DatePicker 日期/时间页签均不使用 Ripple；保留选中指示器位移与内容切换动画。

- `v-model` 表示 `modelValue` + `update:modelValue`；表格、树等命名模型在各行列出。
- `motion`（下文记为 M）接受 `inherit | auto | full | reduced | none`，默认 `inherit`。全局与系统减少动态效果策略是上限，局部只能进一步收敛。表中未列 M 的静态组件不提供该 prop。
- 每个输入应提供 `label` 或 `aria-label`。基础表单属性（下文记为 F）为 `label`、`hint`、`error`、`disabled`、`loading`、`required`、M。`error` / `hint` 为字符串，不是校验规则数组。
- 表单选项类型为 `AppleOption = { label: string; value: string | number; disabled?: boolean }`。数字值不会被基础 Select 强制转成字符串。
- 内容选项类型为 `AppleItem = { label; value; disabled?; description?; href?; content? }`；`value` 为唯一的 `string | number`。
- 组件并非 Vuetify 同名组件的透传包装。只依赖这里声明的接口，不假设任意 `v-*` prop、slot 或事件都可直接使用。

## Glass 通用样式

导入 `apptify/style.css` 后，在 `<apple-provider>` 内给自定义元素添加 `.apple-glass`，即可应用跟随主题和全局 glass 设置的背景、文字颜色与背景模糊：

```vue
<apple-provider>
  <div class="apple-glass">自定义玻璃面板</div>
</apple-provider>
```

该类只提供材质与文字颜色，间距、圆角、边框和阴影由使用方设置。Provider 外使用默认浅色材质；Provider 内跟随 `glass.opacity` 与 `glass.blur` 配置。

## 动效组件 · 2

| 组件 | Props | 说明 |
| --- | --- | --- |
| `AppleAutoSize` | M；`axis=height`（height/both） | ResizeObserver 测量内容，通过实际像素尺寸连续动画；default slot。 |
| `AppleTransition` | M；`name=slide-y`（page/slide-x/slide-y/fade）、`mode=out-in`、`appear=true` | Vue Transition 包装，用于局部内容切换；单根 default slot。 |

全局入场使用 `v-apple-entrance="pageKey"` 放在一个页面容器上：首次挂载及 key 改变时整体由下向上 14px，不复制旧页、不执行离场、不改变透明度。不应嵌套应用到同一页面的多层内容。

另提供 `v-apple-ripple` 和 `v-apple-selection`；后者移动到后代 `[data-apple-selected="true"]`，也可传 `{selector}`。selection 遵循全局 none/reduced 与系统减少动态效果限制；ripple 在减弱动效下可手动开启，none 下始终禁用。

## 基础组件 · 9

| 组件 | 主要 Props | Events / Slots / 说明 |
| --- | --- | --- |
| `AppleProvider` | `theme?: string`、`motion?: auto/full/reduced/none` | default slot；应用主题并自动挂载弹层宿主。无显式属性时复用插件上下文。 |
| `AppleButton` | M；`variant=primary`（primary/secondary/outline/danger）、`size=medium`（small/medium/large）、`icon: Component`、`iconOnly`、`label`、`disabled`、`loading`、`ripple=true`、`href`、`type=button` | `click(event)`；default slot；图标位于文字右侧。纯图标按钮须提供 label。关闭动效时禁用 Ripple，其余模式遵循全局波纹开关。 |
| `AppleLink` | `as=a`（a/button）、`href`、`external`、`disabled`、`icon`、`iconOnly`、`label` | default slot；文字操作使用 as=button；external 使用新窗口并设置 `noopener noreferrer`。 |
| `AppleCard` | M；`title`、`subtitle`、`text`、`eyebrow`、`icon: Component 或图片 URL`、`iconColor`、`image`、`imageAlt`、`href`、`zoom=none`（big/small/none）、`shadow=normal`（normal/static/focused/none） | default、media、icon、title、actions slots；href 为标题链接，不会把所有嵌套控件变成一个大按钮。 |
| `AppleImage` | M；`gallery: AppleImageItem | (string/AppleImageItem)[]`（唯一来源，默认空数组，单图可传对象）；`preview=true`、`carousel=false`、`autoplay=true`、`interval=5000`（毫秒，仅 carousel）、`disabled=false`、`label`、`galleryLayout=compact`（compact/tiled/tiled-wrap，所有设备）、`galleryShape=natural`（natural/square）、`index=0`、`squared`、`aspectRatio='4/3'`、`fit=cover`（cover/contain） | caption 与 item({item,index,active}) slots；carousel 强制 compact、默认每 5 秒循环播放，悬停、聚焦、预览、拖动、页面隐藏或禁用时暂停，保留自由滚动；默认点击预览；统一预览交互，支持拖动、双击、捏合、平滑滚轮及键盘；连续滚轮累积目标并保持位置与速度，缩放、旋转、翻页与进退场分通道，可在动画途中继续操作；翻页按距离与速度使用 360–720ms 动画，放大图片随各自画布裁剪离场；底部单一胶囊按左旋转、缩小、可选名称、放大、右旋转排列，每次旋转 90°，旋转状态按图片保存；竖屏隐藏箭头、关闭及缩放按钮；完整渲染图片组，compact 在固定框内横滑，桌面横向滚轮或 Shift+滚轮平滑横滑，连续事件保留累计目标，停止后平滑吸附；一次手势可跨越多张，快速点击翻页延续当前位置和速度；hover 放大并使用 AppleCard 的悬停阴影，横屏多图的缩略图左右按钮仅在悬浮时淡入、移开时淡出，遵循 --apple-fast 与 --apple-ease 并对齐图片中间（单图小窗与全屏均无翻页箭头），跨多张点击小点时直接衔接当前画面与目标图并支持连续改选，tiled 等高横向平铺，溢出时底部常显自定义滚动条，支持拖动、点击轨道与键盘，滑块比例随内容和容器尺寸同步，tiled-wrap 等宽保留图片比例，按列从上往下紧密堆叠，避免按行对齐产生空白；平铺 hover 只缩放当前图片；galleryShape=square 强制 1:1 并居中裁剪（覆盖 fit），squared 同样作用于图片组；`update:index`、`change(index)`；图片错误状态；squared 覆盖 aspectRatio。 |
| `AppleSearch` | `v-model: string`、`placeholder='搜索'`、`label='搜索'`、`disabled` | `search(value)` 在 Enter 时发出；清空更新 model。 |
| `AppleContainer` | `width=1200`（number/string） | default slot；数字宽度按 px，宽度不会超过可用空间。 |
| `AppleStack` | `direction=column`、`gap=16`、`align=stretch`、`wrap=true` | default slot；Flex 布局；数字 gap 按 px。 |
| `AppleGrid` | `min=240`、`gap=20` | default slot；基于最小列宽的自适应网格，两项单位均为 px。 |

## 表单组件 · 18

字段名称、hint、错误提示和行内空白只用于展示，点击不会聚焦、展开或切换控件；直接操作输入框、选择器或开关本身。字段名称通过 ARIA 保留可访问性关联。

| 组件 | 主要 Props | Events / Slots / 方法 |
| --- | --- | --- |
| `AppleInput` | F；`v-model: string/number`、`type=text`、`placeholder`、`clearable` | `change(value)`、`clear()`；prefix/suffix slots；`focus()`；输入事件实际返回字符串。password 类型带显隐按钮。 |
| `AppleTextarea` | F；`v-model: string`、`placeholder`、`rows=4`、`maxlength`、`counter`、`resize=true` | `change(value)`；`focus()`；resize=true 允许纵向缩放。 |
| `AppleSelect` | F；`v-model: string/number/null`、`items: AppleOption[]`、`placeholder='请选择'` | `change(value)`；自绘半透明模糊下拉，支持键盘导航和 required 校验。 |
| `AppleAutocomplete` | F；`v-model: string/number/null`、`items`、`placeholder`、`emptyText`、`clearable=true`、`filter(query,item)` | `change(value)`、`search(query)`；`focus()`；方向键/Enter/Escape；是单选过滤，不是多选标签输入。 |
| `AppleCheckbox` | F；`v-model: boolean`、`indeterminate` | `change(checked)`；default slot 替代 label 文本，默认文字在左、开关在右；hint 在下方。 |
| `AppleRadioGroup` | F；`v-model: string/number/null`、`items`、`inline`、`name` | `change(value)`；原生 radio group。 |
| `AppleSwitch` | F；`v-model: boolean` | `change(checked)`；default slot 替代 label 文本。默认 width: 100%，label 和 hint 在左侧同一列，开关在右侧。 |
| `AppleSlider` | F；`v-model: number`、`min=0`、`max=100`、`step=1`、`showValue=true`、`formatValue(value)` | `change(value)`；单值原生 range，不是双滑块范围选择。 |
| `AppleStepper` | F；`v-model: number`、`min=-Infinity`、`max=Infinity`、`step=1` | `change(value)`；减/加按钮及可编辑数值输入；提交时约束范围。 |
| `AppleSegmentedControl` | F；`v-model: string/number/null`、`items`、`name` | `change(value)`；基于 radio 的单选分段控件，不是 tabs 内容容器。 |
| `AppleDatePicker` | F；`v-model: string`、`min`、`max`、`format`、`granularity`、`type=date`（date/month/datetime-local） | `change(value)`；自绘分段输入、年月日历与时间页签；输入不自动跳段，占位时间在创建时冻结。 |
| `AppleColorPicker` | F；`v-model: string='#0071e3'`、`showValue=true` | `change(value)`；自绘色板和 HEX 输入，不打开原生颜色弹窗。 |
| `AppleUpload` | F；`v-model: File[]`、`accept`、`multiple`、`maxSize=Infinity`、`maxFiles=Infinity`、`capture=user/environment`、`buttonText` | `change(files)`、`reject({file,reason}[])`、`remove(file)`；default slot；maxSize 单位为字节；不发送网络请求。 |
| `AppleForm` | M；`disabled`、`loading`、`validator(FormData): boolean/string/Promise` | `submit(FormData)`、`invalid({type,message?})`、`reset()`；default slot `{loading}`；实例方法 `validate(): Promise<boolean>`、`submit()`、`reset()`。 |
| `AppleFormField` | F；`for` | default slot `{id,disabled,required,'aria-label','aria-labelledby','aria-invalid','aria-describedby'}`；将 slot 属性绑定到自定义输入，以关联字段名称及提示。 |
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

## 内容与移动交互 · 30

以下组件均接受 M。

导航组件默认协调同一文档中的图片预览；对话框内预览只协调该对话框内的导航。独立页面区域可用 `data-apple-navigation-scope` 容器隔离；多个预览都开始退出后恢复导航。关闭、取消和卸载均释放状态。

| 组件 | 主要 Props | Events / Slots / 说明 |
| --- | --- | --- |
| `AppleNavibar` | `v-model: string/number`、`items: AppleItem[]`、`brand`、`brandHref='/'`、`label='主导航'`、`fixed=true`、`breakpoint=640`、`hideOnPreview`（默认跟随 fixed） | `change(value,item)`、`toggle(open)`；brand、item `{item,active}`、actions `{close}` slots。固定模式自带占位；栏宽不超过 breakpoint 时折叠为三横杠菜单；选择、Escape、外部点击或焦点移出后收起。`fixed=false` 可嵌入容器。参与预览时保留占位并隐藏，退出开始时与黑色背景淡出同步执行 300ms 淡入与向下滑入。 |
| `AppleAside` | M；`hideOnPreview=true` | 原生 aside 容器，布局由调用方提供；图片预览期间保留尺寸、隐藏并禁用交互，退出开始时 140ms 淡入。正常文档流侧栏可设 `hideOnPreview=false`。 |
| `AppleTabs` | `v-model: string/number`、`items`、`label`、`disabled` | `change(value)`；`panel-${value}` slot `{item}` 或 default `{item,value}`；可非受控；方向键/Home/End。 |
| `AppleTabBar` | 与 AppleTabs 相同 | 顶角圆角页签，移动选中背景与内容滑动。 |
| `AppleBreadcrumbs` | `items`、`label='当前位置'` | `click(item,event)`；非最后项使用 item.href 或按钮；最后项为当前页文本；无下划线。 |
| `ApplePagination` | `v-model: number=1`、`total=0`、`pageSize=10`、`disabled`、`label` | `change(page)`；页码从 1 开始，total 是总条目数。 |
| `AppleAccordion` | `v-model: string/number/array`、`items`、`multiple`、`disabled` | `change(value)`；`item-${value}` 或 item slot `{item,open}`；默认内容使用 item.content；multiple 时模型为数组。 |
| `AppleTable` | `columns: AppleColumn[]`、`rows: Record[]`、`rowKey=id`、`label`、`selectable`、`v-model:selected`、`v-model:sort-by`、`v-model:sort-direction`、`v-model:page`、`pageSize=0`、`loading`、`disabled`、`emptyText` | `sort({key,direction})`、`row-click(row)`；`cell-${key}` slot `{row,value,index}`、empty slot；本地排序/分页；pageSize=0 不分页。 |
| `AppleTree` | `items: AppleTreeItem[]`、`v-model`、`v-model:expanded`、`disabled`、`label`、`searchable=true`、`mobileDirectory=true` | 默认顶部搜索；宽度 ≤900px 自动进入全局 SpeedDial 目录，无宿主保留原位。`select(item)`；item slot `{item,expanded,selected}`；递归 children；单选与键盘树导航，不含勾选联动。 |
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
| `ApplePullRefresh` | `v-model: boolean`、`disabled`、`threshold=72`、`label` | `refresh(done)`；default slot `{refresh,refreshing}`；在滚动顶部下拉，也提供刷新按钮；完成必须调用 done 或将 model 设为 false。 |
| `AppleInfiniteScroll` | `loading`、`error: boolean/string`、`finished`、`disabled`、`distance=120`、`finishedText` | `load(done)`、`retry(done)`；default slot；IntersectionObserver 及手动加载按钮；完成后调用 done，或令 loading 从 true 回到 false。 |
| `AppleScrollBar` | `target: string/HTMLElement/()=>HTMLElement`、`axis='both'`、`label`、`controls` | `interaction()`；`refresh()`；fixed 悬浮滚动条，不占空间，支持横向/纵向、拖动、轨道点击、键盘及 RTL。AppleProvider 自动接管文档滚动容器，原本隐藏滚动条的控件除外；`data-apple-scrollbar-ignore` 可排除容器。 |
| `AppleBackTop` | `target: CSS selector=''`、`threshold=300`、`label`、`disabled` | `click(event)`；default slot；空 target 使用 window，达到滚动阈值才显示。 |
| `AppleFloatingGroup` | `backTop=true`、`threshold=300`、`target`、`label` | default slot 放附加操作，回顶按钮始终排最下；默认固定右下并考虑安全区，与 Navibar 同为 z-index 70；图片预览时隐藏，退出开始时执行 300ms FadeInLeft，尊重 reduced/none 动效。 |
| `AppleSpeedDial` | `backTop=true`、`threshold=300`、`target`、`label` | App.vue 全局唯一宿主，嵌套 Provider 共享注册表；BackTop 排第一，操作按注册顺序排列，primary 目录按钮排最后。移动目录弹窗保持高高度，多目录用 AppleTabBar 切换。 |
| `AppleSpeedDialItem` | `label`、`icon`、`disabled`、`visible=true`、`variant='primary'` | `click(event)`；default slot 可放按钮文字；页面声明后自动注册全局宿主，卸载或 KeepAlive 停用时注销；无需父子通信。 |
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

## 弹层组件 · 9

以下组件除 Host 外均接受 M。

| 组件 | 主要 Props | Events / Slots / 说明 |
| --- | --- | --- |
| `AppleDialog` | `v-model: boolean=false`；以下 Modal 公共属性 | 默认显示确认/取消 footer。 |
| `AppleDrawer` | 同 Modal；`placement=right`（left/right）；`width=440` | 默认无 footer；全高侧边抽屉。 |
| `AppleSheet` | 同 Modal；`width=440` | 默认无 footer；底部面板，移动端全宽；桌面样式最小设计宽度 540px，仍受可用宽度约束。 |
| `AppleSnackbar` | `v-model: boolean=true`、`message`、`title`、`tone=default`（default/info/success/warning/danger/error）、`duration=4000`、`action`、`closable=true` | `close(value,reason)`、`action()`；default slot；duration 单位毫秒，0 常驻；直接使用时位置由业务布局决定。 |
| `AppleOverlayHost` | 无公开配置 | 自动渲染当前上下文 overlays.entries.value；Provider 已包含，不要重复挂载。 |
| `ApplePopover` | `v-model?: boolean`、`label='更多'`、`disabled`、`placement=bottom`（top/bottom/left/right）、`align=start`（start/center/end）、`width=280`、`role=dialog`、`openOnHover`、`trapFocus=true`、`panelClass` | `open()`、`close()`；activator `{props,open,close,isOpen}`、default `{close}`；支持非受控模式与屏幕边缘避让。 |
| `AppleTooltip` | 必填 `text`；`placement=top`、`disabled` | default slot 为触发元素；悬停/焦点显示，Escape 关闭；短文本提示。 |
| `AppleMenu` | `v-model?: boolean`、`label='操作'`、`items: AppleMenuItem[]`、`selected`、`disabled` | `select(value,item)`；activator slot 同 Popover、item slot `{item}`；选择后关闭，方向键/Home/End。 |
| `AppleActionSheet` | `v-model: boolean`、`title`、`message`、`items: AppleMenuItem[]`、`cancelText='取消'` | `select(value,item)`、`close(value,reason)`；默认插槽支持自定义模板，提供 `select(item)`、`close(value)`，覆盖 items 内容；取消按钮保留。无拖拽指示条。 |

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

`AppleViewerImage = { src: string; alt?: string; title?: string; width?: number; height?: number }` 仍是 `AppleImage` 可用的公共图片类型。图片数组字符串是 URL；需要可访问描述或标题时传对象。预览名称可选，使用 title（未提供时使用 label），不以 alt 或编号填充名称。`AppleImageItem` 扩展该类型，`src` 可选以支持 carousel 的自定义内容，另有 `label`、`value`、`description`。顶层不接受 src/alt；index 从 0 开始、默认 0，支持 `v-model:index`，非有限值归零、越界值截取到有效范围。普通图片忽略无效空项；空列表显示占位且不打开预览。点击放大由 `AppleImage` 内部管理，不另行注册独立查看器。

## 上下文与服务

`createAppleUI(options)` 创建可安装插件；`createApple(options)` 创建独立上下文，不执行组件注册。`appleKey` 用于 Options API 注入，`useApple()` 用于 setup。可单独导入 `createMessageBus()`、`createOverlayService()`、`resolveMotion()`、`themeStyle()`、`builtInThemes` 及公开类型。

| API | 作用 |
| --- | --- |
| `theme.value.set(name)` | 切换注册主题或 system。未知名称抛出错误。 |
| `theme.value.register(name,tokens,scheme='light')` | 注册自定义主题并补齐基础 token。 |
| `theme.value.name / resolved / current / themes` | 当前配置名、解析后名称、主题内容、主题注册表。 |
| `overlays.entries.value` | 当前弹层列表，`Ref<OverlayEntry[]>`。 |
| `isVerticalScreen.value` | 全局只读 ref，当前视口高度大于宽度时为 true，随 resize/orientationchange 更新；也可独立导入。 |
| `portalTarget.value` | 弹层挂载 DOM 元素。 |
| `motion.value.set(mode)` | 即时修改全局动效策略。 |
| `ripple.value.enabled / set(enabled)` | 全局点击波纹开关，默认 true；也可传入 `createAppleUI({ ripple: false })`。切换到减弱动效或系统开启减少动态效果时自动关闭，可手动开启；只有关闭动效时禁止开启。开启 persist 时保存偏好，嵌套 Provider 共享此开关。 |
| `onMessage(channel,listener)` | 注册监听器，返回取消订阅函数。 |
| `sendMessage(channel,payload?)` | 返回该 channel 全部监听器的返回值数组。 |
| `dialog(options)` | 打开 dialog 并返回独立句柄。 |
| `notify(message,options?)` | 打开通知，默认 duration=4000。 |
| `overlays.open(options)` | 支持 kind 为 dialog/drawer/sheet/snackbar。 |
| `overlays.close(id,value?) / closeTop(value?) / clear()` | 精确关闭、关闭顶层非通知、清空当前上下文。 |

`OverlayOptions` 实际字段为 `kind?`、`title?`、`message?`、`component?`、`props?`、`onMessage?`、`persistent?`、`confirmText?`、`cancelText?`、`tone?`、`duration?`。不要把声明式组件的 width、loading、action 等属性假定成当前服务参数；需要这些控制时使用声明式组件或自定义内容。

返回的 `OverlayHandle<T>` 为 `{ id, close(value?), update(patch), result: Promise<T | undefined> }`。`props` 传给动态内容组件；宿主额外注入 `close` 和 `sendMessage`。`onMessage(channel,payload)` 可返回普通值或 Promise，实现双向请求与响应。

## 验证边界

这是当前接口清单，不是全平台兼容认证。自动化测试覆盖了部分状态与键盘交互；真实输入法、软键盘、触屏滚动、读屏器和各 WebView 行为需要在应用目标设备上验证。导入安全与服务端渲染 / hydration 是不同结论；当前不承诺未经验证的完整 SSR 支持。
