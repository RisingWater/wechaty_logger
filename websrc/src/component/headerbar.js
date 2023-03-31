import React from 'react';
import { Layout } from 'antd';

export class HeaderBar extends React.Component {
    render() {
        return (
            <Layout.Header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'white' }}  >Nahida知识库管理系统</div>
                </div>
            </Layout.Header>
        )
    }
}