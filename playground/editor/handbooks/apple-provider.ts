import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleProvider",
  "source": "src/components/foundation.ts",
  "props": [
    {
      "name": "theme",
      "type": "string",
      "default": "undefined",
      "description": "局部主题名称：light、dark、graphite、rose、system，或已注册主题。省略时继承父上下文。"
    },
    {
      "name": "motion",
      "type": "'auto' | 'full' | 'reduced' | 'none'",
      "default": "undefined",
      "description": "局部上下文的动效模式。省略时继承父上下文；仅接受 auto、full、reduced、none。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "处于局部主题和上下文中的内容。Provider 已包含 OverlayHost。"
    }
  ],
  "methods": [],
  "notes": [
    "嵌套 Provider 可使用局部主题和动效上下文；glass 与 ripple 偏好仍与父上下文共享。Provider 已自动挂载 OverlayHost，无需再放一个。"
  ]
})
