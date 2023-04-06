import express from 'express';
import bodyParser from 'body-parser';
import EmbeddingService from "./webservice/EmbeddingService.js"
import UserService from "./webservice/UserService.js"
import SysConfigService from "./webservice/SysConfigService.js"
import ChatService from "./webservice/ChatService.js"
import LogService from './webservice/LogService.js';
import UploadService from './webservice/uploadService.js';

import LogControl from './utils/LogUtils.js';
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
app.post('/embedded/get', EmbeddingService.get)
app.get('/embedded/waitingCount', EmbeddingService.waitingCount)

app.post('/user/check', UserService.check);
app.post('/user/login', UserService.login);
app.post('/user/changepassword', UserService.changepassword);

app.get('/sys/load', SysConfigService.load);
app.post('/sys/config', SysConfigService.config);

app.post('/chat/list', ChatService.list);
app.post('/chat/chatWithKnowledge', ChatService.chatWithKnowledge);
app.post('/chat/chatDirectly', ChatService.chatDirectly);

app.post('/log/get', LogService.get);

app.post('/file/upload', UploadService.uploadInfo(), UploadService.upload);

app.listen(SysConfigControl.get().port, () => {
    LogControl.Info('Server started on port ' + SysConfigControl.get().port);
});