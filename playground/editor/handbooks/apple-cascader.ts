import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleCascader",
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
      "type": "(string | number)[]",
      "default": "[]",
      "description": "已选 value 的路径数组，每级一个值；改选上级时舍弃其后的旧路径。"
    },
    {
      "name": "items",
      "type": "AppleCascaderOption[]",
      "default": "[]",
      "description": "递归选项：{ label: string; value: string | number; disabled?: boolean } & { children?: AppleCascaderOption[] }。需自行提供数据。"
    },
    {
      "name": "placeholder",
      "type": "string",
      "default": "\"请选择\"",
      "description": "尚未填写或选择时显示的占位文字，不能替代字段名称。"
    },
    {
      "name": "levelLabels",
      "type": "string[]",
      "default": "[]",
      "description": "各层选择器的占位文字和可访问名称，未提供的层级使用 placeholder / label。"
    },
    {
      "name": "name",
      "type": "string",
      "default": "undefined",
      "description": "提交字段按 name[0]、name[1] 等命名。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: (string | number)[]) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "change",
      "type": "(value: (string | number)[]) => void",
      "description": "用户提交选择或调整时发出当前值；直接从父组件赋值不会主动发出此事件。"
    },
    {
      "name": "complete",
      "type": "(path: (string | number)[]) => void",
      "description": "选择无子节点的叶子选项时触发，参数是完整选中路径。"
    }
  ],
  "slots": [],
  "methods": [],
  "notes": [
    "字段名称、帮助和错误文字只用于说明。直接操作控件；原生 name、autocomplete 等属性需按实际输入类型使用。"
  ]
})
