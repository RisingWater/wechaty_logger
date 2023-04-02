import SysConfigControl from "../db/SysConfigControl.js";
import LogControl from "../utils/LogUtils.js";

class SysConfigService {
    static load = function (req, res) {
        var result = { 
            result : 0,
            data : SysConfigControl.get()
        };

        LogControl.Trace("SysConfigService load result:\n" + JSON.stringify(result, null, 4));
    
        res.send(result);
    }

    static config = function (req, res) {
        var result = {
            result : 0
        }

        var config = {
            orgid : req.body.orgid,
            apikey : req.body.apikey,
            port : req.body.port,
            loglevel : req.body.loglevel
        }

        LogControl.Trace("SysConfigService config:\n" + JSON.stringify(config, null, 4));

        SysConfigControl.set(config);

        res.send(result);
    }
}

export default SysConfigService