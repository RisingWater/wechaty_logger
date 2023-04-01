import DBController from "./DBController.js";

class UserControl {
    static list = function () {
        return DBController.LoadUserDB();
    }

    static add = function (user) {
        var users = DBController.LoadUserDB();
        const newUsers = [...users, user];
        DBController.SaveUserDB(newUsers);
    }

    static update = function (user) {
        var users = DBController.LoadUserDB();
        users.some(element => {
            if (element.userid == user.userid) {
                element.username = user.username;
                element.password = user.password;
                element.isAdmin = user.isAdmin;
                return true;
            }
        });
        DBController.SaveUserDB(users);
    }

    static find_byusernameandpassword = function (username, password) {
        var user = null;
        DBController.LoadUserDB().some(element => {
            if (element.username == username
                && element.password == password) {
                user = element;
                return true;
            }
        });

        return user;
    }

    static find_byusername = function (username) {
        var user = null;
        DBController.LoadUserDB().some(element => {
            if (element.username == username) {
                user = element;
                return true;
            }
        });

        return user;
    }

    static find_byuserid = function (userid) {
        var user = null;
        DBController.LoadUserDB().some(element => {
            if (element.userid == userid) {
                user = element;
                return true;
            }
        });

        return user;
    }
}

export default UserControl
