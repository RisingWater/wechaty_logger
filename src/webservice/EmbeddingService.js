import EmbeddedControl from "../db/EmbeddedControl.js";
import AIInterface from "../utils/AIInterface.js";

class EmbeddingService {
    static list = function (req, res) {
        var result = { 
            result : 0,
            data : EmbeddedControl.ListEmbeddedInfo().reverse()
        };
    
        res.send(result);
    }

    static del = function (req, res) {
        EmbeddedControl.DeleteEmbedded(req.body.id);

        var result = { 
            result : 0
        };
    
        res.send(result);
    }

    static add = async function (req, res) {
        var result = await AIInterface.Embedding(req.body.content);
        EmbeddedControl.AddEmbedded(req.body.content, result.message, req.body.summary);

        var result = { 
            result : 0
        };
    
        res.send(result);
    }

    static edit = async function (req, res) {
        var result = await AIInterface.Embedding(req.body.content);
        EmbeddedControl.UpdateEmbedded(req.body.id, req.body.summary, req.body.content, result.message);

        var result = { 
            result : 0
        };
    
        res.send(result);
    }

    static get = function (req, res) {
        var result = { 
            result : -1,
            data : null
        };

        var embedded = EmbeddedControl.FindEmbeddedById(req.body.id);

        if (embedded != null) {
            result.data = embedded;
        }

        res.send(result);
    }
}

export default EmbeddingService;