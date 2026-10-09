import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleDatePicker",
  "source": "src/components/date-picker.ts",
  "props": [
    {
      "name": "modelValue",
      "type": "string",
      "default": "\"\"",
      "description": "规范化模型字符串：YYYY、YYYY-MM、YYYY-MM-DD、日期THH:mm[:ss] 或 HH:mm[:ss]，由显示分段决定；清空为 \"\"。"
    },
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
      "name": "min",
      "type": "string",
      "default": "undefined",
      "description": "最早允许的日期/时间字符串，与当前模型精度对应。"
    },
    {
      "name": "max",
      "type": "string",
      "default": "undefined",
      "description": "最晚允许的日期/时间字符串，与当前模型精度对应。"
    },
    {
      "name": "format",
      "type": "string",
      "default": "undefined",
      "description": "显示分段格式，例如 YYYY/MM/DD、YYYY/MM/DD HH:mm:ss 或 HH:mm。优先级高于 granularity 和 type，模型仍用规范化分隔符。"
    },
    {
      "name": "granularity",
      "type": "string",
      "default": "undefined",
      "description": "格式预设名称。内置 year、month、day、hour、minute、second、hm、hms、ym、ymd、ymdhm、ymdhms。显式 format 优先。"
    },
    {
      "name": "type",
      "type": "'date' | 'month' | 'datetime-local' | 'time'",
      "default": "\"date\"",
      "description": "未设置 format/granularity 时选择 date、month、datetime-local 或 time 的默认分段。"
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
      "type": "(value: string) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "change",
      "type": "(value: string) => void",
      "description": "用户提交选择或调整时发出当前值；直接从父组件赋值不会主动发出此事件。"
    }
  ],
  "slots": [],
  "methods": [],
  "notes": [
    "format > granularity > type。显示格式和模型格式分离，输入不会自动跳到下一段；不支持范围或 ISO week 选择。",
    "字段名称、帮助和错误文字只用于说明。直接操作控件；原生 name、autocomplete 等属性需按实际输入类型使用。"
  ]
})
