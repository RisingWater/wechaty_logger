import path from "path";
import fs from "fs";
import jschardet from 'jschardet';
import iconv from 'iconv-lite';

import EmbeddedControl from '../db/EmbeddedControl.js'
import AIInterface from "./AIInterface.js";
import PromptCreator from "../utils/PromptCreator.js"
import LogControl from "./LogUtils.js";

function splitString(input, maxLength) {
    const result = [];
    let startIndex = 0;

    while (startIndex < input.length) {
        let endIndex = startIndex + maxLength;

        if (endIndex < input.length) {
            let lastNewLine = input.lastIndexOf('\n', endIndex);
            if (lastNewLine > startIndex) {
                endIndex = lastNewLine;
            }
        } else {
            endIndex = input.length;
        }

        result.push(input.slice(startIndex, endIndex));
        startIndex = endIndex + 1;
    }

    return result;
}

function splitText(text) {
    const regex = /Q\d+:(\s*)(.*)(\s*)A\d+:(\s*)([\s\S]*?)(?=Q|$)/g;
    const matches = Array.from(text.matchAll(regex));

    const result = [];
    for (const match of matches) {
        const question = match[2];
        const answer = match[5];
        if (question && answer) {
            result.push({
                question : question,
                answer : answer.trim().replace(/\n\s*/g, '\n')
            });
        }
    }

    return result;
}

async function embeddingQA(Fragment) {
    LogControl.Info("RawMessge:" + Fragment);

    var QASpiltPrompt = await PromptCreator.CreateQASplitPrompt(Fragment);
    var QASpilt = await AIInterface.ChatCompletion(QASpiltPrompt);

    var QAList = splitText(QASpilt.message);

    for (var index = 0; index < QAList.length; index++) {
        var QAPair = QAList[index];
        LogControl.Info("Question["+index+"]: " + QAPair.question);
        LogControl.Info("Answer["+index+"]: " + QAPair.answer);
        var QEmbedding = await AIInterface.Embedding(QAPair.question + "\n" + QAPair.answer);
        EmbeddedControl.AddEmbedded(QAPair.question + "\n" + QAPair.answer, QEmbedding.message, QAPair.question);
    }
}

var WaitingList = 0;

class FileEmbedding {
    static GetWaitingList = function () {
        return WaitingList;
    }
    
    static ProcessFile = async function (filename) {
        var ext = path.extname(filename);

        var result = {
            result: -1,
            messages: ""
        }

        var rawText = "";

        if (ext == ".txt") {
            var buffer = fs.readFileSync(filename);
            var detected = jschardet.detect(buffer);
            rawText = iconv.encode(iconv.decode(buffer, detected.encoding), 'utf8').toString();
        } else {
            result.messages = "不识别的文件"
            return;
        }

        var TextFragments = splitString(rawText, 1000);

        WaitingList += TextFragments.length;

        for (var i = 0; i < TextFragments.length; i++) {
            var Fragment = TextFragments[i];
            if (!EmbeddedControl.FindEmbedded(Fragment)) {
                await embeddingQA(Fragment);
                var result = await AIInterface.Embedding(Fragment);
                if (result.result == 0) {
                    var messages = await PromptCreator.CreateDialogPrompt([], "给下面这些资料取一个标题:\n资料:\n\n" + Fragment + "\n\n标题: \n");
                    var summary_result = await AIInterface.ChatCompletion(messages);
                    if (summary_result.result == 0) {
                        var md5 = EmbeddedControl.AddEmbedded(Fragment, result.message, summary_result.message);
                        console.log("Fragment[" + i + "] Embedding finish, summary: " + summary_result.message + " md5: " + md5);
                    }
                }
            } else {
                console.log("Fragment[" + i + "] is already Embedded");
            }

            WaitingList--;
        }

        result.result = 0;

        return;
    }
}

export default FileEmbedding;