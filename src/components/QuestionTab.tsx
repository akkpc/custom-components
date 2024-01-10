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

const tabs: Record<string, any> = {
    supplier: {
        tabs: [{
            label: "All",
            filter: () => ([{}])
        },
        {
            label: "My Questions",
            filter: (query_value: string) => ([{
                "LHSField": "Created_By_2",
                "Operator": "EQUAL_TO",
                "RHSType": "Value",
                "RHSValue": query_value,
                "RHSField": null,
                "RHSParam": "",
                "LHSAttribute": null,
                "RHSAttribute": null
            }])
        },
        {
            label: "Others Questions",
            filter: (query_value: string) => ([{
                "LHSField": "Created_By_2",
                "Operator": "NOT_EQUAL_TO",
                "RHSType": "Value",
                "RHSValue": query_value,
                "RHSField": null,
                "RHSParam": "",
                "LHSAttribute": null,
                "RHSAttribute": null
            }])

        }],
        disableAnswer: true,
        hideSupplierName: true,
        hidePrivateCheckBox: true,
        hideSearch: false
    },
    buyer: {
        tabs: [
            {
                label: "All",
                filter: () => ([{}])
            },
            {
                label: "Answered",
                filter: () => ([{
                    "LHSField": "Procurement_Team_response",
                    "Operator": "NOT_EMPTY",
                    "RHSType": "",
                    "RHSValue": "",
                    "RHSField": null,
                    "RHSParam": "",
                    "LHSAttribute": null,
                    "RHSAttribute": null
                }])
            },
            {
                label: "UnAnswered",
                filter: () => ([{
                    "LHSField": "Procurement_Team_response",
                    "Operator": "EMPTY",
                    "RHSType": "",
                    "RHSValue": "",
                    "RHSField": null,
                    "RHSParam": "",
                    "LHSAttribute": null,
                    "RHSAttribute": null
                },
                {
                    "LHSField": "Procurement_Team_response",
                    "Operator": "EQUAL_TO",
                    "RHSType": "Value",
                    "RHSValue": "",
                    "RHSField": null,
                    "RHSParam": "",
                    "LHSAttribute": null,
                    "RHSAttribute": null
                }])
            }],
        hideSearch: true,
        disableAnswer: false
    }
}

export function QuestionTab() {
    const [currentTab, setCurrentTab] = useState(tabs["supplier"])
    const [questionDetails, setQuestionDetails] = useState([])
    // const [columnDetails, setColumnDetails] = useState<Record<string, ColumnDetail>>({});
    const [searchText, setSearchText] = useState("")
    const [filter, setFilter] = useState([{}])
    const [currentUserEmail, setCurrentUserEmail] = useState("");

    useEffect(() => {
        (async () => {
            await getQuestions();
        })()
    }, [searchText, filter])

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            let allParams = await KFSDK.app.page.getAllParameters();
            setCurrentTab(tabs[allParams.user_type])
            setCurrentUserEmail(allParams.buyer_email)
        })()
    }, [])

    async function getQuestions() {
        const response = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/Ac6j6Sn_e_zo/Supplier_QnA_Clarification_A00/allitems/list?q=${searchText}&page_size=1000`, {
            method: "POST",
            body: JSON.stringify({
                Filter: {
                    "AND": [
                        {
                            "OR": [
                                ...filter
                            ]
                        }
                    ]
                }
            })
        });
        setQuestionDetails(() => response.Data)
    }

    async function postQuestions(data: any) {
        // const createdResponse = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/Ac6j6Sn_e_zo/Supplier_QnA_Clarification_A00/draft_Us6vkpe22I75?_application_id=Kissflow_Procurement_Cloud_A01`, {
        //     method: "POST",
        //     body: JSON.stringify(data)
        // })
        console.log("first", KFSDK.account._id)
        const create = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Supplier_QnA_Clarification_A00/batch`,
            {
                method: "POST",
                body: JSON.stringify([data])
            })
    }

    return (
        currentTab && <div style={{ padding: 20 }} >
            {!currentTab.hideSearch &&
                <Input
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={"Enter Your Question Here"}
                    suffix={
                        questionDetails.length == 0 ?
                            <Button onClick={
                                async () => {
                                    await postQuestions({
                                        Question: searchText,
                                        _is_created: true
                                    })
                                    setSearchText("");
                                }
                            } style={{ backgroundColor: '#dfeafd', color: "#0043B2", fontWeight: "bold" }} >
                                Post Question
                            </Button> : <></>
                    }
                    style={{ color: "red", height: 60 }}
                    value={searchText}
                />}
            <Tabs
                defaultActiveKey="0"
                items={currentTab.tabs.map((record: any, index: number) => {
                    return {
                        key: index.toString(),
                        label: record.label,
                        children: <QnASection KFSDK={KFSDK} {...currentTab} questions={(questionDetails)} refetch={async () => await getQuestions()} />
                    }
                })}
                onChange={(e) => {
                    setFilter(currentTab.tabs[e].filter(currentUserEmail))
                }}
            />
        </div>
    )
}
