import DBController from "./DBController.js";
import crypto from "crypto";

function md5(str) {
    const hash = crypto.createHash('md5');
    hash.update(str);
    return hash.digest('hex');
}

function compareEmbeddings(embedding1, embedding2) {
    var length = Math.min(embedding1.length, embedding2.length);
    var dotprod = 0;

    for (var i = 0; i < length; i++) {
        dotprod += embedding1[i] * embedding2[i];
    }

    return dotprod;
};

class EmbeddedControl {
    static ListEmbedded = function () {
        return DBController.LoadEmbeddedDB();
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

    static AddEmbedded = function (content, Embedded) {
        var list = DBController.LoadEmbeddedDB();
        var embedded = {
            embedding: Embedded,
            content: content,
            created: new Date().getTime(),
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
                fragment: element.content,
                score: compareEmbeddings(questionEmbedding, currentEmbedding),
            });
        });
    
        items.sort(function (a, b) {
            return b.score - a.score;
        });
    
        return items.slice(0, count).map((item) => item.fragment);
    };
}

export default EmbeddedControl;