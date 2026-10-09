import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleCard",
  "source": "src/components/AppleCard.vue",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "icon",
      "type": "Component | string",
      "default": "undefined",
      "description": "Vue 图标组件或图片 URL 字符串；icon 插槽可以覆盖。"
    },
    {
      "name": "iconColor",
      "type": "string",
      "default": "undefined",
      "description": "组件图标的颜色，不影响字符串图片图标。"
    },
    {
      "name": "title",
      "type": "string",
      "default": "undefined",
      "description": "标题文字。"
    },
    {
      "name": "subtitle",
      "type": "string",
      "default": "undefined",
      "description": "标题下方的补充文字。"
    },
    {
      "name": "text",
      "type": "string",
      "default": "undefined",
      "description": "内容文字。"
    },
    {
      "name": "eyebrow",
      "type": "string",
      "default": "undefined",
      "description": "标题上方的短文字。"
    },
    {
      "name": "image",
      "type": "string",
      "default": "undefined",
      "description": "顶部图片 URL；media 插槽会替代该图片。"
    },
    {
      "name": "imageAlt",
      "type": "string",
      "default": "\"\"",
      "description": "顶部图片的替代文字。"
    },
    {
      "name": "href",
      "type": "string",
      "default": "undefined",
      "description": "仅将标题渲染为链接，不会让整张卡片可点击。"
    },
    {
      "name": "zoom",
      "type": "'big' | 'small' | 'none'",
      "default": "\"none\"",
      "description": "悬停缩放：big、small、none；仅完整动效且支持悬停时使用。"
    },
    {
      "name": "shadow",
      "type": "'normal' | 'static' | 'focused' | 'none'",
      "default": "\"normal\"",
      "description": "阴影：normal（悬停增强）、static、focused、none。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "media",
      "type": "() => VNode[]（无 slot props）",
      "description": "替代默认顶部图片。"
    },
    {
      "name": "icon",
      "type": "() => VNode[]（无 slot props）",
      "description": "替代默认图标。"
    },
    {
      "name": "title",
      "type": "() => VNode[]（无 slot props）",
      "description": "替代默认标题，需自行保留标题与链接语义。"
    },
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "放在文字后的卡片正文。"
    },
    {
      "name": "actions",
      "type": "() => VNode[]（无 slot props）",
      "description": "底部操作区。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
