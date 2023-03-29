import { WechatyBuilder } from "wechaty";
import dotenv from "dotenv";
import qrcode from "qrcode-terminal";
import ConversationControl from "./db/conversation_controller.js"

dotenv.config();

const bot = WechatyBuilder.build({
    name: "test-bot",
    memory: false,
    puppetOptions: {
        uos: process.env.WECHATY_PUPPET == "wechaty-puppet-wechat"
    },
    puppet: process.env.WECHATY_PUPPET
})

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

    if (message.payload.type != 7) {
        console.log("Message discarded because unsupported. type is \'" + bot.Message.Type[message.type()] + "\'");
        return;
    }

    var msg = {
        conversationid: "",
        from: "",
        content: "",
        topic: ""
    };

    var in_room = false;

    if (message.payload.roomId == undefined) {
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

    console.log("recv:" + msg.content + " age:" + message.age());

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
                ConversationControl.record_conversation(msg.conversationid, msg.from, msg.content);
            } else if (conversation.type == "dialog") {
                ConversationControl.dialog_conversation(msg.conversationid, msg.content).then((result)=>{
                    message.say(result.message);
                });
            }
        }
    }
}

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)

bot.start()
    .then(() => {
        return console.log("Bot is Started.");
    })