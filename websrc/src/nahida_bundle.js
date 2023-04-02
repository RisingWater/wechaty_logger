import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import { 
    Layout,
    Menu
} from 'antd';

import {
    DatabaseOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    QuestionCircleOutlined,
    LockOutlined,
    SettingOutlined,
    RobotOutlined,
    WechatOutlined,
    SolutionOutlined
} from '@ant-design/icons';


import { HeaderBar } from './component/HeaderBar.js'
import { KnowledgeList } from './component/KnowledgeList.js'
import { ChangePassword } from './component/ChangePassword.js';
import { SystemConfig } from './component/SystemConfig.js';
import { QuestionTest } from './component/QuestionTest.js';

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    return (arr = document.cookie.match(reg)) ? unescape(arr[2]) : null;
}

function getItem(label, key, icon, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
    };
}

const items = [
    getItem('知识库管理', 'sub1', <DatabaseOutlined />, [
        getItem('知识列表', 'nahida', <UnorderedListOutlined />),
        getItem('测试知识库', 'question', <QuestionCircleOutlined />)
    ]),
    getItem('微信机器人', 'sub2', <RobotOutlined />, [
        getItem('微信设置', 'wechat_setting', <WechatOutlined />),
        getItem('聊天记录', 'chatlog', <SolutionOutlined />)
    ]),
    getItem('系统管理', 'sub3', <AppstoreOutlined />, [
        getItem('系统设置', 'sysconfig', <SettingOutlined />),
        getItem('修改密码', 'changepassword', <LockOutlined />),
    ])
];

class RootContext extends React.Component {
    constructor(props) {
        super(props);
        this.HeaderRef = React.createRef();
        this.state = {
            ContextHeight: 0,
            menuSelectedkey: "nahida",
            user: {
                result: -1,
                userid: "",
                username: "",
                isAdmin: false
            }
        }
    }

    reload_user() {
        var userid = getCookie("userid");
        var user = null;

        if (userid == null) {
            return null;
        }

        var json = JSON.stringify({
            userid: userid,
        })

        $.ajax({
            type: "post",
            url: "/user/check",
            contentType: "application/json",
            data: json,
            async: false,
            success: (data, status) => {
                if (status == "success") {
                    if (data.result == 0) {
                        user = data;
                    } else {
                        console.log("user/check failed");
                    }
                }
            }
        });

        if (user != null) {
            this.setState({ user: user });
            if (user.username == "guest") {
                this.setState({ guest: true });
            } else {
                this.setState({ guest: false });
            }
        }

        return user;
    }

    componentWillMount() {
        var user = this.reload_user();

        if (user == null) {
            window.location.href = "./user_operation.html?op=login"
        }
    }

    componentDidMount() {
        var HeaderHeight = this.HeaderRef.current.offsetHeight;
        var WindowHeight = $(window).height();
        var ContextHeight = WindowHeight - HeaderHeight;

        this.setState({
            ContextHeight: ContextHeight,
        })
    }

    onMenuSelectChange(object) {
        var state = { menuSelectedkey: object.key };
        console.log(state);
        this.setState(state);
    }

    getTable() {
        if (this.state.menuSelectedkey == "nahida") {
            return (<KnowledgeList />);
        } else if (this.state.menuSelectedkey == "question") {
            return (<QuestionTest />);
        } else if (this.state.menuSelectedkey == "changepassword") {
            return (<ChangePassword />);
        } else if (this.state.menuSelectedkey == "sysconfig") {
            return (<SystemConfig />);
        } else {
            return (<div></div>);
        }
    }

    render() {
        return (
            <Layout>
                <div ref={this.HeaderRef}>
                    <HeaderBar user={this.state.user} />
                </div>
                <Layout>
                    <Layout.Sider>
                        <Menu
                            theme="dark"
                            defaultSelectedKeys={['nahida']}
                            mode="inline"
                            defaultOpenKeys={['sub1']}
                            items={items}
                            onClick={this.onMenuSelectChange.bind(this)}>
                        </Menu>
                    </Layout.Sider>
                    <Layout>
                        <Layout.Content style={{ background: '#fff', paddingLeft: 24, paddingRight: 24, margin: 0, minHeight: this.state.ContextHeight, }}>
                            {this.getTable()}
                        </Layout.Content>
                    </Layout>
                </Layout>
            </Layout>
        );
    }
}

ReactDOM.render(
    <RootContext />,
    document.getElementById("root")
);