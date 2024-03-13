import { InputNumber, Table } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useState } from 'react';
import { Applicable_commercial_info, dataforms, leafNodes, rootNodes as oldRootNode, processes } from '../helpers/constants';
import { SourcingMaster, SourcingSupplierResponses } from '../types';
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
    const [selectedColumn, setSelectedColumn] = useState<string>();
    const [contentLoaded, setContentLoaded] = useState(false);
    // const [suppliers, setSuppliers] = useState<any[]>([]);
    const [sourcingEventId, setSourcingEventId] = useState<string>("");
    const [columns, setColumns] = useState<any[]>([])
    const [data, setData] = useState<any[]>([])
    const [evaluatorSequence, setEvaluatorSequence] = useState(0);
    const [isViewOnly, setIsViewOnly] = useState(true);

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            // let allParams = await KFSDK.app.page.getAllParameters();
            // const sourcing_event_id = allParams.sourcing_event_id;
            const sourcing_event_id = "Pk8sR3hY9Rmn";
            const evaluator_sequence = 1;
            const viewOnly = false
            setSourcingEventId(sourcing_event_id)
            setEvaluatorSequence(evaluator_sequence)
            setIsViewOnly(viewOnly);
        })()
    }, [])

    useEffect(() => {
        if (sourcingEventId) {
            (async () => {
                const sourcingDetails: SourcingMaster = await getSourcingDetails(sourcingEventId)
                let suppliers = sourcingDetails["Table::Add_Existing_Suppliers"].map((supplier) => ({
                    _id: supplier.Supplier_Name_1._id,
                    Supplier_Name: supplier.First_Name_1
                }))
                const responses: SourcingSupplierResponses[] = (await getSourcingSupplierResponses(sourcingEventId)).Data;
                let lineItemInstanceIds = responses.map((response) => response.Line_Item_instance_id)
                let respondedSupplierIds = responses.map((s) => s.Supplier_ID)
                let respondedSuppliers = suppliers.filter((supplier) => respondedSupplierIds.includes(supplier._id))

                const questionnaires = await buildTechnicalItems(sourcingDetails.Current_Stage);
                const commercials = await buildCommercialItems(lineItemInstanceIds, sourcingDetails);

                let overAllScore: TableRowData = {
                    key: `Score_${evaluatorSequence}`,
                    parameters: "OverAll Score",
                    type: "root",
                    children: [questionnaires, commercials]
                }

                for (let i = 0; i < respondedSupplierIds.length; i++) {
                    const supplierId: any = respondedSupplierIds[i];
                    overAllScore[supplierId] = questionnaires[supplierId] + commercials[supplierId];
                }

                console.log("overAllScore: ", overAllScore)

                buildColumns(respondedSuppliers);
                setData([overAllScore]);
                setContentLoaded(true);
            })()
        }
    }, [sourcingEventId])

    function updateValueFields(supplierId: string,value: number, diff: number, path: number[]) {
        setData((data) => {
            let dataObject = data;
            let overallData = dataObject[0]
            overallData[supplierId] = overallData[supplierId] + (diff)
            for (let i = 0; i < path.length ; i++) {
                if(i == path.length - 1) {
                    overallData.children[path[i]][supplierId] = value;
                } else {
                    overallData.children[path[i]][supplierId] = overallData.children[path[i]][supplierId] + (diff);
                    overallData = overallData.children[path[i]];
                }
            }
            console.log("updateValueFields" , dataObject)
            return JSON.parse(JSON.stringify(dataObject));
        })
    }

    function getTitleWithCheckbox(key: string, title: string) {
        return <div style={{ display: "flex" }} >
            {/* <Checkbox disabled={selectedColumn ? selectedColumn !== key : false}
                onChange={(event) => event.target.checked ? setSelectedColumn(key) : setSelectedColumn("")} style={{ marginRight: 5 }} ></Checkbox> */}
            <p>{title}</p>
        </div>
    }

    async function buildTechnicalItems(currentStage: string) {
        let sections = await getSupplierSections(sourcingEventId, currentStage);
        let questions = await getSupplierQuestions(sourcingEventId, currentStage);

        let technicalItems: TableRowData[] = [];
        let sectionKey: Record<string, number> = {}
        // let supplierQuestionnaireSum: Record<string, number> = {};

        let questionnaires: TableRowData = {
            key: `Questionnaire_Score_${evaluatorSequence}`,
            parameters: "Questionnaire",
            type: "questionniare",
            path: [0]
        };

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const sectionQuestion = questions.filter((q) => (q.Section_ID == section.Section_ID && q.Supplier_ID == section.Supplier_ID))
            let questionKey: Record<string, number> = {}
            let supplierSectionSum: Record<string, number> = {};

            if (section.Section_Name in sectionKey) {
                technicalItems[sectionKey[section.Section_Name]] = {
                    ...technicalItems[sectionKey[section.Section_Name]],
                    [section.Supplier_ID]: supplierSectionSum[section.Supplier_ID],
                    [`${section.Supplier_ID}_instance_id`]: section._id,
                }
            } else {
                technicalItems.push(
                    {
                        key: section._id,
                        parameters: section.Section_Name,
                        type: "section",
                        [`${section.Supplier_ID}_instance_id`]: section._id,
                        children: [],
                        path: [0, technicalItems.length]
                    }
                )
                sectionKey[section.Section_Name] = technicalItems.length - 1;
            }

            let currentItem = technicalItems[technicalItems.length - 1];
            let questionCols = currentItem?.children || [];

            for (let j = 0; j < sectionQuestion.length; j++) {
                let { Question, _id, Supplier_ID, Text_Response, ...rest } = sectionQuestion[j]
                supplierSectionSum[Supplier_ID] = supplierSectionSum[Supplier_ID] ? supplierSectionSum[Supplier_ID] + rest[getScoreKey(evaluatorSequence)] : rest[getScoreKey(evaluatorSequence)] || 0;
                if (Question in questionKey) {
                    questionCols[questionKey[Question]] = {
                        ...questionCols[questionKey[Question]],
                        [Supplier_ID]: rest[getScoreKey(evaluatorSequence)] || 0,
                        [getResponseKey(Supplier_ID)]: Text_Response,
                        [`${Supplier_ID}_instance_id`]: _id,
                    }
                } else {
                    questionCols.push(
                        {
                            key: _id,
                            parameters: Question,
                            [Supplier_ID]: rest[getScoreKey(evaluatorSequence)] || 0,
                            [getResponseKey(Supplier_ID)]: Text_Response,
                            [`${Supplier_ID}_instance_id`]: _id,
                            type: "question",
                            editScore: true,
                            path: [...currentItem.path, questionCols.length]
                        }
                    )
                    questionKey[Question] = questionCols.length - 1;
                }
            }
            currentItem[section.Supplier_ID] = supplierSectionSum[section.Supplier_ID];

            questionnaires[section.Supplier_ID] = questionnaires[section.Supplier_ID] ? questionnaires[section.Supplier_ID] + supplierSectionSum[section.Supplier_ID] : supplierSectionSum[section.Supplier_ID];
        }

        questionnaires.children = technicalItems;

        return questionnaires
    }

    async function buildCommercialItems(instanceIds: string[], SourcingDetails: any) {
        const applicableCommercialInfo = SourcingDetails[Applicable_commercial_info]
        let commercials: TableRowData = {
            key: `Commercial_Score_${evaluatorSequence}`,
            parameters: "Commercials",
            type: "commercial_details",
            children: [],
            path: [1]
        }
        let lineItems: TableRowData = {
            key: "Table::Line_Items",
            parameters: "Line Items",
            type: "line_items",
            children: [],
        }

        for await (const id of instanceIds) {
            const {
                Supplier_ID,
                ...rest
            } = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/process/2/${KFSDK.account._id}/admin/${SupplierLineItem}/${id}`));
            let commercialSum = 0
            applicableCommercialInfo.forEach((info: string) => {
                let newCommercialsInfos = {
                    key: `${info.replaceAll(" ", "_")}_Score_${evaluatorSequence}`,
                    type: "line_item_info",
                    parameters: info,
                    [Supplier_ID]: rest[`${info.replaceAll(" ", "_")}_Score_${evaluatorSequence}`],
                    editScore: true,
                    [`${Supplier_ID}_instance_id`]: id,
                    path: [1, commercials.children?.length]
                }
                commercials.children?.push(newCommercialsInfos)
                commercialSum += rest[`${info.replaceAll(" ", "_")}_Score_${evaluatorSequence}`];
            })
            let lineItemsSum = 0
            rest[`Table::Line_Items`].forEach((item: any) => {
                lineItems?.children?.push({
                    key: item._id,
                    type: "line_item",
                    parameters: item.Item.Item,
                    [Supplier_ID]: item[`Score_${evaluatorSequence}`],
                    [getResponseKey(Supplier_ID)]: `$${item.Line_Total}`,
                    editScore: true,
                    [`${Supplier_ID}_instance_id`]: id,
                    path: [1, commercials.children?.length, lineItems?.children.length]
                })
                lineItemsSum += item[`Score_${evaluatorSequence}`];
            });
            lineItems[Supplier_ID] = lineItemsSum;
            commercials[Supplier_ID] = commercialSum + lineItemsSum;
        }
        commercials.children?.push(lineItems);
        return commercials;
    }

    function buildColumns(suppliers: any) {
        const columns: any = [{
            title: "Parameters",
            dataIndex: 'parameters',
            key: 'parameters',
            fixed: "left",
            width: 200
        }];
        suppliers.forEach(({ _id, Supplier_Name }: any) => {
            columns.push({
                key: _id,
                title: getTitleWithCheckbox(_id, Supplier_Name),
                children: [
                    {
                        title: "Response",
                        dataIndex: getResponseKey(_id),
                        key: getResponseKey(_id),
                        render: (text: string, record: any) => ({
                            children: <p style={{ marginLeft: 8 }} >{text}</p>
                        }),
                        width: 280,
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
                            />
                        }),
                        width: 100,
                    }],
            })
        })
        setColumns(columns)
    }

    const getSourcingDetails = async (sourcing_event_id: string) => {
        const sourcingdetails = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/process/2/${KFSDK.account._id}/admin/${SourcingMasterProcess}/${sourcing_event_id}`));
        return sourcingdetails;
    }

    const getSourcingSupplierResponses = async (sourcing_event_id: string) => {
        const sourcingdetails = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${supplierResponses}/allitems/list`, {
            method: "POST",
            body: JSON.stringify({
                Filter: {
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
                            "LHSField": "Response_Status",
                            "Operator": "EQUAL_TO",
                            "RHSType": "Value",
                            "RHSValue": ResponseStatus.Active,
                            "RHSField": null,
                            "RHSParam": "",
                            "LHSAttribute": null,
                            "RHSAttribute": null
                        },
                        {
                            "LHSField": "Evaluation_Status",
                            "Operator": "EQUAL_TO",
                            "RHSType": "Value",
                            "RHSValue": Evaluation_Status.Not_Completed,
                            "RHSField": null,
                            "RHSParam": "",
                            "LHSAttribute": null,
                            "RHSAttribute": null
                        },
                    ]
                }
            })
        }));
        return sourcingdetails;
    }

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

        const sections: SupplierSection[] = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${supplierResponseSection}/allitems/list?${queries}`, {
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

        const questions: SupplierQuestion[] = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${supplierResponseQuestion}/allitems/list?${queries}`, {
            method: "POST",
            body: JSON.stringify(payload)
        })).Data

        return questions;
    }

    function getResponseKey(id: string) {
        return `${id}_response`
    }

    return (
        <div>
            {contentLoaded ? <Table
                columns={columns}
                rowSelection={{ ...rowSelection }}
                dataSource={data}
                bordered
                pagination={false}
                className="custom-table"
                scroll={{ x: window.innerWidth - 100, y: window.innerHeight - 115 }}
            /> : "Loading..."}
        </div>
    );
};

function RowRender({ record: { key, type, path, ...rest }, evaluatorSequence, isViewOnly = true, text, supplierId, updateValueFields }: any) {
    const [scoreValue, setScoreValue] = useState(0);
    let processInstanceId = rest[`${supplierId}_instance_id`];

    useEffect(() => {
        if (rest[supplierId]) {
            setScoreValue(rest[supplierId])
        }
    }, [rest[supplierId]])

    async function saveScore() {
        switch (type) {
            case "line_item_info":
                let linePayload: any = {}
                linePayload[key] = scoreValue;
                (await KFSDK.api(`${process.env.REACT_APP_API_URL}/process/2/${KFSDK.account._id}/admin/${SupplierLineItem}/${processInstanceId}`, {
                    method: "PUT",
                    body: JSON.stringify(linePayload)
                }))
                break;
            case "line_item":
                let commercialPayload: any = {}
                commercialPayload[`Table::Line_Items`] = [
                    {
                        _id: key,
                        [`Score_${evaluatorSequence}`]: scoreValue
                    }
                ];
                (await KFSDK.api(`${process.env.REACT_APP_API_URL}/process/2/${KFSDK.account._id}/admin/${SupplierLineItem}/${processInstanceId}`, {
                    method: "PUT",
                    body: JSON.stringify(commercialPayload)
                }))
                break;
            case "section":
            case "question":
                let dataform = type == "section" ? supplierResponseSection : supplierResponseQuestion;
                let payload: any = {}
                payload[`Score_${evaluatorSequence}`] = scoreValue;

                (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${dataform}/${key}`, {
                    method: "POST",
                    body: JSON.stringify(payload)
                }))
                break;
        }
    }

    return (
        <div style={{
            height: "100%", width: "100%", display: "flex", alignItems: "center",  backgroundColor: "#fafafa"
        }} >
            {isViewOnly ?
                <div style={{ textAlign: "left", paddingLeft: 15}} >
                    {scoreValue}
                </div> :
                <InputNumber
                    value={scoreValue}
                    onChange={(value) => {
                        if (value) {
                            setScoreValue(value);
                        }
                    }}
                    onBlur={async () => {
                        if (scoreValue != rest[supplierId]) {
                            let diff = scoreValue - rest[supplierId];
                            updateValueFields(supplierId,scoreValue,diff,path)
                            await saveScore()
                        }
                    }}
                    min={0}
                    max={100}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        borderRadius: 0,
                        border: "0px"
                    }}
                />
            }
        </div>)
}
export { Evaluation_Table };
