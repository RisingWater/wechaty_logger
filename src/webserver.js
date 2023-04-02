import express from 'express';
import bodyParser from 'body-parser';
import EmbeddingService from "./webservice/EmbeddingService.js"
import UserService from "./webservice/UserService.js"
import SysConfigService from "./webservice/SysConfigService.js"
import ChatService from "./webservice/ChatService.js"

import SysConfigControl from "./db/SysConfigControl.js"

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect("index.html");
});

app.get('/embedded/list', EmbeddingService.list)
app.post('/embedded/del', EmbeddingService.del)
app.post('/embedded/add', EmbeddingService.add)
app.post('/embedded/edit', EmbeddingService.edit)

app.post('/user/check', UserService.check);
app.post('/user/login', UserService.login);
app.post('/user/changepassword', UserService.changepassword);

app.get('/sys/load', SysConfigService.load);
app.post('/sys/config', SysConfigService.config);

app.post('/chat/list', ChatService.list);
app.post('/chat/chatWithKnowledge', ChatService.chatWithKnowledge);

app.listen(SysConfigControl.get().port, () => {
    console.log('Server started on port ' + SysConfigControl.get().port);
});