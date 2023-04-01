import UserControl from "../db/UserControl.js";

class UserService {
    static check = function (req, res) {
        var user = null;
        var result = {
            result: -1,
            userid: req.body.userid,
            username: "",
            isAdmin: false
        }

        user = UserControl.find_byuserid(req.body.userid);

        if (user != null) {
            result.result = 0;
            result.username = user.username;
            result.isAdmin = user.isAdmin;
        }

        res.send(result);
    }

    static login = function (req, res) {
        var result = {
            result: -1,
            userid: "",
        }

        var user = UserControl.find_byusernameandpassword(req.body.username, req.body.password);

        if (user != null) {
            result.result = 0;
            result.userid = user.userid;
        }

        res.send(result);
    }

    static changepassword = function (req, res) {
        var user = null;
        var result = {
            result: -1
        }

        user = UserControl.find_byuserid(req.body.userid);

        if (user != null) {
            if (user.password == req.body.password) {
                user.password = req.body.password_new;
                UserControl.update(user);
                result.result = 0;
            }
        }

        res.send(result);
    }


    static register = function (req, res) {
        var result = {
            result: -1,
            userid: "",
            username: "",
            isAdmin: false
        }

        var user = UserControl.find_byusername(req.body.username);

        if (user == null) {
            var new_user = {
                "userid": uuid.v1(),
                "username": req.body.username,
                "password": req.body.password,
                "isAdmin": false
            }

            UserControl.add(new_user);

            result.result = 0;
            result.userid = new_user.userid;
            result.username = new_user.username;
            result.isAdmin = new_user.isAdmin;
        }

        res.send(result);
    }
}

export default UserService