import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const THEMES = ['light', 'dark', 'dracula', 'nord', 'solarized', 'tokyo', 'monokai']

for (const theme of THEMES) {
  test(`a11y · ${theme}`, async ({ page }) => {
    await page.goto('/examples/ui-gallery/')
    await page.waitForSelector('.container')
    if (theme !== 'light') {
      await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme)
    }

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    if (results.violations.length) {
      console.log(`\n[${theme}] ${results.violations.length} 项违规：`)
      for (const v of results.violations) {
        console.log(`  · [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} 处)`)
      }
    }

    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast')
    expect(contrastViolations, `${theme} 对比度不达标`).toEqual([])
  })
}
