import { DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Col, Input, Row, Select } from 'antd'
import React from 'react'
import { Question, RoundedIcon } from './SideBar';

interface Props {
    index: number;
    question: Question;
}

const types = [
    {
        value: 'single_select',
        label: 'Single Select',
        enableOptions: true
    },
    {
        value: "multi_select",
        label: "Multi Select",
        enableOptions: true
    },
    {
        value: 'date_time',
        label: 'Date & Time',
    },
    {
        value: "short_text",
        label: "Short Text"
    },
    {
        value: "long_text",
        label: "Long Text"
    }
]

export function QuestionCard(props: Props) {
    const { index, question: { Question_ID, Question, Response_Type } } = props;
    return (
        <div style={{}} >
            <Card style={{ borderRadius: 4, borderColor: "rgba(222, 234, 255, 1)", padding: 0 }}>
                <Row>
                    {/* <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} > */}
                    <Col span={22} >
                        <Input style={{ height: 35, width: "80%", padding: 0, borderRadius: 0 }}
                            prefix={<div style={{ backgroundColor: "rgba(222, 234, 255, 1)", width: 40, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }} >{index + 1}.</div>}
                            value={Question}
                        />
                    </Col>
                    <Col span={2} >
                        <div style={{ width: 30, display: "flex", alignItems: "center", justifyContent: "center" }} >
                            <Button shape="circle" icon={<DeleteOutlined style={{ color: "red" }} />} />
                        </div>
                    </Col>
                    {/* </div> */}
                </Row>
                <div>
                    <p style={{ color: "rgba(175, 183, 199, 1)" }} >Choose answer type</p>
                    <Select
                        showSearch
                        placeholder="Select Field Type"
                        optionFilterProp="children"
                        onChange={(event) => { console.log("enableOptions: true", event) }}
                        onSearch={() => { }}
                        options={types}
                        style={{ width: 300 }}
                        defaultValue={"short_text"}
                    />
                </div>
                <div>
                    <p style={{ color: "rgba(175, 183, 199, 1)" }} >Options</p>
                </div>
            </Card>
        </div>
    )
}
