import DBController from "./DBController.js";
import { v4 as uuid } from 'uuid';

class DialogChat {
    static ListChat = function (chatid) {
        return DBController.LoadAIChatDB(chatid);
    }

    static AddUserChat = function (chatid, input) {
        const dateString = new Date().toLocaleString();

        var chat = DBController.LoadAIChatDB(chatid);
        chat.push({ name: 'You', role: 0, content: input, time: dateString, refs: [], "token_used": 0 });
        DBController.SaveAIChatDB(chatid, chat);
    }

    static AddAIChat = function (chatid, input, refs, token) {
        const dateString = new Date().toLocaleString();

        var chat = DBController.LoadAIChatDB(chatid);
        chat.push({ name: 'Chatgpt', role: 1, content: input, time: dateString, refs: refs, "token_used": token });
        DBController.SaveAIChatDB(chatid, chat);
    }

    static ClearChat = function (chatid) {
        const newChat = [];
        var chat = DBController.LoadAIChatDB(chatid);
        DBController.SaveAIChatDB(uuid(), chat);
        DBController.SaveAIChatDB(chatid, newChat);
    }
}

export default DialogChat;
