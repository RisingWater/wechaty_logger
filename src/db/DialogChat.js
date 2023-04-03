import DBController from "./DBController.js";
import { v4 as uuid } from 'uuid';

class DialogChat {
    static ListChat = function (chatid) {
        return DBController.LoadAIChatDB(chatid);
    }

    static AddUserChat = function (chatid, input) {
        const dateString = new Date().toLocaleString();

        var chat = DBController.LoadAIChatDB(chatid);
        const newChat = [...chat, { name: 'You', role: 0, content: input, time: dateString, refs: [] }];
        DBController.SaveAIChatDB(chatid, newChat);
    }

    static AddAIChat = function (chatid, input, refs) {
        const dateString = new Date().toLocaleString();

        var chat = DBController.LoadAIChatDB(chatid);
        const newChat = [...chat, { name: 'Chatgpt', role: 1, content: input, time: dateString, refs: refs }];
        DBController.SaveAIChatDB(chatid, newChat);
    }

    static ClearChat = function (chatid) {
        const newChat = [];
        var chat = DBController.LoadAIChatDB(chatid);
        DBController.SaveAIChatDB(uuid(), chat);
        DBController.SaveAIChatDB(chatid, newChat);
    }
}

export default DialogChat;
