const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');
require('dotenv').config()

const logo =
  `\n
 /$$$$$$$                      /$$       /$$       /$$      /$$                       /$$    
| $$__  $$                    | $$      | $$      | $$$    /$$$                      | $$    
| $$  \\ $$  /$$$$$$  /$$$$$$$ | $$   /$$| $$      | $$$$  /$$$$  /$$$$$$   /$$$$$$  /$$$$$$  
| $$$$$$$  /$$__  $$| $$__  $$| $$  /$$/| $$      | $$ $$/$$ $$ /$$__  $$ /$$__  $$|_  $$_/  
| $$__  $$| $$  \\ $$| $$  \\ $$| $$$$$$/ |__/      | $$  $$$| $$| $$$$$$$$| $$$$$$$$  | $$    
| $$  \\ $$| $$  | $$| $$  | $$| $$_  $$           | $$\\  $ | $$| $$_____/| $$_____/  | $$ /$$
| $$$$$$$/|  $$$$$$/| $$  | $$| $$ \\  $$ /$$      | $$ \\/  | $$|  $$$$$$$|  $$$$$$$  |  $$$$/
|_______/  \\______/ |__/  |__/|__/  \\__/|__/      |__/     |__/ \\_______/ \\_______/   \\___/ 
                              bot for attending your Gmeet sessions                              \n`
console.log(logo);
console.log('Send /help to the bot...');

const TOKEN = process.env.BOT_TOKEN;
const COOKIE = JSON.parse(process.env.COOKIE);
const USER_ID = process.env.USER_ID;
const THRESHOLD = parseInt(process.env.THRESHOLD, 10);
let interval = null;
let lastIndex = 0;

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--start-maximized', '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.setCookie(...COOKIE);
  await page.setViewport({ width: 1366, height: 768 });

  const bot = new TelegramBot(TOKEN, { polling: true });

  async function monitorMeeting() {
    try {
      console.log('Monitoring meeting status...');

      const messages = await page.evaluate(() =>
        [...document.querySelectorAll('[data-formatted-timestamp]')].map(elem => elem.getAttribute('data-formatted-timestamp'))
      );
      if (messages.length - lastIndex >= 15) {
        bot.sendMessage(USER_ID, '⚠️ Meeting chatbox is being spammed!');
      }
      lastIndex = messages.length;

      const participantCount = await page.evaluate(() => {
        const element = document.querySelector('.uGOf1d');
        return element ? parseInt(element.textContent, 10) : 0;
      });

      if (participantCount < THRESHOLD) {
        bot.sendMessage(USER_ID, '📉 Participant count below threshold. Leaving the meeting...');
        clearInterval(interval);
        await page.screenshot({ path: 'leave_meet.png' });
        bot.sendPhoto(USER_ID, fs.createReadStream('leave_meet.png'));

        const leaveButton = await page.$('.VfPpkd-Bz112c-LgbsSe');
        if (leaveButton) {
          await leaveButton.click();
          console.log('Meeting left.');
        }
      }
    } catch (error) {
      console.error('Error during monitoring:', error);
    }
  }

  bot.onText(/\/join (.+)/, async (msg, match) => {
    if (msg.from.id !== parseInt(USER_ID, 10)) return;

    const meetLink = match[1];
    const meetCode = meetLink.match(/\w+-\w+-\w+/)?.[0];
    if (!meetCode) {
      bot.sendMessage(msg.chat.id, '❌ Invalid Google Meet link. Please check and try again.');
      return;
    }

    clearInterval(interval);
    await page.goto(`https://meet.google.com/${meetCode}`);
    bot.sendMessage(msg.chat.id, '🔗 Joining the meeting, please wait...');

    try {
      const joinButton = await page.$('.VfPpkd-Bz112c-LgbsSe');
      if (joinButton) {
        await joinButton.click();
        bot.sendMessage(msg.chat.id, '✅ Successfully joined the meeting!');
      }
      interval = setInterval(monitorMeeting, 60000);
    } catch (error) {
      bot.sendMessage(msg.chat.id, '❌ Failed to join the meeting.');
      console.error('Join error:', error);
    }
  });

  bot.onText(/\/message (.+)/, async (msg, match) => {
    if (msg.from.id !== parseInt(USER_ID, 10)) return;
    const message = match[1];
    try {
      await page.type('#bfTqV', message);
      const sendButton = await page.$('.VfPpkd-Bz112c-LgbsSe');
      if (sendButton) await sendButton.click();
      bot.sendMessage(msg.chat.id, '📩 Message sent to the meeting chatbox!');
    } catch (error) {
      bot.sendMessage(msg.chat.id, '❌ Unable to send the message. Ensure the chatbox is active.');
      console.error('Message error:', error);
    }
  });

  bot.onText(/\/leave/, async msg => {
    if (msg.from.id !== parseInt(USER_ID, 10)) return;

    try {
      const leaveButton = await page.$('.VfPpkd-Bz112c-LgbsSe');
      if (leaveButton) {
        await leaveButton.click();
        clearInterval(interval);
        bot.sendMessage(msg.chat.id, '🚪 Left the meeting successfully!');
      } else {
        bot.sendMessage(msg.chat.id, '❌ Not currently in a meeting.');
      }
    } catch (error) {
      bot.sendMessage(msg.chat.id, '❌ Failed to leave the meeting.');
      console.error('Leave error:', error);
    }
  });

  bot.onText(/\/status/, async msg => {
    if (msg.from.id !== parseInt(USER_ID, 10)) return;

    try {
      await page.screenshot({ path: 'status.png' });
      bot.sendPhoto(msg.chat.id, fs.createReadStream('status.png'));
    } catch (error) {
      bot.sendMessage(msg.chat.id, '❌ Unable to fetch meeting status.');
      console.error('Status error:', error);
    }
  });

  bot.onText(/\/help/, msg => {
    const helpMessage = `
Available commands:
/join {gmeet_link} - Join a Google Meet session.
/message {text} - Send a message to the meeting chatbox.
/status - Get a screenshot of the current meeting.
/leave - Leave the ongoing meeting.
/help - Show this help message.
`;
    bot.sendMessage(msg.chat.id, helpMessage);
  });
}

main();
