const Telegram = require("./src/telegram");
const Trello = require("./src/Trello");

require("dotenv").config()

new Telegram({
  key: process.env.TELEBOT_TOKEN,
  chat_id: process.env.TELECHAT_ID,
  trelloBot: new Trello({
    key: process.env.TRELLO_KEY,
    token: process.env.TRELLO_TOKEN,
    board: {
      board_name: process.env.BOARD_NAME,
      board_id: process.env.BOARD_ID,
      idLabels: process.env.ID_LABELS,
      idMembers: process.env.ID_MEMEBERS,
    },
  }),
});
