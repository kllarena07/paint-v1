import { chromium } from 'playwright';

class CookieManager {
  constructor() {
    this.maxRetries = 5;
    this.baseDelay = 3000;
    this.tileId = '019d60ad-9672-7bad-9587-8ad072c1de72';
  }

  async extractSessionCookie(context) {
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');
    return sessionCookie ? sessionCookie.value : null;
  }

  async waitForCookieChange(context, initialCookie, timeout = 60000) {
    const startTime = Date.now();
    const checkInterval = 500;
    
    console.log(`[CookieManager] ⏳ Waiting for cookie change (Turnstile completion)...`);
    
    while (Date.now() - startTime < timeout) {
      const currentCookie = await this.extractSessionCookie(context);
      
      if (currentCookie && currentCookie !== initialCookie) {
        console.log(`[CookieManager] ✅ Cookie changed! Turnstile completed`);
        return currentCookie;
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    throw new Error(`Cookie did not change within ${timeout}ms timeout`);
  }

  async getCookie() {
    const browser = await chromium.launch({
      headless: false,
      args: ['--disable-blink-features=AutomationControlled']
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
    });
    let page = null;

    try {
      page = await context.newPage();

      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          console.log(`[CookieManager] Attempt ${attempt}/${this.maxRetries} to get cookie...`);
          
          console.log(`[CookieManager] 🌐 Navigating to tile page...`);
          await page.goto(`https://paintastreet.com/#tile-${this.tileId}`, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
          });

          await page.waitForSelector('button.vote-button', { timeout: 10000 });
          console.log(`[CookieManager] ✅ Vote button found`);

          const initialCookie = await this.extractSessionCookie(context);
          console.log(`[CookieManager] 🔍 Initial cookie: ${initialCookie ? initialCookie.substring(0, 20) : 'None'}...`);

          console.log(`[CookieManager] 🖱️  Clicking vote button to trigger Turnstile...`);
          await page.click('button.vote-button');

          console.log(`[CookieManager] ⏳ Waiting for Turnstile completion (cookie change)...`);
          const newCookie = await this.waitForCookieChange(context, initialCookie, 60000);

          console.log(`[CookieManager] ✅ Successfully obtained vote-specific cookie: ${newCookie.substring(0, 20)}...`);
          return newCookie;

        } catch (error) {
          console.error(`[CookieManager] ❌ Attempt ${attempt} failed:`, error.message);
          
          if (attempt < this.maxRetries) {
            const delay = this.baseDelay * Math.pow(2, attempt - 1);
            console.log(`[CookieManager] ⏳ Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.error('[CookieManager] 🚨 MAX RETRIES EXCEEDED - PAUSING');
            console.error('[CookieManager] Please check if Turnstile is blocking requests');
            console.error('[CookieManager] The browser window may need manual intervention');
            console.error('[CookieManager] Press Enter to continue after resolving the issue...');
            
            await new Promise(resolve => {
              process.stdin.once('data', resolve);
            });
          }
        }
      }
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (error) {
          console.error(`[CookieManager] ⚠️ Error closing page: ${error.message}`);
        }
      }
      if (context) {
        try {
          await context.close();
        } catch (error) {
          console.error(`[CookieManager] ⚠️ Error closing context: ${error.message}`);
        }
      }
      if (browser) {
        try {
          await browser.close();
        } catch (error) {
          console.error(`[CookieManager] ⚠️ Error closing browser: ${error.message}`);
        }
      }
    }
  }

  async close() {
    console.log('[CookieManager] Close called (browsers are closed per cookie request)');
  }
}

export default CookieManager;