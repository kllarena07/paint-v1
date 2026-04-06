# Automated Voting System

Automates voting on PaintAStreet.com with cookie rotation to minimize downtime and handle rate limits.

## Features

- **Cookie Rotation**: Automatically rotates through pre-provisioned cookies after 10 votes or when rate-limited
- **Minimal Downtime**: Efficient cookie management reduces non-voting time
- **Comprehensive Logging**: Tracks votes, errors, and statistics
- **Graceful Shutdown**: Handles Ctrl+C with proper cleanup

## Setup

1. Install dependencies:
```bash
npm install
```

2. Prepare cookies file:
   - Create a file named `valid_cookies.txt` in the project root
   - Add valid PaintAStreet.com session cookies, one per line
   - Each line should contain only the session cookie value (not the full cookie string)
   - Example content of `valid_cookies.txt`:
     ```
     your_cookie_value_1_here
     your_cookie_value_2_here
     your_cookie_value_3_here
     ```

## Usage

Start the voting system:
```bash
node simple-voter.js
```

Or update package.json and use:
```bash
npm start
```

## How It Works

1. **Cookie Loading**: Loads pre-provisioned session cookies from `valid_cookies.txt`
2. **Voting Loop**: Casts votes every 2 seconds using current cookie
3. **Rate Limit Handling**: 
    - Tracks vote count (max 10 per cookie)
    - Detects rate limit errors
    - Automatically rotates to next cookie when needed
4. **Statistics**: Displays stats after each successful vote

## Rate Limit Details

- **Votes per cookie**: 10
- **Vote interval**: 2 seconds
- **Rate limit window**: ~10 minutes
- **Cookie rotation**: Every 10 votes or on rate limit error
- **Cookie source**: Read from `valid_cookies.txt` file

## Architecture

```
Main Loop (1 vote/2 seconds)
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
Rotate to next cookie in valid_cookies.txt
    ↓
Reset vote count for new cookie
    ↓
Return to main loop
```

## Troubleshooting

**Cookie File Not Found**:
- Ensure `valid_cookies.txt` exists in the project root
- Check file permissions and location

**No Valid Cookies**:
- Make sure `valid_cookies.txt` contains valid session cookies
- Each line should have one cookie value
- Remove empty lines and whitespace

**Rate Limit Errors**:
- Normal behavior - system will automatically rotate cookies
- Check statistics output for total errors
- If all cookies are exhausted, the program will stop

**Network Errors**:
- Check internet connection
- Verify PaintAStreet.com is accessible
- Check firewall settings

**Cookie Exhaustion**:
- All cookies have been used and rate limited
- Program will need fresh cookies from `valid_cookies.txt`
- Update the file with new valid session cookies

## Stopping

Press `Ctrl+C` to stop gracefully. The system will display final statistics before shutting down.