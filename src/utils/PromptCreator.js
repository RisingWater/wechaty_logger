import AIInterface from "../utils/AIInterface.js"
import EmbeddedControl from "../db/EmbeddedControl.js"
const MaxPromptSize = 1500;

function GenDialogPrompt(history, current_input) {
    var messages = [];

    history.reverse();
    var tmp = [];

    var total_len = current_input.length;

    history.some((element)=>{
        total_len += element.content.length;
        if (total_len > MaxPromptSize) {
            return true;
        }

        tmp.push(element);
    })

    tmp.reverse();

    tmp.some((element)=>{
        var chat = { "role": "", "content": "" };
        
        chat.role = (element.role == 0) ? "user" : "assistant";
        chat.content = element.content;
        messages.push(chat);
    })

    messages.push({ "role": "user", "content": current_input });

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
        var prompt_result = {
            QuestionPrompt:"",
            refs:[],
            token:0
        }

        var result = await AIInterface.Embedding(content);

        if (result.result != 0) {
            return null;
        }

        var closestParagraphs = EmbeddedControl.FindClosestFragment(result.message, 5);

        var prompt =
            "回答下面的问题, 你可以使用下列资料作为参考\n" +
            "资料:\n";

        closestParagraphs.some((element) => {
            var ref = {
                id : element.id,
                score: element.score
            }
            prompt_result.refs.push(ref);
            prompt += element.content + "\n\n";
        })

        prompt += "问题如下 :\n" + content;

        prompt_result.token = result.token;
        prompt_result.QuestionPrompt = GenDialogPrompt(history, prompt);

        return prompt_result;
    }
}

export default PromptCreator;