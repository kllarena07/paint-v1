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

1. **Initial Cookie**: Launches browser, navigates to paintastreet.com, bypasses Cloudflare, extracts session cookie
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
Navigate to paintastreet.com
    ↓
Wait for Cloudflare Turnstile
    ↓
Extract session cookie
    ↓
Return to main loop
```

## Troubleshooting

**Cloudflare Bypass Fails**:
- If you see "MAX RETRIES EXCEEDED - PAUSING", check if Cloudflare is blocking requests
- Press Enter to continue after resolving the issue
- May need to complete Turnstile manually in the browser window

**Rate Limit Errors**:
- Normal behavior - system will automatically rotate cookies
- Check statistics output for total errors

## Stopping

Press `Ctrl+C` to stop gracefully. The system will display final statistics before shutting down.