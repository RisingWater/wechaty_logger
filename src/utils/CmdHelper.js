const cmdprocesslist = [];

class CmdHelper {
    static registerCmd = function(keyword, callback) {
        var cmdprocess = {
            keyword:keyword,
            callback:callback
        };

        cmdprocesslist.push(cmdprocess);
    }

    static isValidCmd = function(keyword) {
        var process = null;
        cmdprocesslist.some((element)=>{
            if (element.keyword === keyword) {
                process = element;
                return true;
            }
        })

        return process != null;
    }

    static ProcessCmd = function(keyword, msg, message, bot) {
        var process = null;
        cmdprocesslist.some((element)=>{
            if (element.keyword === keyword) {
                element.callback(msg, message, bot);
                return true;
            }
        })

        return process != null;
    }
}

export default CmdHelper;