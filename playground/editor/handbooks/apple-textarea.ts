import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleTextarea",
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
      "type": "string",
      "default": "\"\"",
      "description": "多行文本，输入后仍返回字符串。"
    },
    {
      "name": "placeholder",
      "type": "string",
      "default": "undefined",
      "description": "尚未填写或选择时显示的占位文字，不能替代字段名称。"
    },
    {
      "name": "rows",
      "type": "number",
      "default": "4",
      "description": "原生 textarea 的可见行数。"
    },
    {
      "name": "maxlength",
      "type": "number",
      "default": "undefined",
      "description": "原生最大字符数。省略时不限制长度。"
    },
    {
      "name": "counter",
      "type": "boolean",
      "default": "false",
      "description": "显示字符数；同时设置 maxlength 时显示“当前数 / 上限”。"
    },
    {
      "name": "resize",
      "type": "boolean",
      "default": "true",
      "description": "允许用户纵向调整大小；false 禁止手动缩放。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: string) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "change",
      "type": "(value: string) => void",
      "description": "原生 change 时发出文字，通常在修改后移出焦点时触发。"
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
