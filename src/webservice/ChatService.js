import DialogChat from "../db/DialogChat.js"
import ConversationControl from "../db/ConversationControl.js";
import LogControl from "../utils/LogUtils.js";

class ChatService {
    static list = function(req, res) {
        var chatlist = DialogChat.ListChat(req.body.chatid);
        LogControl.Trace("ChatService list return " + chatlist.length + " chats");
        res.send(chatlist);
    }

    static chatWithKnowledge = async function(req, res) {
        LogControl.Trace("ChatService chatWithKnowledge chatid " + req.body.chatid + " input " + req.body.input);
        
        await ConversationControl.ProcessQuestion(req.body.chatid, req.body.input);

        res.send({result:0});
    }
}

export default ChatService