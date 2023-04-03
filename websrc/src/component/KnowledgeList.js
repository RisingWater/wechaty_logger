import React from 'react';
import $ from 'jquery';

import {
    Table,
    Button,
    Popconfirm,
    Input,
    Pagination,
    Collapse,
    Typography,
    Space,
    Modal,
    Form,
    Upload,
    message
} from 'antd';

import {
    DeleteOutlined,
    EditOutlined,
    PlusCircleOutlined,
    FileAddOutlined
} from '@ant-design/icons'

export class KnowledgeList extends React.Component {
    constructor(props) {
        super(props);
        this.SearchInput = React.createRef();
        this.state = {
            orgDataSource: [],
            dataSource: [],
            searchText: '',
            showDialog: false,
            isEdit: false,
            SelectKnowledge: {
                id: "",
                embeddingTime: "",
                summary: "",
                content: "",
            },
            loading: true
        };

        this.FormRef = React.createRef();
    }

    filterData(value, record) {
        return record.filter((element) => {
            return element.content.toString().toLowerCase().includes(value.toLowerCase());
        })
    }

    onSearch = (value) => {
        this.setState({
            searchText: value,
            dataSource: this.filterData(value, this.state.orgDataSource)
        });
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
                    )
                },
                {
                    title: '操作',
                    key: 'action',
                    render: (text, record, index) => (
                        <span>
                            <Button type="primary" icon={<EditOutlined />} style={{ marginRight: 8 }} onClick={() => this.ShowModifyDialog(record)}>
                                编辑
                            </Button>
                            <Popconfirm title="确认删除" onConfirm={() => this.DeleteData(record.id)}>
                                <Button danger type="primary" icon={<DeleteOutlined />}>
                                    删除
                                </Button>
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
                        this.setState({
                            orgDataSource: data.data,
                            dataSource: data.data,
                        });
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

    AddData(data) {
        var json = { "id": "", "content": data.content, "summary": data.summary };
        this.setState({ loading: true });
        $.ajax({
            type: "post",
            url: "embedded/add",
            contentType: "application/json",
            data: JSON.stringify(json),
            success: (data, status) => {
                if (status == "success") {
                    this.RefreshData();
                }
            }
        });
    }

    EditData(data) {
        console.log(data);
        var json = { "id": data.id, "content": data.content, "summary": data.summary };
        this.setState({ loading: true });
        $.ajax({
            type: "post",
            url: "embedded/edit",
            contentType: "application/json",
            data: JSON.stringify(json),
            success: (data, status) => {
                if (status == "success") {
                    this.RefreshData();
                }
            }
        });
    }

    UpdateData(data) {
        if (this.state.isEdit) {
            this.EditData(data);
        } else {
            this.AddData(data);
        }
    }

    componentDidMount() {
        this.RefreshData();
    }

    ShowAddDialog = (e) => {
        this.setState({
            showDialog: true,
            isEdit: false,
            SelectKnowledge: {
                id: "",
                embeddingTime: "",
                summary: "",
                content: "",
            }
        });
    }

    ShowModifyDialog = (record) => {
        this.setState({
            showDialog: true,
            isEdit: true,
            SelectKnowledge: record
        });
    }

    handleOk = () => {
        this.FormRef.current.validateFields()
            .then((values) => {
                console.log(values);
                this.UpdateData(values);

                this.setState({
                    showDialog: false,
                    isEdit: false,
                    SelectKnowledge: {
                        id: "",
                        embeddingTime: "",
                        summary: "",
                        content: "",
                    }
                });
            });
    };

    handleCancel = () => {
        this.setState({
            showDialog: false,
            isEdit: false,
            SelectKnowledge: {
                id: "",
                embeddingTime: "",
                summary: "",
                content: "",
            }
        });
    };

    UploadEvent = (info) => {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`文件 ${info.file.name} 上传成功`);
        } else if (info.file.status === 'error') {
            message.error(`文件 ${info.file.name} 上传失败`);
        }
    }

    render() {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 16 }}>
                    <Space align='start'>
                        <Button type="primary" icon={<PlusCircleOutlined />} onClick={this.ShowAddDialog} style={{ marginRight: 8 }}>添加知识</Button>
                        <Upload name="file"
                            accept='.txt'
                            action='/file/upload'
                            onChange= {this.UploadEvent}
                            showUploadList={false}
                            maxCount={1}>
                            <Button icon={<FileAddOutlined />}>导入文件</Button>
                        </Upload>
                    </Space>
                    <div>
                        <Input.Search placeholder="搜索知识" onSearch={this.onSearch} style={{ width: 400 }} allowClear enterButton />
                    </div>
                </div>
                <Table
                    size="middle"
                    columns={this.getColumns()}
                    dataSource={this.state.dataSource}
                    pagination={{ size: "default", position: "both", defaultPageSize: 20, showQuickJumper: true }}
                    loading={this.state.loading}>
                </Table>
                <Modal
                    title={this.state.isEdit ? "编辑知识" : "添加知识"}
                    okText="确认"
                    cancelText="取消"
                    open={this.state.showDialog}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={700}
                    destroyOnClose>
                    <Form
                        ref={this.FormRef}
                        layout="vertical"
                        name="EditKnowledge"
                        initialValues={this.state.SelectKnowledge}
                        style={{ marginTop: 20, marginBottom: 20 }}
                    >
                        <Form.Item name="id" />
                        <Form.Item label="知识标题" name="summary" rules={[{ required: true, message: '请输入标题!' }]} style={{ marginBottom: '16px' }}>
                            <Input placeholder="请输入标题" />
                        </Form.Item>
                        <Form.Item label="知识内容" name="content" rules={[{ required: true, message: '请输入知识内容' }]} style={{ marginBottom: '16px' }}>
                            <Input.TextArea showCount maxLength={1000} placeholder="请输入知识内容，最长不要超过1000字" style={{ height: 400 }} />
                        </Form.Item>
                    </Form>
                    <div style={{ height: 20 }}></div>
                </Modal>
            </div>
        );
    }
}