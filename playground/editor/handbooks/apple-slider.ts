import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleSlider",
  "source": "src/components/forms.ts",
  "props": [
    {
      "name": "label",
      "type": "string",
      "default": "\"\"",
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
      "description": "单个数值，不支持双端范围数组。"
    },
    {
      "name": "min",
      "type": "number",
      "default": "0",
      "description": "原生 range 的最小值。"
    },
    {
      "name": "max",
      "type": "number",
      "default": "100",
      "description": "原生 range 的最大值。"
    },
    {
      "name": "step",
      "type": "number",
      "default": "1",
      "description": "每次调整的数值步长。"
    },
    {
      "name": "showValue",
      "type": "boolean",
      "default": "true",
      "description": "显示当前数值。"
    },
    {
      "name": "formatValue",
      "type": "(value: number) => string",
      "default": "(value) => String(value)",
      "description": "格式化函数 (value: number) => string，同时用于数值显示与 aria-valuetext。"
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
      "description": "原生 range 提交变化时发出数值，区别于连续 input 模型更新。"
    }
  ],
  "slots": [],
  "methods": [],
  "notes": [
    "字段名称、帮助和错误文字只用于说明。直接操作控件；原生 name、autocomplete 等属性需按实际输入类型使用。"
  ]
})
