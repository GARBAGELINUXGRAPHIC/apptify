<template>
  <apple-popover v-model="opened" label="用户菜单" align="end" :width="280" panel-class="user-popup">
    <template #activator>
      <apple-button class="user-trigger user-account-trigger" variant="ghost" icon-only label="打开用户菜单" title="用户菜单"><UserRound :size="20" /></apple-button>
    </template>
    <div class="user-summary">
      <apple-avatar name="林初" :size="48" />
      <div><strong>林初 <small>演示账户</small></strong><span>lin.chu@example.com</span></div>
    </div>
    <div class="user-menu-list">
      <apple-button variant="ghost" @click="showProfile"><UserRound :size="17" /><span>个人资料</span><ArrowUpRight :size="14" aria-hidden="true" /></apple-button>
      <router-link to="/settings" @click="opened = false"><Settings2 :size="17" /><span>偏好设置</span><ArrowUpRight :size="14" aria-hidden="true" /></router-link>
    </div>
    <div class="user-menu-list user-menu-examples">
      <apple-button variant="ghost" @click="openAuth('login')"><LogIn :size="17" /><span>登录 <small>Login</small></span><em>示例</em></apple-button>
      <apple-button variant="ghost" @click="openAuth('register')"><UserPlus :size="17" /><span>注册 <small>Register</small></span><em>示例</em></apple-button>
    </div>
  </apple-popover>
  <apple-dialog v-model="authOpen" class="user-auth-dialog" :width="560" :title="authMode === 'login' ? '登录示例' : '注册示例'" :show-footer="false" @after-close="password = ''">
    <template #title>
      <span class="user-auth-heading">
        <span class="user-auth-symbol" aria-hidden="true">a</span>
        <span>{{ authMode === 'login' ? '登录或切换用户' : '创建账户' }}</span>
      </span>
    </template>
    <apple-form :key="authMode" class="user-auth-form" @submit="submitAuth">
      <apple-input v-if="authMode === 'register'" ref="nameInput" v-model="name" label="姓名" autocomplete="name" required>
        <template #prefix><UserRound :size="18" aria-hidden="true" /></template>
      </apple-input>
      <apple-input ref="emailInput" v-model="email" label="电子邮箱" type="email" autocomplete="email" placeholder="name@example.com" required>
        <template #prefix><Mail :size="18" aria-hidden="true" /></template>
      </apple-input>
      <div class="user-auth-password">
        <apple-input v-model="password" label="密码" type="password" :autocomplete="authMode === 'login' ? 'current-password' : 'new-password'" required>
          <template #prefix><LockKeyhole :size="18" aria-hidden="true" /></template>
        </apple-input>
        <apple-button v-if="authMode === 'login'" class="user-auth-forgot" variant="ghost" size="small" @click="showAuthEntry('forgot')">忘记密码？</apple-button>
      </div>
      <p class="user-auth-note">这是表单交互示例，尚未接入账户服务。填写内容不会提交到服务器。</p>
      <div class="user-auth-actions">
        <apple-button class="user-auth-submit" type="submit" size="large">{{ authMode === 'login' ? '体验登录' : '体验注册' }}</apple-button>
        <apple-button class="user-auth-email" variant="outline" size="large" @click="showAuthEntry('email')">邮箱验证码登录</apple-button>
      </div>
    </apple-form>
    <div class="user-auth-alternatives">
      <apple-link href="#" @click.prevent="switchAuthMode">
        {{ authMode === 'login' ? '注册账户' : '已有账户？登录' }}<ArrowUpRight :size="14" aria-hidden="true" />
      </apple-link>
    </div>
  </apple-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowUpRight, LockKeyhole, LogIn, Mail, Settings2, UserPlus, UserRound } from 'lucide-vue-next'
import { useApple } from 'apptify'

const apple = useApple()
const route = useRoute()
const opened = ref(false)
const authOpen = ref(false)
const authMode = ref<'login' | 'register'>('login')
const name = ref('')
const email = ref('')
const password = ref('')
const nameInput = ref<{ focus: () => void } | null>(null)
const emailInput = ref<{ focus: () => void } | null>(null)
watch(() => route.path, () => { opened.value = false; authOpen.value = false })

function openAuth(mode: 'login' | 'register') {
  opened.value = false
  authMode.value = mode
  name.value = email.value = password.value = ''
  authOpen.value = true
}
function submitAuth() {
  authOpen.value = false
  password.value = ''
  apple.notify(authMode.value === 'login' ? '登录示例已完成' : '注册示例已完成', { tone: 'success' })
}
async function switchAuthMode() {
  authMode.value = authMode.value === 'login' ? 'register' : 'login'
  password.value = ''
  await nextTick()
  const firstInput = authMode.value === 'register' ? nameInput.value : emailInput.value
  firstInput?.focus()
}
function showAuthEntry(entry: 'forgot' | 'email') {
  apple.notify(entry === 'forgot'
    ? '找回密码尚未接入账户服务，此示例不会发送重置邮件。'
    : '邮箱验证码登录尚未接入账户服务，此示例不会发送验证码。')
}
function showProfile() {
  opened.value = false
  apple.dialog({ title: '个人资料', message: '林初 · lin.chu@example.com\n这是用于展示账户菜单的演示资料。', confirmText: '知道了', cancelText: '' })
}
</script>

<style>
.user-popup.apple-popover { border-radius: 24px; background: var(--apple-surface); -webkit-backdrop-filter: none; backdrop-filter: none; }
.user-popup .user-menu-list > .apple-button > .apple-button__content { width: 100%; justify-content: flex-start; gap: 11px; }
.user-popup .user-menu-list > .apple-button { min-height: 44px; font-weight: 400; line-height: inherit; }
.user-popup .user-menu-list > .apple-button:hover:where(:not([data-apple-touch] *)):not(:disabled) { background: var(--apple-hover); color: var(--apple-text); }
.user-popup .user-menu-list > .apple-button:active:not(:disabled) { background: var(--apple-pressed); color: var(--apple-text); }
.user-trigger.user-account-trigger { width: 44px; height: 44px; border: 0; background: transparent; }
.user-trigger.user-account-trigger:focus-visible { outline: 3px solid var(--apple-accent); outline-offset: 2px; }
.user-auth-dialog.apple-modal { border-radius: 24px; background: var(--apple-surface); -webkit-backdrop-filter: none; backdrop-filter: none; }
.user-auth-dialog .apple-modal-header { position: relative; justify-content: center; padding: 40px 44px 32px; }
.user-auth-dialog .apple-modal-heading { width: 100%; text-align: center; }
.user-auth-dialog .apple-modal-heading h2 { font-size: 30px; line-height: 1.35; }
.user-auth-dialog .apple-modal-header > .apple-overlay-icon { position: absolute; top: 8px; right: 8px; }
.user-auth-heading { display: flex; flex-direction: column; align-items: center; gap: 22px; }
.user-auth-symbol { display: grid; place-items: center; box-sizing: border-box; width: 64px; height: 64px; padding-bottom: 8px; border-radius: 16px; background: var(--apple-text); color: var(--apple-surface); font: 600 56px/1 Georgia, serif; }
.user-auth-dialog .apple-modal-body { padding: 0 64px 36px; }
.user-auth-form .apple-form__fields { gap: 20px; }
.user-auth-password { position: relative; }
.user-auth-password .apple-field__label { padding-right: 110px; }
.user-auth-password .user-auth-forgot { position: absolute; top: -12px; right: -8px; min-height: 44px; padding: 8px; font-size: 12px; }
.user-auth-dialog .user-auth-note { margin: 8px 0 20px; font-size: 13px; line-height: 1.75; }
.user-auth-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.user-auth-actions .apple-button { width: 100%; padding-inline: 12px; border-radius: var(--apple-radius, 8px); font-size: 14px; }
.user-auth-alternatives { display: flex; justify-content: center; margin-top: 24px; font-size: 13px; }
@media (max-width: 480px) {
  .user-auth-dialog .apple-modal-header { padding: 28px 24px 22px; }
  .user-auth-dialog .apple-modal-body { padding: 0 20px 22px; }
  .user-auth-dialog .apple-modal-heading h2 { font-size: 22px; }
  .user-auth-actions { gap: 8px; }
  .user-auth-actions .apple-button { padding-inline: 8px; font-size: 12px; }
  .user-auth-dialog .user-auth-note { margin-block: 0 8px; }
}
</style>
