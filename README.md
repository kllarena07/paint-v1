# Automated Voting System

Automates voting on PaintAStreet.com with cookie rotation to minimize downtime and handle rate limits.

## Features

- **Cookie Rotation**: Automatically rotates cookies after 10 votes or when rate-limited
- **Cloudflare Bypass**: Uses Playwright to bypass Cloudflare Turnstile
- **Minimal Downtime**: Efficient cookie management reduces non-voting time
- **Comprehensive Logging**: Tracks votes, errors, and statistics
- **Graceful Shutdown**: Handles Ctrl+C with proper cleanup

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browser:
```bash
npx playwright install chromium
```

## Usage

Start the voting system:
```bash
npm start
```

## How It Works

1. **Cookie Generation**: 
   - Launches browser (visible mode required for Turnstile)
   - Navigates to specific tile page
   - Clicks "upvote" button to trigger Cloudflare Turnstile
   - Monitors session cookie for changes (indicates Turnstile completion)
   - Extracts vote-specific cookie
2. **Voting Loop**: Casts votes every 1 second using current cookie
3. **Rate Limit Handling**: 
   - Tracks vote count (max 10 per cookie)
   - Detects rate limit errors
   - Automatically rotates cookies when needed
4. **Statistics**: Displays stats every 60 seconds

## Rate Limit Details

- **Votes per cookie**: 10
- **Vote interval**: 1 second
- **Rate limit window**: ~10 minutes
- **Cookie rotation**: Every 10 votes or on rate limit error

## Architecture

```
Main Loop (1 vote/second)
    ↓
Check cookie usage (< 10 votes?)
    ↓ Yes
Cast vote with current cookie
    ↓
Log success/error
    ↓
Wait for next interval

If cookie usage >= 10:
    ↓
Cookie Manager
    ↓
Navigate to paintastreet.com/#tile-ID
    ↓
Click "upvote" button
    ↓
Wait for Turnstile completion (cookie change)
    ↓
Extract vote-specific cookie
    ↓
Return to main loop
```

## Troubleshooting

**Turnstile Timeout**:
- If you see "Cookie did not change within timeout", Turnstile may require manual interaction
- Check the visible browser window for challenges
- Press Enter to continue after resolving manually
- Turnstile auto-passes sometimes but may require interaction

**Cookie Not Changing**:
- System polls for cookie changes every 500ms
- If Turnstile is blocked or requires manual completion, cookie won't change
- May need to complete Turnstile in the visible browser window

**Rate Limit Errors**:
- Normal behavior - system will automatically rotate cookies
- Check statistics output for total errors

**Browser Window**:
- Browser opens in visible mode (required for Turnstile)
- Don't close the browser window - it's reused for cookie generation
- Each cookie rotation creates a new page but uses same browser instance

## Stopping

Press `Ctrl+C` to stop gracefully. The system will display final statistics before shutting down.