<script>
import { AppleInput, AppleTextarea, AppleLink } from 'apptify'
import { Mail } from 'lucide-vue-next'

export default {
  components: { AppleInput, AppleTextarea, AppleLink, Mail },
  data() {
    return { value: 'Apptify', events: [], eventId: 0 }
  },
  computed: {
    eventLog() {
      return this.events.map(event => `${event.id}. ${event.name} ${event.value === undefined ? '无参数' : JSON.stringify(event.value)}`).join('\n')
    },
  },
  watch: {
    eventLog() {
      this.$nextTick(() => {
        const textarea = this.$refs.logInput?.$el.querySelector('textarea')
        if (textarea) textarea.scrollTop = textarea.scrollHeight
      })
    },
  },
  methods: {
    record(name, value) {
      this.events.push({ id: ++this.eventId, name, value })
      if (this.events.length > 12) this.events.shift()
    },
  },
}
</script>

<template>
  <div class="example">
    <section class="input-section" aria-label="输入框">
      <form @submit.prevent="record('submit', value)">
        <AppleInput
          ref="input"
          v-model="value"
          label="姓名"
          placeholder="怎么称呼你"
          hint="用于在应用中显示你的名称。"
          clearable
          @update:model-value="record('update:modelValue', $event)"
          @change="record('change', $event)"
          @clear="record('clear')"
          @focus="record('focus')"
          @blur="record('blur')"
        >
          <!-- prefix -->
          <!-- suffix -->
        </AppleInput>
        <div class="actions">
          <AppleLink as="button" :disabled="false" @click="$refs.input.focus()">focus()</AppleLink>
          <AppleLink as="button" @click="value = 0">赋值为 0</AppleLink>
          <AppleLink as="button" type="submit">表单校验</AppleLink>
        </div>
      </form>
      <output>v-model = {{ JSON.stringify(value) }} · {{ typeof value }}</output>
    </section>
    <section class="events-section" aria-label="事件记录">
      <div class="event-heading"><h3>事件记录</h3><AppleLink as="button" @click="events = []">清除记录</AppleLink></div>
      <AppleTextarea ref="logInput" :model-value="eventLog" readonly :rows="6" :resize="false" class="event-log" aria-label="事件记录内容" placeholder="等待操作…" />
    </section>
  </div>
</template>

<style scoped>
.example { display: grid; gap: 28px; max-width: 560px; margin-inline: auto; padding: 28px 24px; }
.input-section { display: grid; gap: 16px; min-width: 0; }
form { display: grid; gap: 16px; min-width: 0; }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 24px; }
output { color: var(--apple-secondary); font-size: 12px; line-height: 1.6; font-family: ui-monospace, SFMono-Regular, monospace; overflow-wrap: anywhere; }
.events-section { display: grid; gap: 12px; min-width: 0; border-top: 1px solid var(--apple-border); padding-top: 20px; }
.event-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.event-heading h3 { margin: 0; font-size: 14px; font-weight: 600; }
.example :deep(.event-log) { height: 240px; max-height: 240px; font-size: 12px; font-family: ui-monospace, SFMono-Regular, monospace; }
@media (max-width: 480px) { .example { padding: 24px 16px; } }
</style>
