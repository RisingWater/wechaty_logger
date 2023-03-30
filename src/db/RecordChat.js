import DBController from "./DBController.js";
import { v4 as uuid } from 'uuid';

class RecordChat {
    static RecordChat = function (chatid, name, input, time) {
        var dateString = time;
        if (dateString == null) {
            const now = new Date();
            dateString = now.toLocaleString();
        }

        var chat = DBController.LoadChatDB(chatid);
        const newChat = [...chat, { name: name, content: input, time: dateString }];
        DBController.SaveChatDB(chatid, newChat);
    }

    static LoadAllChat = function (chatid) {
        var chat = DBController.LoadChatDB(chatid);
        return chat;
    }

    static SaveSummary = function (chatid, allchat, summary, topic) {
        var data = {
            topic : topic,
            summary : summary,
            chat : allchat
        };

        const newChat = [];
        DBController.SaveChatDB(uuid(), newChat);

        return DBController.SaveChatSummary(uuid(), data);
    }
}

export default RecordChat;