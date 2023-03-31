import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect("index.html");
});

app.listen(8009, () => {
    console.log('Server started on port 80');
});