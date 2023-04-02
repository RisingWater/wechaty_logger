import React from 'react';
import { List, Avatar, Input, Button, Space } from 'antd';
import $ from 'jquery';
import { v4 as uuid } from 'uuid';

class ChatWindow extends React.Component {
    constructor(props) {
        super(props);
        this.chatWindowRef = React.createRef();

        this.state = {
            humanAvatar: "./image/human.png",
            AIAvatar: "./image/ai.png",
            dataSource: [],
        }
    }

    RefreshDataSource(chatid) {
        var json = JSON.stringify({
            chatid: chatid,
        })

        $.ajax({
            type: "post",
            url: "/chat/list",
            contentType: "application/json",
            data: json,
            success: (data, status) => {
                if (status == "success") {
                    this.setState({ dataSource: data });
                } else {
                    console.log("/chat/show_all ajax failed");
                }
            }
        });
    }

    componentDidMount() {
        this.RefreshDataSource(this.props.chatid);
    }

    componentDidUpdate() {
        const chatWindow = this.chatWindowRef.current;
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    render() {
        return (
            <div ref={this.chatWindowRef} style={{ maxHeight: this.props.contentHeight, minHeight: this.props.contentHeight, width: "100%", overflowY: 'auto' }}>
                <List
                    itemLayout="horizontal"
                    dataSource={this.state.dataSource}
                    renderItem={item => (
                        <List.Item>
                            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                                <Space>
                                    <Avatar src={item.role == 0 ? this.state.humanAvatar : this.state.AIAvatar} />
                                    <div style={{ fontSize: 20 }}>{item.name}</div>
                                </Space>
                                <div style={{ fontSize: 16, wordWrap: "break-word", whiteSpace: "pre-wrap" }}>{item.content}</div>
                                <div style={{ fontSize: 10 }}>{item.time}</div>
                            </Space>
                        </List.Item>
                    )}
                />
            </div>
        );
    }
}

class ChatBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: "",
            isChatDisabled: false
        };
    }

    onChatBoxClick() {
        this.setState({ isChatDisabled: true }, () => {
            var json = JSON.stringify({ chatid: this.props.chatid, input: this.state.inputValue })

            $.ajax({
                type: "post",
                url: "/chat/chatWithKnowledge",
                contentType: "application/json",
                async: true,
                data: json,
                success: (data, status) => {
                    if (status == "success") {
                        this.setState({ inputValue: "" });
                        this.setState({ isChatDisabled: false })
                        this.props.onSubmit();
                    }
                    else {
                        console.log("/chat/chatWithKnowledge ajax failed");
                    }
                }
            });
            
            setTimeout(() => {
                this.props.onSubmit();
            }, 200);
        });
    }

    onChatBoxClear() {
        this.props.onClearChatLog();
    }

    handleInputChange(event) {
        this.setState({ inputValue: event.target.value });
    }

    render() {
        return (
            <Space.Compact style={{ width: '100%' }}>
                <Input placeholder="输入你的问题"
                    value={this.state.inputValue}
                    onChange={this.handleInputChange.bind(this)}
                    onPressEnter={this.onChatBoxClick.bind(this)}
                    disabled={this.state.isChatDisabled} />
                <Button type="primary"
                    onClick={this.onChatBoxClick.bind(this)}
                    loading={this.state.isChatDisabled}>提问</Button>
                <Button
                    onClick={this.onChatBoxClear.bind(this)}
                    disabled={this.state.isChatDisabled}>清除记录</Button>
            </Space.Compact>
        )
    }
}

export class QuestionTest extends React.Component {
    constructor(props) {
        super(props);

        this.ChatWindoRef = React.createRef();

        this.state = {
            chatid: ""
        }
    }

    componentWillMount() {
        this.setState({
            chatid: uuid()
        })
    }

    onChatBoxSubmit() {
        this.ChatWindoRef.current.RefreshDataSource(this.state.chatid);
    }

    onChatBoxClear() {
        this.setState({
            chatid: uuid()
        }).then(() => {
            this.ChatWindoRef.current.RefreshDataSource(this.state.chatid);
        });

    }

    render() {
        return (
            <div>
                <div style={{ marginTop: 16, marginBottom: 16 }}>
                    <ChatBox chatid={this.state.chatid} onSubmit={this.onChatBoxSubmit.bind(this)} onClear={this.onChatBoxClear.bind(this)} />
                </div>
                <div>
                    <ChatWindow ref={this.ChatWindoRef} chatid={this.state.chatid} />
                </div>
            </div>
        )
    }
}
