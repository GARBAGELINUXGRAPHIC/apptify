import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleOverlayHost",
  "source": "src/components/overlays.ts",
  "props": [],
  "events": [],
  "slots": [],
  "methods": [],
  "notes": [
    "只消费注入上下文的 overlays.entries；不接受公开 props、事件或插槽。Provider 已包含 Host，独立宿主场景才手动挂载。"
  ]
})
