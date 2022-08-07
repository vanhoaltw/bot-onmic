const TelegramBot = require("node-telegram-bot-api");

const MAX_OPTION_COUNT = 5;
const MIN_OPTION_COUNT = 2;
class Telegram {
  constructor(params) {
    this.token = params.key;
    this.bot = new TelegramBot(params.key, { polling: true });
    this.chatId = params.chat_id;
    this.trelloBot = params.trelloBot;
    this.start();
  }

  removeReplyListener(id) {
    this.bot.removeReplyListener(id);
  }

  replyToMessage(text, replyId, options = {}) {
    const option = { ...options };
    if (replyId) option.reply_to_message_id = replyId;
    return this.bot.sendMessage(this.chatId, text, option);
  }

  // Command

  onHello(msg) {
    const fromName = [msg?.from?.first_name, msg?.from?.last_name].join(" ");
    this.replyToMessage(`
      Hế lô ${fromName} <3 \n /bug: để chửi dev \n /help: để biết thêm
    `);
  }

  onHelp(msg) {
    this.replyToMessage(
      `Các bước báo bug: \n 1/ Nhập "/bug" để bắt đầu \n 2/ Reply vào tin nhắc được tag để báo bug kèm ảnh (nếu có)`
    );
  }

  async onLogBug(msg) {
    const chatId = msg?.chat?.id;
    const botMsg = await this.replyToMessage(
      `@${msg?.from?.username} reply vào đây để log bug!`,
      null,
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );

    this.bot.onReplyToMessage(chatId, botMsg.message_id, async (response) => {
      const fromName = `${response?.from?.first_name} ${response?.from?.last_name}`;
      const name = response?.caption || response?.text;
      const card = {
        name,
        desc: `Người tạo: ${fromName}`,
        pos: "top",
        keepFromSource: "all",
        idMembers: this.trelloBot.board.idMembers,
        idLabels: this.trelloBot.board.idLabels,
      };

      if (response?.photo) {
        const urlSource = await this.bot.getFileLink(
          response?.photo?.[0]?.file_id
        );
        card.urlSource = urlSource;
      }

      await this.trelloBot.createNewCard(card, () => {
        this.replyToMessage(`${fromName} đã log bug lên trello`);
      });
    });
  }

  async start() {
    this.trelloBot.getListId();
    this.bot.onText(/\/hello/, this.onHello.bind(this));
    this.bot.onText(/\/help/, this.onHelp.bind(this));
    this.bot.onText(/\/bug/, this.onLogBug.bind(this));
  }
}

module.exports = Telegram;
