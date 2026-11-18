<template>
  <apple-stack class="demo-image">
    <apple-segmented-control v-if="controls" v-model="layout" :items="layouts" label="图片组布局" />
    <div v-if="controls" class="image-demo-toggles">
      <apple-switch v-model="carousel" label="轮播模式" />
      <apple-switch v-model="square" label="强制 1:1（裁剪）" />
    </div>
    <apple-image
      :carousel="carousel"
      :gallery="(carousel ? slides : gallery).slice(0, limit)"
      :gallery-layout="layout"
      :gallery-shape="square ? 'square' : 'natural'"
      :aspect-ratio="aspectRatio"
    />
  </apple-stack>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { imageUrl } from '../images'

withDefaults(defineProps<{ aspectRatio?: string; controls?: boolean; limit?: number }>(), { controls: true })
const layout = ref<'compact' | 'tiled' | 'tiled-wrap'>('compact')
const carousel = ref(false)
const square = ref(false)
const layouts = [
  { label: '省空间', value: 'compact' },
  { label: '平铺', value: 'tiled' },
  { label: '换行平铺', value: 'tiled-wrap' },
]
const gallery = [
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
]
const slides = [
  { label: '山间清晨', value: 0, src: imageUrl('lake.jpg') },
  { label: '一场聆听', value: 1, src: imageUrl('airpods-max-orange.jpg') },
]
</script>

<style scoped>
.image-demo-toggles { display: grid; gap: 16px; }
</style>
