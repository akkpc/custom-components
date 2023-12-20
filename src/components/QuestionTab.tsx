import type { TabsProps } from 'antd';
import { Button, Input, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { QnASection } from './QnASection';
const KFSDK = require('@kissflow/lowcode-client-sdk')

interface ColumnDetail {
    FieldId: string;
    Name: string;
    Type: string;
    ProjectionFunction: null | string; // Assuming ProjectionFunction can be null or a string
    AggregationFunction: null | string; // Assuming AggregationFunction can be null or a string
    IsSystemField: boolean;
    Id: string;
    Width: number;
    IsVisible: boolean;
}


const items: TabsProps['items'] = [
    {
        key: '1',
        label: 'All'
    },
    {
        key: '2',
        label: 'Answered'
    },
    {
        key: '3',
        label: 'UnAnswered'
    },
];

export function QuestionTab() {
    const tabs: Record<string, any> = {
        supplier: {
            tabs: [{
                label: "All",
                filter: (questions: any) => questions
            },
            {
                label: "My Questions",
                filter: (questions: any) => questions.filter((record: any) => record["Column_w2Oc0EUSch"])
            },
            {
                label: "Others Questions",
                filter: (questions: any) => questions.filter((record: any) => record["Column_w2Oc0EUSch"])
            }],
            disableAnswer: true,
            hideSupplierName: true,
            hidePrivateCheckBox: true,
        },
        buyer: {
            tabs: [
                {
                    label: "All",
                    filter: (questions: any) => questions
                },
                {
                    label: "Answered",
                    filter: (questions: any) => questions.filter((record: any) => record["Column_w2Oc0EUSch"])
                },
                {
                    label: "UnAnswered",
                    filter: (questions: any) => questions.filter((record: any) => !record["Column_w2Oc0EUSch"])
                }],
            hideSearch: true
        }
    }
    const currentTab = tabs["buyer"]
    const [questionDetails, setQuestionDetails] = useState([])
    const [columnDetails, setColumnDetails] = useState<Record<string, ColumnDetail>>({});

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            console.log("process.env.REACT_APP_API_URL", process.env.REACT_APP_API_URL)
            const response = await KFSDK.api(`${process.env.REACT_APP_API_URL}/case-report/2/AcS4izpPbKF37/Sourcing_Clarifications_A00/Sourcing_Clarifications_A00_All_Items?apply_preference=true&page_number=1&page_size=10&_application_id=Sourcing_App_A00`);
            const columns: Record<string, ColumnDetail> = {}
            response.Columns.forEach((column: ColumnDetail) => {
                columns[column.Id] = column
            })

            setQuestionDetails(response.Data)
            setColumnDetails(columns)
        })()
    }, [])
    return (
        <div style={{ padding: 20 }} >
            {!currentTab.hideSearch && <Input placeholder={"Enter Your Question Here"}
                suffix={
                    <Button style={{ backgroundColor: '#dfeafd', color: "#0043B2", fontWeight: "bold" }} >
                        Post Question
                    </Button>
                }
                style={{ color: "red", height: 60 }}
            />}
            <Tabs
                defaultActiveKey="1"
                items={currentTab.tabs.map((record:any, index: number) => {
                    return {
                        key: index.toString(),
                        label: record.label,
                        children: <QnASection {...currentTab} questions={record.filter(questionDetails)} />
                    }
                })}
                tabBarStyle={{ color: "red" }}
            />
        </div>
    )
}
