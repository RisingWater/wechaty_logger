import ConversationControl from "../db/ConversationControl.js"

class MsgProcess {
    static StartRecordProcess = function (msg, message, bot) {
        message.say("已开始记录");
        ConversationControl.StartConversation(msg.conversationid, "record");
    }

    static EndRecordProcess = function (msg, message, bot) {
        message.say("记录已完成，正在总结:");
        ConversationControl.SummaryRecord(msg.conversationid, msg.topic).then((result) => {
            message.say("总结如下:\n" + result.message);
            ConversationControl.EndConversation(msg.conversationid, "record");
        })
    }

    static StartDialogProcess = function (msg, message, bot) {
        message.say("已开始对话");
        ConversationControl.StartConversation(msg.conversationid, "dialog");
    }

    static EndDialogProcess = function (msg, message, bot) {
        ConversationControl.EndDialog(msg.conversationid);
        ConversationControl.EndConversation(msg.conversationid, "dialog");
        message.say("已结束对话, 很高兴可以帮助到你");
    }

    static StartQuestionProcess = function (msg, message, bot) {
        message.say("鉴于当前的知识库内容，现在你可以开始询问有关MSPAD的问题");
        ConversationControl.StartConversation(msg.conversationid, "question");
    }

    static EndQuestionProcess = function (msg, message, bot) {
        ConversationControl.EndQuestion(msg.conversationid);
        ConversationControl.EndConversation(msg.conversationid, "question");
        message.say("已结束询问环节, 很高兴可以帮助到你");
    }

    static ProcessDefault = function (msg, message, bot) {
        var conversation = ConversationControl.FindConversation(msg.conversationid);
        if (conversation != null) {
            if (conversation.type == "record") {
                if (message.payload.type == bot.Message.Type.Text) {
                    ConversationControl.RecordChat(msg.conversationid, msg.from, msg.content);
                } else if (message.payload.type == bot.Message.Type.ChatHistory) {
                    ConversationControl.RecordChatlog(msg.conversationid, msg.content);
                }
            } else if (conversation.type == "dialog") {
                if (message.payload.type == bot.Message.Type.Text) {
                    ConversationControl.ProcessDialog(msg.conversationid, msg.content).then((result) => {
                        message.say(result.message);
                    });
                } else {
                    message.say("不支持此类消息类型");
                }
            } else if (conversation.type == "question") {
                if (message.payload.type == bot.Message.Type.Text) {
                    ConversationControl.ProcessQuestion(msg.conversationid, msg.content).then((result) => {
                        message.say(result.message);
                    })
                } else {
                    message.say("不支持此类消息类型");
                }
            }
        }
    }
}

export default MsgProcess;