import DBController from "./DBController.js";
import crypto from "crypto";
import cosineSimilarity from 'cosine-similarity';
import { v4 as uuid } from 'uuid';

function md5(str) {
    const hash = crypto.createHash('md5');
    hash.update(str);
    return hash.digest('hex');
}

class EmbeddedControl {
    static ListEmbedded = function () {
        return DBController.LoadEmbeddedDB();
    }

    static ListEmbeddedInfo = function () {
        var Infolist = [];
        var list = DBController.LoadEmbeddedDB();
        list.some((element) => {
            var info = {
                id: element.id,
                embeddingTime : element.embeddingTime,
                summary: element.summary,
                content: element.content,
            }

            Infolist.push(info);
        })

        return Infolist;
    }

    static DeleteEmbedded = function (id) {
        var list = DBController.LoadEmbeddedDB();
        var newlist = list.filter((element) => {
            if (element.id != id) {
                return true;
            }
            return false;
        })

        DBController.SaveEmbeddedDB(newlist);
        return;
    }

    static UpdateEmbedded = function (id, summary, content, Embedded) {
        var list = DBController.LoadEmbeddedDB();
        list.some((element) => {
            if (element.id == id) {
                var md5sum = md5(content);
                element.summary = summary;
                element.md5sum = md5sum;
                element.content = content;
                element.embedding = Embedded;
                element.embeddingTime = new Date().toLocaleString()
                return true;
            }
        })
        DBController.SaveEmbeddedDB(list);
    }

    static FindEmbedded = function (content) {
        var found = false;
        var list = DBController.LoadEmbeddedDB();
        list.some((element) => {
            var md5sum = md5(content);
            if (element.md5sum === md5sum) {
                found = true;
                return true;
            }
        })

        return found;
    }

    static FindEmbeddedById = function (id) {
        var embedded = null;
        var list = DBController.LoadEmbeddedDB();
        list.some((element) => {
            if (element.id == id) {
                embedded = element;
                return true;
            }
        })

        return embedded;
    }

    static AddEmbedded = function (content, Embedded, summary) {
        var list = DBController.LoadEmbeddedDB();
        var embedded = {
            id: uuid(),
            embeddingTime : new Date().toLocaleString(),
            summary: summary,
            embedding: Embedded,
            content: content,
            md5sum: md5(content)
        };
        list.push(embedded);
        DBController.SaveEmbeddedDB(list);

        return embedded.md5sum;
    }

    static FindClosestFragment = function(questionEmbedding, count) {
        var items = [];
        var list = DBController.LoadEmbeddedDB();
    
        list.some((element)=> {
            var currentEmbedding = element.embedding;
    
            items.push({
                id:element.id,
                content: element.content,
                score: cosineSimilarity(questionEmbedding, currentEmbedding),
            });
        });
    
        items.sort(function (a, b) {
            return b.score - a.score;
        });
    
        return items.filter((element)=>{
            if (element.score > 0.76) {
                return true;
            } else {
                return false;
            }
        }).slice(0, count);
    };
}

export default EmbeddedControl;