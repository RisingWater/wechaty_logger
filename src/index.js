import { WechatyBuilder } from "wechaty";
import dotenv from "dotenv";
import qrcode from "qrcode-terminal";
import ConversationControl from "./db/conversation_controller.js"
import { PuppetXp } from 'wechaty-puppet-xp'

dotenv.config();

const MessageTypeStr = [
    "Unknown",
    "Attachment",
    "Audio",
    "Contact",
    "ChatHistory",
    "Emoticon",
    "Image",
    "Text",
    "Location",
    "MiniProgram",
    "GroupNote",
    "Transfer",
    "RedEnvelope",
    "Recalled",
    "Url",
    "Video",
    "Post"
];

function onScan(payload) {
    console.log(payload);
    qrcode.generate(payload);
}

async function onLogin(user) {
    console.log("Bot: " + user.name() + "is logined");
}

function onLogout(user) {
    console.log("Bot " + user.name() + " is logouted");
    process.exit();
}

async function onMessage(message) {

    if (message.self()) {
        console.log("Message discarded because its outgoing");
        return;
    }

    if (message.age() > 180) {
        console.log("Message discarded because it is too old " + message.age());
        return;
    }

    if (message.payload.type != bot.Message.Type.Text && message.payload.type != bot.Message.Type.ChatHistory) {
        console.log("Message discarded because unsupported. type is \'" + MessageTypeStr[message.payload.type] + "\'");
        return;
    }

    if (message.talker() == undefined || message.listener() == undefined) {
        console.log("Message discarded because message error");
        console.log(message);
        return;
    }

    var msg = {
        conversationid: "",
        from: "",
        content: "",
        topic: ""
    };

    var in_room = false;

    if (message.payload.roomId == undefined || message.payload.roomId == "") {
        msg.conversationid = message.payload.talkerId;
        msg.from = message.talker().name();
        msg.content = message.text();
        msg.topic = "与" + msg.from + "的对话";
    } else {
        var room_topic = await message.room().topic();
        in_room = true;
        msg.conversationid = message.payload.roomId;
        msg.from = message.talker().name();
        msg.content = message.text();
        msg.topic = "在" + room_topic + "中的对话";
    }

    if (message.payload.type != bot.Message.Type.ChatHistory)
    {
        console.log("recv:" + msg.content + " in: " + msg.topic + " from: " + msg.from + " age:" + message.age());
    } else if (message.payload.type == bot.Message.Type.Text) {
        console.log("recv:" + "聊天记录" + " in: " + msg.topic + " from: " + msg.from + " age:" + message.age());
    }

    var mentionSelf = "@" + message.listener().name();

    var commandstr = null;
    if (in_room) {
        if (msg.content.startsWith(mentionSelf)) {
            commandstr = msg.content.substring(mentionSelf.length).trim();
        }
    } else {
        if (msg.content === "开始对话"
            || msg.content === "结束对话"
            || msg.content === "开始记录"
            || msg.content === "结束记录") {
            commandstr = msg.content;
        }
    }

    if (commandstr) {
        if (commandstr == "开始记录") {
            message.say("已开始记录");
            ConversationControl.start_conversation(msg.conversationid, "record");
        } else if (commandstr == "结束记录") {
            message.say("记录已完成，正在总结:");
            ConversationControl.summary_recorded_conversation(msg.conversationid, msg.topic).then((result) => {
                message.say("总结如下:\n" + result.message);
                ConversationControl.end_conversation(msg.conversationid, "record");
            })
        } else if (commandstr == "开始对话") {
            message.say("已开始对话");
            ConversationControl.start_conversation(msg.conversationid, "dialog");
        } else if (commandstr == "结束对话") {
            ConversationControl.dialog_conversation_end(msg.conversationid);
            ConversationControl.end_conversation(msg.conversationid, "dialog");
            message.say("已结束对话, 很高兴可以帮助到你");
        }
    } else {
        var conversation = ConversationControl.find_conversation(msg.conversationid);
        if (conversation != null) {
            if (conversation.type == "record") {
                if (message.payload.type == bot.Message.Type.Text) {
                    ConversationControl.record_conversation(msg.conversationid, msg.from, msg.content);
                } else if (message.payload.type == bot.Message.Type.ChatHistory) {
                    ConversationControl.record_chatlog(msg.conversationid, msg.content);
                }
            } else if (conversation.type == "dialog") {
                ConversationControl.dialog_conversation(msg.conversationid, msg.content).then((result) => {
                    message.say(result.message);
                });
            }
        }
    }
}

var bot = null;

if (process.env.WECHATY_PUPPET == "wechaty-puppet-wechat") {
    console.log("start wechaty-puppet-wechat");
    const tmp = WechatyBuilder.build({
        name: "test-bot",
        memory: false,
        puppetOptions: {
            uos: true
        },
        puppet: process.env.WECHATY_PUPPET
    })

    bot = tmp;
} else if (process.env.WECHATY_PUPPET == "wechaty-puppet-xp") {
    console.log("start wechaty-puppet-xp");
    const puppet = new PuppetXp()
    const tmp = WechatyBuilder.build({
        name: "test-bot",
        memory: false,
        puppet,
    })

    bot = tmp;
}


bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)

bot.start()
    .then(() => {
        return console.log("Bot is Started.");
    })