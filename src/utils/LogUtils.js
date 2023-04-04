import SysConfigControl from "../db/SysConfigControl.js"
import DBController from "../db/DBController.js";

const toConst = true;
const prefix = "[nahidaLog]"

function formatDate() {
    var date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

class LogControl {
    static Error = function (string) {
        var level = SysConfigControl.get().loglevel;
        var date = formatDate();
        if (level > 0) {
            var time = new Date().toLocaleString();
            DBController.AppendLog(date, prefix + "[ERROR][" + time + "] " + string + "\n");
        }

        if (toConst) {
            console.log(string);
        }
    }

    static Info = function (string) {
        var level = SysConfigControl.get().loglevel;
        var date = formatDate();
        if (level > 0) {
            var time = new Date().toLocaleString();
            DBController.AppendLog(date, prefix + "[INFO][" + time + "] " + string + "\n");
        }

        if (toConst) {
            console.log(string);
        }
    }

    static Trace = function (string) {
        var level = SysConfigControl.get().loglevel;
        var date = formatDate();
        if (level > 0) {
            var time = new Date().toLocaleString();
            DBController.AppendLog(date, prefix + "[TRACE][" + time + "] " + string + "\n");
        }

        if (toConst) {
            console.log(string);
        }
    }

    static LoadDateLog = function (date, loglevel) {
        var loglist = [];
        var rawlog = DBController.LoadLog(date);

        if (rawlog == null) {
            return null;
        }

        rawlog.split('[nahidaLog]').some((log) => {
            const regex = /\[(.*?)\]\[(.*?)\]\s(.*)/s;
            const match = log.match(regex);

            if (match) {
                var loginfo = {
                    level: match[1],
                    time: match[2],
                    content: match[3]
                };

                console.log(loginfo.content);

                if (loglevel == 1 && loginfo.level == "ERROR") {
                    loglist.push(loginfo);
                } else if (loglevel == 2 && (loginfo.level == "ERROR" || loginfo.level == "INFO")){
                    loglist.push(loginfo);
                } else if (loglevel == 3) {
                    loglist.push(loginfo);
                }
            };
        })

        loglist.reverse();

        return loglist;
    }
}

export default LogControl