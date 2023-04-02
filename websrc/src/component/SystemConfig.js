import React from 'react';
import $ from 'jquery';

import {
    Form,
    Input,
    Button,
    Typography,
    InputNumber,
    Popover
} from 'antd';

import {
    KeyOutlined,
    IdcardOutlined,
    ExportOutlined,
    InfoCircleOutlined
} from '@ant-design/icons'

export class SystemConfig extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.formRef = React.createRef();
        this.state = {
            config: {
                orgid: "",
                apikey: "",
                port: 8009
            }
        }
    }

    onFinish = (values) => {
        var json = { "orgid": values.orgid, "apikey": values.apikey, "port": values.port };
        $.ajax({
            type: "post",
            url: "sys/config",
            contentType: "application/json",
            async: false,
            data: JSON.stringify(json),
            success: function (data, status) {
                if (data.result != 0) {
                    console.log("changepassword ajax failed " + data.result);
                }
            }
        })
    }

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    reload_config() {
        var config = null;
        $.ajax({
            type: "get",
            url: "sys/load",
            async: false,
            contentType: "application/json",
            success: (data, status) => {
                if (status == "success") {
                    if (data.result == 0) {
                        config = data.data;
                    } else {
                        console.log("sys/load failed");
                    }
                }
            }
        });

        if (config != null) {
            this.setState({ config: config });
        }

        return config;
    }

    componentWillMount() {
        this.reload_config();
    }

    render() {
        return (
            <div style={{ width: "100%", height: "100%" }}>
                <div style={{ width: "500px", marginLeft: "20px" }}>
                    <Typography.Title level={3}>系统设置</Typography.Title>
                    <Form name="sysconfig"
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        ref={this.formRef}
                        style={{ marginTop: '20px' }}
                        layout="vertical"
                        initialValues={this.state.config}>
                        <Form.Item
                            label="OpenAI 组织ID"
                            name="orgid"
                            rules={[{ required: true, message: '请输入组织ID!' }]}>
                            <Input prefix={<IdcardOutlined />} placeholder="请输入组织id" suffix={
                                <Popover content={<Typography.Link herf="https://platform.openai.com/account/api-keys">点击以获取你的组织ID</Typography.Link>}>
                                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                </Popover>
                            } />
                        </Form.Item>
                        <Form.Item
                            label="OpenAI APIKey"
                            name="apikey"
                            rules={[{ required: true, messcontentage: '请输入APIKey!' }]}>
                            <Input prefix={<KeyOutlined />} placeholder="请输入APIKey" suffix={
                                <Popover content={<Typography.Link herf="https://platform.openai.com/account/api-keys">点击以获取你的APIKEY</Typography.Link>}>
                                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                </Popover>
                            } />
                        </Form.Item>
                        <Form.Item
                            label="网站端口"
                            name="port"
                            rules={[{ required: true, message: '请输入端口号!' }]}>
                            <InputNumber prefix={<ExportOutlined />} style={{ width: '100%' }} placeholder="请输入端口号"/>
                        </Form.Item>
                        <Form.Item style={{ marginTop: '20px' }}>
                            <Button type="primary" htmlType="submit">确认</Button>
                        </Form.Item>
                    </Form>
                </div>
            </div >
        );
    }
}