class PromptCreator {
    static CreateDialogPrompt = function(history, current_input) {
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
    
    static CreateSummaryPrompt = function(allchat) {
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

    static CreateQuestionPrompt = function(content) {
        return "";
    }
}

export default PromptCreator;