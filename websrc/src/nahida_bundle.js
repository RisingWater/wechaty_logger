import React from 'react';
import ReactDOM from 'react-dom';
import { Layout, Menu } from 'antd';
import { DatabaseOutlined, AppstoreOutlined, UnorderedListOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import $ from 'jquery';

import { HeaderBar } from './component/HeaderBar.js'
import { KnowledgeList } from './component/KnowledgeList.js'

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
    getItem('系统管理', 'sys', <AppstoreOutlined />)
];

class RootContext extends React.Component {
    constructor(props) {
        super(props);
        this.HeaderRef = React.createRef();
        this.state = {
            ContextHeight: 0,
            menuSelectedkey: "nahida"
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
        } if (this.state.menuSelectedkey == "question") {
            return (<QuestionTest />);
        } else {
            return (<div></div>);
        }
    }

    render() {
        return (
            <Layout>
                <div ref={this.HeaderRef}>
                    <HeaderBar />
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