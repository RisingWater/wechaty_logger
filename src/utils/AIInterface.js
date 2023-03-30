import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import request from "request";

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

const openai = new OpenAIApi(configuration);

function ShowBalance() {
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

class AIInterface {
    static ChatCompletion = async function(content) {
        var data = {
            result: 0,
            message: ""
        };

        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: content,
                temperature: 1,
            });
            data.result = 0;
            data.message = completion.data.choices[0].message.content;
            var total_tokens = completion.data.usage.total_tokens;
            console.log("use total_tokens: " + total_tokens);
            ShowBalance();
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

        return data;
    }
}

export default AIInterface;