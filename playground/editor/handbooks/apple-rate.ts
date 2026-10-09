import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleRate",
  "source": "src/components/forms.ts",
  "props": [
    {
      "name": "label",
      "type": "string",
      "default": "\"评分\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    },
    {
      "name": "hint",
      "type": "string",
      "default": "\"\"",
      "description": "字段帮助文字；error 非空时优先显示错误，帮助文字暂时隐藏。"
    },
    {
      "name": "error",
      "type": "string",
      "default": "\"\"",
      "description": "显示字段错误和错误样式，不会自行执行校验或阻止表单提交。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用控件的交互。选项自身的 disabled 仍然独立生效。"
    },
    {
      "name": "loading",
      "type": "boolean",
      "default": "false",
      "description": "显示忙碌状态；表单控件在加载时禁止编辑或选择。"
    },
    {
      "name": "required",
      "type": "boolean",
      "default": "false",
      "description": "为字段添加必填标记并传递必填约束；不会自动生成 error 文本。"
    },
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "modelValue",
      "type": "number",
      "default": "0",
      "description": "整数星级，0 表示未评分；不支持半星。"
    },
    {
      "name": "max",
      "type": "number",
      "default": "5",
      "description": "星星数量，渲染限制为 1–10，应用也应使用该范围。"
    },
    {
      "name": "readonly",
      "type": "boolean",
      "default": "false",
      "description": "只展示，禁止交互更新并移出 Tab 顺序；与 disabled 独立。"
    },
    {
      "name": "allowClear",
      "type": "boolean",
      "default": "true",
      "description": "再次点击当前星级时清为 0；不会改变键盘方向键的整数步进规则。"
    },
    {
      "name": "name",
      "type": "string",
      "default": "undefined",
      "description": "HTML 表单字段名；设置后才会在 FormData 中包含此字段。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: number) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "change",
      "type": "(value: number) => void",
      "description": "用户提交选择或调整时发出当前值；直接从父组件赋值不会主动发出此事件。"
    }
  ],
  "slots": [],
  "methods": [],
  "notes": [
    "字段名称、帮助和错误文字只用于说明。直接操作控件；原生 name、autocomplete 等属性需按实际输入类型使用。"
  ]
})
