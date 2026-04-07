import fs from 'fs';
import { request } from 'undici';
import PlatformDetector from './lib/platform-detector.js';

const TILE_ID = '019d60ad-9672-7bad-9587-8ad072c1de72';
const REQUEST_INTERVAL_MS = 2000;
const MAX_VOTES_PER_COOKIE = 10;
const DEFAULT_COOKIES_FILE = 'valid_cookies.txt';

class SimpleVoter {
  constructor(cookiesFile = DEFAULT_COOKIES_FILE) {
    this.cookiesFile = cookiesFile;
    this.cookies = [];
    this.currentCookieIndex = 0;
    this.currentCookieVotes = 0;
    this.maxVotesPerCookie = MAX_VOTES_PER_COOKIE;
    this.totalVotes = 0;
    this.cyclesCompleted = 0;
    this.isRunning = false;
    this.dispatcherOptions = {
      pipelining: 1,
      connections: 1,
      keepAliveTimeout: 60000,
      keepAliveMaxTimeout: 300000
    };
    this.requestTimeout = 30000;
    this.platformDetector = new PlatformDetector();
    this.headers = this.platformDetector.generateHeaders();
  }

  loadCookies() {
    try {
      if (!fs.existsSync(this.cookiesFile)) {
        throw new Error(`File not found: ${this.cookiesFile}`);
      }

      const content = fs.readFileSync(this.cookiesFile, 'utf8');
      this.cookies = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (this.cookies.length === 0) {
        throw new Error(`No valid cookies found in ${this.cookiesFile}`);
      }

      console.log(`📋 Loaded ${this.cookies.length} valid cookies from ${this.cookiesFile}`);
      console.log('');

    } catch (error) {
      console.error(`❌ Error loading cookies: ${error.message}`);
      process.exit(1);
    }
  }

  getCurrentCookie() {
    return this.cookies[this.currentCookieIndex];
  }

  switchToNextCookie() {
    this.currentCookieIndex = (this.currentCookieIndex + 1) % this.cookies.length;
    this.currentCookieVotes = 0;

    if (this.currentCookieIndex === 0) {
      this.cyclesCompleted++;
    }
  }

  async vote() {
    const cookie = this.getCurrentCookie();
    const voteNumber = this.totalVotes + 1;
    const cookieNumber = this.currentCookieIndex + 1;
    const timestamp = new Date().toLocaleTimeString();

    console.log(`[SIMPLE-VOTER] 🔄 Vote #${voteNumber} | Cookie ${cookieNumber}/${this.cookies.length} | Votes: ${this.currentCookieVotes}/${this.maxVotesPerCookie} | Time: ${timestamp}`);
    console.log(`[SIMPLE-VOTER] 📤 Request: PUT /tiles/${TILE_ID}/vote`);
    console.log(`[SIMPLE-VOTER] 🍪 Cookie: ${cookie.substring(0, 20)}...`);
    console.log(`[SIMPLE-VOTER] 📦 Body: {"direction":"up"}`);
    console.log(`[SIMPLE-VOTER] 🖥️  Platform: ${this.platformDetector.platform.toUpperCase()}`);

    const requestHeaders = {
      ...this.headers,
      'cookie': `session=${cookie}`
    };

    try {
      const response = await request(`https://please.paintastreet.com/tiles/${TILE_ID}/vote`, {
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify({ direction: 'up' }),
        headersTimeout: this.requestTimeout,
        bodyTimeout: this.requestTimeout
      });

      const responseData = await response.body.text();

      console.log(`[SIMPLE-VOTER] ✅ Response: ${response.statusCode} ${response.statusMessage}`);
      console.log(`[SIMPLE-VOTER] 📄 Response Body: ${responseData}`);

      if (response.headers[':status'] === '200' || response.headers[':status'] === '201') {
        console.log(`[SIMPLE-VOTER] 🌐 Using HTTP/2 protocol`);
      }

      if (response.statusCode === 429) {
        console.error(`[SIMPLE-VOTER] ⚠️ Cookie exhausted (rate limit)`);
        console.error(`[SIMPLE-VOTER] 📊 Cookie votes: ${this.currentCookieVotes}/${this.maxVotesPerCookie}`);
        console.error(`[SIMPLE-VOTER] 🔄 Switching to next cookie...`);
        console.error('');
        this.switchToNextCookie();
        return this.vote();
      }

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error(`HTTP ${response.statusCode}: ${responseData || response.statusMessage || 'Unknown error'}`);
      }

      this.totalVotes++;
      this.currentCookieVotes++;

      console.log(`[SIMPLE-VOTER] ✅ Vote successful!`);
      console.log(`[SIMPLE-VOTER] 📊 Cookie votes: ${this.currentCookieVotes}/${this.maxVotesPerCookie}`);
      console.log(`[SIMPLE-VOTER] 📊 Total votes: ${this.totalVotes} | Cycles: ${this.cyclesCompleted}`);

      if (this.currentCookieVotes >= this.maxVotesPerCookie) {
        console.log(`[SIMPLE-VOTER] ⚠️ Cookie exhausted! Moving to next cookie...`);
        this.switchToNextCookie();
      }
      console.log('');

    } catch (error) {
      console.error(`[SIMPLE-VOTER] ❌ ERROR: ${error.message}`);
      if (error.statusCode) {
        console.error(`[SIMPLE-VOTER] ❌ Response Status: ${error.statusCode}`);
      }
      if (error.body) {
        console.error(`[SIMPLE-VOTER] ❌ Response Body: ${error.body}`);
      }
      console.error(`[SIMPLE-VOTER] 🛑 Stopping due to error`);
      console.error(`[SIMPLE-VOTER] 📊 Total votes cast: ${this.totalVotes}`);
      console.error(`[SIMPLE-VOTER] 📊 Cycles completed: ${this.cyclesCompleted}`);
      this.isRunning = false;
      process.exit(1);
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async start() {
    console.log('🚀 Starting Simple Cookie Rotation Voter');
    console.log('==========================================');
    console.log('');

    const platformInfo = this.platformDetector.getPlatformInfo();
    console.log(`🖥️  Platform: ${platformInfo.platform.toUpperCase()}`);
    console.log(`🌐 Locale: ${platformInfo.locale}`);
    console.log(`💻 Hostname: ${platformInfo.hostname}`);
    console.log(`🏗️  Architecture: ${platformInfo.arch}`);
    console.log('');

    this.loadCookies();
    this.isRunning = true;

    console.log(`⏰ Voting every ${REQUEST_INTERVAL_MS}ms`);
    console.log(`📋 Using ${this.cookies.length} cookies with rotation`);
    console.log(`🔄 Max votes per cookie: ${this.maxVotesPerCookie}`);
    console.log(`🌐 HTTP/2 enabled (via Undici)`);
    console.log('Press Ctrl+C to stop\n');
    console.log('');

    while (this.isRunning) {
      await this.vote();
      
      if (this.isRunning) {
        console.log(`⏳ Waiting ${REQUEST_INTERVAL_MS}ms...\n`);
        await this.sleep(REQUEST_INTERVAL_MS);
      }
    }
  }

  stop() {
    console.log('\n\n[SIMPLE-VOTER] ⏹️  Stopping gracefully...');
    this.isRunning = false;
    console.log(`[SIMPLE-VOTER] 📊 Total votes cast: ${this.totalVotes}`);
    console.log(`[SIMPLE-VOTER] 📊 Cycles completed: ${this.cyclesCompleted}`);
    console.log('[SIMPLE-VOTER] ✅ Shutdown complete');
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--cookies' && args[i + 1]) {
      parsed.cookies = args[i + 1];
      i++;
    }
  }

  return parsed;
}

const args = parseArgs();
const voter = new SimpleVoter(args.cookies);

process.on('SIGINT', () => {
  voter.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  voter.stop();
  process.exit(0);
});

voter.start().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
