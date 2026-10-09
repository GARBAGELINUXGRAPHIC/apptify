import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleUpload",
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
      "type": "File[]",
      "default": "[]",
      "description": "浏览器 File 对象数组，不是 URL 或文件名数组。组件只选择文件，不发送网络请求。"
    },
    {
      "name": "accept",
      "type": "string",
      "default": "\"\"",
      "description": "允许的扩展名或 MIME 类型，逗号分隔，例如 .png,image/jpeg,image/*；选择和拖放都会检查。"
    },
    {
      "name": "multiple",
      "type": "boolean",
      "default": "false",
      "description": "允许多个文件；开启时保留既有文件并追加，关闭时本次选择替换原数组。"
    },
    {
      "name": "maxSize",
      "type": "number",
      "default": "Infinity",
      "description": "单个文件大小上限，单位字节。默认 Infinity；超限通过 reject 返回。"
    },
    {
      "name": "maxFiles",
      "type": "number",
      "default": "Infinity",
      "description": "文件数量上限。multiple=false 时实际最多一个；重复文件会跳过。"
    },
    {
      "name": "capture",
      "type": "'user' | 'environment'",
      "default": "undefined",
      "description": "原生 file 输入的移动设备采集提示：user 或 environment，是否生效由浏览器决定。"
    },
    {
      "name": "buttonText",
      "type": "string",
      "default": "\"选择文件\"",
      "description": "文件选择区域的操作文字。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: File[]) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "change",
      "type": "(value: File[]) => void",
      "description": "用户提交选择或调整时发出当前值；直接从父组件赋值不会主动发出此事件。"
    },
    {
      "name": "reject",
      "type": "(rejections: { file: File; reason: string }[]) => void",
      "description": "返回本次未通过类型、大小或数量检查的文件及原因。"
    },
    {
      "name": "remove",
      "type": "(file: File) => void",
      "description": "移除单个文件时，在模型更新和 change 之后发出被移除的 File。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "追加到文件选择区域中的内容；插槽内按钮保留自身操作。"
    }
  ],
  "methods": [],
  "notes": [
    "选中数据是本地 File[]。上传请求由应用实现；示例只记录文件选择与拒绝结果。",
    "字段名称、帮助和错误文字只用于说明。直接操作控件；原生 name、autocomplete 等属性需按实际输入类型使用。"
  ]
})
