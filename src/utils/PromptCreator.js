import AIInterface from "../utils/AIInterface.js"
import fs from "fs";
import DBController from "../db/DBController.js"

const embeds_storage_prefix = "embeds:";

function keyExtractParagraph(key) {
    return key.substring(embeds_storage_prefix.length);
};

function compareEmbeddings(embedding1, embedding2) {
    var length = Math.min(embedding1.length, embedding2.length);
    var dotprod = 0;

    for (var i = 0; i < length; i++) {
        dotprod += embedding1[i] * embedding2[i];
    }

    return dotprod;
};

function findClosestParagraphs(questionEmbedding, count) {
    var items = [];

    var embeddingStore = DBController.LoadEmbeddedDB();

    for (const key in embeddingStore) {
        var paragraph = keyExtractParagraph(key);

        var currentEmbedding = JSON.parse(embeddingStore[key]).embedding;

        items.push({
            paragraph: paragraph,
            score: compareEmbeddings(questionEmbedding, currentEmbedding),
        });
    }

    items.sort(function (a, b) {
        return b.score - a.score;
    });

    return items.slice(0, count).map((item) => item.paragraph);
};

class PromptCreator {
    static CreateDialogPrompt = async function (history, current_input) {
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

    static CreateQuestionPrompt = async function (content) {
        var result = await AIInterface.Embedding(content);

        if (result.result != 0) {
            return null;
        }

        var closestParagraphs = findClosestParagraphs(result.message, 5);

        var prompt =
            //"Answer the following question from the context, if the answer can not be deduced from the context, say '我不知道' :" +
            "Answer the following question, also use your own knowledge when necessary :\n\n" +
            "Context :\n" +
            closestParagraphs.join("\n\n") +
            "\n\nQuestion :\n" +
            content +
            "?" +
            "\n\nAnswer :"
            ;

        var all_prompt = [
            { "role": "user", "content": prompt }
        ]

        return all_prompt;
    }
}

export default PromptCreator;