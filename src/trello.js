const NodeTrello = require("node-trello");
const eventEmitter = require("events").EventEmitter;
const async = require("async");
const _ = require("lodash");
class Trello extends eventEmitter {
  constructor({ key, token, board } = {}) {
    super();
    this.bot = new NodeTrello(key, token);
    this.board = board;
    this.listId = null;
    this.getListId();
  }

  attachmentToCard(cardId, file_path) {
    this.bot.post(
      `/1/cards/${cardId}/attachments`,
      {
        attachment: fs.createReadStream(
          path.resolve(__dirname, "downloads/", file_path)
        ),
      },
      (err, data) => {
        if (err) throw err;
        console.log({ data });
      }
    );
  }

  getListId() {
    this.bot.get(`/1/boards/${this.board.board_id}/lists/open`, (err, data) => {
      if (err) throw err;
      if (Array.isArray(data)) {
        this.listId = data.find((item) => item?.name === this.board.board_name)?.id;
      }
    });
  }

  createNewCard(card, cb) {
    card.idList = this.listId
    return this.bot.post(`/1/cards/`, card, cb);
  }
}

module.exports = Trello;
