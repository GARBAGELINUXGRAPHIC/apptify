import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleForm",
  "source": "src/components/forms.ts",
  "props": [
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用 fieldset 内的字段并阻止提交。"
    },
    {
      "name": "loading",
      "type": "boolean",
      "default": "false",
      "description": "与内部异步校验状态合并，禁用 fieldset 内所有字段并阻止再次提交。"
    },
    {
      "name": "validator",
      "type": "(data: FormData) => boolean | string | Promise<boolean | string>",
      "default": "undefined",
      "description": "函数 (data: FormData) => boolean | string | Promise<boolean | string>。原生校验通过后执行，仅 true 表示成功；字符串作为错误，false 使用默认错误。"
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
      "name": "submit",
      "type": "(data: FormData) => void",
      "description": "原生约束和自定义校验通过后发出表单数据；不会自动发送网络请求。"
    },
    {
      "name": "invalid",
      "type": "(error: { type: 'native' | 'custom'; message?: string }) => void",
      "description": "原生校验失败时 type=native；自定义返回失败或抛错时 type=custom 并带 message。"
    },
    {
      "name": "reset",
      "type": "() => void",
      "description": "原生表单重置时触发。需要在应用内同步重置 Vue model。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "({ loading: boolean }) => VNode[]",
      "description": "表单字段与操作，loading 合并外部 loading 和内部校验状态。"
    }
  ],
  "methods": [
    {
      "name": "validate()",
      "type": "() => Promise<boolean>",
      "description": "执行原生及自定义校验，返回是否通过；不会发出 submit。"
    },
    {
      "name": "submit()",
      "type": "() => Promise<void>",
      "description": "在可用状态下执行校验，通过后发出 submit(FormData)。"
    },
    {
      "name": "reset()",
      "type": "() => void",
      "description": "调用原生 form.reset() 并触发 reset；父组件应同步重置 Vue model。"
    }
  ],
  "notes": [
    "FormData 只包含有 name 的可提交字段。reset 重置浏览器字段，不会替应用重置所有 Vue model。"
  ]
})
