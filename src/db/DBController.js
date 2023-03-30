import path from "path";
import fs from "fs";

const db_dir = '/db/'

function LoadDB(filename) {
    var file = path.join(process.cwd(), filename);
    if (fs.existsSync(file)) {
        var data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        return data;
    } else {
        fs.writeFileSync(file, JSON.stringify([]));
        return [];
    }
}

function SaveDB(filename, data) {
    var file = path.join(process.cwd(), filename);
    fs.writeFileSync(file, JSON.stringify(data, null, 4));
}

class DBController {
    static LoadAIChatDB = function (chatid) {
        return LoadDB(db_dir + 'aichatdb/aichatdb-' + chatid + '.js');
    }

    static SaveAIChatDB = function (chatid, data) {
        return SaveDB(db_dir + 'aichatdb/aichatdb-' + chatid + '.js', data);
    }

    static LoadChatDB = function (chatid) {
        return LoadDB(db_dir + 'chatdb/chatdb-' + chatid + '.js');
    }

    static SaveChatDB = function (chatid, data) {
        return SaveDB(db_dir + 'chatdb/chatdb-' + chatid + '.js', data);
    }

    static SaveChatSummary = function (chatid, data) {
        return SaveDB(db_dir + 'chatdb/summary-' + chatid + '.js', data);
    }

    static LoadConversationDB = function () {
        return LoadDB(db_dir + 'conversationdb.js');
    }

    static SaveConversationDB = function (data) {
        return SaveDB(db_dir + 'conversationdb.js', data);
    }
}

export default DBController;
