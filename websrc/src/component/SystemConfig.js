import React from 'react';
import $ from 'jquery';

import {
    Form,
    Input,
    Button,
    Typography,
    InputNumber,
    Popover,
    Select,
    Alert
} from 'antd';

import {
    KeyOutlined,
    IdcardOutlined,
    ExportOutlined,
    InfoCircleOutlined
} from '@ant-design/icons'

export class SystemConfig extends React.Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            hideAlert: true,
            configResult: 0,
            config: {
                orgid: "",
                apikey: "",
                port: 8009,
                loglevel: 0
            }
        }
    }

    onFinish = (values) => {
        var json = { "orgid": values.orgid, "apikey": values.apikey, "port": values.port, "loglevel": values.loglevel };
        $.ajax({
            type: "post",
            url: "sys/config",
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

    reload_config() {
        $.ajax({
            type: "get",
            url: "sys/load",
            async: false,
            contentType: "application/json",
            success: (data, status) => {
                if (data.result == 0) {
                    this.setState({ config: data.data });
                }
            }
        });
    }

    componentWillMount() {
        this.reload_config();
    }

    getAlert() {
        if (!this.state.hideAlert) {
            if (this.state.configResult === 0) {
                return (<div style={{ marginBottom: 20 }}><Alert message={"修改设置成功"} type="success" showIcon closable /></div>);
            } else {
                return (<div style={{ marginBottom: 20 }}><Alert message={"修改设置失败，原始密码错误"} type="error" showIcon closable /></div>);
            }
        }
        else {
            return (<div />);
        }
    }

    render() {
        return (
            <div style={{ width: "100%", height: "100%" }}>
                <Typography.Title level={3}>系统设置</Typography.Title>
                {this.getAlert()}
                <div style={{ width: "500px", marginLeft: "20px" }}>
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
                            rules={[{ required: true, message: '请输入APIKey!' }]}>
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
                            <InputNumber prefix={<ExportOutlined />} style={{ width: '100%' }} placeholder="请输入端口号" />
                        </Form.Item>
                        <Form.Item
                            label="日志等级"
                            name="loglevel">
                            <Select
                                style={{ width: '100%' }}
                                options={[
                                    { value: 0, label: '关闭日志' },
                                    { value: 1, label: '仅记录错误日志' },
                                    { value: 2, label: '仅记录关键日志' },
                                    { value: 3, label: '仅记录所有日志' },
                                ]}
                            />
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