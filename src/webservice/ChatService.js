import DialogChat from "../db/DialogChat.js"
import ConversationControl from "../db/ConversationControl.js";

class ChatService {
    static list = function(req, res) {
        res.send(DialogChat.ListChat(req.body.chatid));
    }

    static chatWithKnowledge = async function(req, res) {
        await ConversationControl.ProcessQuestion(req.body.chatid, req.body.input);
        res.send({result:0});
    }
}

export default ChatService