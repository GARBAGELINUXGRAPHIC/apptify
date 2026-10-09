import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleNavibar",
  "source": "src/components/navibar.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "items",
      "type": "AppleItem[]",
      "default": "[]",
      "description": "导航项结构：{ label: string; value: string | number; disabled?: boolean; description?: string; href?: string; content?: string }[]。带 href 时生成链接；事件本身不会阻止链接导航。"
    },
    {
      "name": "modelValue",
      "type": "string | number",
      "default": "undefined",
      "description": "当前值。使用 v-model 同步组件发出的 update:modelValue。"
    },
    {
      "name": "brand",
      "type": "string",
      "default": "\"\"",
      "description": "品牌文字；brand 插槽可以覆盖。"
    },
    {
      "name": "brandHref",
      "type": "string",
      "default": "\"/\"",
      "description": "默认品牌链接地址，不负责 Vue Router 导航。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"主导航\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    },
    {
      "name": "fixed",
      "type": "boolean",
      "default": "true",
      "description": "固定定位；关闭后按正常文档流布局。"
    },
    {
      "name": "hideOnPreview",
      "type": "boolean",
      "default": "undefined",
      "description": "省略时跟随 fixed；图片预览期间隐藏并保留占位，退出开始时恢复。"
    },
    {
      "name": "breakpoint",
      "type": "number",
      "default": "640",
      "description": "导航栏自身宽度小于等于此值时折叠为菜单，单位 px；不是仅检查窗口宽度。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: string | number) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "change",
      "type": "(value: string | number, item: AppleItem) => void",
      "description": "选择导航项后发出 value 和完整项；不阻止 href 跳转。"
    },
    {
      "name": "toggle",
      "type": "(open: boolean) => void",
      "description": "折叠菜单打开状态改变时触发。"
    }
  ],
  "slots": [
    {
      "name": "brand",
      "type": "() => VNode[]（无 slot props）",
      "description": "替代品牌内容。"
    },
    {
      "name": "item",
      "type": "({ item: AppleItem, active: boolean }) => VNode[]",
      "description": "替代每个导航项的内部内容；外层链接/按钮仍由组件处理。"
    },
    {
      "name": "actions",
      "type": "({ close: (restoreFocus?: boolean) => void }) => VNode[]",
      "description": "右侧附加操作；需要时调用 close() 关闭折叠菜单。"
    }
  ],
  "methods": [],
  "notes": [
    "固定模式保留占位；折叠取决于导航栏自身宽度。链接导航由 href 或应用的 Router 处理。"
  ]
})
