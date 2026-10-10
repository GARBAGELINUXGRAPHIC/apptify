<template>
  <div class="component-demo" :class="demoClass" :data-component="name">
    <apple-stack v-if="name === 'AppleButton'" direction="row" align="center">
      <apple-button @click="notify('操作已完成')">继续</apple-button>
      <apple-button variant="secondary" @click="notify('已选择次要操作')">稍后再说</apple-button>
      <apple-button variant="outline" @click="notify('已加入收藏')">加入收藏</apple-button>
      <apple-link as="button" :icon="icons.ArrowUpRight" @click="notify('正在查看详情')">了解更多</apple-link>
      <apple-button :icon="icons.Plus" icon-only label="添加" @click="notify('已添加')" />
      <apple-button loading>处理中</apple-button><apple-button disabled>暂不可用</apple-button>
    </apple-stack>
    <apple-stack v-else-if="name === 'AppleLink'" direction="row" align="center">
      <apple-link href="https://www.apple.com.cn/" external>Apple 官网</apple-link>
      <apple-link href="https://www.apple.com.cn/accessibility/" external>辅助功能</apple-link>
      <apple-link disabled external>暂不可用</apple-link>
    </apple-stack>
    <apple-stack v-else-if="name === 'AppleSearch'">
      <apple-search v-model="searchText" label="搜索设置" placeholder="搜索设置" @search="notify(searchText ? `正在搜索：${searchText}` : '显示全部设置')" />
      <apple-list v-if="searchResults.length" v-model="setting" :items="searchResults" selectable @select="notify('已选择设置项')" />
      <apple-empty v-else title="没有找到相关设置" />
    </apple-stack>
    <apple-stack v-else-if="name === 'AppleProvider'">
      <apple-segmented-control v-model="previewTheme" :items="previewThemes" label="局部外观" />
      <apple-provider :theme="previewTheme" motion="auto" style="padding: 24px">
        <apple-stack>
          <apple-input v-model="text" label="显示名称" placeholder="你的名称" />
          <apple-switch v-model="checked" label="接收通知" />
          <apple-button @click="notify('偏好已保存')">保存偏好</apple-button>
        </apple-stack>
      </apple-provider>
    </apple-stack>
    <apple-button v-else-if="name === 'AppleOverlayHost'" @click="notify('由 Provider 内的 OverlayHost 显示')">显示通知</apple-button>
    <apple-stack v-else-if="name === 'AppleContainer'">
      <apple-slider v-model="containerWidth" label="内容宽度" :min="240" :max="640" :step="40" />
      <apple-container :width="containerWidth">
        <apple-stack><apple-button v-for="section in layoutItems" :key="section" variant="secondary" @click="notify(`已选择${section}`)">{{ section }}</apple-button></apple-stack>
      </apple-container>
    </apple-stack>
    <apple-stack v-else-if="name === 'AppleStack'">
      <apple-segmented-control v-model="stackDirection" :items="[{label:'横向',value:'row'},{label:'纵向',value:'column'}]" label="排列方向" />
      <apple-stack :direction="stackDirection" :gap="16" align="center">
        <apple-button v-for="section in layoutItems" :key="section" variant="secondary" @click="notify(`已选择${section}`)">{{ section }}</apple-button>
      </apple-stack>
    </apple-stack>
    <apple-stack v-else-if="name === 'AppleGrid'">
      <apple-slider v-model="gridMin" label="最小列宽" :min="120" :max="320" :step="40" />
      <apple-grid :min="gridMin" :gap="16">
        <apple-card v-for="(section, index) in layoutItems" :key="section" class="demo-layout-tile"><span>0{{ index + 1 }}</span><strong>{{ section }}</strong></apple-card>
      </apple-grid>
    </apple-stack>
    <apple-card v-else-if="name === 'AppleCard'" class="demo-product" title="AirPods Max" subtitle="每个音符，都更动听。" eyebrow="声音，出类拔萃。">
      <apple-image :gallery="{ src: imageUrl('airpods-max-orange.jpg'), alt: '橙色 AirPods Max 耳机' }" aspect-ratio="1" fit="contain" />
      <template #actions><apple-button @click="notify('已加入购物袋')">加入购物袋</apple-button><apple-link as="button" :icon="icons.Heart" icon-only label="收藏" @click="notify('已收藏')" /></template>
    </apple-card>
    <apple-stack v-else-if="name === 'AppleImage'" class="demo-image">
      <apple-segmented-control v-model="imageLayout" :items="[{label:'省空间',value:'compact'},{label:'平铺',value:'tiled'},{label:'换行平铺',value:'tiled-wrap'}]" label="图片组布局" />
      <apple-switch v-model="imageCarousel" label="轮播模式" />
      <apple-switch v-model="imageSquare" label="强制 1:1（裁剪）" />
      <apple-image :carousel="imageCarousel" :gallery="imageCarousel ? slides : galleryImages" :gallery-layout="imageLayout" :gallery-shape="imageSquare ? 'square' : 'natural'" />
    </apple-stack>
    <apple-stack v-else-if="name === 'AppleAvatar'"><apple-slider v-model="avatarSize" label="头像尺寸" :min="24" :max="72" :step="8" /><apple-stack direction="row" align="center"><apple-avatar name="林初" :size="avatarSize" /><apple-avatar name="Alex" :size="avatarSize" /><apple-avatar name="Taylor" :size="avatarSize" square /></apple-stack></apple-stack>
    <apple-stack v-else-if="name === 'AppleAvatarGroup'"><apple-stepper v-model="avatarMax" label="显示人数" :min="1" :max="5" /><apple-avatar-group :items="people" :max="avatarMax" :size="44" label="设计团队" /></apple-stack>
    <apple-stack v-else-if="name === 'AppleBadge'" direction="row" align="center"><apple-badge :value="unread"><apple-link variant="secondary" :icon="icons.Bell" @click="unread++">新消息</apple-link></apple-badge><apple-link as="button" :disabled="!unread" @click="unread = 0">全部已读</apple-link></apple-stack>
    <apple-stack v-else-if="name === 'AppleTag'" class="demo-tag-row" direction="row" align="center" :gap="10"><apple-tag>默认标签</apple-tag><apple-tag tone="success">已完成</apple-tag><apple-tag tone="info">进行中</apple-tag><apple-tag tone="warning">待确认</apple-tag><apple-tag v-if="tag" label="设计系统" closable @close="tag = false">设计系统</apple-tag><apple-link as="button" v-else :icon="icons.Plus" @click="tag = true">添加标签</apple-link></apple-stack>
    <apple-stack v-else-if="name === 'AppleDivider'"><apple-switch v-model="dividerVertical" label="纵向分隔" /><apple-stack :direction="dividerVertical ? 'row' : 'column'" :gap="0" align="center"><span>配送到家</span><apple-divider :vertical="dividerVertical" :label="dividerVertical ? undefined : '更多选择'" /><span>到店取货</span></apple-stack></apple-stack>
    <div v-else-if="name === 'AppleScrollBar'" class="demo-scroll-bar" tabindex="0" aria-label="滚动示例"><div class="demo-scroll-bar__content"><apple-card v-for="n in 12" :key="n" class="demo-layout-tile"><strong>0{{ n }}</strong></apple-card></div></div>
    <apple-input v-else-if="name === 'AppleInput'" v-model="text" label="姓名" placeholder="怎么称呼你" clearable />
    <apple-textarea v-else-if="name === 'AppleTextarea'" v-model="bio" label="个人简介" placeholder="写下你的想法" :maxlength="160" counter />
    <apple-select v-else-if="name === 'AppleSelect'" v-model="city" label="所在城市" :items="cities" />
    <apple-autocomplete v-else-if="name === 'AppleAutocomplete'" v-model="device" label="搜索设备" :items="devices" />
    <apple-checkbox v-else-if="name === 'AppleCheckbox'" v-model="checked" label="我已阅读并同意条款" />
    <apple-radio-group v-else-if="name === 'AppleRadioGroup'" v-model="delivery" label="配送方式" :items="deliveryItems" />
    <apple-switch v-else-if="name === 'AppleSwitch'" v-model="checked" label="接收通知" />
    <apple-slider v-else-if="name === 'AppleSlider'" v-model="volume" label="音量" />
    <apple-stepper v-else-if="name === 'AppleStepper'" v-model="quantity" label="数量" :min="1" :max="10" />
    <apple-segmented-control v-else-if="name === 'AppleSegmentedControl'" v-model="period" :items="periods" label="统计周期" />
    <apple-stack v-else-if="name === 'AppleDatePicker'"><apple-select v-model="dateFormat" :items="dateFormats" label="日期精度" @update:model-value="date=''" /><apple-date-picker :key="dateFormat" v-model="date" :format="dateFormat" label="到店日期" /></apple-stack>
    <apple-color-picker v-else-if="name === 'AppleColorPicker'" v-model="color" label="强调色" />
    <apple-upload v-else-if="name === 'AppleUpload'" v-model="files" label="上传图片" accept="image/*" multiple :max-files="5" :max-size="5000000" @reject="notify('文件类型、大小或数量不符合要求')" />
    <apple-otp-input v-else-if="name === 'AppleOtpInput'" v-model="otp" label="验证码" @complete="notify('验证码已填完')" />
    <apple-cascader v-else-if="name === 'AppleCascader'" v-model="region" label="所在地区" :items="regions" />
    <apple-rate v-else-if="name === 'AppleRate'" v-model="rating" label="体验评分" />
    <apple-form v-else-if="name === 'AppleForm'" :validator="validate" @submit="notify('表单提交成功')">
      <apple-input v-model="text" label="姓名" name="name" required placeholder="请输入姓名" />
      <apple-input v-model="email" label="邮箱" name="email" type="email" required placeholder="name@example.com" />
      <apple-button type="submit">提交</apple-button>
    </apple-form>
    <apple-form-field v-else-if="name === 'AppleFormField'" label="个人网站" :error="website && !website.startsWith('https://') ? '请输入以 https:// 开头的网址' : ''" hint="你的公开主页">
      <template #default="field"><input v-bind="field" v-model="website" class="apple-control" type="url" placeholder="https://example.com" /></template>
    </apple-form-field>
    <apple-navibar v-else-if="name === 'AppleNavibar'" v-model="tab" brand="Apptify" :fixed="false" :items="tabs" label="示例导航"><template #actions><apple-link as="button" :icon="icons.Bell" icon-only label="通知" @click="notify('暂无新通知')" /></template></apple-navibar>
    <apple-aside v-else-if="name === 'AppleAside'" :hide-on-preview="false" aria-label="示例侧栏"><apple-list v-model="setting" :items="settings" selectable /></apple-aside>
    <apple-tabs v-else-if="name === 'AppleTabs'" v-model="tab" :items="tabs"><template #default="{ value }"><p class="demo-copy">{{ value === 'overview' ? '这里是产品概览。' : value === 'spec' ? '这里是技术规格。' : '你的服务与支持。' }}</p></template></apple-tabs>
    <apple-tab-bar v-else-if="name === 'AppleTabBar'" v-model="tab" :items="tabs"><template #default="{ value }"><p class="demo-copy">{{ value === 'overview' ? '这里是产品概览。' : value === 'spec' ? '这里是技术规格。' : '你的服务与支持。' }}</p></template></apple-tab-bar>
    <apple-breadcrumbs v-else-if="name === 'AppleBreadcrumbs'" :items="[{label:'组件',value:'home'},{label:'导航',value:'nav'},{label:'面包屑',value:'current'}]" @click="item=>$emit('navigate',item.value==='home'?'全部组件':'导航')" />
    <apple-pagination v-else-if="name === 'ApplePagination'" v-model="page" :total="120" :page-size="10" />
    <apple-steps v-else-if="name === 'AppleSteps'" v-model="step" :items="steps" clickable />
    <apple-accordion v-else-if="name === 'AppleAccordion'" :items="questions" />
    <apple-stack v-else-if="name === 'AppleTable'"><apple-switch v-model="virtualTable" label="虚拟滚动 · 5000 行" /><apple-table :columns="columns" :rows="virtualTable ? virtualRows : rows" selectable :virtual="virtualTable" :height="360" :page-size="virtualTable ? 0 : 3" /></apple-stack>
    <apple-tree v-else-if="name === 'AppleTree'" v-model="tree" :items="folders" :mobile-directory="false" />
    <apple-list v-else-if="name === 'AppleList'" v-model="setting" :items="settings" selectable @select="notify('已选择设置项')" />
    <apple-stack v-else-if="name === 'AppleTimeline'"><apple-segmented-control v-model="timelineDirection" :items="[{label:'纵向',value:'vertical'},{label:'横向',value:'horizontal'}]" label="时间线方向" /><apple-timeline :items="events" :orientation="timelineDirection" /><apple-link variant="secondary" @click="updateDelivery">{{ delivered ? '查看配送过程' : '确认签收' }}</apple-link></apple-stack>
    <apple-stack v-else-if="name === 'AppleStatistic'"><apple-segmented-control v-model="period" :items="periods" label="统计周期" /><apple-statistic :label="period === 'day' ? '今日访问' : period === 'week' ? '本周访问' : '本月访问'" :value="period === 'day' ? 428 : period === 'week' ? 2996 : 12840" suffix="次" description="最新访问数据" /></apple-stack>
    <apple-stack v-else-if="name === 'AppleDialog'" direction="row"><apple-button @click="openDialog">打开对话框</apple-button><apple-button variant="secondary" @click="openStack">多层对话框</apple-button></apple-stack>
    <template v-else-if="name === 'AppleDrawer'"><apple-button @click="drawer = true">打开抽屉</apple-button><apple-drawer v-model="drawer" title="偏好设置"><apple-stack><apple-switch v-model="checked" label="接收通知" /><apple-slider v-model="volume" label="音量" /></apple-stack></apple-drawer></template>
    <template v-else-if="name === 'AppleSheet'"><apple-button @click="sheet = true">打开底部面板</apple-button><apple-sheet v-model="sheet" title="分享这份灵感"><apple-stack direction="row"><apple-button @click="notify('链接已准备好'); sheet = false">生成链接</apple-button><apple-button variant="secondary" @click="sheet = false">取消</apple-button></apple-stack></apple-sheet></template>
    <apple-stack v-else-if="name === 'AppleSnackbar'" direction="row"><apple-button @click="notify('你的更改已保存')">成功提示</apple-button><apple-button variant="secondary" @click="$apple.notify('网络连接暂时中断', {tone:'warning'})">提醒</apple-button><apple-button variant="outline" @click="notify('第一条消息'); notify('第二条消息')">堆叠提示</apple-button></apple-stack>
    <apple-stack v-else-if="name === 'AppleAlert'"><apple-alert v-model="alertVisible" title="一切已就绪" tone="success" closable>内容已同步到你的所有设备。</apple-alert><apple-button v-if="!alertVisible" variant="secondary" @click="alertVisible = true">重新同步</apple-button></apple-stack>
    <apple-stack v-else-if="name === 'AppleProgress'"><apple-progress :model-value="volume" label="正在上传" show-value /><apple-slider v-model="volume" label="进度" /></apple-stack>
    <apple-stack v-else-if="name === 'AppleSpinner'"><apple-switch v-model="demoLoading" label="同步内容" /><apple-spinner v-if="demoLoading" label="正在同步">正在同步</apple-spinner><apple-tag v-else tone="success">已同步</apple-tag></apple-stack>
    <apple-stack v-else-if="name === 'AppleSkeleton'"><apple-select v-model="skeletonVariant" :items="skeletonVariants" label="骨架类型" /><apple-switch v-model="demoLoading" label="加载内容" /><apple-skeleton v-if="demoLoading" :variant="skeletonVariant" :lines="3" avatar /><apple-list v-else :items="settings" /></apple-stack>
    <apple-empty v-else-if="name === 'AppleEmpty'" title="还没有收藏" description="喜欢的内容，会出现在这里。"><apple-button variant="secondary" @click="notify('开始浏览')">开始探索</apple-button></apple-empty>
    <apple-popover v-else-if="name === 'ApplePopover'" label="更多选项"><template #activator><apple-button variant="secondary" :icon="icons.MoreHorizontal">更多选项</apple-button></template><p>已同步到 iCloud</p><apple-switch v-model="checked" label="自动同步" /></apple-popover>
    <apple-tooltip v-else-if="name === 'AppleTooltip'" text="添加到收藏"><apple-button variant="secondary" :icon="icons.Heart" icon-only label="收藏" @click="notify('已收藏')" /></apple-tooltip>
    <apple-menu v-else-if="name === 'AppleMenu'" :items="actions" label="更多操作" @select="notify('操作已完成')" />
    <template v-else-if="name === 'AppleActionSheet'">
      <apple-button @click="actionSheet = true">选择操作</apple-button>
      <apple-action-sheet v-model="actionSheet" title="山间的一刻" message="收藏这份灵感，或与朋友分享。" @select="notify('操作已完成')">
        <template #default="{ select }">
          <div class="apple-action-sheet-items">
            <button v-for="action in photoActions" :key="action.value" v-apple-ripple type="button" class="apple-action-sheet-item" :class="{'apple-action-sheet-item--danger':action.danger}" @click="select(action)">
              <component :is="action.icon" :size="21" aria-hidden="true" /><span>{{ action.label }}<small>{{ action.description }}</small></span>
            </button>
          </div>
        </template>
      </apple-action-sheet>
    </template>
    <apple-pull-refresh v-else-if="name === 'ApplePullRefresh'" @refresh="refresh"><apple-list :items="[{label:'最新内容',value:'latest',description:refreshText},{label:'最近更新',value:'recent',description:'所有内容已同步'}]" /></apple-pull-refresh>
    <template v-else-if="name === 'AppleBackTop'"><apple-button :icon="icons.ArrowUp" variant="secondary" @click="toTop">回到顶部</apple-button><apple-back-top :threshold="0" :fixed="false" /></template>
    <template v-else-if="name === 'AppleFloatingGroup'"><apple-button variant="secondary" @click="notify('快捷操作已就绪')">快捷操作</apple-button><apple-card class="demo-floating-preview"><apple-provider><apple-floating-group :threshold="0" /></apple-provider></apple-card></template>
    <apple-card v-else-if="name === 'AppleSpeedDial'" class="demo-floating-preview"><apple-provider><apple-floating-group :back-top="false" label="全局快捷操作预览"><apple-back-top :threshold="0" :fixed="false" /><apple-button :icon="icons.Plus" icon-only label="新增" @click="notify('已新增')" /><apple-button :icon="icons.Menu" icon-only label="目录" :disabled="!$apple.speedDial.mobile.value" @click="$apple.speedDial.open.value = true" /></apple-floating-group></apple-provider></apple-card>
    <apple-button v-else-if="name === 'AppleSpeedDialItem'" :icon="icons.Plus" icon-only label="新增" @click="notify('已新增')" />
    <apple-stack v-else-if="name === 'AppleAutoSize'"><apple-switch v-model="checked" label="显示详情" /><apple-auto-size><apple-list :items="checked ? settings : settings.slice(0,1)" selectable /></apple-auto-size></apple-stack>
    <apple-stack v-else-if="name === 'AppleTransition'">
      <apple-segmented-control v-model="period" :items="periods" label="统计周期" />
      <div class="demo-transition-stage" :class="{ 'is-backward': transitionBackward }">
        <apple-transition name="slide-x" mode="default" :appear="false">
          <apple-statistic :key="period" :value="period==='day'?428:period==='week'?2996:12840" label="访问次数" />
        </apple-transition>
      </div>
    </apple-stack>
    <apple-infinite-scroll v-else-if="name === 'AppleInfiniteScroll'" :finished="itemsCount >= 12" @load="loadMore"><apple-list :items="Array.from({length:itemsCount}, (_, i) => ({label:`灵感收藏 ${i+1}`, value:i, description:'刚刚更新'}))" /></apple-infinite-scroll>
  </div>
</template>

<script lang="ts">
import { imageUrl } from './images'
import { defineComponent, h, markRaw } from 'vue'
import { Plus, Heart, Bell, ArrowUpRight, ArrowUp, MoreHorizontal, ZoomIn, Share2, Trash2, Menu } from 'lucide-vue-next'
import { AppleButton, resolveMotion, scrollToWithMotion, type MotionScroll } from '../src'
export default defineComponent({
  name: 'ComponentDemo', props: { name: { type: String, required: true } }, emits: ['navigate'],
  data() { return {
    icons: markRaw({ Plus, Heart, Bell, ArrowUpRight, ArrowUp, MoreHorizontal, ZoomIn, Menu }), text: '', bio: '', email: '', city: 'beijing', device: null, checked: true, delivery: 'express', volume: 68, quantity: 1, period: 'month', date: '', time: '10:30', color: '#0071e3', files: [], otp: '', region: [], rating: 4, tab: 'overview', page: 1, step: 1, tree: '', drawer: false, sheet: false, actionSheet: false, tag: true, refreshText: '今天 09:41', itemsCount: 3,
    searchText: '', setting: 'profile', website: '', previewTheme: 'dark', stackDirection: 'row' as 'row' | 'column', containerWidth: 480, gridMin: 160, avatarSize: 48, avatarMax: 3, unread: 8, dividerVertical: false, delivered: false, alertVisible: true, demoLoading: true, imageLayout: 'compact' as 'compact' | 'tiled' | 'tiled-wrap', imageSquare: false, imageCarousel: false,
    virtualTable: false, transitionBackward: false,
    timelineDirection:'vertical' as 'vertical'|'horizontal', skeletonVariant:'text' as 'text'|'avatar'|'card'|'list'|'table'|'image', skeletonVariants:[{label:'文本',value:'text'},{label:'头像',value:'avatar'},{label:'卡片',value:'card'},{label:'列表',value:'list'},{label:'表格',value:'table'},{label:'图片',value:'image'}],
    dateFormat:'YYYY/MM/DD HH:mm', dateFormats:[{label:'年 / 月',value:'YYYY/MM'},{label:'年 / 月 / 日',value:'YYYY/MM/DD'},{label:'日期与时分',value:'YYYY/MM/DD HH:mm'},{label:'日期与时分秒',value:'YYYY/MM/DD HH:mm:ss'},{label:'时分',value:'HH:mm'},{label:'时分秒',value:'HH:mm:ss'}],
    previewThemes: [{label:'浅色',value:'light'},{label:'深色',value:'dark'},{label:'石墨',value:'graphite'},{label:'玫瑰',value:'rose'}], layoutItems: ['概览', '设计', '支持'],
    galleryImages: [
      { src: imageUrl('lake.jpg'), alt: '山间湖泊与小屋' },
      { src: imageUrl('airpods-max-orange.jpg'), alt: '橙色 AirPods Max 耳机' },
      { src: imageUrl('city.jpg'), alt: '城市天际线' },
      { src: imageUrl('mountains.jpg'), alt: '群山与山峰' },
      { src: imageUrl('forest.jpg'), alt: '阳光下的森林' },
      { src: imageUrl('architecture.jpg'), alt: '建筑细节' },
      { src: imageUrl('coast.jpg'), alt: '海岸风景' },
      { src: imageUrl('food.jpg'), alt: '餐桌上的美食' },
      { src: imageUrl('desert.jpg'), alt: '沙漠沙丘' },
      { src: imageUrl('waterfall.jpg'), alt: '山间瀑布' },
      { src: imageUrl('sunset.jpg'), alt: '夕阳风景' },
      { src: imageUrl('snow.jpg'), alt: '雪地风景' },
    ],
    images: [imageUrl('lake.jpg'), imageUrl('airpods-max-orange.jpg')], people: [{name:'林初'},{name:'Alex'},{name:'Taylor'},{name:'Quinn'},{name:'Sam'}],
    cities: [{label:'北京',value:'beijing'},{label:'上海',value:'shanghai'},{label:'杭州',value:'hangzhou'}], devices: [{label:'MacBook Air',value:'mac'},{label:'iPad Pro',value:'ipad'},{label:'AirPods Max',value:'airpods'}],
    deliveryItems: [{label:'快递送达',value:'express'},{label:'到店取货',value:'pickup'}], periods: [{label:'日',value:'day'},{label:'周',value:'week'},{label:'月',value:'month'}],
    regions: [{label:'北京市',value:'beijing',children:[{label:'朝阳区',value:'chaoyang'},{label:'海淀区',value:'haidian'}]},{label:'浙江省',value:'zhejiang',children:[{label:'杭州市',value:'hangzhou',children:[{label:'西湖区',value:'xihu'}]}]}],
    tabs: [{label:'概览',value:'overview'},{label:'技术规格',value:'spec'},{label:'支持',value:'support'}], steps: [{label:'选择产品',value:0},{label:'确认信息',value:1},{label:'完成',value:2}],
    questions: [{label:'如何管理我的订阅？',value:'subscription',content:'前往账户设置，选择订阅即可查看或管理。'},{label:'可以随时取消吗？',value:'cancel',content:'可以。你可以随时在账户中取消，服务会保留至当前周期结束。'},{label:'如何获得帮助？',value:'support',content:'通过支持页面联系我们，我们很乐意提供帮助。'}],
    columns: [{key:'name',label:'名称',sortable:true},{key:'category',label:'分类',sortable:true},{key:'status',label:'状态'},{key:'updated',label:'更新时间',sortable:true}], rows: [{id:1,name:'Apple Card',category:'基础',status:'已发布',updated:'09-24'},{id:2,name:'Apple Dialog',category:'反馈',status:'已发布',updated:'09-25'},{id:3,name:'Apple Input',category:'表单',status:'已发布',updated:'09-26'},{id:4,name:'Apple Image',category:'基础',status:'已发布',updated:'09-26'}],
    folders: [{label:'设计资源',value:'design',children:[{label:'组件',value:'components',children:[{label:'按钮',value:'buttons'},{label:'输入框',value:'inputs'}]},{label:'图标',value:'icons'}]},{label:'项目文件',value:'project'}],
    settings: [{label:'个人资料',value:'profile',description:'姓名、头像和联系方式'},{label:'通知',value:'notifications',description:'推送和邮件偏好'},{label:'隐私与安全',value:'security',description:'管理账户的安全设置'}],
    events: [{label:'订单已确认',value:'confirmed',description:'我们正在准备你的订单',time:'09:41'},{label:'正在配送',value:'shipping',description:'你的包裹已出发',time:'12:00'},{label:'即将送达',value:'arrival',description:'留意配送通知',time:'预计明天'}],
    actions: [{label:'收藏',value:'favorite'},{label:'分享',value:'share'},{label:'删除',value:'delete',danger:true}], slides: [{label:'山间清晨',value:0,src:imageUrl('lake.jpg')},{label:'一场聆听',value:1,src:imageUrl('airpods-max-orange.jpg')}],
    photoActions: [{label:'加入收藏',value:'favorite',description:'将这张照片保存到你的灵感收藏',icon:markRaw(Heart),danger:false},{label:'分享照片',value:'share',description:'与朋友分享山间的这一刻',icon:markRaw(Share2),danger:false},{label:'删除照片',value:'delete',description:'从当前相册中移除',icon:markRaw(Trash2),danger:true}],
    topScroll: undefined as MotionScroll | undefined,
    timers: [] as ReturnType<typeof setTimeout>[],
  } },
  computed: {
    virtualRows() { return this.virtualTable ? Array.from({length:5000},(_,i)=>({id:i+1,name:`组件 ${String(i+1).padStart(4,'0')}`,category:i%2?'基础':'表单',status:'已发布',updated:'09-26'})) : [] },
    demoClass(): string {
      const compact = ['AppleSearch', 'AppleProvider', 'AppleAvatar', 'AppleAvatarGroup', 'AppleInput', 'AppleTextarea', 'AppleSelect', 'AppleAutocomplete', 'AppleCheckbox', 'AppleRadioGroup', 'AppleSwitch', 'AppleSlider', 'AppleStepper', 'AppleSegmentedControl', 'AppleDatePicker', 'AppleColorPicker', 'AppleUpload', 'AppleOtpInput', 'AppleCascader', 'AppleRate', 'AppleForm', 'AppleFormField', 'AppleProgress', 'AppleSpinner', 'AppleStatistic', 'AppleTransition']
      const media = ['AppleImage']
      return compact.includes(this.name) ? 'component-demo--compact' : media.includes(this.name) ? 'component-demo--media' : 'component-demo--wide'
    },
    searchResults() { return this.settings.filter(item => `${item.label} ${item.description}`.includes(this.searchText.trim())) },
  },
  watch: {
    period(next: string, previous: string) {
      this.transitionBackward = this.periods.findIndex(item => item.value === next) < this.periods.findIndex(item => item.value === previous)
    },
  },
  beforeUnmount() { this.topScroll?.cancel(); this.timers.forEach(clearTimeout) },
  methods: {
    imageUrl,
    notify(message: string) { this.$apple.notify(message, {tone:'success'}) },
    validate(data: FormData) { return String(data.get('name') ?? '').trim().length > 0 || '请输入姓名' },
    updateDelivery() { this.delivered = !this.delivered; this.events[2] = this.delivered ? { label: '已签收', value: 'arrival', description: '包裹已送达，祝你使用愉快', time: new Date().toLocaleTimeString('zh-CN') } : { label: '即将送达', value: 'arrival', description: '留意配送通知', time: '预计明天' } },
    openDialog() { this.$apple.dialog({title:'保存更改？',message:'你的更改会同步到所有设备。',confirmText:'保存'}).result.then(result => { if (result) this.notify('你的更改已保存') }) },
    openStack() {
      const apple = this.$apple
      const Inner = defineComponent({ props:['close','sendMessage'], render() { return h('div', {class:'demo-dialog-body'}, [h('p','第一层仍然保留在下面。'), h(AppleButton, {onClick:() => apple.dialog({title:'第二层对话框',message:'关闭这一层后，会回到第一层。'})}, () => '打开第二层')]) } })
      apple.dialog({title:'第一层对话框',component:Inner})
    },
    refresh(done: () => void) { this.timers.push(setTimeout(() => { this.refreshText = `更新于 ${new Date().toLocaleTimeString('zh-CN')}`; done() }, 700)) },
    loadMore(done: () => void) { this.timers.push(setTimeout(() => { this.itemsCount = Math.min(12, this.itemsCount + 3); done() }, 500)) },
    toTop() { this.topScroll = scrollToWithMotion(window, 0, resolveMotion('inherit', this.$apple.motion.value.mode, this.$apple.motion.value.reduced) === 'full') },
  },
})
</script>

<style scoped>
.demo-tag-row { width: 100%; max-width: 100%; }
.component-demo > .demo-tag-row > :deep(.apple-button) { min-height: 44px; padding: 7px 10px; font-size: 11px; font-weight: 500; line-height: 1.5; }
.demo-tag-row :deep(.apple-button__content) { gap: 4px; }
.demo-tag-row :deep(.apple-button__content > svg) { width: 13px; height: 13px; }
.component-demo > .demo-tag-row > :deep(.apple-tag),
.component-demo > .demo-tag-row > :deep(.apple-button) { align-self: center; max-width: 100%; }

.demo-transition-stage { display: grid; min-width: 0; overflow: hidden; --demo-slide-distance: 24px; }
.demo-scroll-bar { height: 240px; overflow: auto; border-radius: 12px; }
.demo-scroll-bar__content { width: 720px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 16px; }
.demo-transition-stage.is-backward { --demo-slide-distance: -24px; }
.demo-transition-stage :deep(.apple-statistic) { grid-area: 1 / 1; min-width: 0; }
.demo-transition-stage :deep(.apple-slide-x-enter-active),
.demo-transition-stage :deep(.apple-slide-x-leave-active) { transition: opacity var(--apple-duration) var(--apple-ease), transform var(--apple-duration) var(--apple-ease); }
.demo-transition-stage :deep(.apple-slide-x-enter-from) { opacity: 0; transform: translateX(var(--demo-slide-distance)); }
.demo-transition-stage :deep(.apple-slide-x-leave-to) { opacity: 0; transform: translateX(calc(-1 * var(--demo-slide-distance))); }
@media (prefers-reduced-motion: reduce) {
  .demo-transition-stage :deep(.apple-slide-x-enter-from),
  .demo-transition-stage :deep(.apple-slide-x-leave-to) { transform: none; }
}
</style>
