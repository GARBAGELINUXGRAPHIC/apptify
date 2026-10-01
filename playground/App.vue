<template>
  <apple-provider>
    <apple-navibar :model-value="view" :items="mainNavigation" @change="navigateMain" @toggle="mobileNav=false">
      <template #brand><a class="brand" href="#" @click.prevent="reset"><span class="brand-symbol">a</span>Apptify<span class="version">0.1</span></a></template>
      <template #item="{item}">{{ item.label }}<ArrowUpRight v-if="item.value==='guide'" :size="13" /></template>
      <template #actions="{close}"><div class="top-actions"><button class="mobile-nav-toggle" aria-label="打开组件导航" title="组件导航" @click="close();mobileNav=!mobileNav"><PanelLeft :size="20" /></button></div></template>
    </apple-navibar>
    <aside class="sidebar" :class="{'is-open':mobileNav}" aria-label="组件导航">
      <apple-search v-model="query" placeholder="搜索组件" label="搜索组件" @search="view='components'" />
      <div class="sidebar-label">组件库</div>
      <div class="sidebar-groups"><button v-for="group in groups" :key="group" v-apple-ripple class="nav-item" :class="{active:activeGroup===group && view==='components'}" @click="chooseGroup(group)"><component :is="groupIcons[group]" :size="17" /><span>{{ group }}</span><small>{{ group === '全部组件' ? catalog.length : catalog.filter(c=>c.group===group).length }}</small></button></div>
      <div class="sidebar-label secondary-label">工作空间</div>
      <button v-apple-ripple class="nav-item" @click="view='foundations';selected=null;mobileNav=false"><Palette :size="17" /><span>主题与色彩</span></button>
      <button v-apple-ripple class="nav-item" @click="preferences=true;mobileNav=false"><SlidersHorizontal :size="17" /><span>动效偏好</span></button>
      <button v-apple-ripple class="nav-item" @click="quickstart=true;mobileNav=false"><BookOpen :size="17" /><span>开始使用</span></button>
      <div class="sidebar-footer"><div class="footer-monogram">a.</div><strong>Less, but better.</strong><small>Made for the details.</small></div>
    </aside>
    <button v-if="mobileNav" class="nav-scrim" aria-label="关闭导航" @click="mobileNav=false" />
    <main v-apple-entrance="`${view}-${selected?.name ?? activeGroup}`" class="main-content">
      <div class="page-eyebrow"><button @click="reset">Apptify</button><ChevronRight :size="13" /><button @click="selected ? chooseGroup(selected.group) : reset()">{{ view==='foundations'?'设计基础':selected?selected.group:'组件' }}</button><template v-if="selected"><ChevronRight :size="13" /><span>{{ selected.label }}</span></template></div>
      <div class="gallery-page">
      <template v-if="view==='foundations'">
        <div class="page-heading"><div><h1>设计基础<span>。</span></h1><p>颜色、排版，以及恰到好处的动效。</p></div></div>
        <section class="foundation-section"><h2>外观</h2><div class="theme-options"><button v-for="theme in themeOptions" :key="theme.value" :class="{selected:$apple.theme.name===theme.value}" @click="$apple.theme.set(theme.value)"><span :style="{background:theme.color}" />{{ theme.label }}<Check v-if="$apple.theme.name===theme.value" :size="16" /></button></div></section>
        <section class="foundation-section"><h2>语义色彩</h2><div class="token-grid"><div v-for="token in tokens" :key="token.key" class="token"><div :style="{background:`var(--apple-${token.key})`}" /><span>{{ token.label }}</span><code>--apple-{{ token.key }}</code></div></div></section>
        <section class="foundation-section"><h2>排版</h2><div class="type-sample"><span class="type-large">细节，让一切不同。</span><code>System font · 40 / 1.2 · 600</code></div><div class="type-sample"><h3>清晰、自然、触手可及。</h3><code>System font · 24 / 1.3 · 600</code></div><p>好的文字，让内容自己说话。The details make the difference.</p></section>
        <section class="foundation-section"><h2>动效</h2><apple-segmented-control :model-value="$apple.motion.mode" :items="motionOptions" label="全局动效" @update:model-value="setMotion" /><div class="motion-samples"><apple-card title="跟随全局" subtitle="motion=inherit" /><apple-card title="无动效" subtitle="motion=none" motion="none" /></div></section>
      </template>
      <template v-else>
        <div class="page-heading"><div><h1>{{ selected ? selected.label : activeGroup==='全部组件'?'组件总览':activeGroup }}<span>。</span></h1><p>{{ selected ? selected.name : `${componentCount} 个组件，属于你的设计语言。` }}</p></div><apple-button v-if="!selected" variant="outline" size="small" :icon="codeIcon" @click="quickstart=true">开始构建</apple-button><apple-button v-else variant="ghost" :icon="backIcon" @click="selected=null">返回</apple-button></div>
        <div class="workspace-toolbar"><div v-apple-selection="{ selector: '[aria-selected=true]' }" class="view-tabs" role="tablist" aria-label="浏览视图"><button role="tab" :aria-selected="!showCode" :class="{active:!showCode}" @click="showCode=false">{{selected?'预览':'组件预览'}}</button><button role="tab" :aria-selected="showCode" :class="{active:showCode}" @click="showCode=true">{{selected?'代码与 API':'全部组件'}}<small v-if="!selected">{{ catalog.length }}</small></button></div><div class="preview-controls"><button v-apple-ripple :class="{active:previewMode==='desktop'}" aria-label="桌面预览" title="桌面预览" @click="previewMode='desktop'"><Monitor :size="17" /></button><button v-apple-ripple :class="{active:previewMode==='mobile'}" aria-label="手机预览" title="手机预览" @click="previewMode='mobile'"><Smartphone :size="17" /></button><span class="toolbar-divider" /><button aria-label="切换明暗主题" title="切换明暗主题" @click="$apple.theme.set($apple.theme.current.scheme==='dark'?'light':'dark')"><Moon v-if="$apple.theme.current.scheme==='light'" :size="17" /><Sun v-else :size="17" /></button></div></div>
        <div class="gallery-view">
        <template v-if="selected">
          <apple-auto-size v-show="!showCode"><section class="detail-preview" :class="{'mobile-preview':previewMode==='mobile'}"><ComponentDemo :key="selected.name" :name="selected.name" @navigate="chooseGroup" /></section></apple-auto-size>
          <section v-if="showCode" class="code-view"><div class="code-toolbar"><span>{{ kebab(selected.name) }}</span><apple-button variant="ghost" size="small" :icon="copyIcon" @click="copy(selected.code)">复制</apple-button></div><pre><code>{{ selected.code }}</code></pre><h2>接口</h2><p class="api-line">{{ selected.api }}</p></section>
          <div class="detail-footer"><span>&lt;{{ kebab(selected.name) }} /&gt;</span><apple-button variant="ghost" :icon="codeIcon" @click="showCode=!showCode">{{showCode?'查看预览':'查看代码'}}</apple-button></div>
        </template>
        <template v-else-if="showCode || query || activeGroup!=='全部组件'">
          <div class="catalog-grid"><button v-for="item in filtered" :key="item.name" v-apple-ripple class="catalog-item" @click="selectItem(item)"><span class="catalog-icon"><component :is="groupIcons[item.group]" :size="23" /></span><strong>{{item.label}}</strong><code>{{kebab(item.name)}}</code><ChevronRight :size="17" /></button></div><apple-empty v-if="!filtered.length" title="没有找到相关组件" description="换个关键词试试。" />
        </template>
        <div v-else class="overview" :class="{'mobile-preview':previewMode==='mobile'}">
          <div class="specimen-grid">
            <section class="specimen"><div class="specimen-caption"><span>01 / 导航</span><button aria-label="查看列表组件" @click="open('AppleList')"><ArrowUpRight :size="17" /></button></div><h2>内容，各归其位。</h2><apple-search v-model="settingQuery" placeholder="搜索设置" label="搜索设置" /><apple-list v-model="setting" :items="overviewSettings.filter(item=>item.label.includes(settingQuery))" selectable /></section>
            <section class="specimen"><div class="specimen-caption"><span>02 / 控制</span><button aria-label="查看按钮组件" @click="open('AppleButton')"><ArrowUpRight :size="17" /></button></div><h2>点到，即止。</h2><div class="button-specimens"><apple-button :icon="arrowIcon" @click="$apple.notify('操作已完成',{tone:'success'})">继续探索</apple-button><apple-button variant="secondary" @click="$apple.notify('已加入收藏')">加入收藏</apple-button><apple-button variant="outline" @click="open('AppleButton')">了解更多</apple-button><div class="icon-button-row"><apple-button variant="secondary" :icon="plusIcon" icon-only label="添加" @click="$apple.notify('已添加')" /><apple-button :variant="liked?'primary':'secondary'" :icon="heartIcon" icon-only label="收藏" @click="liked=!liked" /><apple-button variant="secondary" :icon="downloadIcon" icon-only label="下载使用示例" @click="quickstart=true" /></div></div><div class="specimen-foot"><code>apple-button</code><span>5 种样式</span></div></section>
            <section class="specimen"><div class="specimen-caption"><span>03 / 偏好</span><button aria-label="查看表单组件" @click="chooseGroup('表单')"><ArrowUpRight :size="17" /></button></div><h2>恰好，是你的。</h2><div class="preference-demo"><apple-segmented-control v-model="period" :items="periods" label="统计周期" /><div class="setting-line"><div><strong>消息通知</strong><small>不错过重要的事</small></div><apple-switch v-model="notices" aria-label="消息通知" /></div><div class="setting-line"><div><strong>自动同步</strong><small>在所有设备上保持一致</small></div><apple-switch v-model="sync" aria-label="自动同步" /></div><apple-slider v-model="volume" label="音量" /><div class="check-row"><apple-checkbox v-model="agreed" label="记住我的偏好" /></div></div></section>
            <section class="specimen form-specimen"><div class="specimen-caption"><span>04 / 输入</span><button aria-label="查看输入组件" @click="open('AppleInput')"><ArrowUpRight :size="17" /></button></div><h2>开始一段对话。</h2><apple-form @submit="$apple.notify(`你好，${name || '新朋友'}！`,{tone:'success'})"><apple-input v-model="name" label="你的名字" placeholder="怎么称呼你" clearable required /><apple-input v-model="email" label="电子邮箱" type="email" placeholder="name@example.com" required /><apple-button type="submit">加入我们<ArrowRight :size="15" /></apple-button></apple-form></section>
            <section class="specimen media-specimen"><div class="specimen-caption"><span>05 / 媒体</span><button aria-label="查看图片预览组件" @click="open('AppleImage')"><ArrowUpRight :size="17" /></button></div><h2>靠近一点，再一点。</h2><apple-image src="/images/lake.jpg" alt="山间湖泊和木屋" :gallery="['/images/lake.jpg','/images/airpods-max-orange.jpg']" aspect-ratio="4/3" /><div class="specimen-foot"><code>apple-image</code><span>山间的一刻</span></div></section>
            <section class="specimen feedback-specimen"><div class="specimen-caption"><span>06 / 反馈</span><button aria-label="查看反馈组件" @click="chooseGroup('反馈')"><ArrowUpRight :size="17" /></button></div><h2>每一步，都有回应。</h2><apple-alert title="所有更改已保存" tone="success" /><div class="progress-demo"><div><span>正在同步</span><span>{{progress}}%</span></div><apple-progress :model-value="progress" label="正在同步" /></div><apple-avatar-group :items="[{name:'林初'},{name:'Alex'},{name:'Taylor'},{name:'Quinn'}]" /><div class="feedback-actions"><apple-button variant="secondary" size="small" @click="openDemoDialog">打开对话框</apple-button><apple-button variant="ghost" size="small" @click="$apple.notify('所有更改已保存',{tone:'success'});progress=Math.min(100,progress+10)">显示提示</apple-button></div></section>
          </div>
          <section class="more-components"><div><h2>还有更多，等你发现。</h2><span>从基础元素，到完整的交互。</span></div><apple-button variant="ghost" :icon="arrowIcon" @click="showCode=true">浏览全部组件</apple-button></section>
        </div>
        </div>
      </template>
      </div>
      <footer class="page-footer"><span>Apptify · Crafted with care.</span><span>Vue 3 / TypeScript / Vuetify Ripple</span></footer>
    </main>
    <apple-drawer v-model="preferences" title="外观与动效">
      <div class="preferences-content"><apple-select :model-value="$apple.theme.name" :items="themeOptions" label="主题" @update:model-value="setTheme" /><apple-select :model-value="$apple.motion.mode" :items="motionOptions" label="动效等级" @update:model-value="setMotion" /><apple-color-picker v-model="accent" label="自定义强调色" @update:model-value="applyAccent" /><apple-button variant="secondary" @click="$apple.theme.set('light');$apple.motion.set('auto');accent='#0071e3'">恢复默认</apple-button></div>
    </apple-drawer>
    <apple-drawer v-model="quickstart" title="开始使用" width="620px">
      <div class="quickstart"><h3>安装</h3><pre><code>npm install ./apptify-0.1.0.tgz vue vuetify</code></pre><p>当前是本地 0.1 版本，尚未发布 npm。运行 npm pack 后安装生成的 tgz。</p><h3>注册组件</h3><pre><code>{{ installCode }}</code></pre><h3>应用入口</h3><pre><code>&lt;apple-provider&gt;
  &lt;apple-button&gt;开始&lt;/apple-button&gt;
&lt;/apple-provider&gt;</code></pre><h3>消息与弹层</h3><pre><code>{{ serviceCode }}</code></pre><apple-button :icon="copyIcon" @click="copy(installCode)">复制接入代码</apple-button></div>
    </apple-drawer>
  </apple-provider>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { ArrowRight, ArrowLeft, ArrowUpRight, Bell, BookOpen, Box, Check, ChevronRight, Code2, Copy, Download, Heart, LayoutGrid, Layers, PanelLeft, Monitor, Moon, MousePointer2, Palette, Plus, SlidersHorizontal, Smartphone, Sun, Table2, TextCursorInput } from 'lucide-vue-next'
import { components, type Motion } from '../src'
import { catalog, groups, type CatalogItem } from './catalog'
import ComponentDemo from './ComponentDemo.vue'
export default defineComponent({
  components: { ComponentDemo, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, PanelLeft, Monitor, Moon, Palette, SlidersHorizontal, Smartphone, Sun },
  data() { return {
    catalog, groups, componentCount:Object.keys(components).length - 1, groupIcons:markRaw({'全部组件':LayoutGrid,'基础':Box,'表单':TextCursorInput,'导航':MousePointer2,'数据展示':Table2,'反馈':Bell,'移动交互':Smartphone}) as Record<string,unknown>,
    codeIcon:markRaw(Code2), copyIcon:markRaw(Copy), backIcon:markRaw(ArrowLeft), arrowIcon:markRaw(ArrowRight), plusIcon:markRaw(Plus), heartIcon:markRaw(Heart), downloadIcon:markRaw(Download),
    activeGroup:'全部组件', view:'components', query:'', selected:null as CatalogItem|null, showCode:false, previewMode:'desktop', preferences:false, quickstart:false, mobileNav:false,
    mainNavigation:[{label:'组件',value:'components'},{label:'设计基础',value:'foundations'},{label:'使用指南',value:'guide'}],
    period:'month', periods:[{label:'日',value:'day'},{label:'周',value:'week'},{label:'月',value:'month'}], notices:true, sync:false, agreed:true, volume:64, progress:68, name:'', email:'', liked:false, accent:'#0071e3',
    settingQuery:'', setting:'profile', overviewSettings:[{label:'个人资料',value:'profile',description:'姓名、头像和联系方式'},{label:'通知',value:'notices',description:'推送和邮件偏好'},{label:'隐私与安全',value:'privacy',description:'管理你的账户安全设置'}],
    themeOptions:[{label:'跟随系统',value:'system',color:'#b9bac0'},{label:'浅色',value:'light',color:'#f5f5f7'},{label:'深色',value:'dark',color:'#242426'},{label:'石墨',value:'graphite',color:'#3f5152'},{label:'玫瑰',value:'rose',color:'#a83b65'}],
    motionOptions:[{label:'自动',value:'auto'},{label:'完整',value:'full'},{label:'减弱',value:'reduced'},{label:'关闭',value:'none'}],
    tokens:[{key:'bg',label:'页面背景'},{key:'surface',label:'内容表面'},{key:'text',label:'主要文字'},{key:'secondary',label:'辅助文字'},{key:'accent',label:'强调色'},{key:'success',label:'成功'},{key:'warning',label:'提醒'},{key:'danger',label:'错误'}],
    installCode:"import { createApp } from 'vue'\nimport { createAppleUI } from 'apptify'\nimport 'apptify/style.css'\nimport App from './App.vue'\n\ncreateApp(App)\n  .use(createAppleUI({ theme: 'system', motion: 'auto' }))\n  .mount('#app')",
    serviceCode:"const apple = useApple()\napple.notify('保存成功', { tone: 'success' })\nconst dialog = apple.dialog({\n  title: '继续操作？', message: '这不会关闭已有弹层。'\n})\nconst result = await dialog.result",
  } },
  computed: { filtered():CatalogItem[] { const query=this.query.toLowerCase();return this.catalog.filter(item=>(this.activeGroup==='全部组件'||item.group===this.activeGroup)&&(!query||`${item.label} ${item.name} ${this.kebab(item.name)}`.toLowerCase().includes(query))) } },
  watch: { query() { this.selected=null;this.view='components' } },
  methods: {
    navigateMain(value: string | number) { this.mobileNav=false;if(value==='guide'){this.quickstart=true;return}this.view=String(value);if(value==='foundations')this.selected=null },
    kebab(name:string) { return name.replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase() },
    reset() { this.view='components';this.activeGroup='全部组件';this.selected=null;this.query='';this.showCode=false;this.mobileNav=false },
    chooseGroup(group:string) { this.activeGroup=group;this.selected=null;this.view='components';this.showCode=false;this.mobileNav=false },
    selectItem(item:CatalogItem) { this.selected=item;this.showCode=false;this.mobileNav=false;window.scrollTo({top:0}) },
    open(name:string) { const item=this.catalog.find(item=>item.name===name);if(item)this.selectItem(item) },
    setTheme(value:string) { this.$apple.theme.set(value) },
    setMotion(value:Motion) { this.$apple.motion.set(value) },
    applyAccent(value:string) { this.$apple.theme.register('custom',{accent:value});this.$apple.theme.set('custom');if(!this.themeOptions.some(t=>t.value==='custom'))this.themeOptions.push({label:'自定义',value:'custom',color:value}) },
    async copy(value:string) { try { await navigator.clipboard.writeText(value);this.$apple.notify('已复制',{tone:'success'}) } catch { this.$apple.notify('无法访问剪贴板，请在代码区手动选择',{tone:'warning'}) } },
    openDemoDialog() { this.$apple.dialog({title:'一切，就从这里开始。',message:'你的偏好设置会保留在这台设备上。',confirmText:'好的',cancelText:'稍后'}) },
  },
})
</script>
