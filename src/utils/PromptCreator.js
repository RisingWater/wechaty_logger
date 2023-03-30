import AIInterface from "../utils/AIInterface.js"
import EmbeddedControl from "../db/EmbeddedControl.js"

const MaxPromptSize = 1500;

function GenDialogPrompt(history, current_input) {
    var messages = [];
    var total_len = current_input.length;
    var i = 0;
    for (i = history.length; i > 0; i--) {
        total_len += history[i - 1].content.length;
        if (total_len > MaxPromptSize) {
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

class PromptCreator {
    static CreateDialogPrompt = async function (history, current_input) {
        return GenDialogPrompt(history, current_input);
    }

    static CreateSummaryPrompt = async function (allchat) {
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

    static CreateQuestionPrompt = async function (history, content) {
        var result = await AIInterface.Embedding(content);

        if (result.result != 0) {
            return null;
        }

        var closestParagraphs = EmbeddedControl.FindClosestFragment(result.message, 5);

        var prompt =
            "回答下面的问题, 你可以使用下列资料作为参考\n" +
            "资料:\n" +
            closestParagraphs.join("\n\n") +
            "问题如下 :\n" +
            content;

        return GenDialogPrompt(history, prompt);
    }
}

export default PromptCreator;