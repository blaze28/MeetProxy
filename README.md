# MeetProxy

**MeetProxy** is a Telegram bot designed to attend Google Meet sessions on your behalf. With advanced features, it simplifies session management directly from Telegram, offering enhanced automation and control.

---

## Features

- **Join Google Meet from Telegram**: Provide a Meet link, and the bot joins seamlessly.
- **Spam Detection**: Alerts you when the chatbox is spammed with over 15 messages per minute.
- **Automatic Exit**: Leaves the Meet when participant count drops below a specified threshold.
- **Live Status Updates**: Provides screenshots of the ongoing session.
- **Message Broadcasting**: Sends messages to the Meet chatbox via Telegram.

---

## Getting Started

### Prerequisites

Ensure the following are available:

- **Node.js**: Recommended latest LTS version.
- **Telegram Account**: To create and use the bot.
- **Google Chrome/Chromium**: Required for Puppeteer-based automation.

### Required Tokens

1. **Bot Token**: Obtain from [BotFather](https://telegram.me/BotFather).
2. **Telegram User ID**: Retrieve from [userinfobot](https://telegram.me/userinfobot).
3. **Google Meet Cookie**: Export using the [Cookies for Puppeteer](https://chrome.google.com/webstore/detail/%E3%82%AF%E3%83%83%E3%82%AD%E3%83%BCjson%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E5%87%BA%E5%8A%9B-for-puppet/nmckokihipjgplolmcmjakknndddifde) browser extension.

### Environment Variables

Configure the following:

```env
bot_token=YOUR_BOT_TOKEN
cookie=YOUR_MEET_COOKIE (as JSON)
user_id=YOUR_TELEGRAM_USER_ID
threshold=10
```

---

## Installation

### For VPS/RDP Users

1. Clone the repository:
   ```bash
   git clone https://github.com/your_username/MeetProxy.git
   cd MeetProxy
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the bot:
   ```bash
   node main.js
   ```

### Deploying to Heroku

1. Deploy using the button below:
   [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/your_username/MeetProxy)

2. Post-deployment setup:
   - Navigate to the "Resources" tab.
   - Disable the "web" dyno.
   - Enable the "worker" dyno.

---

## Usage

Control the bot through the following commands:

| Command          | Description                                          |
|------------------|------------------------------------------------------|
| `/join {link}`   | Joins a Google Meet session with the given link.     |
| `/message {msg}` | Sends the specified message to the Meet chatbox.     |
| `/status`        | Provides a screenshot of the ongoing Meet session.   |
| `/leave`         | Exits the current Meet session.                      |
| `/help`          | Displays a list of all available commands.           |

---

## Screenshots

Example interaction:
![Bot Interaction Example](https://user-images.githubusercontent.com/67633271/159228071-af14ac62-b867-4271-83c8-1a075bf2bab7.png)

---

## Contributing

We welcome contributions! Fork this repository, submit pull requests, and help improve the project.

---


