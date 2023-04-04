import xml2js from "xml2js"
import LogControl from "./LogUtils.js";

class RecordHelper {
    static RecordChatLog = function(chatlog, callback) {
        xml2js.parseString(chatlog, (err, result) => {
            if (err == null) {
                result.msg.appmsg.some((element) => {
                    element.recorditem.some((record) => {
                        xml2js.parseString(record, (err, record2) => {
                            if (err == null) {
                                record2.recordinfo.datalist.some((data) => {
                                    data.dataitem.some((item) => {
                                        if (item.datadesc != undefined && item.datadesc != null) {
                                            callback(item.sourcename[0], item.datadesc[0], item.sourcetime[0]);
                                        }
                                    })
                                })
                            } else {
                                LogControl.Error("RecordChatLog failed " + JSON.stringify(err, null, 4));
                            }
                        })
                    })
                });
            } else {
                LogControl.Error("RecordChatLog failed " + JSON.stringify(err, null, 4));
            }
        });
    }
}

export default RecordHelper;