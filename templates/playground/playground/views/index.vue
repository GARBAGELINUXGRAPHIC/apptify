<template>
  <main class="main-content home-page">
    <section class="home-intro">
      <div class="page-kicker">APPTIFY / 界面与交互</div>
      <h1>让界面自然，<br /><span>让细节动人。</span></h1>
      <p>从一个按钮，到完整体验。<br class="mobile-break" /> 简洁的组件，恰到好处的交互。</p>
      <div class="home-actions">
        <router-link v-slot="{ href, navigate }" to="/components" custom>
          <apple-button :href="href" @click="navigate">浏览全部组件 <ArrowRight :size="17" aria-hidden="true" /></apple-button>
        </router-link>
        <router-link v-slot="{ href, navigate }" to="/settings" custom>
          <apple-link :href="href" class="home-link" @click="navigate">调整外观与动效 <ArrowUpRight :size="16" aria-hidden="true" /></apple-link>
        </router-link>
      </div>
    </section>
    <section aria-label="精选交互示例">
      <div class="section-heading"><h2>细节，即刻体验。</h2><span>精选交互示例 · 直接试一试</span></div>
          <div class="specimen-grid">
            <section class="specimen"><div class="specimen-caption"><span>01 / 导航</span></div><h2>内容，各归其位。</h2><apple-search v-model="settingQuery" placeholder="搜索设置" label="搜索设置" /><apple-list v-model="setting" :items="filteredSettings" selectable label="设置导航示例" /><p v-if="!filteredSettings.length" class="search-empty" role="status">没有匹配的设置，试试其他关键词。</p></section>
            <section class="specimen"><div class="specimen-caption"><span>02 / 控制</span></div><h2>点到，即止。</h2><div class="button-specimens"><apple-button :icon="arrowIcon" @click="$apple.notify('操作已完成',{tone:'success'})">继续探索</apple-button><apple-button variant="secondary" @click="$apple.notify('已加入收藏')">加入收藏</apple-button><apple-button variant="outline" @click="$router.push('/components#apple-button')">了解更多</apple-button><div class="icon-button-row"><apple-button variant="secondary" :icon="plusIcon" icon-only label="添加" @click="$apple.notify('已添加')" /><apple-button :variant="liked?'primary':'secondary'" :icon="heartIcon" icon-only :label="liked ? '取消收藏' : '收藏'" :aria-pressed="liked" @click="liked=!liked" /><apple-button variant="secondary" :icon="downloadIcon" icon-only label="浏览组件示例" @click="$router.push('/components')" /></div></div><div class="specimen-foot"><code>apple-button</code><span>5 种样式</span></div></section>
            <section class="specimen"><div class="specimen-caption"><span>03 / 偏好</span></div><h2>恰好，是你的。</h2><div class="preference-demo"><apple-segmented-control v-model="period" :items="periods" label="统计周期" /><div class="setting-line"><div><strong>消息通知</strong><small>不错过重要的事</small></div><apple-switch v-model="notices" aria-label="消息通知" /></div><div class="setting-line"><div><strong>自动同步</strong><small>在所有设备上保持一致</small></div><apple-switch v-model="sync" aria-label="自动同步" /></div><apple-slider v-model="volume" label="音量" /><div class="check-row"><apple-checkbox v-model="agreed" label="记住我的偏好" /></div></div></section>
            <section class="specimen form-specimen"><div class="specimen-caption"><span>04 / 输入</span></div><h2>开始一段对话。</h2><apple-form @submit="$apple.notify(`你好，${name || '新朋友'}！`,{tone:'success'})"><apple-input v-model="name" label="你的名字" placeholder="怎么称呼你" autocomplete="name" clearable required /><apple-input v-model="email" label="电子邮箱" type="email" placeholder="name@example.com" autocomplete="email" required /><apple-button type="submit">加入我们<ArrowRight :size="15" /></apple-button></apple-form></section>
            <section class="specimen media-specimen"><div class="specimen-caption"><span>05 / 媒体</span></div><h2>靠近一点，再一点。</h2><apple-image :gallery="[{ src: '/images/lake.jpg', alt: '山间湖泊和木屋' }, { src: '/images/airpods-max-orange.jpg', alt: '橙色耳机' }]" aspect-ratio="4/3" /><div class="specimen-foot"><code>apple-image</code><span>山间的一刻</span></div></section>
            <section class="specimen feedback-specimen"><div class="specimen-caption"><span>06 / 反馈</span></div><h2>每一步，都有回应。</h2><apple-alert title="所有更改已保存" tone="success" /><div class="progress-demo"><div><span>正在同步</span><span>{{progress}}%</span></div><apple-progress :model-value="progress" label="正在同步" /></div><apple-avatar-group :items="[{name:'林初'},{name:'Alex'},{name:'Taylor'},{name:'Quinn'}]" /><div class="feedback-actions"><apple-button variant="secondary" size="small" @click="openDemoDialog">打开对话框</apple-button><apple-button variant="ghost" size="small" @click="$apple.notify('所有更改已保存',{tone:'success'});progress=Math.min(100,progress+10)">显示提示</apple-button></div></section>
          </div>
    </section>
    <section class="more-components">
      <div><h2>更多组件，同样顺手。</h2><span>{{ catalog.length }} 个组件，预览与交互都在一页之中。</span></div>
      <router-link v-slot="{ href, navigate }" to="/components" custom>
        <apple-link :href="href" class="home-link" @click="navigate">查看全部组件 <ArrowRight :size="16" aria-hidden="true" /></apple-link>
      </router-link>
    </section>
    <PageFooter />
  </main>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { ArrowRight, ArrowUpRight, Download, Heart, Plus } from 'lucide-vue-next'
import { catalog } from '../catalog'
import PageFooter from '../components/PageFooter.vue'

export default defineComponent({
  components: { ArrowRight, ArrowUpRight, PageFooter },
  data() { return {
    catalog, arrowIcon: markRaw(ArrowRight), plusIcon: markRaw(Plus), heartIcon: markRaw(Heart), downloadIcon: markRaw(Download),
    period: 'month', periods: [{label:'日',value:'day'},{label:'周',value:'week'},{label:'月',value:'month'}],
    notices: true, sync: false, agreed: true, volume: 64, progress: 68, name: '', email: '', liked: false,
    settingQuery: '', setting: 'profile', overviewSettings: [
      {label:'个人资料',value:'profile',description:'姓名、头像和联系方式'},
      {label:'通知',value:'notices',description:'推送和邮件偏好'},
      {label:'隐私与安全',value:'privacy',description:'管理你的账户安全设置'},
    ],
  } },
  computed: {
    filteredSettings() {
      const query = this.settingQuery.trim()
      return this.overviewSettings.filter(item => item.label.includes(query) || item.description.includes(query))
    },
  },
  methods: {
    openDemoDialog() { this.$apple.dialog({title:'一切，就从这里开始。',message:'试试这些组件，找到适合你的交互。',confirmText:'好的',cancelText:'稍后'}) },
  },
})
</script>

<style scoped>
.home-link { min-height: 44px; gap: 9px; font-size: 13px; font-weight: 500; }
.search-empty { margin: 12px 0 0; color: var(--apple-secondary); font-size: 12px; line-height: 1.7; }
/* Keep the library's control sizes in the compact specimens. */
.button-specimens > .apple-button { min-height: 44px; font-size: inherit; }
.icon-button-row .apple-button { width: 44px; height: 44px; min-height: 44px; }
.form-specimen .apple-form .apple-button { min-height: 44px; font-size: inherit; }
.feedback-actions .apple-button { font-size: 13px; }
</style>
