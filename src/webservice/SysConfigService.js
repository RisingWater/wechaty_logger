import SysConfigControl from "../db/SysConfigControl.js";

class SysConfigService {
    static load = function (req, res) {
        var result = { 
            result : 0,
            data : SysConfigControl.get()
        };
    
        res.send(result);
    }

    static config = function (req, res) {
        var result = {
            result : 0
        }

        var config = {
            orgid : req.body.orgid,
            apikey : req.body.apikey,
            port : req.body.port
        }

        SysConfigControl.set(config);

        res.send(result);
    }
}

export default SysConfigService