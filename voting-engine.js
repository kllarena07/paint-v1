class VotingEngine {
  constructor(cookieManager) {
    this.cookieManager = cookieManager;
    this.currentCookie = null;
    this.voteCount = 0;
    this.totalVotes = 0;
    this.totalErrors = 0;
    this.cookieRotations = 0;
    this.lastVoteTime = null;
    this.tileId = '019d60ad-9672-7bad-9587-8ad072c1de72';
  }

  async vote() {
    try {
      if (this.voteCount >= 10 || !this.currentCookie) {
        await this.rotateCookie();
      }

      const response = await fetch(`https://please.paintastreet.com/tiles/${this.tileId}/vote`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'cookie': `session=${this.currentCookie}`,
          'origin': 'https://paintastreet.com',
          'referer': 'https://paintastreet.com/',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site'
        },
        body: JSON.stringify({ direction: 'up' })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'vote rate limit exceeded') {
          console.log('[VotingEngine] ⚠️ Rate limit hit - rotating cookie');
          await this.rotateCookie();
          return this.vote();
        } else {
          throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
        }
      }

      this.voteCount++;
      this.totalVotes++;
      this.lastVoteTime = new Date();

      const timestamp = this.lastVoteTime.toLocaleTimeString();
      console.log(`[VotingEngine] ✅ Vote #${this.totalVotes} | Cookie usage: ${this.voteCount}/10 | ${timestamp}`);

    } catch (error) {
      this.totalErrors++;
      console.error(`[VotingEngine] ❌ Vote failed: ${error.message}`);
      console.error(`[VotingEngine] Total errors: ${this.totalErrors}`);
      
      if (error.message.includes('401') || error.message.includes('403')) {
        console.log('[VotingEngine] ⚠️ Auth error - rotating cookie');
        await this.rotateCookie();
      }
    }
  }

  async rotateCookie() {
    console.log('[VotingEngine] 🔄 Rotating cookie...');
    this.currentCookie = await this.cookieManager.getCookie();
    this.voteCount = 0;
    this.cookieRotations++;
    console.log(`[VotingEngine] ✅ Cookie rotation #${this.cookieRotations} complete`);
  }

  getStats() {
    return {
      totalVotes: this.totalVotes,
      voteCount: this.voteCount,
      cookieRotations: this.cookieRotations,
      totalErrors: this.totalErrors,
      lastVoteTime: this.lastVoteTime,
      currentCookie: this.currentCookie ? `${this.currentCookie.substring(0, 20)}...` : 'None'
    };
  }

  printStats() {
    const stats = this.getStats();
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 VOTING STATISTICS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total votes cast:     ${stats.totalVotes}`);
    console.log(`Current cookie votes: ${stats.voteCount}/10`);
    console.log(`Cookie rotations:      ${stats.cookieRotations}`);
    console.log(`Total errors:         ${stats.totalErrors}`);
    console.log(`Last vote time:       ${stats.lastVoteTime ? stats.lastVoteTime.toLocaleTimeString() : 'Never'}`);
    console.log(`Current cookie:       ${stats.currentCookie}`);
    console.log('═══════════════════════════════════════════════════════\n');
  }
}

export default VotingEngine;