import path from "path";
import fs from "fs";

const db_dir = '/db/'
const log = '/log/'

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

function LoadRawFile(filename) {
    var file = path.join(process.cwd(), filename);
    if (fs.existsSync(file)) {
        var data = fs.readFileSync(file, 'utf-8');
        return data;
    } else {
        return "";
    }
}

function SaveAppendRawFile(filename, data) {
    var file = path.join(process.cwd(), filename);
    if (fs.existsSync(file)) {
        fs.appendFileSync(file, data);
    } else {
        fs.writeFileSync(file, data);
    }
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

    static LoadEmbeddedDB = function () {
        return LoadDB(db_dir + 'embedded/embedded.js');
    }

    static SaveEmbeddedDB = function (data) {
        return SaveDB(db_dir + 'embedded/embedded.js', data);
    }

    static LoadUserDB = function() {
        return LoadDB(db_dir + 'userdb.js');
    }

    static SaveUserDB = function(data) {
        return SaveDB(db_dir + 'userdb.js', data);
    }

    static LoadSysConfigDB = function() {
        return LoadDB(db_dir + 'sysconfig.js');
    }

    static SaveSysConfigDB = function(data) {
        return SaveDB(db_dir + 'sysconfig.js', data);
    }

    static LoadLog = function(date) {
        return LoadRawFile(db_dir + date + '.log');
    }

    static AppendLog = function(date, log) {
        return SaveAppendRawFile(db_dir + date + '.log', log);
    }
}

export default DBController;
