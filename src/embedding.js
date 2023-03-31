import fs from "fs";
import AIInterface from "./utils/AIInterface.js"
import EmbeddedControl from "./db/EmbeddedControl.js"
import PromptCreator from "./utils/PromptCreator.js"

const FragmentMinSize = 5;

let sourcePath = "./db/sourceFile.txt";
let destPath = "./db/embeddedFile_new.js";

async function generateEmbedding(filePath) {
    console.log("Embedding Started " + filePath);

    var rawText = fs.readFileSync(filePath, {
        encoding: "utf-8",
        flag: "r",
    });

    const regex = /.*summary-.*\.js/;
    const match = regex.test(filePath);

    var TextFragments = [];

    if (!match) {
        var RawFragments = rawText.split(/\n\s*\n/);

        for (var i = 0; i < RawFragments.length; i++) {
            var TextFragment = RawFragments[i].trim().replaceAll("\n", " ").replace(/\r/g, "");

            if (TextFragment.split(/\s+/).length >= FragmentMinSize) {
                TextFragments.push(TextFragment);
            }
        }
    } else {
        try {
            var json = JSON.parse(rawText);
            TextFragments.push(json.summary);
        } catch {
            console.log("summary file parse failed");
            return;
        }
    }

    console.log("Total Fragments:" + TextFragments.length);

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
};

generateEmbedding(process.argv[2]);
