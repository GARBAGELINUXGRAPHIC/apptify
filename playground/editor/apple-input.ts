import type { ComponentDocument, ApiDefinition, VueExample } from './contract'
const sfc = (script: string, template: string) => `<script setup>\nimport { ref } from 'vue'\nimport { AppleInput, AppleButton, AppleCard, AppleSelect, AppleSegmentedControl, AppleSwitch } from 'apptify'\n${script}\n</script>\n\n<template>\n  <AppleCard class="example" title="输入框体验" subtitle="调整下面的选项，观察输入框的反馈。">\n    <div class="example-fields">\n${template}\n    </div>\n  </AppleCard>\n</template>\n\n<style scoped>\n.example { max-width: 440px; margin: 24px auto;  }\n.example-fields { display: grid; gap: 18px; margin-top: 20px; }\noutput, pre { color: var(--apple-secondary); font-size: 13px; white-space: pre-wrap; }\noutput { overflow-wrap: anywhere; }\n</style>`
const definitions = {
  name: 'AppleInput', source: 'src/components/forms.ts:21–89',
  props: [
    { name: 'modelValue / v-model', type: 'string | number', default: "''", description: '输入框里显示的内容，用 v-model 绑定。初始值可以是文字或数字；用户输入后，得到的值都是字符串。例如输入 123，得到的是 "123"，不是数字 123。清空后得到空字符串 ""。' },
    { name: 'type', type: 'string', default: "'text'", description: '设置输入类型，例如 text（普通文字）、password（密码）、number（数字）。密码类型会显示“显示密码”按钮，点击后可以查看或隐藏内容，输入的值不会改变。数字类型仍返回字符串。' },
    { name: 'placeholder', type: 'string', default: 'undefined', description: '输入框为空时显示的提示文字，开始输入后消失。例如“请输入姓名”。它不能代替字段名称，建议同时设置 label。' },
    { name: 'clearable', type: 'boolean', default: 'false', description: '设为 true 后，输入框有内容时会显示清空按钮，值为数字 0 时也会显示。点击按钮会清空内容、触发 clear 事件，并让光标回到输入框。禁用或加载时会隐藏清空按钮。' },
    { name: 'label', type: 'string', default: "''", description: '输入框上方的字段名称，例如“姓名”。点击名称也能把光标放进输入框。屏幕阅读器默认使用它介绍这个字段；可以用 aria-label 单独设置朗读名称。' },
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
    '常见 HTML 输入属性可以直接使用，例如 maxlength 限制长度、readonly 只读、autocomplete 自动填充。@focus、@blur、@keydown 也可以直接监听。这些沿用浏览器的行为，不是组件另设的接口。class 和 style 应用在内部输入框上。',
    '不传 id 时，组件会自动生成，保证名称和输入框正确关联。帮助、错误、加载状态也会告知屏幕阅读器；这些状态跟随 hint、error、loading、required 和 disabled。',
    '可以用 Tab 切换焦点，用键盘选中文字、复制和操作按钮。密码按钮会提示当前是显示还是隐藏；清空后光标回到输入框。如果不显示 label，请设置 aria-label 或 aria-labelledby，让屏幕阅读器知道字段名称。',
  ],
}

const examples: Record<string, VueExample & { id: string }> = {
  "type": { id: "type", title: "原生类型与密码可见性", description: "选择不同的输入类型。选“密码”后，点击眼睛按钮查看或隐藏内容。", code: sfc("const value = ref('123')\nconst type = ref('text')", "    <AppleSegmentedControl v-model=\"type\" label=\"输入类型\" :items=\"[{ label: '文本', value: 'text' }, { label: '密码', value: 'password' }, { label: '数字', value: 'number' }]\" />\n    <AppleInput v-model=\"value\" :type=\"type\" label=\"内容\" />\n    <output>当前类型：{{ type }}</output>") },
  "clearable": { id: "clearable", title: "清空按钮", description: "打开或关闭“允许清空”，试着清空内容。再点击“赋值为数值 0”，看看 0 也可以被清空。", code: sfc("const value = ref('可清空的内容')\nconst clearable = ref(true)", "    <AppleInput v-model=\"value\" label=\"内容\" :clearable=\"clearable\" />\n    <AppleSwitch v-model=\"clearable\" label=\"允许清空\" />\n    <AppleButton @click=\"value = 0\">赋值为数值 0</AppleButton>\n    <output>{{ JSON.stringify(value) }}</output>") },
  "label": { id: "label", title: "标签与可访问名称", description: "修改“设置标签”，观察另一个输入框的名称变化。点击这个名称，光标会进入对应输入框。", code: sfc("const value = ref('')\nconst label = ref('姓名')", "    <AppleInput v-model=\"label\" label=\"设置标签\" />\n    <AppleInput id=\"label-example\" v-model=\"value\" :label=\"label\" placeholder=\"点标签也可以聚焦\" />") },
  "hint": { id: "hint", title: "帮助说明", description: "修改“帮助说明文字”，观察下面输入框的帮助文字变化。", code: sfc("const value = ref('')\nconst hint = ref('这将是你的公开显示名称')", "    <AppleInput v-model=\"hint\" label=\"帮助说明文字\" />\n    <AppleInput v-model=\"value\" label=\"显示名称\" :hint=\"hint\" />") },
  "error": { id: "error", title: "错误状态", description: "打开或关闭“显示错误”，查看错误样式和错误信息。错误出现时，帮助文字会隐藏，但仍能输入。", code: sfc("const value = ref('')\nconst error = ref('请输入至少两个字符')", "    <AppleInput v-model=\"value\" label=\"姓名\" hint=\"可以使用昵称\" :error=\"error\" />\n    <AppleSwitch :model-value=\"Boolean(error)\" label=\"显示错误\" @update:model-value=\"error = $event ? '请输入至少两个字符' : ''\" />") },
  "disabled": { id: "disabled", title: "禁用输入和按钮", description: "打开或关闭“禁用输入框”，试着输入、清空和显示密码，看看按钮如何隐藏和恢复。", code: sfc("const value = ref('apple123')\nconst disabled = ref(true)", "    <AppleInput v-model=\"value\" label=\"密码\" type=\"password\" clearable :disabled=\"disabled\" />\n    <AppleSwitch v-model=\"disabled\" label=\"禁用输入框\" />") },
  "loading": { id: "loading", title: "显示加载状态", description: "打开“加载中”，查看加载图标；此时不能输入，清空和密码按钮会隐藏。关闭后恢复。", code: sfc("const value = ref('处理中')\nconst loading = ref(true)", "    <AppleInput v-model=\"value\" label=\"名称\" clearable :loading=\"loading\" />\n    <AppleSwitch v-model=\"loading\" label=\"加载中\" />") },
  "required": { id: "required", title: "原生必填校验", description: "保持“设为必填”开启，直接点击提交会提示填写姓名。输入姓名后再提交，会显示成功。这里演示浏览器校验，不会真的发送表单。", code: sfc("const value = ref('')\nconst required = ref(true)\nconst submitted = ref(false)", "    <form @submit.prevent=\"submitted = true\">\n      <AppleInput v-model=\"value\" label=\"姓名\" name=\"name\" :required=\"required\" />\n      <AppleButton @click=\"submitted = $event.target.closest('form').reportValidity()\">提交</AppleButton>\n    </form>\n    <AppleSwitch v-model=\"required\" label=\"设为必填\" @update:model-value=\"submitted = false\" />\n    <output>{{ submitted ? '提交成功' : '等待提交' }}</output>") },
  "motion": { id: "motion", title: "设置动效", description: "选择动效模式。inherit 跟随外层设置，none 关闭动效。你也可以修改代码，尝试其他模式。", code: sfc("const value = ref('')\nconst motion = ref('inherit')", "    <AppleSelect v-model=\"motion\" label=\"动效模式\" :items=\"['inherit', 'auto', 'full', 'reduced', 'none'].map(value => ({ label: value, value }))\" />\n    <AppleInput v-model=\"value\" label=\"内容\" clearable :motion=\"motion\" />\n    <output>当前动效模式：{{ motion }}</output>") },
  "update:modelValue": { id: "update-model-value", title: "查看每次输入的值", description: "输入数字或点击清空，查看下方收到的值和类型。这个例子手动接收更新事件，再把新值显示回输入框。", code: sfc("const value = ref(0)\nconst events = ref([])\nfunction update(next) { events.value.unshift({ value: next, type: typeof next }); value.value = next }", "    <AppleInput :model-value=\"value\" label=\"数量\" type=\"number\" clearable @update:model-value=\"update\" />\n    <pre>{{ events }}</pre>") },
  "change": { id: "change", title: "输入结束后收到通知", description: "输入内容，再点击下面的按钮把光标移开，查看 change 收到的文字。对比输入时和离开输入框时的差别。", code: sfc("const value = ref('')\nconst changes = ref([])", "    <AppleInput v-model=\"value\" label=\"姓名\" clearable @change=\"v => changes.unshift(v)\" />\n    <AppleButton>点击此处使输入框失焦</AppleButton>\n    <output>当前值：{{ value }}</output>\n    <pre>change 收到的内容：{{ changes }}</pre>") },
  "clear": { id: "clear", title: "清空事件与执行顺序", description: "点击清空，查看下方事件记录：先更新为空，再触发 clear，最后光标回到输入框。clear 本身不带参数。", code: sfc("const value = ref('清空我')\nconst events = ref([])", "    <AppleInput v-model=\"value\" label=\"内容\" clearable @update:model-value=\"v => events.push('update：' + JSON.stringify(v))\" @clear=\"(...args) => events.push('clear：' + args.length + ' 个参数')\" />\n    <AppleButton @click=\"value = '再次清空'; events = []\">重新填入</AppleButton>\n    <pre>{{ events }}</pre>") },
  "prefix": { id: "prefix", title: "在左侧放内容", description: "这个例子在输入框左侧放了 @。修改插槽内容，可以换成其他文字或图标。", code: sfc("const value = ref('apptify')", "    <AppleInput v-model=\"value\" label=\"用户名\">\n      <template #prefix><span aria-hidden=\"true\">@</span></template>\n    </AppleInput>\n    <output>{{ value }}</output>") },
  "suffix": { id: "suffix", title: "在右侧放内容", description: "这个例子在右侧放了“切换类型”按钮，点击它可以显示或隐藏密码。也可以把按钮换成单位文字。", code: sfc("const value = ref('apple123')\nconst type = ref('password')", "    <AppleInput v-model=\"value\" label=\"密码\" :type=\"type\">\n      <template #suffix><AppleButton variant=\"ghost\" @click=\"type = type === 'text' ? 'password' : 'text'\">后缀：切换类型</AppleButton></template>\n    </AppleInput>") },
  "focus()": { id: "focus", title: "让光标进入输入框", description: "点击“调用 focus()”，光标会进入输入框。再点击别处，下方状态会从 focus（进入）变为 blur（离开）。", code: sfc("const value = ref('')\nconst input = ref(null)\nconst status = ref('尚未聚焦')", "    <AppleInput ref=\"input\" v-model=\"value\" label=\"显示名称\" @focus=\"status = 'focus'\" @blur=\"status = 'blur'\" />\n    <AppleButton @click=\"input?.focus()\">调用 focus()</AppleButton>\n    <output>{{ status }}</output>") },
}
function entries(group: string, definitions: ApiDefinition[]) {
  return definitions.map(entry => {
    const example = examples[entry.name]
    const id = entry.name === 'modelValue / v-model' ? 'model-value' : entry.name
    return { ...entry, id: `${group}-${example?.id || id}`, ...(example ? { example } : {}) }
  })
}
export default {
  ...definitions,
  props: entries('prop', definitions.props),
  events: entries('event', definitions.events),
  slots: entries('slot', definitions.slots),
  methods: entries('method', definitions.methods),
} satisfies ComponentDocument
