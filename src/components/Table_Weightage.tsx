import { Button, InputNumber, Table, Tooltip, Typography } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useRef, useState } from 'react';
import { calculateSplitValue } from '../helpers';
const KFSDK = require("@kissflow/lowcode-client-sdk")

const { Text } = Typography;

interface DataType {
    key: string;
    parameters: string;
    Pk8LrjrVGBG7: number;
    sup_02: number;
    children?: DataType[];
    childUrl?: string;
    showCheckBox?: boolean;
}

type SourcingEventSection = {
    Sourcing_Event_Section_ID: string;
    Section_ID: string;
    Section_Name: string;
    Template_ID: string;
    Created_At: string; // Assuming this is a string representation of a date
    Weightage: number;
    _id: string;
};

type SourcingEventQuestion = {
    Sourcing_Event__Question_ID: string;
    Weightage: number;
    Template_ID: string;
    Section_ID: string;
    Question_ID: string;
    Question: string;
    Created_At: string; // Assuming this is a string representation of a date
    _id: string;
};

type Data = {
    key: string;
    parameters: string;
    Weightage: number;
    type: "section" | "question",
    children: any[]
}

type TableDataType = {
    _id: string;
    Weightage: number;
}

const rowSelection: TableRowSelection<DataType> = {
    getCheckboxProps: (record) => ({
        className: record.showCheckBox ? "" : "hide-row"
    }),
    hideSelectAll: true,
};

const AccordionTableWeightage: React.FC = () => {
    const [contentLoaded, setContentLoaded] = useState(false);
    const [sourcingEventId, setSourcingEventId] = useState<string>("");
    const [columns, setColumns] = useState<any[]>([])
    const [data, setData] = useState<any[]>([])
    const [sectionWeightage, setSectionWeightage] = useState<TableDataType[]>([])
    const [questionWeightage, setQuestionWeightage] = useState<TableDataType[]>([])
    const [showWeightageError, setWeightageError] = useState(false)
    const [expandedRows, setExpandedRows] = useState<string[]>([])
    const prevData = useRef<any>([]);

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();

            const sourcing_event_id = await KFSDK.app.page.popup.getAllParameters();
            await getSectiondetailsBySourcingEvent(sourcing_event_id);
            buildColumns();
            setContentLoaded(true);
            setSourcingEventId(sourcing_event_id)
        })()
    }, [])

    function validateWeightage(obj: any[], weightage: any, keyname: string) {
        if (obj && obj.length > 0) {
            for (let i = 0; i < obj.length; i++) {
                if (weightage.hasOwnProperty(keyname)) {
                    weightage[keyname] += obj[i].Weightage ?? 0;
                } else {
                    weightage[keyname] = obj[i].Weightage ?? 0;
                }
            }
            obj.map((newObj) =>  validateWeightage(newObj.children, weightage, newObj.key))
        }
        return weightage
    }

    /* Important Logic to compare delta value between actual data and modified data */
    function calculateDelta(obj1: any[], obj2: any[], res: any) {
        for (let i = 0; i < obj1.length; i++) {
            if (obj1[i].Weightage != obj2[i].Weightage) {
                if (res[obj1[i].type]) {
                    res[obj1[i].type].push({
                        _id: obj1[i].key,
                        Weightage: obj1[i].Weightage
                    })
                } else {
                    res[obj1[i].type] = [{
                        _id: obj1[i].key,
                        Weightage: obj1[i].Weightage
                    }]
                }
            }
            if (obj1[i].children && obj1[i].children.length > 0) {
                calculateDelta(obj1[i].children, obj2[i].children, res);
            }
        }
        return res;
    }


    function buildColumns() {
        const columns: any = [{
            title: "Parameters",
            dataIndex: 'parameters',
            key: 'parameters',
            width: "80%",
            render: (text: string, record: any, index: any) => (
                <Typography>
                    {record.type == "question" && <span style={{ fontWeight: "bold" }} >Q{index + 1}: </span>}
                    {text}
                </Typography>
            ),
        }];
        columns.push({
            title: "Weightage",
            dataIndex: "weightage",
            key: "weightage",
            render: (text: string, record: any) => (
                <RowRender
                    key={record.key}
                    record={record}
                    setSectionWeightage={setSectionWeightage}
                    setQuestionWeightage={setQuestionWeightage}
                    setData={setData}
                />
            ),
        })
        setColumns(columns)
    }

    async function getSectiondetailsBySourcingEvent(sourcing_event_id: string) {
        const queries = `page_number=1&page_size=1000000&_application_id=Sourcing_App_A00`

        const payload =
        {
            "Filter": {
                "AND": [
                    {
                        "OR": [
                            {
                                "LHSField": "Sourcing_Event_ID",
                                "Operator": "EQUAL_TO",
                                "RHSType": "Value",
                                "RHSValue": sourcing_event_id,
                                "RHSField": null,
                                "RHSParam": "",
                                "LHSAttribute": null,
                                "RHSAttribute": null
                            }
                        ]
                    }
                ]
            }
        }

        const sections: SourcingEventSection[] = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Sections_A00/allitems/list?${queries}`, {
            method: "POST",
            body: JSON.stringify(payload)
        })).Data

        const questions: SourcingEventQuestion[] = await getQuestionDetails(sourcing_event_id);

        let technicalData: Data[] = sections.map((section) => ({
            key: section._id,
            parameters: section.Section_Name,
            Weightage: section.Weightage,
            type: "section",
            showCheckBox: false,
            children: questions.filter((q) => q.Section_ID == section.Section_ID).map((question, index) => {
                return ({
                    key: question._id,
                    parameters: question.Question,
                    Weightage: question.Weightage,
                    type: "question",
                    showCheckBox: false
                })
            })
        }))
        let q = [
            {
                key: "questionnaire",
                parameters: "Questionnaire",
                Weightage: 0,
                type: "questionnaire",
                showCheckBox: false,
                children: technicalData
            },
            {
                key: "line_items",
                parameters: "Line Items",
                Weightage: 0,
                type: "line_items",
                showCheckBox: false,
                children: []
            }
        ]
        setData(q)
        prevData.current = JSON.parse(JSON.stringify(q));
    }

    async function getQuestionDetails(sourcing_event_id: string) {
        const queries = `page_number=1&page_size=1000000&_application_id=Sourcing_App_A00`

        const payload =
        {
            "Filter": {
                "AND": [
                    {
                        "OR": [
                            {
                                "LHSField": "Sourcing_Event_Id",
                                "Operator": "EQUAL_TO",
                                "RHSType": "Value",
                                "RHSValue": sourcing_event_id,
                                "RHSField": null,
                                "RHSParam": "",
                                "LHSAttribute": null,
                                "RHSAttribute": null
                            }
                        ]
                    }
                ]
            }
        }

        const questions: SourcingEventQuestion[] = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Questions_A00/allitems/list?${queries}`, {
            method: "POST",
            body: JSON.stringify(payload)
        })).Data

        return questions
    }

    async function updateWeightage(sectionWeightage: any[], dataformName: string) {
        const questions: any[] = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${dataformName}/batch`, {
            method: "POST",
            body: JSON.stringify(sectionWeightage)
        })).Data

        return questions
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "flex-end", margin: 3, alignItems: "center" }} >
                {showWeightageError && <Text type="danger" style={{ fontSize: 16, marginRight: 5 }} >Weightage should not exceed 100%</Text>}
                <Button
                    type='primary'
                    onClick={async () => {
                        let isValid = validateWeightage(data, {}, "root")
                        console.log("isValid" , data, isValid)
                        if (isValid) {
                            setWeightageError(false)
                            // if (sectionWeightage.length > 0) {
                            //     await updateWeightage(sectionWeightage, sourcing_section_dataform);
                            // }
                            // if (questionWeightage.length > 0) {
                            //     await updateWeightage(questionWeightage, sourcing_question_dataform);
                            // }
                        } else {
                            setWeightageError(true)
                        }
                    }}
                >Save</Button>
            </div>
            {contentLoaded && data ?
                <Table
                    columns={columns}
                    rowSelection={{ ...rowSelection }}
                    dataSource={data}
                    bordered
                    pagination={false}
                    className="custom-table"
                    expandable={{
                        onExpand(expanded, record) {
                            if (expanded) {
                                setExpandedRows((rows: string[]) => [...rows, record.key]);
                            } else {
                                setExpandedRows((rows) => [...rows.filter((r) => r != record.key)])
                            }
                        },
                    }}
                    rowClassName={(record) => {
                        if (expandedRows.includes(record.key)) {
                            return "newclass"
                        }
                        return ""
                    }
                    }
                    rootClassName='root'
                    rowKey={(record) => record.key}
                /> : "Loading..."}
        </div>
    );
};

function RowRender({ record, setData }: any) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        if (record.Weightage) {
            setValue(record.Weightage)
        }
    }, [record.Weightage])

    function onChangeValue(value: number) {
        setValue(value);
    }

    function onBlur() {
        switch (record.type) {
            case "questionnaire":
                setData((data: any) => {
                    data[0].Weightage = value;
                    return [...data]
                })
                break;
            case "section":
                setData((data: any) => {
                    let sections = data[0].children;
                    let sectionIndex = sections.findIndex((s: any) => s.key == record.key)
                    if (sectionIndex >= 0) {
                        sections[sectionIndex].Weightage = value
                    }
                    data[0].children = sections;
                    return [...data]
                })
                break;
            case "question":
                setData((data: any) => {
                    let sections = data[0].children;
                    sections = sections.map((s: any) => {
                        s.children = s.children.map((question: any) => {
                            if (question.key == record.key) {
                                return {
                                    ...question,
                                    Weightage: value
                                }
                            }
                            return question;
                        })
                        return s
                    })
                    data[0].children = sections;
                    return [...data]
                })
                break;
        }
    }

    function splitWeightage(type: string, key: string) {
        switch (type) {
            case "questionnaire":
                setData((data: any) => {
                    let sectionLength = data[0].children.length;
                    let sectionSplWeightage = calculateSplitValue(sectionLength)
                    let sections = data[0].children;

                    sections = sections.map((section: any) => {
                        section.Weightage = sectionSplWeightage;
                        return section;
                    })
                    data[0].children = sections;
                    return [...data]
                })
                break;
            case "section":
                setData((data: any) => {
                    let index = data[0].children.findIndex((question: any) => question.key == key);
                    let questions = data[0].children[index].children
                    let questionSplWeightage = calculateSplitValue(questions.length);
                    questions = questions.map((question: any) => {
                        question.Weightage = questionSplWeightage;
                        return question
                    })
                    data[0].children[index].children = questions;
                    return [...data]
                })
                break;
        }
    }

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", height: "100%"
        }} key={record.key} >
            {
                <div style={{ padding: 3, width: "100%", display: "flex", alignItems: "center", height: "90%", marginLeft: 10 }} >
                    <InputNumber
                        style={{
                            width: 120,
                            background: "transparent"
                        }}
                        value={value}
                        min={0}
                        max={100}
                        formatter={(value) => `${value}%`}
                        parser={(value: any) => value!.replace('%', '')}
                        onChange={(value: any) => onChangeValue(value)}
                        controls={false}
                        addonAfter={
                            record.type != "question" && <Button
                                onClick={() => {
                                    splitWeightage(record.type, record.key)
                                }}
                                style={{ display: "flex", height: 14, width: 18, fontSize: 5, alignItems: "center", justifyContent: "center", color: "rgba(0, 60, 156, 1)", borderColor: "rgba(0, 60, 156, 1)", borderRadius: 3 }}
                                type='primary'
                                size='small'
                                ghost
                                icon={
                                    <Tooltip title="Split equally" >
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="0.5" y="0.5" width="17" height="17" rx="1.5" fill="#EEF5FF" stroke="#003C9C" />
                                            <rect x="5.625" y="6.75" width="6.75" height="1.6875" fill="#003C9C" />
                                            <rect x="5.625" y="9.5625" width="6.75" height="1.6875" fill="#003C9C" />
                                        </svg>
                                    </Tooltip>
                                }
                            />
                        }
                        onBlur={onBlur}
                    />
                </div>
            }
        </div>)
}
export { AccordionTableWeightage };
