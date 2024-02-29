import { Button, InputNumber, Table, Tooltip, Typography } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useRef, useState } from 'react';
import { calculateSplitValue } from '../helpers';
import { tableFontColor } from '../helpers/colors';
import { SourcingMasterProcess, sourcing_question_dataform, sourcing_section_dataform } from '../helpers/constants';
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
    type: "section" | "question" | "line_items",
    children: any[]
}

type TableDataType = {
    _id: string;
    Weightage: number;
}

type LineItem = {
    _id: string;
    _created_by: {
        _id: string;
        Name: string;
        Kind: string;
    };
    _modified_by: {
        _id: string;
        Name: string;
        Kind: string;
    };
    _created_at: string;
    _modified_at: string;
    Item: string;
    Item_Description: string;
    Unit_of_Measure: string;
    Quantity: number;
    Weightage: number;
};

const leafNodes = ["question", "line_items"]
const rootNodes = ["header_line_item", "section", "questionnaire"]
const lineItemTableKey = "Table::RFQ_Configuration"

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
    const [showWeightageError, setWeightageError] = useState(false)
    const [expandedRows, setExpandedRows] = useState<string[]>([])
    const prevData = useRef<any>([]);

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();

            const sourcing_event_id = await KFSDK.app.page.popup.getAllParameters();
            await buildRowDetails(sourcing_event_id);
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
            obj.map((newObj) => validateWeightage(newObj.children, weightage, newObj.key))
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
            title: "Type",
            dataIndex: 'parameters',
            key: 'parameters',
            width: "80%",
            render: (text: string, record: any, index: any) => (
                <div style={{ display: "flex", color: tableFontColor }} >
                    {record.type == "question" &&
                        <Typography style={{ fontWeight: "bold", marginRight: 6, width: 30 }} >Q{index + 1}: </Typography>
                    }
                    <Typography style={{ width: "100%" }} >
                        {text}
                    </Typography>
                </div>
            ),
            className: "table-header"
        }];
        columns.push({
            title: "Weightage",
            dataIndex: "weightage",
            key: "weightage",
            render: (text: string, record: any) => (
                <RowRender
                    key={record.key}
                    record={record}
                    setData={setData}
                />
            ),
            className: "table-header"
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

        return technicalData
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

    async function getLineDetails(sourcing_event_id: string) {
        const sourcingDetails: any =
            (await KFSDK.api(`${process.env.REACT_APP_API_URL}/process/2/${KFSDK.account._id}/admin/Sourcing_Master_A00/${sourcing_event_id}`))

        const lineItems: LineItem[] = sourcingDetails[lineItemTableKey]
        console.log("lineItems", lineItems)

        let commercialData: Data[] = lineItems.map((lineItem) => ({
            key: lineItem._id,
            parameters: lineItem.Item,
            Weightage: lineItem.Weightage || 0,
            type: "line_items",
            showCheckBox: false,
            children: []
        }))

        return commercialData
    }

    async function buildRowDetails(sourcing_event_id: string) {
        const technicalData = await getSectiondetailsBySourcingEvent(sourcing_event_id);
        const commercialData = await getLineDetails(sourcing_event_id);
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
                key: "header_line_item",
                parameters: "Line Items",
                Weightage: 0,
                type: "header_line_item",
                showCheckBox: false,
                children: commercialData
            }
        ]
        setData(q)
        prevData.current = JSON.parse(JSON.stringify(q));
    }

    async function updateWeightage(sectionWeightage: any[], dataformName: string) {
        const questions: any[] = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${dataformName}/batch`, {
            method: "POST",
            body: JSON.stringify(sectionWeightage)
        })).Data

        return questions
    }

    async function updateLineWeightage(lineWeightage: any[]) {
        const lineDetails: any[] = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/process/2/${KFSDK.account._id}/admin/${SourcingMasterProcess}/${sourcingEventId}`, {
            method: "PUT",
            body: JSON.stringify({
                [lineItemTableKey]: lineWeightage
            })
        }));
        console.log("lineDetails",  lineDetails)
        return lineDetails
    }

    function customExpandIcon(props: any) {
        console.log("props", props)
        if (rootNodes.includes(props.record.type)) {
            if (props.expanded) {
                return (<a style={{ color: 'black', position: "relative", float: "left", marginRight: 15 }} onClick={e => {
                    props.onExpand(props.record, e);
                }}>
                    <img src={process.env.PUBLIC_URL + "/svgs/expand.svg"} ></img>
                </a>)
            } else {
                return (<a style={{ color: 'black', position: "relative", float: "left", marginRight: 15 }} onClick={e => {
                    props.onExpand(props.record, e);
                }}>
                    <img src={process.env.PUBLIC_URL + "/svgs/minimize.svg"} ></img>
                </a>)
            }
        }
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "flex-end", margin: 3, alignItems: "center" }} >
                {showWeightageError && <Text type="danger" style={{ fontSize: 16, marginRight: 5 }} >Weightage should not exceed 100%</Text>}
                <Button
                    type='primary'
                    onClick={async () => {
                        let weightages = validateWeightage(data, {}, "root")
                        let isValid = Object.values(weightages).every((w: any) => (w <= 100))
                        let delta = calculateDelta(data, prevData.current, []);
                        if (isValid) {
                            setWeightageError(false)
                            if (delta["section"] && delta["section"].length > 0) {
                                await updateWeightage(delta["section"], sourcing_section_dataform);
                            }
                            if (delta["question"] && delta["question"].length > 0) {
                                await updateWeightage(delta["question"], sourcing_question_dataform);
                            }
                            if (delta["line_items"] && delta["line_items"].length > 0) {
                                await updateLineWeightage(delta["line_items"]);
                            }
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
                    // bordered
                    pagination={false}
                    className="custom-table-weightage"
                    expandable={{
                        onExpand(expanded, record) {
                            if (expanded) {
                                setExpandedRows((rows: string[]) => [...rows, record.key]);
                            } else {
                                setExpandedRows((rows) => [...rows.filter((r) => r != record.key)])
                            }
                        },
                        expandIcon: customExpandIcon
                    }}
                    rowClassName={(record) => {
                        if (expandedRows.includes(record.key)) {
                            return "newclass"
                        }
                        return "row-class"
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
                    let sections = data[0].children;
                    let sectionLength = sections.length;
                    let { lastValue, value } = calculateSplitValue(sectionLength)

                    sections = sections.map((section: any, index: number) => {
                        if (lastValue && (index == sections.length - 1)) {
                            section.Weightage = lastValue;
                        } else {
                            section.Weightage = value;
                        }
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
                    let { value, lastValue } = calculateSplitValue(questions.length);
                    questions = questions.map((question: any, index: number) => {
                        if (lastValue && (index == questions.length - 1)) {
                            question.Weightage = lastValue;
                        } else {
                            question.Weightage = value;
                        }
                        return question
                    })
                    data[0].children[index].children = questions;
                    return [...data]
                })
                break;
            case "header_line_item":
                setData((data: any) => {
                    let lineItems = data[1].children;
                    let lineItemLength = lineItems.length;
                    let { lastValue, value } = calculateSplitValue(lineItemLength)

                    lineItems = lineItems.map((lineItem: any, index: number) => {
                        if (lastValue && (index == lineItemLength - 1)) {
                            lineItem.Weightage = lastValue;
                        } else {
                            lineItem.Weightage = value;
                        }
                        return lineItem;
                    })
                    data[1].children = lineItems;
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
                            !leafNodes.includes(record.type) && <Button
                                onClick={() => {
                                    splitWeightage(record.type, record.key)
                                }}
                                style={{ display: "flex", height: 14, width: 18, fontSize: 5, alignItems: "center", justifyContent: "center", color: "rgba(0, 60, 156, 1)", borderColor: "rgba(0, 60, 156, 1)", borderRadius: 3 }}
                                type='primary'
                                size='small'
                                ghost
                                icon={
                                    <Tooltip title="Split equally" >
                                        <img src={process.env.PUBLIC_URL + "/svgs/split_equally_icon.svg"} alt="image" />
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
