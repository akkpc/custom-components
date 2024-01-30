import { DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { Card, Input, Select } from 'antd'
import React from 'react'
import { RoundedIcon } from './SideBar';

interface Props {
    index: number;
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
    const { index } = props;
    return (
        <div style={{}} >
            <Card style={{ borderRadius: 4, borderColor: "rgba(222, 234, 255, 1)", padding: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} >
                    <Input style={{ height: 35, width: "80%", padding: 0 }}
                        prefix={<div style={{ backgroundColor: "rgba(222, 234, 255, 1)", width: 40, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }} >{index + 1}.</div>} />
                    <RoundedIcon onClick={() => { }} >
                        <DeleteOutlined style={{ color: "red", fontSize: 15 }} />
                    </RoundedIcon>
                </div>
                <div>
                    <p style={{ color: "rgba(175, 183, 199, 1)" }} >Choose answer type</p>
                    <Select
                        showSearch
                        placeholder="Select Field Type"
                        optionFilterProp="children"
                        onChange={(event) => {console.log("enableOptions: true" , event)}}
                        onSearch={() => { }}
                        options={types}
                        style={{width: 300}}
                    />
                </div>
                <div>
                    <p style={{ color: "rgba(175, 183, 199, 1)" }} >Options</p>
                </div>
            </Card>
        </div>
    )
}
