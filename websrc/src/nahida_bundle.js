import React from 'react';
import ReactDOM from 'react-dom';
import { Layout, Menu } from 'antd';
import { HeaderBar } from './component/headerbar.js'
import $ from 'jquery';

import { DatabaseOutlined, AppstoreOutlined } from '@ant-design/icons';

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
    getItem('知识库管理', 'nahida', <DatabaseOutlined />),
    getItem('系统管理', 'sys', <AppstoreOutlined />)
];

class RootContext extends React.Component {
    constructor(props) {
        super(props);
        this.HeaderRef = React.createRef();
        this.state = {
            ContextHeight: 0,
            menuSelectedkey: "nahidaLib"
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

    onMenuSelectChange(object)
    {
        var state = {menuSelectedkey : object.key};
        console.log(state);
        this.setState(state);
    }

    getTable() {
        if (this.state.menuSelectedkey == "nahidaLib") {
            return (<PublishPage user={this.state.user} reload_user={this.reload_user.bind(this)}/>)
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
                            items={items}
                            onClick={this.onMenuSelectChange.bind(this)}>
                        </Menu>
                    </Layout.Sider>
                    <Layout>
                        <Layout.Content style={{ background: '#fff', paddingLeft: 24, paddingRight: 24, margin: 0, minHeight: this.state.ContextHeight, }}>
                            <div>hello world</div>
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