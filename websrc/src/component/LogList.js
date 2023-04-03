import React from 'react';
import dayjs from 'dayjs';
import $ from 'jquery';

import {
    Typography,
    Alert,
    DatePicker,
    Select,
    Space,
    Table,
    Input
} from 'antd';

export class LogList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideAlert: true,
            configResult: 0,
            dateString: dayjs().format('YYYY-MM-DD'),
            loglevel: 3,
            orgDataSource: [],
            dataSource: [],
            loading: true,
            searchText: ""
        }
    }

    getColumns() {
        return (
            [
                {
                    title: '日志等级',
                    dataIndex: 'level',
                    key: 'level',
                    width: 75
                },
                {
                    title: '生成时间',
                    dataIndex: 'time',
                    key: 'time',
                    width: 150
                },
                {
                    title: '日志内容',
                    key: 'content',
                    render: (text, record, index) => (
                        <div>
                            {
                                record.content.split("\n").map((line) => {
                                    return (
                                        <Typography.Paragraph>{line}</Typography.Paragraph>
                                    );
                                })
                            }
                        </div>
                    )
                }
            ]
        );
    }

    RefreshData() {
        this.setState({ loading: true });
        var json = { "dateString": this.state.dateString, "loglevel": this.state.loglevel };
        $.ajax({
            type: "post",
            url: "log/get",
            contentType: "application/json",
            async: false,
            data: JSON.stringify(json),
            success: (data, status) => {
                this.setState({
                    loading: false,
                    orgDataSource: data.data,
                    dataSource: this.filterData(this.state.searchText, data.data),
                    hideAlert: false,
                    configResult: data.result
                });
            }
        })
    }

    componentDidMount() {
        this.RefreshData();
    }

    getAlert() {
        if (!this.state.hideAlert && this.state.configResult != 0) {
            return (<div style={{ marginBottom: 20 }}><Alert message={"加载日志成功，没有指定日期的日志"} type="error" showIcon closable /></div>);
        } else {
            return (<div />);
        }
    }

    onDateChange = (date, dateString) => {
        this.setState({
            dateString: dateString
        }, () => {
            this.RefreshData();
        })
    };

    onLevelChange = (value) => {
        this.setState({
            loglevel: value
        }, () => {
            this.RefreshData();
        })
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

    render() {
        return (
            <div style={{ width: "100%", height: "100%" }}>
                <Typography.Title level={3}>系统日志</Typography.Title>
                {this.getAlert()}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 16 }}>
                    <Space size='middle'>
                        <Select style={{ width: 200 }} defaultValue={3} onChange={this.onLevelChange} options={[
                            { value: 1, label: '显示错误日志' },
                            { value: 2, label: '显示关键日志' },
                            { value: 3, label: '显示所有日志' },
                        ]}
                        />
                        <DatePicker defaultValue={dayjs()} format='YYYY-MM-DD' onChange={this.onDateChange} />
                    </Space>
                    <div>
                        <Input.Search placeholder="搜索日志" onSearch={this.onSearch} style={{ width: 400 }} allowClear enterButton />
                    </div>
                </div>
                <Table
                    size="middle"
                    columns={this.getColumns()}
                    dataSource={this.state.dataSource}
                    pagination={{ size: "default", position: "both", defaultPageSize: 20, showQuickJumper: true }}
                    loading={this.state.loading}>
                </Table>
            </div>
        )
    }
}