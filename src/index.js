import { WechatyBuilder } from "wechaty";
import dotenv from "dotenv";
import qrcode from "qrcode-terminal";
import CmdHelper from "./utils/CmdHelper.js"
import { PuppetXp } from 'wechaty-puppet-xp'
import MsgProcess from "./Message/MsgProcess.js";

dotenv.config();

const MessageTypeStr = ["Unknown", "Attachment", "Audio", "Contact", "ChatHistory", "Emoticon",
    "Image", "Text", "Location", "MiniProgram", "GroupNote", "Transfer", "RedEnvelope", "Recalled",
    "Url", "Video", "Post"
];

function onScan(payload) {
    console.log(payload);
    qrcode.generate(payload);
}

var selfName = "";

async function onLogin(user) {
    console.log("Bot: " + user.name() + "is logined");
    selfName = user.name();
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

    if (message.talker() == undefined) {
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

    if (message.payload.type != bot.Message.Type.ChatHistory) {
        console.log("recv:" + msg.content + " in: " + msg.topic + " from: " + msg.from + " age:" + message.age());
    } else if (message.payload.type == bot.Message.Type.Text) {
        console.log("recv:" + "聊天记录" + " in: " + msg.topic + " from: " + msg.from + " age:" + message.age());
    }

    var mentionSelf = "@" + selfName;

    var commandstr = null;

    if (in_room) {
        if (msg.content.startsWith(mentionSelf)) {
            commandstr = msg.content.substring(mentionSelf.length).trim();
        }
    } else {
        if (CmdHelper.isValidCmd(msg.content)) {
            commandstr = msg.content;
        }
    }

    if (commandstr == null) {
        commandstr = "Default";
    }

    CmdHelper.ProcessCmd(commandstr, msg, message, bot);
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

CmdHelper.registerCmd("开始对话", MsgProcess.StartDialogProcess);
CmdHelper.registerCmd("结束对话", MsgProcess.EndDialogProcess);
CmdHelper.registerCmd("开始记录", MsgProcess.StartRecordProcess);
CmdHelper.registerCmd("结束记录", MsgProcess.EndRecordProcess);
CmdHelper.registerCmd("开始提问", MsgProcess.StartQuestionProcess);
CmdHelper.registerCmd("结束提问", MsgProcess.EndQuestionProcess);
CmdHelper.registerCmd("Default", MsgProcess.ProcessDefault);

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)

bot.start()
    .then(() => {
        return console.log("Bot is Started.");
    })
