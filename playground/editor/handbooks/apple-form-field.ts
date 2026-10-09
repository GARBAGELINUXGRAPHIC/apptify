import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleFormField",
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
      "description": "通过插槽向内部输入传递 disabled；容器不会自动禁用任意插槽内容。"
    },
    {
      "name": "loading",
      "type": "boolean",
      "default": "false",
      "description": "将 default 插槽的 disabled 设为 true；字段容器本身不代替内部控件执行禁用。"
    },
    {
      "name": "required",
      "type": "boolean",
      "default": "false",
      "description": "显示必填星号，并通过插槽传递 required；需绑定到实际输入。"
    },
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "for",
      "type": "string",
      "default": "undefined",
      "description": "自定义输入的 id，省略时自动生成。需将 default 插槽属性绑定到实际输入以关联标签与说明。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "({ id: string, disabled: boolean, required: boolean, 'aria-label'?: string, 'aria-labelledby'?: string, 'aria-invalid': boolean, 'aria-describedby'?: string }) => VNode[]",
      "description": "将 slot props 用 v-bind 绑定到实际输入，才能传递禁用、必填和标签/提示关联。"
    }
  ],
  "methods": [],
  "notes": [
    "容器只提供字段关联属性，不会自动改写插槽内容；务必将插槽参数绑定到自定义输入。",
    "字段名称、帮助和错误文字只用于说明。直接操作控件；原生 name、autocomplete 等属性需按实际输入类型使用。"
  ]
})
