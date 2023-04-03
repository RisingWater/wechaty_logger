import { Configuration, OpenAIApi } from "openai";
import SysConfigControl from "../db/SysConfigControl.js"
import LogControl from "./LogUtils.js";
import request from "request";

function ShowBalance() {
    var request_headers = {
        "Authorization": "Bearer " + SysConfigControl.get().apikey,
        "OpenAI-Organization": SysConfigControl.get().orgid,
        "Content-Type": "application/json"
    };

    var balance_url = "https://api.openai.com/dashboard/billing/credit_grants"
    const options = { headers: request_headers };

    request.get(balance_url, options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            LogControl.Info("OpenAPI billing " + JSON.stringify(body, null, 4));
        } else {
            LogControl.Error("OpenAPI billing failed " + JSON.stringify(error, null, 4));
        }
    });
}

class AIInterface {
    static ChatCompletion = async function (content) {
        var configuration = new Configuration({
            organization: SysConfigControl.get().orgid,
            apiKey: SysConfigControl.get().apikey,
        });
        
        var openai = new OpenAIApi(configuration);

        var data = {
            result: 0,
            message: ""
        };

        LogControl.Trace("ChatCompletion start:" + content);

        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: content,
                temperature: 1,
            });
            data.result = 0;
            data.message = completion.data.choices[0].message.content;
            var total_tokens = completion.data.usage.total_tokens;

            LogControl.Info("ChatCompletion success use " + total_tokens + " tokens");
            ShowBalance();
        } catch (error) {
            LogControl.Error("ChatCompletion catch error " +  JSON.stringify(error, null, 4));
            if (error.response) {
                data.result = error.response.status;
                data.message = error.response.data.error.message;
            } else {
                data.result = -1;
                data.message = "other error!";
            }
        }

        LogControl.Trace("ChatCompletion result:" + JSON.stringify(data, null, 4));

        return data;
    }

    static Embedding = async function (content) {
        var configuration = new Configuration({
            organization: SysConfigControl.get().orgid,
            apiKey: SysConfigControl.get().apikey,
        });
        
        var openai = new OpenAIApi(configuration);
        
        var data = {
            result: 0,
            message: ""
        };

        LogControl.Trace("Embedding start:" + content);

        try {
            const embedded = await openai.createEmbedding({
                input: content,
                model: "text-embedding-ada-002",
            });

            if (embedded.data.data.length) {
                data.message = embedded.data.data[0].embedding;

                var total_tokens = embedded.data.usage.total_tokens;
                LogControl.Info("Embedding success use " + total_tokens + " tokens");
            } else {
                data.result = -1;
                data.message = "Question not embedded properly";
            }
        } catch (error) {
            LogControl.Error("Embedding catch error " +  JSON.stringify(error, null, 4));
            if (error.response) {
                data.result = error.response.status;
                data.message = error.response.data.error.message;
            } else {
                data.result = -1;
                data.message = "other error!";
            }
        }

        return data;
    }
}

export default AIInterface;