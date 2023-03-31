import express from 'express';
import bodyParser from 'body-parser';
import EmbeddedControl from "./db/EmbeddedControl.js"
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect("index.html");
});

app.get('/embedded/list', (req, res) => {
    var result = { 
        result : 0,
        data : EmbeddedControl.ListEmbeddedInfo()
    };

    res.send(result);
})

app.listen(8009, () => {
    console.log('Server started on port 80');
});