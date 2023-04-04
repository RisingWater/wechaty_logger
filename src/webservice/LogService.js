import LogControl from "../utils/LogUtils.js"

class LogService {
    static get = function(req, res) {
        var result = {
            result: -1,
            data: null
        }

        var log = LogControl.LoadDateLog(req.body.dateString, req.body.loglevel);

        if (log != null) {
            result.result = 0;
            result.data = log;
        }

        res.send(result);
    }
}

export default LogService