import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleImage",
  "source": "src/components/foundation.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "preview",
      "type": "boolean",
      "default": "true",
      "description": "点击有效图片进入内置放大预览；关闭后仍能使用图片组和轮播。"
    },
    {
      "name": "gallery",
      "type": "AppleImageItem | (string | AppleImageItem)[]",
      "default": "[]",
      "description": "单个图片对象或字符串/对象数组。对象：{ src?, alt?, title?, width?, height?, label?, value?, description? }。普通图片忽略无 src 的空项；carousel 可用无 src 的自定义内容。顶层没有 src/alt props。"
    },
    {
      "name": "carousel",
      "type": "boolean",
      "default": "false",
      "description": "轮播模式，强制 compact 布局，并启用 item 插槽和标题说明。"
    },
    {
      "name": "autoplay",
      "type": "boolean",
      "default": "true",
      "description": "carousel 模式自动循环播放；悬浮、聚焦、预览、拖动、页面隐藏或禁用时暂停。"
    },
    {
      "name": "interval",
      "type": "number",
      "default": "5000",
      "description": "carousel 自动播放间隔，单位毫秒，默认每 5 秒切换一张图片。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用打开预览、翻页、拖动及图片组键盘操作。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"图片轮播\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    },
    {
      "name": "galleryLayout",
      "type": "'compact' | 'tiled' | 'tiled-wrap'",
      "default": "\"compact\"",
      "description": "compact 为分页图片条，tiled 为横向平铺，tiled-wrap 为换行平铺。"
    },
    {
      "name": "galleryShape",
      "type": "'natural' | 'square'",
      "default": "\"natural\"",
      "description": "natural 保留各图片比例，square 强制正方形并居中裁剪。"
    },
    {
      "name": "index",
      "type": "number",
      "default": "0",
      "description": "当前图片索引，从 0 开始，可用 v-model:index。非有限值归零，越界值截取到有效范围。"
    },
    {
      "name": "squared",
      "type": "boolean",
      "default": "false",
      "description": "强制 1:1，覆盖 aspectRatio、galleryShape 和 fit；也作用于图片组。"
    },
    {
      "name": "aspectRatio",
      "type": "string | number",
      "default": "\"4/3\"",
      "description": "单图或 compact 视口的 CSS aspect-ratio 值，例如 4/3、1；不是图片像素尺寸。"
    },
    {
      "name": "fit",
      "type": "'contain' | 'cover'",
      "default": "\"cover\"",
      "description": "contain 完整显示，cover 填满裁剪；正方形模式始终使用 cover。"
    }
  ],
  "events": [
    {
      "name": "update:index",
      "type": "(value: number) => void",
      "description": "交互更新 index 时发出新值；可使用对应的命名 v-model 接收。"
    },
    {
      "name": "change",
      "type": "(value: number) => void",
      "description": "图片组或预览索引改变时发出从 0 开始的索引。"
    }
  ],
  "slots": [
    {
      "name": "item",
      "type": "({ item: AppleImageItem, index: number, active: boolean }) => VNode[]",
      "description": "仅 carousel=true 时替代整个轮播项；提供无图片内容时不会打开图片预览。"
    },
    {
      "name": "caption",
      "type": "() => VNode[]（无 slot props）",
      "description": "figure 的 figcaption 说明文字。"
    }
  ],
  "methods": [],
  "notes": [
    "图片数组不接受顶层 src/alt；描述应放在 gallery 对象内。预览由组件内部管理，没有独立公开 Viewer 组件。",
    "图片组支持方向键、Home/End、拖动和分页；无效或加载失败的图片不会打开预览。横屏缩略图左右按钮在悬浮时淡入、移开时淡出，遵循 --apple-fast 和 --apple-ease；竖屏隐藏左右箭头、关闭及缩放按钮。",
    "所有设备使用统一预览交互，平滑滚轮、缩放、旋转、翻页和进退场支持动画打断与叠加；底部胶囊依次为左旋转、缩小、可选名称、放大、右旋转，每次旋转 90°。"
  ]
})
