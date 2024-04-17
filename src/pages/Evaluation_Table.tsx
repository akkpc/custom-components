import { InputNumber, Table, Typography } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useRef, useState } from 'react';
import { KFButton } from '../components/KFButton';
import { KFLoader } from '../components/KFLoader';
import { tableFontColor } from '../helpers/colors';
import { Applicable_commercial_info, dataforms, leafNodes, rootNodes as oldRootNode, processes } from '../helpers/constants';
import { SourcingMaster, SourcingSupplierResponses } from '../types';
import { customExpandIcon } from './AssessAndAwardTable';
const KFSDK = require("@kissflow/lowcode-client-sdk")

const {
    supplierResponses,
    supplierResponseSection,
    supplierResponseQuestion
} = dataforms;

const {
    SourcingMaster: SourcingMasterProcess,
    SupplierLineItem
} = processes;

let rootNodes = oldRootNode.concat("root");
const allNodes = rootNodes.concat(leafNodes)

enum ResponseStatus {
    Active = "Active",
    Draft = "Draft"
}

enum Evaluation_Status {
    Completed = "Completed",
    Not_Completed = "Not Completed"
}

interface DataType {
    key: React.ReactNode;
    parameters: string;
    Pk8LrjrVGBG7: number;
    sup_02: number;
    children?: DataType[];
    childUrl?: string;
    showCheckBox?: boolean;
    path: []
}

interface TableRowData {
    key: string;
    parameters: string;
    type: typeof allNodes[number];
    children?: TableRowData[];
    [key: string]: any;
}

interface SupplierSection {
    _id: string;
    Section_ID: string;
    Template_ID: string;
    Sourcing_Event_ID: string;
    Supplier_ID: string;
    Event_Stage: string;
    Instance_ID: string;
    Section_Name: string;
    Progress: number;
    Score: number;
    Score_1: number;
    Score_2: number;
    Score_3: number;
};
interface SupplierQuestion {
    _id: string;
    Section_ID: string;
    Template_ID: string;
    Question_ID: string;
    Question: string;
    Response_Type: string;
    Sourcing_Event_ID: string;
    Weightage: number;
    Supplier_ID: string;
    Event_Stage: string;
    Instance_ID: string;
    Dropdown_options: string;
    Score: number;
    Score_1: number;
    Score_2: number;
    Score_3: number;
    Text_Response: string;
};

const rowSelection: TableRowSelection<DataType> = {
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    onSelect: (record, selected, selectedRows) => {
        console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
        console.log(selected, selectedRows, changeRows);
    },
    getCheckboxProps: (record) => ({
        className: record.showCheckBox ? "" : "hide-row"
    }),
    hideSelectAll: true,
};

function getScoreKey(sequence: number): ("Score_1" | "Score_2" | "Score_3") {
    if (sequence == 1) return "Score_1"
    if (sequence == 2) return "Score_1"
    return "Score_3"
}


const Evaluation_Table: React.FC = () => {
    const [contentLoaded, setContentLoaded] = useState(false);
    const [selectedSuppliers, setSelectedSuppliers] = useState<any[]>([]);
    const [sourcingEventId, setSourcingEventId] = useState<string>("");
    const [columns, setColumns] = useState<any[]>([])
    const [data, setData] = useState<any[]>([])
    const [evaluatorSequence, setEvaluatorSequence] = useState(0);
    const [isViewOnly, setIsViewOnly] = useState(true);
    const [sourcingDetails, setSourcingDetails] = useState<SourcingMaster>();
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const prevData = useRef(data);

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            let { sourcing_event_id, supplierIds } = await KFSDK.app.page.getAllParameters();
            const viewOnly = false
            const sourcing_details: SourcingMaster = await getSourcingDetails(sourcing_event_id)
            const es = findSequence(sourcing_details)
            setSelectedSuppliers(JSON.parse(supplierIds));
            setEvaluatorSequence(es)
            setSourcingDetails(sourcing_details);
            setSourcingEventId(sourcing_event_id)
            setIsViewOnly(viewOnly);
        })();
    }, [])

    useEffect(() => {
        if (sourcingDetails) {
            (async () => {
                // const responses: SourcingSupplierResponses[] = (await getSourcingSupplierResponses(sourcingEventId)).Data;
                let respondedSuppliers = selectedSuppliers.map((response, index) => {
                    let supplierIndex = sourcingDetails["Table::Add_Existing_Suppliers"].findIndex((s) => s.Supplier_Name_1._id == response.Supplier_ID)
                    if (supplierIndex >= 0) {
                        let { First_Name_1 } = sourcingDetails["Table::Add_Existing_Suppliers"][supplierIndex]
                        return {
                            ...response,
                            Supplier_Name: First_Name_1
                        }
                    }
                    return {
                        ...response,
                        Supplier_Name: `Supplier ${index + 1}`
                    }
                })

                let overAllScore: TableRowData = {
                    key: `Score_${evaluatorSequence}`,
                    parameters: "OverAll Score",
                    type: "root",
                    children: []
                }

                if (["RFI", "RFP"].includes(sourcingDetails.Current_Stage)) {
                    const questionnaires = await buildTechnicalItems(respondedSuppliers, sourcingDetails.Current_Stage, evaluatorSequence, 0);
                    overAllScore?.children?.push(questionnaires);
                }


                if (sourcingDetails.Current_Stage == "RFQ" || sourcingDetails.Current_Stage == "RFP" && !sourcingDetails.Event_Type.includes("RFQ")) {
                    let cIndex = overAllScore?.children?.length || 0;
                    const commercials = await buildCommercialItems(respondedSuppliers, sourcingDetails, evaluatorSequence, cIndex);
                    overAllScore?.children?.push(commercials);
                }


                for (let i = 0; i < respondedSuppliers.length; i++) {
                    const { Supplier_ID: supplierId } = respondedSuppliers[i];
                    overAllScore[supplierId] = overAllScore.children?.reduce((prev: any, current: any) => prev[supplierId] || 0 + current[supplierId] || 0, 0);
                    //  questionnaires[supplierId] + commercials[supplierId];
                    overAllScore[`${supplierId}_instance_id`] = respondedSuppliers[i]._id;
                }

                console.log("overAllScore: ", overAllScore)
                prevData.current = [overAllScore];
                setData([overAllScore]);
                buildColumns(respondedSuppliers, evaluatorSequence);
                setContentLoaded(true);
            })()
        }
    }, [sourcingDetails])

    function findSequence(sourcingDetails: SourcingMaster) {
        if (sourcingDetails.Evaluator_1.Email_address === KFSDK.user.Email) {
            return 1
        } else if (sourcingDetails?.Evaluator_2?.Email_address === KFSDK.user.Email) {
            return 2
        } else if (sourcingDetails?.Evaluator_3?.Email_address === KFSDK.user.Email) {
            return 3
        } else {
            KFSDK.client.showInfo("Something went wrong");
            return 0;
        }
    }


    function getTitleWithCheckbox(key: string, title: string) {
        return <div style={{ display: "flex" }} >
            {/* <Checkbox disabled={selectedColumn ? selectedColumn !== key : false}
                onChange={(event) => event.target.checked ? setSelectedColumn(key) : setSelectedColumn("")} style={{ marginRight: 5 }} ></Checkbox> */}
            <p>{title}</p>
        </div>
    }


    // const updateValueFields = async (supplierId: string, value: number, diff: number, path: number[]) => {
    //     let dataObject = prevData.current;
    //     let overallData = dataObject[0]
    //     overallData[supplierId] = overallData[supplierId] + (diff)
    //     // overallData[supplierId] = 0

    //     await update(overallData, overallData[supplierId], supplierId)
    //     await Promise.all(path.map(async (index, i) => {
    //         let currentData = overallData.children[index];

    //         if (i == path.length - 1) {
    //             currentData[supplierId] = value;
    //             // currentData[supplierId] = 0;
    //         } else {
    //             currentData[supplierId] = overallData.children[index]
    //             [supplierId] + (diff);
    //             // currentData[supplierId] = 0;
    //             overallData = overallData.children[index];
    //         }
    //         await update(currentData, currentData[supplierId], supplierId)
    //     }));

    //     prevData.current = JSON.parse(JSON.stringify(dataObject));
    //     setData(() => prevData.current)
    // }

    const updateValueFields = async (supplierId: string, value: number, path: number[]) => {
        let dataObject = JSON.parse(JSON.stringify(prevData.current));
        let overallData = dataObject[0];
        path.map(async (index, i) => {
            let currentData = overallData.children[index];
            if (i == path.length - 1) {
                currentData[supplierId] = value;
            }
            overallData = currentData;
        })

        dataObject[0] = updateSumValue(dataObject[0], supplierId);

        overallData = dataObject[0];
        prevData.current = dataObject;
        setData(() => (dataObject));

        await update(overallData, overallData[supplierId], supplierId);
        for await (const dataIndex of path) {
            let currentData = overallData.children[dataIndex];
            await update(currentData, currentData[supplierId], supplierId);
            overallData = currentData;
        }
    }

    const updateSumValue = (data: any, supplierId: string) => {
        if (!data.children) {
            return;
        }
        for (let i = 0; i < data.children.length; i++) {
            updateSumValue(data.children[i], supplierId);
        }
        data[supplierId] = data.children.reduce((prev: number, current: any) => prev + current[supplierId], 0);
        return data;
    }

    async function update(instance: TableRowData, scoreValue: number, supplierId: string) {
        const { type, key, ...rest } = instance;
        let dataInstanceId = rest[`${supplierId}_instance_id`];
        switch (type) {
            case "root":
            case "questionnaire":
            case "commercial_details":
                (await KFSDK.api(`/form/2/${KFSDK.account._id}/${supplierResponses}/${dataInstanceId}`, {
                    method: "POST",
                    body: JSON.stringify({
                        [key]: scoreValue
                    })
                }))
                break;
            case "line_item_params":
                const [keyname] = key.split("#");
                (await KFSDK.api(`/process/2/${KFSDK.account._id}/admin/${SupplierLineItem}/${dataInstanceId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        [`Table::Line_Items`]: [
                            {
                                _id: rest[`${supplierId}_key`],
                                [keyname]: scoreValue
                            }
                        ]
                    })
                }))
                break;
            case "line_item":
                (await KFSDK.api(`/process/2/${KFSDK.account._id}/admin/${SupplierLineItem}/${dataInstanceId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        [`Table::Line_Items`]: [
                            {
                                _id: rest[`${supplierId}_key`],
                                [`Score_${evaluatorSequence}`]: scoreValue
                            }
                        ]
                    })
                }))
                break;
            case "line_items":
            case "line_item_info":
                (await KFSDK.api(`/process/2/${KFSDK.account._id}/admin/${SupplierLineItem}/${dataInstanceId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        [key]: scoreValue
                    })
                }))
                break;
            case "section":
            case "question":
                let dataform = type == "section" ? supplierResponseSection : supplierResponseQuestion;
                (await KFSDK.api(`/form/2/${KFSDK.account._id}/${dataform}/${dataInstanceId}`, {
                    method: "POST",
                    body: JSON.stringify({
                        [`Score_${evaluatorSequence}`]: scoreValue
                    })
                }))
                break;
        }
    }

    async function buildTechnicalItems(respondedSuppliers: SourcingSupplierResponses[], currentStage: string, evaluatorSequence: number, qIndex: number) {
        let sections = await getSupplierSections(sourcingEventId, currentStage);
        let questions = await getSupplierQuestions(sourcingEventId, currentStage);

        let technicalItems: TableRowData[] = [];
        let sectionKey: Record<string, number> = {}
        let questionKey: Record<string, number> = {}

        let questionnaires: TableRowData = {
            key: `Questionnaire_Score_${evaluatorSequence}`,
            parameters: "Questionnaire",
            type: "questionnaire",
            path: [qIndex],
            children: []
        };
        // let sectionsColumns = questionnaires.children ? questionnaires.children : [];

        for (let i = 0; i < sections.length; i++) {
            const { Supplier_ID, ...section } = sections[i];
            const supplierResponse = respondedSuppliers.find((supplier) => supplier.Supplier_ID == Supplier_ID)
            const sectionQuestion = questions.filter((q) => (q.Section_ID == section.Section_ID && q.Supplier_ID == Supplier_ID))
            let supplierSectionSum: Record<string, number> = {};

            if (section.Section_ID in sectionKey) {
                technicalItems[sectionKey[section.Section_ID]] = {
                    ...technicalItems[sectionKey[section.Section_ID]],
                    [`${Supplier_ID}_instance_id`]: section._id,
                }
            } else {
                technicalItems.push(
                    {
                        key: section.Section_ID,
                        parameters: section.Section_Name,
                        type: "section",
                        children: [],
                        path: [qIndex, technicalItems.length],
                        [`${Supplier_ID}_instance_id`]: section._id
                    }
                )
                sectionKey[section.Section_ID] = technicalItems.length - 1;
            }

            let currentItem = technicalItems[sectionKey[section.Section_ID]];
            let questionCols = currentItem?.children || [];

            for (let j = 0; j < sectionQuestion.length; j++) {
                let { Question_ID, Question, _id, Text_Response, ...rest } = sectionQuestion[j]
                supplierSectionSum[Supplier_ID] = supplierSectionSum[Supplier_ID] ? supplierSectionSum[Supplier_ID] + rest[getScoreKey(evaluatorSequence)] : rest[getScoreKey(evaluatorSequence)] || 0;
                if (Question_ID in questionKey) {
                    questionCols[questionKey[Question_ID]] = {
                        ...questionCols[questionKey[Question_ID]],
                        [Supplier_ID]: rest[getScoreKey(evaluatorSequence)] || 0,
                        [getResponseKey(Supplier_ID)]: Text_Response,
                        [`${Supplier_ID}_instance_id`]: _id,
                    }
                } else {
                    questionCols.push(
                        {
                            key: Question_ID,
                            parameters: Question,
                            type: "question",
                            editScore: true,
                            path: [...currentItem.path, questionCols.length],
                            [Supplier_ID]: rest[getScoreKey(evaluatorSequence)] || 0,
                            [getResponseKey(Supplier_ID)]: Text_Response,
                            [`${Supplier_ID}_instance_id`]: _id,
                        }
                    )
                    questionKey[Question_ID] = questionCols.length - 1;
                }
            }
            currentItem[Supplier_ID] = supplierSectionSum[Supplier_ID];
            questionnaires[`${Supplier_ID}_instance_id`] = supplierResponse?._id
            questionnaires[Supplier_ID] = questionnaires[Supplier_ID] ? questionnaires[Supplier_ID] + supplierSectionSum[Supplier_ID] : supplierSectionSum[Supplier_ID] || 0;
        }

        questionnaires.children = technicalItems;

        return questionnaires
    }

    async function buildCommercialItems(supplierResponses: SourcingSupplierResponses[], SourcingDetails: any, evaluatorSequence: number, cIndex: number) {
        const applicableCommercialInfo = SourcingDetails[Applicable_commercial_info]
        const commercialInfoKeys: Record<string, number> = {};
        let commercials: TableRowData = {
            key: `Commercial_Score_${evaluatorSequence}`,
            parameters: "Commercials",
            type: "commercial_details",
            children: [],
            path: [cIndex]
        }
        let lineItems: TableRowData = {
            key: `Line_Items_Score_${evaluatorSequence}`,
            parameters: "Line Items",
            type: "line_items",
            children: [],
        }

        for await (const response of supplierResponses) {
            const {
                Line_Item_instance_id: id,
                _id
            } = response;
            const {
                Supplier_ID,
                ...rest
            } = (await KFSDK.api(`/process/2/${KFSDK.account._id}/admin/${SupplierLineItem}/${id}`));
            let commercialSum = 0

            for (const info of applicableCommercialInfo) {
                let key = `${info.replaceAll(" ", "_")}_Score_${evaluatorSequence}`;
                if (key in commercialInfoKeys && commercials.children) {
                    commercials.children[commercialInfoKeys[key]] = {
                        ...commercials.children[commercialInfoKeys[key]],
                        [Supplier_ID]: rest[key],
                        [`${Supplier_ID}_instance_id`]: id,
                        [getResponseKey(Supplier_ID)]: rest[`${info.replaceAll(" ", "_")}`],
                    }
                } else {
                    commercialInfoKeys[key] = commercials.children ? commercials.children?.length : 0;
                    commercials.children?.push({
                        key,
                        type: "line_item_info",
                        parameters: info,
                        editScore: true,
                        path: [cIndex, commercials.children?.length],
                        [Supplier_ID]: rest[key],
                        [`${Supplier_ID}_instance_id`]: id,
                        [getResponseKey(Supplier_ID)]: rest[`${info.replaceAll(" ", "_")}`],
                    })
                }

                commercialSum += rest[key];
            }

            let lines = rest[`Table::Line_Items`];
            let lineItemsSum = 0;

            console.log("lines", rest)

            if (lines.length > 0) {
                for (const item of lines) {
                    let key = item.Item?._id;

                    if (key in commercialInfoKeys && lineItems.children) {
                        lineItems.children[commercialInfoKeys[key]].children = lineItems.children[commercialInfoKeys[key]].children?.map((data) => {
                            return ({
                                ...data,
                                [`${Supplier_ID}_key`]: item._id,
                                [`${Supplier_ID}_instance_id`]: id,
                                [Supplier_ID]: item[data.key.split("#")[0]] || 0,
                                [getResponseKey(Supplier_ID)]: item[data.parameters],
                            })
                        })
                        lineItems.children[commercialInfoKeys[key]] = {
                            ...lineItems.children[commercialInfoKeys[key]],
                            [`${Supplier_ID}_key`]: item._id,
                            [`${Supplier_ID}_instance_id`]: id,
                            [Supplier_ID]: item[`Score_${evaluatorSequence}`],
                            [getResponseKey(Supplier_ID)]: item.Line_Total
                        }
                    } else {
                        commercialInfoKeys[key] = lineItems.children ? lineItems.children?.length : 0;
                        lineItems.children?.push({
                            key,
                            type: "line_item",
                            parameters: item.Item?.Item,
                            path: [cIndex, commercials.children?.length, lineItems.children?.length],
                            [`${Supplier_ID}_key`]: item._id,
                            [`${Supplier_ID}_instance_id`]: id,
                            [Supplier_ID]: item[`Score_${evaluatorSequence}`],
                            [getResponseKey(Supplier_ID)]: item.Line_Total,

                            children: item["Request_Quote_For"].split(",").map((requestKeyName: string, index: number) => ({
                                key: `${requestKeyName.replaceAll(" ", "_")}_Score_${evaluatorSequence}#${key}`,
                                type: "line_item_params",
                                parameters: requestKeyName,
                                editScore: true,
                                path: [cIndex, commercials.children?.length, lineItems.children?.length, index],
                                [`${Supplier_ID}_key`]: item._id,
                                [`${Supplier_ID}_instance_id`]: id,
                                [Supplier_ID]: item[`${requestKeyName}_Score_${evaluatorSequence}`] || 0,
                                [getResponseKey(Supplier_ID)]: item[requestKeyName],
                            }))
                        })
                    }
                    lineItemsSum += item[`Score_${evaluatorSequence}`];
                }
            }

            lineItems[Supplier_ID] = lineItemsSum;
            commercials[Supplier_ID] = commercialSum + lineItemsSum;

            lineItems[`${Supplier_ID}_instance_id`] = id;
            commercials[`${Supplier_ID}_instance_id`] = _id;
        }
        commercials.children?.push(lineItems);
        return commercials;
    }

    function buildColumns(suppliers: SourcingSupplierResponses[], evaluatorSequence: number) {
        const columns: any = [{
            title: "Parameters",
            dataIndex: 'parameters',
            key: 'parameters',
            fixed: "left",
            width: 500,
            render: (text: string, record: any, index: any) => (
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingLeft: getLeftPadding(record.type)
                }} >
                    <div style={{ display: "flex", color: tableFontColor, width: "100%" }}  >
                        <Typography style={{ width: record.type == "question" ? "95%" : "100%" }} >
                            {!["question", "line_item_params"].includes(record.type) ? `${index + 1}. ` : ""} {text}
                        </Typography>
                    </div>
                </div>
            )
        }];
        suppliers.forEach(({ Supplier_ID: _id, Supplier_Name }) => {
            columns.push({
                key: _id,
                title: getTitleWithCheckbox(_id, Supplier_Name || ""),
                children: [
                    {
                        title: "Response",
                        dataIndex: getResponseKey(_id),
                        key: getResponseKey(_id),
                        render: (text: string, record: any) => ({
                            children: <p style={{ marginLeft: 8 }} >
                                {
                                    record.type == "line_item_params" ?
                                        record.key.includes("Leadtime") ? `${text} Days` :
                                            record.key.includes("Price") ? `$${text}` : text : record.type == "line_item"
                                            ? `$${text}` : text
                                }
                            </p>
                        }),
                        width: 300,
                    },
                    {
                        title: "Score",
                        dataIndex: _id,
                        key: _id,
                        render: (text: string, record: any) => ({
                            children: <RowRender
                                record={record}
                                evaluatorSequence={evaluatorSequence}
                                isViewOnly={isViewOnly || !record.editScore}
                                text={text}
                                supplierId={_id}
                                updateValueFields={updateValueFields}
                            // data={data}
                            />
                        }),
                        width: 130,
                    }],
            })
        })
        setColumns(columns)
    }

    const getSourcingDetails = async (sourcing_event_id: string) => {
        const sourcingdetails = (await KFSDK.api(`/process/2/${KFSDK.account._id}/admin/${SourcingMasterProcess}/${sourcing_event_id}`));
        return sourcingdetails;
    }

    // const getSourcingSupplierResponses = async (sourcing_event_id: string) => {
    //     const sourcingdetails = (await KFSDK.api(`/form/2/${KFSDK.account._id}/${supplierResponses}/allitems/list`, {
    //         method: "POST",
    //         body: JSON.stringify({
    //             Filter: {
    //                 "AND": [
    //                     {
    //                         "LHSField": "Sourcing_Event_ID",
    //                         "Operator": "EQUAL_TO",
    //                         "RHSType": "Value",
    //                         "RHSValue": sourcing_event_id,
    //                         "RHSField": null,
    //                         "RHSParam": "",
    //                         "LHSAttribute": null,
    //                         "RHSAttribute": null
    //                     },
    //                     {
    //                         "LHSField": "Response_Status",
    //                         "Operator": "EQUAL_TO",
    //                         "RHSType": "Value",
    //                         "RHSValue": ResponseStatus.Active,
    //                         "RHSField": null,
    //                         "RHSParam": "",
    //                         "LHSAttribute": null,
    //                         "RHSAttribute": null
    //                     },
    //                     {
    //                         "LHSField": "Evaluation_Status",
    //                         "Operator": "EQUAL_TO",
    //                         "RHSType": "Value",
    //                         "RHSValue": Evaluation_Status.Not_Completed,
    //                         "RHSField": null,
    //                         "RHSParam": "",
    //                         "LHSAttribute": null,
    //                         "RHSAttribute": null
    //                     },
    //                 ]
    //             }
    //         })
    //     }));
    //     return sourcingdetails;
    // }

    const getSupplierSections = async (sourcing_event_id: string, currentStage: string) => {
        const queries = `page_number=1&page_size=100000`
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

        const sections: SupplierSection[] = (await KFSDK.api(`/form/2/${KFSDK.account._id}/${supplierResponseSection}/allitems/list?${queries}`, {
            method: "POST",
            body: JSON.stringify(payload)
        })).Data

        return sections;
    }

    const getSupplierQuestions = async (sourcing_event_id: string, currentStage: string) => {
        const queries = `page_number=1&page_size=100000`
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

        const questions: SupplierQuestion[] = (await KFSDK.api(`/form/2/${KFSDK.account._id}/${supplierResponseQuestion}/allitems/list?${queries}`, {
            method: "POST",
            body: JSON.stringify(payload)
        })).Data

        return questions;
    }

    function getResponseKey(id: string) {
        return `${id}_response`
    }

    async function evaluateCompletionStatus() {
        for (let i = 0; i < selectedSuppliers.length; i++) {
            const { Supplier_ID, _id } = selectedSuppliers[i]
            let status: any = calculate(data, Supplier_ID)
            let evalStatus = status ? "Completed" : "Not Completed";
            await KFSDK.api(`/form/2/${KFSDK.account._id}/${supplierResponses}/${_id}`, {
                method: "POST",
                body: JSON.stringify({
                    Evaluation_Status: evalStatus
                })
            });
        }
    }

    function calculate(data: any[], supplierId: string): any {
        let queue = [...data]
        while (queue.length > 0) {
            let curr: any = queue.shift();
            if (curr[supplierId] == 0) {
                return false
            }
            if (curr.children && curr.children.length > 0) {
                queue = [
                    ...queue,
                    ...curr.children
                ]
            }
        }
        return true
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }} >
            <div style={{ height: 700 }} >
                {contentLoaded ?
                    <Table
                        style={{
                            marginBottom: 20,
                        }}
                        columns={columns}
                        rowSelection={{ ...rowSelection }}
                        dataSource={data}
                        bordered
                        pagination={false}
                        className="custom-table-weightage"
                        scroll={{ x: window.innerWidth - 100, y: window.innerHeight - 172 }}
                        rowClassName={(record: any) => {
                            let classNames = ""
                            if (record.type == "root") {
                                classNames = classNames + "sticky-header-row "
                            }
                            if (expandedRows.includes(record.key)) {
                                classNames = classNames + "newclass-assess"
                            } else {
                                classNames = classNames + "row-class"
                            }
                            return classNames;
                        }
                        }
                        expandable={{
                            onExpand(expanded, record) {
                                if (expanded) {
                                    setExpandedRows((rows: string[]) => [...rows, record.key]);
                                } else {
                                    setExpandedRows((rows) => [...rows.filter((r) => r != record.key)])
                                }
                            },
                            expandIcon: customExpandIcon,
                            defaultExpandedRowKeys: [`Score_${evaluatorSequence}`]
                        }}
                        rootClassName='root'
                        rowKey={(record) => record.key}
                    /> :
                    <KFLoader />
                }
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    position: "fixed",
                    height: 60,
                    width: "100%",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    // borderTop: "1px solid #deeaff",
                    zIndex: 1000
                }}
            >
                <KFButton
                    buttonType='primary' style={{ marginRight: 10 }}
                    onClick={async () => {
                        let { prevQuery } = await KFSDK.app.page.getAllParameters();
                        await evaluateCompletionStatus()
                        KFSDK.app.openPage("Sourcing_Buyer_Evaluation_A00", JSON.parse(prevQuery))
                    }}
                >Save & Close</KFButton>
            </div>
        </div>
    );
};

function RowRender({ record: { key, type, path, ...rest }, isViewOnly = true, text, supplierId, updateValueFields, index }: any) {
    const [scoreValue, setScoreValue] = useState(0);

    useEffect(() => {
        if (rest[supplierId]) {
            setScoreValue(Number(rest[supplierId].toFixed(0)))
        }
    }, [rest[supplierId]])

    return (
        <div style={{
            height: "100%", width: "100%", display: "flex", alignItems: "center", backgroundColor: "#fafafa"
        }} >
            {isViewOnly ?
                <div style={{ textAlign: "left", marginLeft: 28 }} >
                    {scoreValue}
                </div> :
                <InputNumber
                    disabled={rest[supplierId] == undefined}
                    value={scoreValue}
                    onChange={(value) => {
                        if (value) {
                            setScoreValue(value);
                        }
                    }}
                    onBlur={async () => {
                        // let diff = scoreValue - (rest[supplierId] || 0);
                        await updateValueFields(supplierId, scoreValue, path)
                    }}
                    min={0}
                    max={100}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        borderRadius: 2
                    }}
                />
            }
        </div>)
}

function getLeftPadding(key: string) {
    if (key == "question") return 12
    if (key == "line_item_info") return 36
    if (key == "line_item_params") return 70
    return 0;
}

export { Evaluation_Table };
