import { chromium } from 'playwright';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

class CookieManager {
  constructor() {
    this.browser = null;
    this.context = null;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.baseDelay = 3000;
  }

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
      });
      this.context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
      });
    }
  }

  async getCookie() {
    await this.init();
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[CookieManager] Attempt ${attempt}/${this.maxRetries} to get cookie...`);
        
        const page = await this.context.newPage();
        await page.goto('https://paintastreet.com/', { 
          waitUntil: 'networkidle',
          timeout: 60000 
        });

        await page.waitForTimeout(5000);

        const cookies = await this.context.cookies();
        const sessionCookie = cookies.find(c => c.name === 'session');

        if (!sessionCookie) {
          throw new Error('Session cookie not found after page load');
        }

        await page.close();
        this.retryCount = 0;

        console.log(`[CookieManager] ✅ Successfully obtained cookie: ${sessionCookie.value.substring(0, 20)}...`);
        return sessionCookie.value;

      } catch (error) {
        console.error(`[CookieManager] ❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1);
          console.log(`[CookieManager] ⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error('[CookieManager] 🚨 MAX RETRIES EXCEEDED - PAUSING');
          console.error('[CookieManager] Please check if Cloudflare Turnstile is blocking requests');
          console.error('[CookieManager] Press Enter to continue after resolving the issue...');
          
          await new Promise(resolve => {
            process.stdin.once('data', resolve);
          });
          
          this.retryCount = 0;
        }
      }
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
    }
  }
}

export default CookieManager;