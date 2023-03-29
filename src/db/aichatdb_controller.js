import dbController from "./db.js";
import { v4 as uuid } from 'uuid';

class DialogChat {
    static list_aichat = function (chatid) {
        return dbController.load_aichat_db(chatid);
    }

    static add_user_aichat = function (chatid, input) {
        const now = new Date();
        const dateString = now.toLocaleString();

        var chat = dbController.load_aichat_db(chatid);
        const newChat = [...chat, { name: 'You', role: 0, content: input, time: dateString }];
        dbController.save_aichat_db(chatid, newChat);
    }

    static add_ai_aichat = function (chatid, input) {
        const now = new Date();
        const dateString = now.toLocaleString();

        var chat = dbController.load_aichat_db(chatid);
        const newChat = [...chat, { name: 'Chatgpt', role: 1, content: input, time: dateString }];
        dbController.save_aichat_db(chatid, newChat);
    }

    static clear_ai_aichat = function (chatid) {
        const newChat = [];
        var chat = dbController.load_aichat_db(chatid);
        dbController.save_aichat_db(uuid(), chat);

        dbController.save_aichat_db(chatid, newChat);
    }
}

export default DialogChat;
