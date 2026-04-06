import CookieManager from './cookie-manager.js';
import VotingEngine from './voting-engine.js';

const VOTE_INTERVAL_MS = 1000;
const STATS_INTERVAL_MS = 60000;

async function main() {
  console.log('🚀 Starting Automated Voting System');
  console.log('=====================================\n');

  const cookieManager = new CookieManager();
  const votingEngine = new VotingEngine(cookieManager);

  process.on('SIGINT', async () => {
    console.log('\n\n⏹️  Shutting down gracefully...');
    votingEngine.printStats();
    await cookieManager.close();
    console.log('✅ Shutdown complete');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n⏹️  Shutting down gracefully...');
    votingEngine.printStats();
    await cookieManager.close();
    console.log('✅ Shutdown complete');
    process.exit(0);
  });

  async function votingLoop() {
    try {
      await votingEngine.vote();
    } catch (error) {
      console.error('[Main] ❌ Vote error:', error.message);
    }
    setTimeout(votingLoop, VOTE_INTERVAL_MS);
  }

  setInterval(() => {
    votingEngine.printStats();
  }, STATS_INTERVAL_MS);

  console.log(`⏰ Voting every ${VOTE_INTERVAL_MS}ms`);
  console.log(`📊 Stats every ${STATS_INTERVAL_MS}ms`);
  console.log('Press Ctrl+C to stop\n');

  votingLoop();
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});