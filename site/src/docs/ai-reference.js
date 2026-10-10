// AI 参考
import { div } from '/root/xunay/site/dist/xunay.js'
import { Doc as Overview } from './ai-overview.js'
import { Doc as Contract } from './ai-contract.js'
import { Doc as Patterns } from './ai-patterns.js'
import { Doc as Antipatterns } from './ai-antipatterns.js'
import { Doc as Constraints } from './ai-constraints.js'
import { Doc as Migration } from './ai-migration.js'
import { Doc as AndroidContract } from './ai-android-contract.js'
import { Doc as AndroidApi } from './ai-android-api.js'
import { Doc as ThreeDApi } from './ai-3d-api.js'
import { Doc as FilamentApi } from './ai-3d-filament-api.js'

export function Doc() {
  return (() => {
  const _div0 = document.createElement("div")
  const _t1 = __rt__.renderChild(Overview())
  if (_t1) _div0.appendChild(_t1)
  const _t2 = __rt__.renderChild(Contract())
  if (_t2) _div0.appendChild(_t2)
  const _t3 = __rt__.renderChild(Patterns())
  if (_t3) _div0.appendChild(_t3)
  const _t4 = __rt__.renderChild(Antipatterns())
  if (_t4) _div0.appendChild(_t4)
  const _t5 = __rt__.renderChild(Constraints())
  if (_t5) _div0.appendChild(_t5)
  const _t6 = __rt__.renderChild(Migration())
  if (_t6) _div0.appendChild(_t6)
  const _t7 = __rt__.renderChild(AndroidContract())
  if (_t7) _div0.appendChild(_t7)
  const _t8 = __rt__.renderChild(AndroidApi())
  if (_t8) _div0.appendChild(_t8)
  const _t9 = __rt__.renderChild(ThreeDApi())
  if (_t9) _div0.appendChild(_t9)
  const _t10 = __rt__.renderChild(FilamentApi())
  if (_t10) _div0.appendChild(_t10)
  return _div0
})()
}
