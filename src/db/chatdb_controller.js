import dbController from "./db.js";
import { v4 as uuid } from 'uuid';

class RecordChat {
    static record_chat = function (chatid, name, input) {
        const now = new Date();
        const dateString = now.toLocaleString();

        var chat = dbController.load_chat_db(chatid);
        const newChat = [...chat, { name: name, content: input, time: dateString }];
        dbController.save_chat_db(chatid, newChat);
    }

    static load_all_chat = function (chatid) {
        var chat = dbController.load_chat_db(chatid);
        return chat;
    }

    static save_summary = function (chatid, allchat, summary, topic) {
        var data = {
            topic : topic,
            summary : summary,
            chat : allchat
        };

        return dbController.save_chat_summary(chatid, data);
    }
}

export default RecordChat;