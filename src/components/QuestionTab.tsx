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
                // filter: (questions: any) => questions.filter((record: any) => record["Column_w2Oc0EUSch"])
                filter: (questions: any) => questions
            },
            {
                label: "Others Questions",
                // filter: (questions: any) => questions.filter((record: any) => record["Column_w2Oc0EUSch"])
                filter: (questions: any) => questions
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
                    // filter: (questions: any) => questions.filter((record: any) => record["Column_w2Oc0EUSch"])
                    filter: (questions: any) => questions
                },
                {
                    label: "UnAnswered",
                    // filter: (questions: any) => questions.filter((record: any) => !record["Column_w2Oc0EUSch"])
                    filter: (questions: any) => questions
                }],
            hideSearch: true
        }
    }
    const currentTab = tabs["supplier"]
    const [questionDetails, setQuestionDetails] = useState([])
    // const [columnDetails, setColumnDetails] = useState<Record<string, ColumnDetail>>({});
    const [searchText, setSearchText] = useState("")

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            console.log("process.env.REACT_APP_API_URL", process.env.REACT_APP_API_URL)
            const response = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/Ac6j6Sn_e_zo/Supplier_QnA_Clarification_A00/allitems/list?q=${searchText}`, {
                method: "POST"
            });
            console.log("data : " , response.Data)
            setQuestionDetails(response.Data)
        })()
    }, [searchText])

    async function createSupplierData(data: any) {
        const createdResponse = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/Ac6j6Sn_e_zo/Supplier_QnA_Clarification_A00/draft_Us6vkpe22I75?_application_id=Kissflow_Procurement_Cloud_A01`, {
            method: "POST",
            body: {
                ...data
            }
        })
    }

    return (
        <div style={{ padding: 20 }} >
            {!currentTab.hideSearch &&
                <Input
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={"Enter Your Question Here"}
                    suffix={
                        <Button style={{ backgroundColor: '#dfeafd', color: "#0043B2", fontWeight: "bold" }} >
                            Post Question
                        </Button>
                    }
                    style={{ color: "red", height: 60 }}
                    value={searchText}
                />}
            <Tabs
                defaultActiveKey="1"
                items={currentTab.tabs.map((record: any, index: number) => {
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
