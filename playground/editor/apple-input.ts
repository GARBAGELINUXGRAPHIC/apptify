import type { ComponentDocument, ApiDefinition } from './contract'
const definitions = {
  name: 'AppleInput', source: 'src/components/forms.ts:21–89',
  props: [
    { name: 'modelValue / v-model', type: 'string | number', default: "''", description: '输入框里显示的内容，用 v-model 绑定。初始值可以是文字或数字；用户输入后，得到的值都是字符串。例如输入 123，得到的是 "123"，不是数字 123。清空后得到空字符串 ""。' },
    { name: 'type', type: 'string', default: "'text'", description: '设置输入类型，例如 text（普通文字）、password（密码）、number（数字）。密码类型会显示“显示密码”按钮，点击后可以查看或隐藏内容，输入的值不会改变。数字类型仍返回字符串。' },
    { name: 'placeholder', type: 'string', default: 'undefined', description: '输入框为空时显示的提示文字，开始输入后消失。例如“请输入姓名”。它不能代替字段名称，建议同时设置 label。' },
    { name: 'clearable', type: 'boolean', default: 'false', description: '设为 true 后，输入框有内容时会显示清空按钮，值为数字 0 时也会显示。点击按钮会清空内容、触发 clear 事件，并让光标回到输入框。禁用或加载时会隐藏清空按钮。' },
    { name: 'label', type: 'string', default: "''", description: '输入框上方的字段名称，例如“姓名”。字段名称只用于说明，点击输入框本身可进入编辑。屏幕阅读器默认使用它介绍这个字段；可以用 aria-label 单独设置朗读名称。' },
    { name: 'hint', type: 'string', default: "''", description: '输入框下方的帮助文字，例如“最多输入 20 个字”。如果设置了 error，会优先显示错误信息，暂时隐藏这段帮助。屏幕阅读器也能读到这段说明。' },
    { name: 'error', type: 'string', default: "''", description: '输入框下方的错误信息，例如“请输入姓名”，同时显示错误样式。把它设为空字符串就能恢复正常。组件只显示你传入的错误，不会自己检查内容，也不会阻止提交。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '设为 true 后，输入框不能编辑，清空和密码按钮也会隐藏。按 Tab 会跳过这个字段，提交 HTML 表单时也不会包含这个字段。' },
    { name: 'loading', type: 'boolean', default: 'false', description: '设为 true 后显示加载图标，表示正在处理。此时不能输入，清空和密码按钮会隐藏，只保留加载图标。处理结束后设为 false，就能继续操作。' },
    { name: 'required', type: 'boolean', default: 'false', description: '设为 true 后，字段名称旁显示星号。放在 HTML 表单中时，浏览器会检查是否填写；为空就不能正常提交。它不会自动设置 error，也不会生成自定义错误信息。' },
    { name: 'motion', type: "'inherit' | 'auto' | 'full' | 'reduced' | 'none'", default: "'inherit'", description: '设置这个输入框的动效偏好。默认 inherit，跟随外层设置；none 表示不使用动效，reduced 表示减少动效。这个设置不会改变输入内容或校验结果。' },
  ],
  events: [
    { name: 'update:modelValue', type: '(value: string) => void', description: '输入内容变化时触发，事件参数就是最新的文字；点击清空时，参数是空字符串。使用 v-model 时通常不用手动处理。即使 type 是 number，参数也仍是字符串，需要数字时自行转换。' },
    { name: 'change', type: '(value: string) => void', description: '修改内容后，把光标移出输入框时通常会触发，事件参数是当前文字。它不会像 update:modelValue 那样每输入一个字就触发。点击组件的清空按钮不会主动触发它。' },
    { name: 'clear', type: '() => void', description: '点击清空按钮时触发，没有事件参数。触发前，组件已经发出清空内容的更新事件；随后会让光标回到输入框。可以用它处理清空后的操作。' },
  ],
  slots: [
    { name: 'prefix', type: '() => VNode[]（无 slot props）', description: '在输入框内容的左侧放自定义内容，例如 @ 符号或图标。插槽不会提供额外数据。如果放的是按钮，请给按钮设置清楚的名称；纯装饰图标可以用 aria-hidden 隐藏朗读。' },
    { name: 'suffix', type: '() => VNode[]（无 slot props）', description: '在输入框右侧放自定义内容，例如单位、图标或操作按钮。它位于组件自带的加载、清空、密码按钮之后。插槽不会提供额外数据；直接放在组件里的内容不会显示，需使用具名插槽。' },
  ],
  methods: [{ name: 'focus()', type: '() => void', description: '让光标进入输入框。先用 ref 获取组件，再调用 input.value.focus()。例如点击“编辑姓名”后自动聚焦。输入框被禁用时无法聚焦；组件没有提供 blur() 或 select() 方法。' }],
  notes: [
    '常见 HTML 输入属性可以直接使用，例如 maxlength 限制长度、autocomplete 自动填充。@focus、@blur、@keydown 也可以直接监听。这些沿用浏览器的行为，不是组件另设的接口。class 和 style 应用在内部输入框上。不要使用 readable。',
    '不传 id 时，组件会自动生成，保证名称和输入框正确关联。帮助、错误、加载状态也会告知屏幕阅读器；这些状态跟随 hint、error、loading、required 和 disabled。',
    '可以用 Tab 切换焦点，用键盘选中文字、复制和操作按钮。密码按钮会提示当前是显示还是隐藏；清空后光标回到输入框。如果不显示 label，请设置 aria-label 或 aria-labelledby，让屏幕阅读器知道字段名称。',
  ],
}

function entries(group: string, definitions: ApiDefinition[]) {
  return definitions.map(entry => {
    const id = entry.name === 'modelValue / v-model' ? 'model-value'
      : entry.name === 'update:modelValue' ? 'update-model-value'
      : entry.name === 'focus()' ? 'focus' : entry.name
    return { ...entry, id: `${group}-${id}` }
  })
}
export default {
  ...definitions,
  props: entries('prop', definitions.props),
  events: entries('event', definitions.events),
  slots: entries('slot', definitions.slots),
  methods: entries('method', definitions.methods),
} satisfies ComponentDocument
