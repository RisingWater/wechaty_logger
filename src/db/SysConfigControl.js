import DBController from "./DBController.js";

class SysConfigControl {
    static get = function () {
        return DBController.LoadSysConfigDB();
    }

    static set = function (config) {
        DBController.SaveSysConfigDB(config);
    }
}

export default SysConfigControl
