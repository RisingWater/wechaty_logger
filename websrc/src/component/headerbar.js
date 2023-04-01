import React from 'react';
import { Layout, Tooltip, Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons' 

function clearCookie() {
    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
    if (keys) {
        for (var i = keys.length; i--;) {
            document.cookie = keys[i] + '=0;path=/;expires=' + new Date(0).toUTCString();
            document.cookie = keys[i] + '=0;path=/;domain=' + document.domain + ';expires=' + new Date(0).toUTCString();
        }
    }
}

export class HeaderBar extends React.Component {
    render() {
        return (
            <Layout.Header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'white' }}  >Nahida知识库管理系统</div>
                    <div style={{ height: 64 }}>
                        <Tooltip placement="bottom" title="注销用户">
                            <Button style={{ float: "right", marginTop: 16, marginLeft: 20 }} ghost={true} icon={<LogoutOutlined />} onClick={() => {
                                clearCookie();
                                window.location.href = "./user_operation.html?op=login";
                            }} />
                        </Tooltip>
                        <div style={{ float: "right", color: 'white' }}>{this.props.user.username}</div>
                    </div>
                </div>
            </Layout.Header>
        )
    }
}