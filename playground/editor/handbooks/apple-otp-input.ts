import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleOtpInput",
  "source": "src/components/forms.ts",
  "props": [
    {
      "name": "label",
      "type": "string",
      "default": "\"验证码\"",
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
      "description": "验证码字符串；键入和粘贴后截取到 length。"
    },
    {
      "name": "length",
      "type": "number",
      "default": "6",
      "description": "验证码位数，要求 1–12，默认 6。"
    },
    {
      "name": "numeric",
      "type": "boolean",
      "default": "true",
      "description": "只保留数字；false 允许非空白字符。"
    },
    {
      "name": "name",
      "type": "string",
      "default": "undefined",
      "description": "HTML 表单字段名；设置后才会在 FormData 中包含此字段。"
    },
    {
      "name": "mask",
      "type": "boolean",
      "default": "false",
      "description": "将各位输入渲染为 password，不改变实际模型。"
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
      "description": "用户提交选择或调整时发出当前值；直接从父组件赋值不会主动发出此事件。"
    },
    {
      "name": "complete",
      "type": "(value: string) => void",
      "description": "更新后的字符串长度达到 length 时触发；不执行远程验证。"
    }
  ],
  "slots": [],
  "methods": [
    {
      "name": "focus(index = 0)",
      "type": "(index?: number) => void",
      "description": "聚焦指定验证码位，索引从 0 开始并约束在有效范围。"
    }
  ],
  "notes": [
    "字段名称、帮助和错误文字只用于说明。直接操作控件；原生 name、autocomplete 等属性需按实际输入类型使用。"
  ]
})
