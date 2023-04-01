import React from 'react';
import ReactDOM from 'react-dom';
import { Layout, Alert, Form, Input, Button, Typography } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import $ from 'jquery';

function setCookie(name, value) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

class LoginForm extends React.Component {
    onFinish = (values) => {
        var json = { "username": values.username, "password": values.password };
        var userid = null;
        $.ajax({
            type: "post",
            url: "/user/login",
            contentType: "application/json",
            async: false,
            data: JSON.stringify(json),
            success: function (data, status) {
                if (data.result == 0) {
                    userid = data.userid;
                } else {
                    console.log("user/login ajax failed");
                }
            }
        })

        if (userid == null) {
            this.props.showError(true);
            return;
        }

        setCookie("userid", userid);
        window.location.href = "./index.html";
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    guestLogin() {
        setCookie("userid", "guest");
        window.location.href = "./index.html";
    }

    render() {
        return (
            <Form
                name="basic"
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
                style={{ marginTop: '20px' }}>
                <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]} style={{ marginBottom: '16px' }}>
                    <Input prefix={<MailOutlined style={{ width: '24px' }} />} placeholder="请输入用户名" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]} style={{ marginBottom: '16px' }}>
                    <Input.Password prefix={<LockOutlined style={{ width: '24px' }} />} placeholder="请输入密码" />
                </Form.Item>
                <Form.Item style={{ marginBottom: '16px' }}>
                    <Button type="primary" htmlType="submit" block>登录</Button>
                </Form.Item>
            </Form>
        );
    }
}

class RootContext extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.HeaderRef = React.createRef();

        this.state = {
            ContextHeight: 0,
            showError: false
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

    showError(on) {
        this.setState({ showError: on });
    }

    getAlert() {
        if (this.state.showError) {
            return (<div style={{ marginBottom: 20 }}><Alert message={"登录失败，请检查用户名和密码"} type="error" showIcon closable /></div>);
        }
        else {
            return (<div />);
        }
    }

    render() {
        return (
            <Layout style={{ display: 'flex', flexDirection: 'column' }}>
                <div ref={this.HeaderRef} >
                    <Layout.Header>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ color: 'white' }}  >Nahida知识库管理系统</div>
                        </div>
                    </Layout.Header>
                </div>
                <Layout.Content style={{ flex: '1 0 auto', padding: 24, margin: 0, width: "100%", height: this.state.ContextHeight }}>
                    <div style={{ width: "100%", height: "100%" }}>
                        <div style={{ width: "300px", margin: "auto" }}>
                            <Typography.Title>登录</Typography.Title>
                            {this.getAlert()}
                            <LoginForm showError={this.showError.bind(this)} />
                        </div>
                    </div>
                </Layout.Content>
            </Layout>
        );
    }
}

ReactDOM.render(
    <RootContext />,
    document.getElementById("root")
);