import React from 'react';
import $ from 'jquery';
import { v4 as uuid } from 'uuid';

import {
    List,
    Avatar,
    Input,
    Button,
    Space,
    Card,
    Typography,
    Collapse
}
    from 'antd';


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

    GetRefsData(id) {
        var result = null;
        var json = JSON.stringify({
            id: id,
        })

        $.ajax({
            type: "post",
            url: "/embedded/get",
            contentType: "application/json",
            async: false,
            data: json,
            success: (data, status) => {
                if (status == "success") {
                    result = data.data;
                } else {
                    console.log("/chat/show_all ajax failed");
                }
            }
        });

        return result;
    }

    componentDidMount() {
        this.RefreshDataSource(this.props.chatid);
    }

    componentDidUpdate() {
        const chatWindow = this.chatWindowRef.current;
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    getRefs = (item) => {
        if (item.refs.length == 0) {
            return (<div></div>);
        } else {
            return (
                <Collapse>
                    {
                        item.refs.map((element) => {
                            var val = this.GetRefsData(element.id);
                            return (
                                <Collapse.Panel header={val.summary}>
                                    {
                                        val.content.split("\n").map((line) => {
                                            return (
                                                <Typography.Paragraph>{line}</Typography.Paragraph>
                                            );
                                        })
                                    }
                                </Collapse.Panel>
                            )
                        })
                    }
                </Collapse>
            );
        }
    }

    getChatItem = (item) => {
        if (item.role == 0) {
            return (
                <div style={{ width: "100%", textAlign: "right" }}>
                    <Space align="start" style={{ marginRight: "30px" }}>
                        <Card style={{ background: "#1AAD19" }} size="small">
                            <Space direction="vertical" size="small">
                                {
                                    item.content.split("\n").map((line) => {
                                        return (
                                            <Typography.Paragraph style={{ fontSize: 16, color: 'white' }}>{line}</Typography.Paragraph>
                                        );
                                    })
                                }
                                <div style={{ fontSize: 10, color: 'white' }}>{item.time}</div>
                            </Space>
                        </Card>
                        <Avatar src={this.state.humanAvatar} />
                    </Space>
                </div >
            )
        } else {
            return (
                <div style={{ width: "100%", textAlign: "left" }}>
                    <Space align="start" style={{ marginLeft: "30px" }}>
                        <Avatar src={this.state.AIAvatar} />
                        <Card style={{ background: "#F2F2F2", maxWidth: "60%" }} size="small">
                            <Space direction="vertical" size="small">
                                {
                                    item.content.split("\n").map((line) => {
                                        return (
                                            <Typography.Text style={{ fontSize: 16 }}>{line}</Typography.Text>
                                        );
                                    })
                                }
                                <Collapse ghost expandIconPosition='end'>
                                    <Collapse.Panel header={"详细信息"} key="1">
                                        <p>{"此回答消耗Token " + item.token_used + "个" + (item.refs.length != 0 ? ("，并参考下列" + item.refs.length + "份资料") : "")}</p>
                                        {this.getRefs(item)}
                                    </Collapse.Panel>
                                </Collapse>
                            </Space>
                        </Card>
                    </Space>
                </div>
            )
        }
    }

    render() {
        return (
            <div ref={this.chatWindowRef} style={{ maxHeight: this.props.contentHeight, minHeight: this.props.contentHeight, width: "100%", overflowY: 'auto' }}>
                <List
                    itemLayout="horizontal"
                    dataSource={this.state.dataSource}
                    renderItem={item => (
                        <List.Item>
                            {this.getChatItem(item)}
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

    onChatBoxClick = () => {
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

    onChatBoxClear = () => {
        this.props.onClearChatLog();
    }

    handleInputChange = (event) => {
        this.setState({ inputValue: event.target.value });
    }

    render() {
        return (
            <Space.Compact style={{ width: '100%' }}>
                <Input placeholder="输入你的问题"
                    value={this.state.inputValue}
                    onChange={this.handleInputChange}
                    onPressEnter={this.onChatBoxClick}
                    disabled={this.state.isChatDisabled} />
                <Button type="primary"
                    onClick={this.onChatBoxClick}
                    loading={this.state.isChatDisabled}>提问</Button>
                <Button
                    onClick={this.onChatBoxClear}
                    disabled={this.state.isChatDisabled}>清除记录</Button>
            </Space.Compact>
        )
    }
}

export class QuestionTest extends React.Component {
    constructor(props) {
        super(props);

        this.ChatWindoRef = React.createRef();
        this.ChatBoxRef = React.createRef();

        this.state = {
            chatid: "",
            ChatWindowHeight: 0
        }
    }

    componentWillMount() {
        this.setState({
            chatid: uuid()
        })
    }

    componentDidMount() {
        var ChatWindowHeight = this.props.contentHeight - this.ChatBoxRef.current.offsetHeight * 2 - 16;

        this.setState({
            ChatWindowHeight: ChatWindowHeight,
        })
    }

    onChatBoxSubmit = () => {
        this.ChatWindoRef.current.RefreshDataSource(this.state.chatid);
    }

    onChatBoxClear = () => {
        this.setState({
            chatid: uuid()
        }, () => {
            this.ChatWindoRef.current.RefreshDataSource(this.state.chatid);
        });

    }

    render() {
        return (
            <div>
                <div>
                    <ChatWindow ref={this.ChatWindoRef} chatid={this.state.chatid} contentHeight={this.state.ChatWindowHeight} />
                </div>
                <div ref={this.ChatBoxRef} style={{ marginTop: 16, marginBottom: 16 }}>
                    <ChatBox chatid={this.state.chatid} onSubmit={this.onChatBoxSubmit} onClear={this.onChatBoxClear} />
                </div>
            </div>
        )
    }
}
