import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';

const require = createRequire(import.meta.url);
const { createApp } = require('../index.js');
const registry = require('../handlers/PlayerRegistry.js');
const browserPath = [
  process.env.CHROME_PATH,
  chromium.executablePath(),
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
].find(path => path && existsSync(path));
if (process.env.REQUIRE_BROWSER_TEST === '1' && !browserPath) {
  throw new Error('Chromium is required for the browser test. Run `npx playwright-core install chromium`.');
}

test('bundled frontend loads and joins the selected room in Chromium',
  { skip: !browserPath }, async () => {
    const app = createApp({ port: 0, signals: false, logger: { log() {}, error() {} } });
    let browser;
    try {
      await app.run();
      browser = await chromium.launch({ executablePath: browserPath, headless: true });
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const base = `http://127.0.0.1:${app.server.address().port}`;
      await page.goto(`${base}/?room=arena`);
      await page.waitForSelector('canvas');
      const deadline = Date.now() + 3000;
      while (registry.inRoom('arena').length !== 1 && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      assert.equal(registry.inRoom('arena').length, 1);
      await page.keyboard.down('d');
      const moveDeadline = Date.now() + 3000;
      while (registry.inRoom('arena')[0]?.position.x <= 400 && Date.now() < moveDeadline) {
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      await page.keyboard.up('d');
      assert.ok(registry.inRoom('arena')[0].position.x > 400);
      assert.deepEqual(errors, []);
    } finally {
      await browser?.close();
      await app.shutdown();
      registry.items.length = 0;
    }
  });
