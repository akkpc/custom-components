import { Button, InputNumber, Table, Tooltip, Typography } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useRef, useState } from 'react';
import { KFButton } from '../components/KFButton';
import { KFLoader } from '../components/KFLoader';
import { calculateSplitValue, getKey } from '../helpers';
import { tableFontColor } from '../helpers/colors';
import { Applicable_commercial_info, Commercial_Details, Line_Items, Questionnaire, dataforms, leafNodes, lineItemTableKey, processes, rootNodes } from '../helpers/constants';
import { showMessage } from '../hooks/KFFunctions';
const KFSDK = require("@kissflow/lowcode-client-sdk")

const { Text } = Typography;

const {
    sourcingSection,
    sourcingQuestion
} = dataforms;

const {
    SourcingMaster: SourcingMasterProcess
} = processes;

const allNodes = rootNodes.concat(leafNodes)

interface DataType {
    key: string;
    parameters: string;
    Pk8LrjrVGBG7: number;
    sup_02: number;
    children?: DataType[];
    childUrl?: string;
    showCheckBox?: boolean;
    error?: boolean;
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
    type: typeof allNodes[number],
    children?: Data[],
    showCheckBox?: boolean,
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
    Price_Weightage: number;
    Quantity_Weightage: number;
    Leadtime_Weightage: number;
    Request_Quote_For: string[]
};


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
    const [weightageLoading, setWeightageLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const prevData = useRef<any>([]);

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();

            const sourcing_event_id = await KFSDK.app.page.popup.getAllParameters();
            // const sourcing_event_id = "Pk8xAuqYRrdT";
            await buildRowDetails(sourcing_event_id);
            buildColumns();
            setContentLoaded(true);
            setSourcingEventId(sourcing_event_id)
        })()
    }, [])

    useEffect(() => {
        if (showWeightageError) {
            showMessage(KFSDK, "Please confirm total percentage equals 100%")
        }
    }, [showWeightageError])

    function validateWeightage(obj: any[], weightage: any, keyname: string) {
        if (obj && obj.length > 0) {
            for (let i = 0; i < obj.length; i++) {
                if (weightage.hasOwnProperty(keyname)) {
                    weightage[keyname] = Math.round((weightage[keyname] + obj[i].Weightage ?? 0 + Number.EPSILON) * 10) / 10;
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
    function getLeftPadding(key: string) {
        if (key == "question") return 12
        if (key == "line_item_info") return 36
        if (key == "line_item_params") return 40
        return 0;
    }

    function buildColumns() {
        const columns: any = [{
            title: "Parameters",
            dataIndex: 'parameters',
            key: 'parameters',
            width: "80%",
            render: (text: string, record: any, index: any) => (
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingLeft: getLeftPadding(record.type)
                }} >
                    <div style={{ display: "flex", color: tableFontColor, width: "100%" }}  >
                        {record.type == "question" &&
                            <Typography style={{ fontWeight: "bold", marginRight: 6, width: "4%", display: "flex", justifyContent: "flex-end" }} >Q{index + 1}: </Typography>
                        }
                        <Typography style={{ width: record.type == "question" ? "95%" : "100%" }} >
                            {record.type != "question" && `${index + 1}. `} {text}
                        </Typography>
                    </div>
                    <div>
                        {record?.error && <img style={{ marginRight: 2 }} src={process.env.PUBLIC_URL + "/svgs/error.svg"} alt="image" />
                            // <Tooltip color='#DF4440' title="Click Split button to auto split" >

                            // </Tooltip>
                        }
                    </div>
                </div>
            ),
            className: "table-header table-parameter"
        }];
        columns.push({
            title: () => (
                <div style={{ display: "flex", alignItems: "center", columnGap: 20 }} >
                    <Typography>Weightage</Typography>
                    <Button
                        onClick={() => {
                            setData((data: any) => {
                                let { lastValue, value } = calculateSplitValue(data.length)
                                if (data[0]) {
                                    data[0].Weightage = value;
                                    data[0].children = splitWeightageToAllChildren(data[0])
                                }
                                if (data[1]) {
                                    data[1].Weightage = lastValue;
                                    data[1].children = splitWeightageToAllChildren(data[1])
                                }
                                return [...data]
                            })
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
                </div>
            ),
            dataIndex: "weightage",
            key: "weightage",
            render: (text: string, record: any) => (
                <RowRender

                    key={record.key}
                    record={record}
                    setData={setData}
                    data={data}
                />
            ),
            className: "table-header table-weightage"
        })
        setColumns(columns)
    }

    async function getSectiondetailsBySourcingEvent(sourcing_event_id: string, currentStage: string) {
        const queries = `page_number=1&page_size=1000000&_application_id=Sourcing_App_A00`

        const payload =
        {
            "Filter": {
                "AND": [
                    {
                        "AND": [
                            {
                                "LHSField": "Sourcing_Event_ID",
                                "Operator": "EQUAL_TO",
                                "RHSType": "Value",
                                "RHSValue": sourcing_event_id,
                                "RHSField": null,
                                "RHSParam": "",
                                "LHSAttribute": null,
                                "RHSAttribute": null
                            },
                            {
                                "LHSField": "Event_Stage",
                                "Operator": "EQUAL_TO",
                                "RHSType": "Value",
                                "RHSValue": currentStage,
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

        const sections: SourcingEventSection[] = (await KFSDK.api(`/form/2/${KFSDK.account._id}/Sourcing_Sections_A00/allitems/list?${queries}`, {
            method: "POST",
            body: JSON.stringify(payload)
        })).Data

        const questions: SourcingEventQuestion[] = await getQuestionDetails(sourcing_event_id, currentStage);

        let technicalData: Data[] = sections.map((section) => ({
            key: section._id,
            parameters: section.Section_Name,
            Weightage: section.Weightage,
            type: "section",
            children: questions.filter((q) => q.Section_ID == section.Section_ID).map((question, index) => {
                return ({
                    key: question._id,
                    parameters: question.Question,
                    Weightage: question.Weightage,
                    type: "question",
                    showCheckBox: false,
                    children: []
                })
            })
        }))

        return technicalData
    }

    async function getQuestionDetails(sourcing_event_id: string, currentStage: string) {
        const queries = `page_number=1&page_size=1000000&_application_id=Sourcing_App_A00`

        const payload =
        {
            "Filter": {
                "AND": [
                    {
                        "AND": [
                            {
                                "LHSField": "Sourcing_Event_ID",
                                "Operator": "EQUAL_TO",
                                "RHSType": "Value",
                                "RHSValue": sourcing_event_id,
                                "RHSField": null,
                                "RHSParam": "",
                                "LHSAttribute": null,
                                "RHSAttribute": null
                            },
                            {
                                "LHSField": "Event_Stage",
                                "Operator": "EQUAL_TO",
                                "RHSType": "Value",
                                "RHSValue": currentStage,
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

        const questions: SourcingEventQuestion[] = (await KFSDK.api(`/form/2/${KFSDK.account._id}/Sourcing_Questions_A00/allitems/list?${queries}`, {
            method: "POST",
            body: JSON.stringify(payload)
        })).Data

        return questions
    }

    async function buildRowDetails(sourcing_event_id: string) {
        const sourcingDetails: any =
            (await KFSDK.api(`/process/2/${KFSDK.account._id}/admin/Sourcing_Master_A00/${sourcing_event_id}`))


        let q: Data[] = []
        if (["RFP", "RFI"].includes(sourcingDetails.Current_Stage)) {
            const technicalData = await getSectiondetailsBySourcingEvent(sourcing_event_id, sourcingDetails.Current_Stage);
            q.push({
                key: "questionnaire",
                parameters: "Questionnaire",
                Weightage: sourcingDetails[Questionnaire],
                type: "questionnaire",
                showCheckBox: false,
                children: technicalData
            },)
        }

        if (sourcingDetails.Current_Stage == "RFQ" || (sourcingDetails.Current_Stage == "RFP" && !sourcingDetails.Event_Type.includes("RFQ"))) {
            const lineItems: LineItem[] = sourcingDetails[lineItemTableKey]
            const applicableCommercialInfo = sourcingDetails[Applicable_commercial_info]

            let commercialItems: Data = {
                key: "commercial_details",
                parameters: "Commercial Details",
                Weightage: sourcingDetails[Commercial_Details] ?? 0,
                type: "commercial_details",
                children: []
            }

            if (applicableCommercialInfo && applicableCommercialInfo.length > 0) {
                for (let i = 0; i < applicableCommercialInfo.length; i++) {
                    let info = applicableCommercialInfo[i];
                    if (commercialItems?.children) {
                        commercialItems?.children.push({
                            key: info,
                            parameters: info,
                            Weightage: sourcingDetails[getKey(info)] ?? 0,
                            type: "line_item_info",
                            children: []
                        })
                    }
                }
            }

            if (lineItems) {
                let lineItemNode: Data = {
                    key: "line_items",
                    parameters: "Line Items",
                    Weightage: sourcingDetails[Line_Items],
                    type: "line_items",
                    children: []
                }
                lineItemNode.children = lineItems.map((lineItem) => {
                    let lineItemReq: Data[] = []

                    if (lineItem.Request_Quote_For.includes("Price")) {
                        lineItemReq.push({
                            key: `${lineItem._id}#Price_Weightage`,
                            parameters: "Price",
                            Weightage: lineItem.Price_Weightage || 0,
                            type: "line_item_params",
                            children: []
                        })
                    }
                    if (lineItem.Request_Quote_For.includes("Quantity")) {
                        lineItemReq.push({
                            key: `${lineItem._id}#Quantity_Weightage`,
                            parameters: "Quantity",
                            Weightage: lineItem.Quantity_Weightage || 0,
                            type: "line_item_params",
                            children: []
                        })
                    }
                    if (lineItem.Request_Quote_For.includes("Leadtime")) {
                        lineItemReq.push({
                            key: `${lineItem._id}#Leadtime_Weightage`,
                            parameters: "Leadtime",
                            Weightage: lineItem.Leadtime_Weightage || 0,
                            type: "line_item_params",
                            children: []
                        })
                    }

                    return ({
                        key: lineItem._id,
                        parameters: lineItem.Item,
                        Weightage: lineItem.Weightage || 0,
                        type: "line_item",
                        // showCheckBox: false,
                        children: lineItemReq
                    })
                })
                if (commercialItems.children) {
                    commercialItems.children.push(lineItemNode);
                }
            }

            if (commercialItems) {
                console.log("commercialItems", commercialItems)
                q.push(commercialItems)
            }
        }
        setData(q)
        prevData.current = JSON.parse(JSON.stringify(q));
    }

    async function updateWeightage(sectionWeightage: any[], dataformName: string) {
        const questions: any[] = (await KFSDK.api(`/form/2/${KFSDK.account._id}/${dataformName}/batch`, {
            method: "POST",
            body: JSON.stringify(sectionWeightage)
        })).Data

        return questions
    }

    async function updateProcessWeightages(payload: Record<string, any>) {
        const lineDetails: any[] = (await KFSDK.api(`/process/2/${KFSDK.account._id}/admin/${SourcingMasterProcess}/${sourcingEventId}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        }));
        return lineDetails
    }

    function customExpandIcon(props: any) {
        if (rootNodes.includes(props.record.type)) {
            if (props.expanded) {
                return (<a style={{ color: 'black', position: "relative", float: "left", marginRight: 15, marginLeft: 15 }} onClick={e => {
                    props.onExpand(props.record, e);
                }}>
                    <img src={process.env.PUBLIC_URL + "/svgs/expand.svg"} ></img>
                </a>)
            } else {
                return (<a style={{ color: 'black', position: "relative", float: "left", marginRight: 15, marginLeft: 15 }} onClick={e => {
                    props.onExpand(props.record, e);
                }}>
                    <img src={process.env.PUBLIC_URL + "/svgs/minimize.svg"} ></img>
                </a>)
            }
        }
    }

    return (
        <div>
            {contentLoaded && data ?
                <Table
                    columns={columns}
                    // rowSelection={{ ...rowSelection }}
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
                        if (record?.error) {
                            return "error-class"
                        }
                        if (expandedRows.includes(record.key)) {
                            return "newclass"
                        }
                        return "row-class"
                    }
                    }
                    rootClassName='root'
                    rowKey={(record) => record.key}
                /> :
                <KFLoader />
            }
            <div style={{ height: 100 }} ></div>
            <div
                style={{
                    position: "fixed",
                    width: "100%",
                    height: 50,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        padding: 5,
                        alignItems: "center",
                        gap: 10
                    }} >
                    <KFButton
                        buttonType="secondary"
                        onClick={async () => {
                            // setData(prevData.current);
                            KFSDK.app.page.popup.close();
                        }}
                    >Close</KFButton>
                    <KFButton
                        buttonType="primary"
                        onClick={async () => {
                            setWeightageError(false)
                            let weightages = validateWeightage(data, {}, "root")
                            let invalidIds = Object.keys(weightages).filter((w: any) => (weightages[w] != 100))
                            let delta = calculateDelta(data, prevData.current, []);
                            if (invalidIds.length == 0) {
                                setWeightageLoading(true)
                                if (delta["section"] && delta["section"].length > 0) {
                                    await updateWeightage(delta["section"], sourcingSection);
                                }
                                if (delta["question"] && delta["question"].length > 0) {
                                    await updateWeightage(delta["question"], sourcingQuestion);
                                }

                                let processPayload: Record<string, any> = {}
                                if (delta["line_item"] && delta["line_item"].length > 0) {
                                    processPayload[lineItemTableKey] = delta["line_item"];
                                }
                                if (delta["line_item_params"] && delta["line_item_params"].length > 0) {
                                    processPayload[lineItemTableKey] = delta["line_item_params"].map((p: any) => {
                                        let sKey = p._id.split("#");
                                        return ({
                                            _id: sKey[0],
                                            [sKey[1]]: p.Weightage
                                        })
                                    });
                                }

                                if (delta["questionnaire"] && delta["questionnaire"].length > 0) {
                                    processPayload[Questionnaire] = delta["questionnaire"][0].Weightage;
                                }
                                if (delta["commercial_details"] && delta["commercial_details"].length > 0) {
                                    processPayload[Commercial_Details] = delta["commercial_details"][0].Weightage;
                                }
                                if (delta["line_items"] && delta["line_items"].length > 0) {
                                    processPayload[Line_Items] = delta["line_items"][0].Weightage;
                                }
                                if (delta["line_item_info"] && delta["line_item_info"].length > 0) {
                                    delta["line_item_info"].forEach((info: any) => {
                                        processPayload[getKey(info._id)] = info.Weightage;
                                    })
                                }
                                await updateProcessWeightages(processPayload);
                                prevData.current = data;
                                showMessage(KFSDK, "Weightage has been saved successfully!")
                                setWeightageLoading(false)
                            } else {
                                setWeightageError(() => true)
                            }
                            setData((newData) => {
                                let d = getErrorData(newData, invalidIds)
                                return JSON.parse(JSON.stringify(d));
                            })
                        }}
                        loading={weightageLoading}
                    >Save</KFButton>
                </div>
            </div>
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
        setData((data: any) => {
            let overall: any = {
                children: data
            }
            let modData = findAndReplace(overall, record.key, value);
            return JSON.parse(JSON.stringify(modData.children))
        })
    }

    function findAndReplace(data: Data, keyName: string, value: number) {
        if (data.key == keyName) return {
            ...data,
            Weightage: value
        }
        let i = 0;
        while (data.children && i < data.children.length) {
            data.children[i] = findAndReplace(data.children[i], keyName, value);
            i++;
        }
        return data;
    }
    function findAndReplaceWeightage(data: Data, keyName: string) {
        if (data.key == keyName) return {
            ...data,
            children: splitWeightageToAllChildren(data)
        }
        let i = 0;
        while (data.children && i < data.children.length) {
            data.children[i] = findAndReplaceWeightage(data.children[i], keyName);
            i++;
        }
        return data;
    }

    function splitWeightage(key: string) {
        setData((data: any) => {
            let overall: any = {
                children: data
            }
            let modData = findAndReplaceWeightage(overall, key);
            return JSON.parse(JSON.stringify(modData.children))
        })
    }

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", height: "100%"
        }} key={record.key} >
            {
                <div style={{ padding: 3, width: "100%", display: "flex", alignItems: "center", height: "90%", marginLeft: 10 }} >
                    <InputNumber
                        status={record.error && 'error'}
                        style={{
                            width: 120,
                            background: "white"
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
                                    splitWeightage(record.key)
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

function splitWeightageToAllChildren(rootData: Record<string, any>) {
    let data = rootData.children;
    let { lastValue, value } = calculateSplitValue(data.length)
    for (let i = 0; i < data.length; i++) {
        if (i == data.length - 1) {
            data[i].Weightage = lastValue;
        } else {
            data[i].Weightage = value;
        }
        if (data[i].children) {
            data[i].children = splitWeightageToAllChildren(data[i]);
        }
    }
    return data;
}

function getErrorData(prevData: any[], keys: string[]) {
    let data = prevData;
    for (let i = 0; i < data.length; i++) {
        let index = keys.indexOf(data[i].key);
        if (index >= 0) {
            data[i].error = true;
        } else {
            data[i].error = false;
        }
        if (data[i].children) {
            data[i].children = getErrorData(data[i].children, keys)
        }
    }
    return data;
}

export { AccordionTableWeightage };
