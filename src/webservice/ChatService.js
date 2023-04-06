import DialogChat from "../db/DialogChat.js"
import ConversationControl from "../db/ConversationControl.js";
import LogControl from "../utils/LogUtils.js";
import PromptCreator from "../utils/PromptCreator.js"
import AIInterface from "../utils/AIInterface.js";

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

    static chatDirectly = async function(req, res) {
        var history = [];
        LogControl.Trace("ChatService chatDirectly input " + req.body.input);
        var messages = await PromptCreator.CreateDialogPrompt(history, req.body.input);
        var data = await AIInterface.ChatCompletion(messages);
        if (data.result == 0) {
            LogControl.Trace("ChatService chatDirectly answer " + data.message);
        }
        res.send(data);
    }
}

export default ChatService