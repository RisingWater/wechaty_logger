import path from "path";
import fs from "fs";

const db_dir = '/db/'

function load_db(filename) {
    var file = path.join(process.cwd(), filename);
    if (fs.existsSync(file)) {
        var data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        return data;
    } else {
        fs.writeFileSync(file, JSON.stringify([]));
        return [];
    }
}

function save_db(filename, data) {
    var file = path.join(process.cwd(), filename);
    fs.writeFileSync(file, JSON.stringify(data, null, 4));
}

class dbController {
    static load_aichat_db = function (chatid) {
        return load_db(db_dir + 'aichatdb/aichatdb-' + chatid + '.js');
    }

    static save_aichat_db = function (chatid, data) {
        return save_db(db_dir + 'aichatdb/aichatdb-' + chatid + '.js', data);
    }

    static load_chat_db = function (chatid) {
        return load_db(db_dir + 'chatdb/chatdb-' + chatid + '.js');
    }

    static save_chat_db = function (chatid, data) {
        return save_db(db_dir + 'chatdb/chatdb-' + chatid + '.js', data);
    }

    static save_chat_summary = function (chatid, data) {
        return save_db(db_dir + 'chatdb/summary-' + chatid + '.js', data);
    }

    static load_conversation_db = function () {
        return load_db(db_dir + 'conversationdb.js');
    }

    static save_conversation_db = function (data) {
        return save_db(db_dir + 'conversationdb.js', data);
    }
}

export default dbController;
