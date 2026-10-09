import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "ApplePopover",
  "source": "src/components/overlays.ts",
  "props": [
    {
      "name": "modelValue",
      "type": "boolean",
      "default": "undefined",
      "description": "受控打开状态；省略时内部管理，保留默认 undefined 可体验非受控模式。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"更多\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用控件的交互。选项自身的 disabled 仍然独立生效。"
    },
    {
      "name": "placement",
      "type": "'top' | 'bottom' | 'left' | 'right'",
      "default": "\"bottom\"",
      "description": "期望弹出方向：top、bottom、left、right；碰到视口边缘时会避让。"
    },
    {
      "name": "align",
      "type": "'start' | 'center' | 'end'",
      "default": "\"start\"",
      "description": "与触发元素对齐：start、center、end。"
    },
    {
      "name": "role",
      "type": "string",
      "default": "\"dialog\"",
      "description": "面板 ARIA role，默认 dialog；自定义语义应与内容匹配。"
    },
    {
      "name": "width",
      "type": "number | string",
      "default": "280",
      "description": "宽度。数字按 px，字符串作为 CSS 尺寸；仍受可用空间约束。"
    },
    {
      "name": "openOnHover",
      "type": "boolean",
      "default": "false",
      "description": "在非触摸设备上支持悬停打开，同时保留焦点和点击交互。"
    },
    {
      "name": "trapFocus",
      "type": "boolean",
      "default": "true",
      "description": "打开后限制 Tab 焦点在面板内；tooltip 等非模态提示可关闭。"
    },
    {
      "name": "panelClass",
      "type": "string",
      "default": "\"\"",
      "description": "附加到弹出面板的 CSS class。"
    },
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: boolean) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "open",
      "type": "() => void",
      "description": "打开状态改变为 true 时触发。"
    },
    {
      "name": "close",
      "type": "() => void",
      "description": "面板退出过渡完成并释放层级状态后触发，无参数。"
    },
    {
      "name": "after-close",
      "type": "() => void",
      "description": "面板退出过渡完成后触发。"
    }
  ],
  "slots": [
    {
      "name": "activator",
      "type": "({ props: Record<string, unknown>, open: () => void, close: () => void, isOpen: boolean }) => VNode[]",
      "description": "自定义触发元素，使用 v-bind=\"props\" 保留点击、焦点与 ARIA 交互。"
    },
    {
      "name": "default",
      "type": "({ close: () => void }) => VNode[]",
      "description": "弹出面板内容；close() 关闭面板。"
    }
  ],
  "methods": [],
  "notes": [
    "支持受控与非受控状态，Esc 与外部点击关闭并恢复焦点。自定义 activator 应绑定 slot props。"
  ]
})
