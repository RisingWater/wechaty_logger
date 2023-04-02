import React from 'react';
import $ from 'jquery';

import {
    Form,
    Input,
    Button,
    Typography,
    Alert
} from 'antd';

import {
    LockOutlined
} from '@ant-design/icons'

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    return (arr = document.cookie.match(reg)) ? unescape(arr[2]) : null;
}

export class ChangePassword extends React.Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            userid: "",
            hideAlert: true,
            configResult: 0
        };
    }

    componentWillMount() {
        var userid = getCookie("userid");
        this.setState({
            userid: userid
        });
    }

    onFinish = (values) => {
        var json = { "userid": this.state.userid, "password": values.password, "password_new": values.password_new };

        $.ajax({
            type: "post",
            url: "user/changepassword",
            contentType: "application/json",
            async: false,
            data: JSON.stringify(json),
            success: (data, status) => {
                this.setState({
                    hideAlert: false,
                    configResult: data.result
                });
            }
        })
    }

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    validatorNew = (rule, value, callback) => {
        if (value && value !== this.formRef.current.getFieldValue('password_new')) {
            callback('两次输入的密码不匹配!');
        } else {
            callback();
        }
    };

    getAlert() {
        if (!this.state.hideAlert) {
            if (this.state.configResult == 0) {
                return (<div style={{ marginBottom: 20 }}><Alert message={"修改密码成功"} type="success" showIcon closable /></div>);
            } else {
                return (<div style={{ marginBottom: 20 }}><Alert message={"修改密码失败，错误代码" + this.state.configResult} type="error" showIcon closable /></div>);
            }
        }
        else {
            return (<div />);
        }
    }

    render() {
        return (
            <div style={{ width: "100%", height: "100%" }}>
                <Typography.Title level={3}>修改密码</Typography.Title>
                {this.getAlert()}
                <div style={{ width: "300px", marginLeft: "20px" }}>
                    <Form name="changepassword"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        ref={this.formRef}
                        style={{ marginTop: '20px' }}>
                        <Form.Item name="password" rules={[{ required: true, message: '请输入原密码!' }]}>
                            <Input.Password prefix={<LockOutlined />} placeholder="请输入原密码" />
                        </Form.Item>
                        <Form.Item
                            name="password_new"
                            rules={[{ required: true, message: '请输入新密码!' }]}>
                            <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
                        </Form.Item>
                        <Form.Item
                            name="confirm_new"
                            rules={[
                                { required: true, message: '请再次输入新密码!' },
                                { validator: this.validatorNew }
                            ]}>
                            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入新密码" />
                        </Form.Item>
                        <Form.Item style={{ marginTop: '20px' }}>
                            <Button type="primary" htmlType="submit">修改</Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        );
    }
}