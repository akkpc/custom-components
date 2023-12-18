import React from 'react';
import { Button, Input, Space, Tabs, Tooltip } from 'antd';
import type { TabsProps } from 'antd';
import { QnASection } from './QnASection';
import { InfoCircleOutlined } from '@ant-design/icons';

const items: TabsProps['items'] = [
    {
        key: '1',
        label: 'All',
        children: <QnASection />,


    },
    {
        key: '2',
        label: 'Answered',
        children: <QnASection />,
    },
    {
        key: '3',
        label: 'UnAnswered',
        children: <QnASection />,
    },
];

export function QuestionTab() {
    return (
        <div style={{ padding: 20 }} >
            <Input placeholder={"Enter Your Question Here"}
                suffix={
                    <Button style={{ backgroundColor: '#dfeafd', color: "#0043B2", fontWeight: "bold" }} >
                        Post Question
                    </Button>
                }
                style={{ color: "red", height: 60 }}
            />
            <Tabs
                defaultActiveKey="1"
                items={items}
                tabBarStyle={{ color: "red" }}
            />
        </div>
    )
}
