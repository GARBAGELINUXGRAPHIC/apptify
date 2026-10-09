import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleSelect",
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
      "name": "items",
      "type": "AppleOption[]",
      "default": "[]",
      "description": "选项结构：{ label: string; value: string | number; disabled?: boolean }[]。disabled 选项不能选择；required 时必须选中有效且未禁用的选项。"
    },
    {
      "name": "modelValue",
      "type": "string | number | null",
      "default": "null",
      "description": "选中选项的 value；可为字符串、数字或 null，不会强制转为字符串。"
    },
    {
      "name": "placeholder",
      "type": "string",
      "default": "\"请选择\"",
      "description": "尚未填写或选择时显示的占位文字，不能替代字段名称。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: string | number | null) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "change",
      "type": "(value: string | number | null) => void",
      "description": "用户提交选择或调整时发出当前值；直接从父组件赋值不会主动发出此事件。"
    }
  ],
  "slots": [],
  "methods": [
    {
      "name": "focus()",
      "type": "() => void",
      "description": "通过组件 ref 将焦点移到输入或选择触发元素；禁用时无法聚焦。"
    }
  ],
  "notes": [
    "字段名称、帮助和错误文字只用于说明。直接操作控件；原生 name、autocomplete 等属性需按实际输入类型使用。"
  ]
})
