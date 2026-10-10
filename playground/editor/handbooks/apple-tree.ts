import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleTree",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "searchable",
      "type": "boolean",
      "default": "true",
      "description": "默认显示顶部搜索，匹配名称、value 和描述并保留祖先路径；清空搜索恢复原展开状态。"
    },
    {
      "name": "mobileDirectory",
      "type": "boolean",
      "default": "true",
      "description": "宽度不超过 900px 时自动进入全局 AppleSpeedDial 目录；设为 false 保持原位。没有宿主时保持原位。多个目录使用 AppleTabBar 切换，label 作为标签。"
    },
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "items",
      "type": "AppleTreeItem[]",
      "default": "[]",
      "description": "树节点为 { label: string; value: string | number; disabled?: boolean; description?: string; href?: string; content?: string } & { children?: AppleTreeItem[] }；value 在整棵树中应唯一。"
    },
    {
      "name": "modelValue",
      "type": "string | number",
      "default": "undefined",
      "description": "选中叶节点的 value；点击父节点只切换展开。折叠后可将高亮显示到最近可见祖先，原选择仍保留。"
    },
    {
      "name": "expanded",
      "type": "(string | number)[]",
      "default": "undefined",
      "description": "展开节点 value 的数组，可用 v-model:expanded；省略时内部管理。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用控件的交互。选项自身的 disabled 仍然独立生效。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"树形列表\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: string | number) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "update:expanded",
      "type": "(value: (string | number)[]) => void",
      "description": "交互更新 expanded 时发出新值；可使用对应的命名 v-model 接收。"
    },
    {
      "name": "select",
      "type": "(item: AppleTreeItem) => void",
      "description": "选择可用叶节点时发出完整节点；父节点点击仅切换 expanded。"
    }
  ],
  "slots": [
    {
      "name": "item",
      "type": "({ item: AppleTreeItem, expanded: boolean, selected: boolean }) => VNode[]",
      "description": "替代节点行的文字，不替代节点的展开和键盘处理。"
    }
  ],
  "methods": [],
  "notes": [
    "方向键、Home/End、Enter/空格可操作树。父节点只展开/折叠，选择事件只来自叶节点；没有复选框级联。"
  ]
})
