import db from "./db.js";
import aichat from "./aichatdb_controller.js"
import chat from "./chatdb_controller.js"
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import request from "request";
import xml2js from "xml2js"

dotenv.config();

const configuration = new Configuration({
    organization: process.env.OPENAI_API_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY,
});

const request_headers = {
    "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
    "OpenAI-Organization": process.env.OPENAI_API_ORGANIZATION,
    "Content-Type": "application/json"
};

function get_balance() {
    var balance_url = "https://api.openai.com/dashboard/billing/credit_grants"
    const options = { headers: request_headers };

    request.get(balance_url, options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        } else {
            console.log(error);
        }
    });
}

const openai = new OpenAIApi(configuration);

function genMessagePrompt(history, current_input) {
    var messages = [];
    var total_len = 0;
    var i = 0;
    for (i = history.length; i > 0; i--) {
        total_len += history[i - 1].content.length;
        if (total_len > 1000) {
            break;
        }
    }

    var j = 0;
    for (j = i; j < history.length; j++) {
        var tmp = { "role": "", "content": "" };
        if (history[j].role == 0) {
            tmp.role = "user";
        } else {
            tmp.role = "assistant";
        }
        tmp.content = history[j].content;
        messages.push(tmp);
    }
    var current = { "role": "user", "content": current_input };
    messages.push(current);

    return messages;
}

function genSummaryPrompt(allchat) {
    var chatstring = "聊天记录开始\n";
    allchat.some((element) => {
        chatstring += element.time + " " + element.name + "\n" + element.content + "\n";
    })
    chatstring += "聊天记录结束\n";

    var prompt = chatstring + "\n总结一下以上的聊天记录，归纳出问题与解决方案";
    var all_prompt = [
        { "role": "user", "content": prompt }
    ]

    return all_prompt;
}

class ConversationControl {
    static find_conversation = function (chatid) {
        var conversation = null;
        var conversationdb = db.load_conversation_db();
        conversationdb.some(element => {
            if (element.chatid == chatid) {
                conversation = element;
                return true;
            }
        });

        return conversation;
    }

    static start_conversation = function (chatid, type) {
        var conversation = ConversationControl.find_conversation(chatid);
        if (conversation == null) {
            var conversationdb = db.load_conversation_db();
            conversation = {
                chatid: chatid,
                type: type
            };
            const new_conversationdb = [...conversationdb, conversation];
            db.save_conversation_db(new_conversationdb);
        }
        else {
            if (conversation.type != type) {
                console.log("conversion [" + chatid + "] type is not fit");
            } else {
                console.log("conversion [" + chatid + "] is already exist");
            }
        }
    }

    static end_conversation = function (chatid) {
        var conversationdb = db.load_conversation_db();
        const new_conversationdb = conversationdb.filter(element => {
            if (element.chatid == chatid) {
                return false;
            }
            return true;
        });
        db.save_conversation_db(new_conversationdb);
    }

    static record_conversation = function (chatid, name, content) {
        chat.record_chat(chatid, name, content, null);
    }

    static record_chatlog = function (chatid, chatlog) {
        xml2js.parseString(chatlog, (err, result) => {
            if (err == null) {
                console.log(result.msg.appmsg.some((element) => {
                    element.recorditem.some((record) => {
                        xml2js.parseString(record, (err, record2) => {
                            if (err == null) {
                                record2.recordinfo.datalist.some((data) => {
                                    data.dataitem.some((item) => {
                                        if (item.datadesc != undefined && item.datadesc != null) {
                                            console.log(item.sourcetime[0] + " " + item.sourcename[0] + ":\n" + item.datadesc[0]);
                                            chat.record_chat(chatid, item.sourcename[0], item.datadesc[0], item.sourcetime[0]);
                                        }
                                    })
                                })
                            }
                        })
                    })
                }));
            } else {
                console.log(error);
            }
        });
    }

    static summary_recorded_conversation = async function (chatid, topic) {
        var allchat = chat.load_all_chat(chatid);
        var messages = genSummaryPrompt(allchat);
        var data = {
            result: 0,
            message: ""
        };
        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: messages,
                temperature: 1,
            });
            data.result = 0;
            data.message = completion.data.choices[0].message.content;
            var total_tokens = completion.data.usage.total_tokens;
            console.log("use total_tokens: " + total_tokens);
            get_balance();
        } catch (error) {
            console.log(error);
            if (error.response) {
                data.result = error.response.status;
                data.message = error.response.data;
            } else {
                data.result = 1;
                data.message = "other error!";
            }
        }

        if (data.result == 0) {
            chat.save_summary(chatid, allchat, data.message, topic);
        }

        chat.clear_c

        return data;
    }

    static dialog_conversation = async function (chatid, input) {
        var history = aichat.list_aichat(chatid);
        var messages = genMessagePrompt(history, input);
        aichat.add_user_aichat(chatid, input);
        var data = {
            result: 0,
            message: ""
        };
        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: messages,
                temperature: 1,
            });
            data.result = 0;
            data.message = completion.data.choices[0].message.content;
            var total_tokens = completion.data.usage.total_tokens;
            console.log("use total_tokens: " + total_tokens);
            get_balance();
        } catch (error) {
            console.log(error);
            if (error.response) {
                data.result = error.response.status;
                data.message = error.response.data;
            } else {
                data.result = 1;
                data.message = "other error!";
            }
        }
        if (data.result == 0) {
            aichat.add_ai_aichat(chatid, data.message)
        }
        return data;
    }

    static dialog_conversation_end = function (chatid) {
        aichat.clear_ai_aichat(chatid);
    }
}

export default ConversationControl;