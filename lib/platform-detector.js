import os from 'os';

class PlatformDetector {
  constructor() {
    this.platform = this.detectPlatform();
    this.locale = this.detectLocale();
    this.chromeVersion = '130.0.0.0';
  }

  detectPlatform() {
    const platform = process.platform;
    switch (platform) {
      case 'darwin':
        return 'macos';
      case 'win32':
        return 'windows';
      case 'linux':
        return 'linux';
      default:
        return 'macos';
    }
  }

  detectLocale() {
    try {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      return locale || 'en-US';
    } catch (error) {
      return 'en-US';
    }
  }

  getUserAgent() {
    switch (this.platform) {
      case 'macos':
        return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${this.chromeVersion} Safari/537.36`;
      case 'windows':
        return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${this.chromeVersion} Safari/537.36`;
      case 'linux':
        return `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${this.chromeVersion} Safari/537.36`;
      default:
        return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${this.chromeVersion} Safari/537.36`;
    }
  }

  getSecChUa() {
    switch (this.platform) {
      case 'macos':
        return `"Chromium";v="${this.getMajorVersion()}", "Not-A.Brand";v="24", "Google Chrome";v="${this.getMajorVersion()}"`;
      case 'windows':
        return `"Chromium";v="${this.getMajorVersion()}", "Not-A.Brand";v="24", "Google Chrome";v="${this.getMajorVersion()}"`;
      case 'linux':
        return `"Chromium";v="${this.getMajorVersion()}", "Not-A.Brand";v="24", "Google Chrome";v="${this.getMajorVersion()}"`;
      default:
        return `"Chromium";v="${this.getMajorVersion()}", "Not-A.Brand";v="24", "Google Chrome";v="${this.getMajorVersion()}"`;
    }
  }

  getMajorVersion() {
    const major = this.chromeVersion.split('.')[0];
    return parseInt(major);
  }

  getSecChUaPlatform() {
    switch (this.platform) {
      case 'macos':
        return '"macOS"';
      case 'windows':
        return '"Windows"';
      case 'linux':
        return '"Linux"';
      default:
        return '"macOS"';
    }
  }

  getAcceptLanguage() {
    const language = this.locale.split('-')[0];
    return `${this.locale},${language};q=0.9`;
  }

  generateHeaders() {
    return {
      'accept': '*/*',
      'accept-language': this.getAcceptLanguage(),
      'content-type': 'application/json',
      'origin': 'https://paintastreet.com',
      'priority': 'u=1, i',
      'referer': 'https://paintastreet.com/',
      'sec-ch-ua': this.getSecChUa(),
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': this.getSecChUaPlatform(),
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': this.getUserAgent()
    };
  }

  getPlatformInfo() {
    return {
      platform: this.platform,
      locale: this.locale,
      chromeVersion: this.chromeVersion,
      hostname: os.hostname(),
      arch: os.arch()
    };
  }
}

export default PlatformDetector;