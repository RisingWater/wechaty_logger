import DBController from "./DBController.js";
import DialogChat from "./DialogChat.js"
import RecordChat from "./RecordChat.js"
import AIInterface from "../utils/AIInterface.js"
import PromptCreator from "../utils/PromptCreator.js";
import RecordHelper from "../utils/RecordHelper.js";
import EmbeddedControl from "./EmbeddedControl.js"

class ConversationControl {
    static FindConversation = function (chatid) {
        var conversation = null;
        var conversationdb = DBController.LoadConversationDB();
        conversationdb.some(element => {
            if (element.chatid == chatid) {
                conversation = element;
                return true;
            }
        });

        return conversation;
    }

    static StartConversation = function (chatid, type) {
        var conversation = ConversationControl.FindConversation(chatid);
        if (conversation == null) {
            var conversationdb = DBController.LoadConversationDB();
            conversation = {
                chatid: chatid,
                type: type
            };
            const new_conversationdb = [...conversationdb, conversation];
            DBController.SaveConversationDB(new_conversationdb);
        }
        else {
            if (conversation.type != type) {
                console.log("conversion [" + chatid + "] type is not fit");
            } else {
                console.log("conversion [" + chatid + "] is already exist");
            }
        }
    }

    static EndConversation = function (chatid) {
        var conversationdb = DBController.LoadConversationDB();
        const new_conversationdb = conversationdb.filter(element => {
            if (element.chatid == chatid) {
                return false;
            }
            return true;
        });
        DBController.SaveConversationDB(new_conversationdb);
    }

    static RecordChat = function (chatid, name, content) {
        RecordChat.RecordChat(chatid, name, content, null);
    }

    static RecordChatlog = function (chatid, chatlog) {
        RecordHelper.RecordChatLog(chatlog, (name, content, time) => {
            RecordChat.RecordChat(chatid, name, content, time);
        })
    }

    static SummaryRecord = async function (chatid, topic) {
        var allchat = RecordChat.LoadAllChat(chatid);
        var messages = await PromptCreator.CreateSummaryPrompt(allchat);
        var data = await AIInterface.ChatCompletion(messages);

        if (data.result == 0) {
            var summary = RecordChat.SaveSummary(chatid, allchat, data.message, topic);

            AIInterface.Embedding(data.message).then((result)=>{
                if (result.result == 0) {
                    var md5 = EmbeddedControl.AddEmbedded(Fragment, result.message);
                    console.log("Fragment[" + chatid + "] Embedding finish, md5: " + md5);
                }
            })
        }

        return data;
    }

    static ProcessDialog = async function (chatid, input) {
        var history = DialogChat.ListChat(chatid);
        var messages = await PromptCreator.CreateDialogPrompt(history, input);
        DialogChat.AddUserChat(chatid, input);
        var data = await AIInterface.ChatCompletion(messages);

        if (data.result == 0) {
            DialogChat.AddAIChat(chatid, data.message)
        }

        return data;
    }

    static EndDialog = function (chatid) {
        DialogChat.ClearChat(chatid);
    }

    static ProcessQuestion = async function (chatid, input) {
        var allchat = RecordChat.LoadAllChat(chatid);
        console.log("allchat:" + allchat);
        console.log("chatid: " + chatid + " input:" + input);
        var messages = await PromptCreator.CreateQuestionPrompt(allchat, input);
        if (messages == null) {
            var data = {
                result: -1,
                messsages: "CreateQuestionPrompt failed"
            };
            return data;
        }
        DialogChat.AddUserChat(chatid, input);
        var data = await AIInterface.ChatCompletion(messages);

        if (data.result == 0) {
            DialogChat.AddAIChat(chatid, data.message)
        }

        return data;
    }

    static EndQuestion = function (chatid) {
        DialogChat.ClearChat(chatid);
    }
}

export default ConversationControl;