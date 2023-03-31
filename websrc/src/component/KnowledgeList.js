import React from 'react';
import { Table, Button, Popconfirm, Input, Pagination, Collapse, Typography, Space } from 'antd';
import { DeleteOutlined, SearchOutlined, RedoOutlined, EditOutlined, PlusCircleOutlined, FileAddOutlined } from '@ant-design/icons'
import $ from 'jquery';

export class KnowledgeList extends React.Component {
    constructor(props) {
        super(props);
        this.SearchInput = React.createRef();
        this.state = {
            dataSource: [],
            searchText: '',
            loading: true
        };
    }

    getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={this.SearchInput}
                    placeholder={`搜索知识内容`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button type="primary" onClick={() => this.handleSearch(selectedKeys, confirm)} icon={<SearchOutlined />} style={{ width: 90, marginRight: 8 }}>
                        搜索
                    </Button>
                    <Button onClick={() => clearFilters && this.handleReset(clearFilters)} icon={<RedoOutlined />} style={{ width: 90 }}>
                        重置
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
    });

    handleSearch = (selectedKeys, confirm) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0]
        });
    };

    handleReset = (clearFilters) => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    getPagination() {
        return (
            <Pagination size="small" defaultPageSize="30" showQuickJumper />
        )
    }

    getColumns() {
        return (
            [
                {
                    title: '生成时间',
                    dataIndex: 'embeddingTime',
                    key: 'embeddingTime',
                    width: 150
                },
                {
                    title: '内容',
                    key: 'summary',
                    render: (text, record, index) => (
                        <Collapse>
                            <Collapse.Panel header={record.summary} key="1">
                                {
                                    record.content.split("\n").map((line) => {
                                        return (
                                            <Typography.Paragraph>{line}</Typography.Paragraph>
                                        );
                                    })
                                }
                            </Collapse.Panel>
                        </Collapse>
                    ),
                    ...this.getColumnSearchProps('content'),
                },
                {
                    title: '操作',
                    key: 'action',
                    render: (text, record, index) => (
                        <span>
                            <Button type="primary" icon={<EditOutlined />} style={{ marginRight: 8 }}>编辑</Button>
                            <Popconfirm title="确认删除" onConfirm={() => this.DeleteData(record.id)}>
                                <Button danger type="primary" icon={<DeleteOutlined />}>删除</Button>
                            </Popconfirm>
                        </span>
                    ),
                    width: 200
                },
            ]
        );
    }

    RefreshData() {
        $.ajax({
            type: "get",
            url: "embedded/list",
            contentType: "application/json",
            success: (data, status) => {
                if (status == "success") {
                    this.setState({ loading: false });
                    if (data.result == 0) {
                        this.setState({ dataSource: data.data });
                    } else {
                        console.log("get embedded/list failed");
                    }
                }
            }
        });
    }

    DeleteData(key) {
        var json = { "id": key };
        this.setState({ loading: true });
        $.ajax({
            type: "post",
            url: "embedded/del",
            contentType: "application/json",
            data: JSON.stringify(json),
            success: (data, status) => {
                if (status == "success") {
                    this.RefreshData();
                }
            }
        });
    };

    componentDidMount() {
        this.RefreshData();
    }

    render() {
        console.log("KnowledgeList");
        return (
            <div>
                <Space style={{ marginTop: 16, marginBottom: 16}}>
                    <Button type="primary" icon={<PlusCircleOutlined />} style={{marginRight: 8 }}>添加知识</Button>
                    <Button icon={<FileAddOutlined />} style={{marginRight: 8 }}>导入文件</Button>
                </Space>
                <Table
                    size="middle"
                    columns={this.getColumns()}
                    dataSource={this.state.dataSource}
                    pagination={{ size: "default", position: "both", defaultPageSize: 20, showQuickJumper: true }}
                    loading={this.state.loading}>
                </Table>
            </div>
        );
    }
}