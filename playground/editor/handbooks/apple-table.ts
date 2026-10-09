import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleTable",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "columns",
      "type": "AppleColumn[]",
      "default": "[]",
      "description": "列数组：{ key, label, sortable?, align?: 'left'|'center'|'right', width?: number|string, minWidth?, maxWidth?, resizable? }。key 对应行字段；宽度数字按 px。"
    },
    {
      "name": "rows",
      "type": "Record<string, unknown>[]",
      "default": "[]",
      "description": "行对象数组；每行需提供稳定唯一的 rowKey。排序和分页在本地完成。"
    },
    {
      "name": "rowKey",
      "type": "string",
      "default": "\"id\"",
      "description": "行的唯一标识字段名称，默认 id。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"数据表格\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    },
    {
      "name": "selectable",
      "type": "boolean",
      "default": "false",
      "description": "显示行复选框及当前页全选框；全选只影响当前可见页。"
    },
    {
      "name": "selected",
      "type": "(string | number)[]",
      "default": "undefined",
      "description": "选中行的 rowKey 值数组，可用 v-model:selected；省略时内部管理。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁止排序、选择、翻页、列宽调整及 row-click。"
    },
    {
      "name": "sortBy",
      "type": "string",
      "default": "undefined",
      "description": "排序字段名，可用 v-model:sort-by；省略时使用内部排序状态。"
    },
    {
      "name": "sortDirection",
      "type": "'asc' | 'desc'",
      "default": "undefined",
      "description": "asc 或 desc，可用 v-model:sort-direction；省略时内部初始方向为 asc。"
    },
    {
      "name": "page",
      "type": "number",
      "default": "undefined",
      "description": "从 1 开始的当前页，可用 v-model:page；省略时内部初始为 1。"
    },
    {
      "name": "pageSize",
      "type": "number",
      "default": "0",
      "description": "每页行数，0 禁用分页；总条目数使用 rows.length。"
    },
    {
      "name": "loading",
      "type": "boolean",
      "default": "false",
      "description": "设置 aria-busy，空表格时显示加载文字；不会阻止排序、选择或行点击。"
    },
    {
      "name": "emptyText",
      "type": "string",
      "default": "\"暂无数据\"",
      "description": "没有行且不在加载时的文字；empty 插槽可以覆盖。"
    },
    {
      "name": "virtual",
      "type": "boolean",
      "default": "false",
      "description": "基于固定行高的虚拟滚动；配合分页时只虚拟化当前页。"
    },
    {
      "name": "height",
      "type": "number",
      "default": "360",
      "description": "virtual 模式的滚动视口高度，单位 px，实际至少 96。"
    },
    {
      "name": "rowHeight",
      "type": "number",
      "default": "48",
      "description": "虚拟行的固定高度，单位 px，实际至少 28；不支持自动测量可变行高。"
    },
    {
      "name": "overscan",
      "type": "number",
      "default": "5",
      "description": "虚拟视口前后额外渲染的行数，实际至少 0。"
    },
    {
      "name": "resizable",
      "type": "boolean",
      "default": "true",
      "description": "允许拖动或键盘调整列宽；列上 resizable=false 可单独关闭。"
    }
  ],
  "events": [
    {
      "name": "update:selected",
      "type": "(value: (string | number)[]) => void",
      "description": "交互更新 selected 时发出新值；可使用对应的命名 v-model 接收。"
    },
    {
      "name": "update:sortBy",
      "type": "(value: string) => void",
      "description": "交互更新 sortBy 时发出新值；可使用对应的命名 v-model 接收。"
    },
    {
      "name": "update:sortDirection",
      "type": "(value: 'asc' | 'desc') => void",
      "description": "交互更新 sortDirection 时发出新值；可使用对应的命名 v-model 接收。"
    },
    {
      "name": "sort",
      "type": "(sort: { key: string; direction: 'asc' | 'desc' }) => void",
      "description": "点击可排序列时，在 sortBy/sortDirection 更新事件后发出排序信息。"
    },
    {
      "name": "update:page",
      "type": "(value: number) => void",
      "description": "交互更新 page 时发出新值；可使用对应的命名 v-model 接收。"
    },
    {
      "name": "row-click",
      "type": "(row: Record<string, unknown>) => void",
      "description": "点击数据行时发出该行；复选框操作不会冒泡触发此事件。"
    },
    {
      "name": "column-resize",
      "type": "(column: { key: string; width: number }) => void",
      "description": "拖动或键盘调整列宽时发出列 key 和约束后的像素宽度。"
    }
  ],
  "slots": [
    {
      "name": "cell-${key}",
      "type": "({ row: Record<string, unknown>, value: unknown, index: number }) => VNode[]",
      "description": "替代 key 对应列的单元格，例如 #cell-name。index 为当前排序/分页后可见页内的行索引。"
    },
    {
      "name": "empty",
      "type": "() => VNode[]（无 slot props）",
      "description": "替代空表格内容，包括默认加载或空文字。"
    }
  ],
  "methods": [],
  "notes": [
    "rows 使用稳定唯一 rowKey。虚拟滚动使用固定行高；与分页同时启用时只虚拟化当前页。",
    "排序、选择、分页可受控也可内部管理。列宽可通过拖动或方向键调整；此组件不提供服务器分页协议。"
  ]
})
