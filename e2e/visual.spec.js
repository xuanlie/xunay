import { test, expect } from '@playwright/test'

const THEMES = ['light', 'dark', 'dracula', 'nord', 'solarized', 'tokyo', 'monokai']

test.describe('视觉回归 · 组件画廊', () => {
  for (const theme of THEMES) {
    test(`主题 ${theme}`, async ({ page }) => {
      await page.goto('/examples/ui-gallery/')
      await page.waitForSelector('.container')

      if (theme !== 'light') {
        await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme)
      }
      await page.waitForTimeout(300)

      await expect(page).toHaveScreenshot(`gallery-${theme}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        animations: 'disabled',
      })
    })
  }
})
