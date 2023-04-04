import path from "path";
import fs from "fs";
import jschardet from 'jschardet';
import iconv from 'iconv-lite';

import EmbeddedControl from '../db/EmbeddedControl.js'
import AIInterface from "./AIInterface.js";
import PromptCreator from "../utils/PromptCreator.js"

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

class FileEmbedding {
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
            result.messages="不识别的文件"
            return;
        }

        var TextFragments = splitString(rawText, 1000);

        for (var i = 0; i < TextFragments.length; i++) {
            var Fragment = TextFragments[i];
            if (!EmbeddedControl.FindEmbedded(Fragment)) {
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
        }

        result.result = 0;

        return;
    }
}

export default FileEmbedding;