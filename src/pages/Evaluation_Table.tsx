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

                const techniCalItems = await buildTechnicalItems(sourcingDetails.Current_Stage);
                const commercialItems = await buildCommercialItems(lineItemInstanceIds, sourcingDetails);

                let questionnaires: TableRowData = {
                    key: `Questionnaire_Score_${evaluatorSequence}`,
                    parameters: "Questionnaire",
                    type: "questionniare",
                    children: techniCalItems
                }

                let commercials: TableRowData = {
                    key: `Commercial_Score_${evaluatorSequence}`,
                    parameters: "Commercials",
                    type: "commercial_details",
                    children: commercialItems
                }

                let overAllScore: TableRowData = {
                    key: `Score_${evaluatorSequence}`,
                    parameters: "OverAll Score",
                    type: "root",
                    children: [questionnaires, commercials]
                }

                for (let i = 0; i < responses.length; i++) {
                    const task: any = responses[i];
                    overAllScore[task.Supplier_ID] = task[`Score_${evaluatorSequence}`] || 0;
                    questionnaires[task.Supplier_ID] = task[`Questionnaire_Score_${evaluatorSequence}`] || 0;
                    commercials[task.Supplier_ID] = task[`Commercial_Score_${evaluatorSequence}`] || 0;
                }

                console.log("overAllScore: ", overAllScore)

                buildColumns(respondedSuppliers);
                setData([overAllScore]);
                setContentLoaded(true);
            })()
        }
    }, [sourcingEventId])

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

        let sectionCols: TableRowData[] = [];
        let sectionKey: Record<string, number> = {}

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const sectionQuestion = questions.filter((q) => (q.Section_ID == section.Section_ID && q.Supplier_ID == section.Supplier_ID))
            let questionKey: Record<string, number> = {}
            let questionCols: TableRowData[] = []

            for (let j = 0; j < sectionQuestion.length; j++) {
                let { Question, _id, Supplier_ID, Text_Response, ...rest } = sectionQuestion[j]
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
                            editScore: true
                        }
                    )
                    questionKey[Question] = questionCols.length - 1;
                }
            }

            if (section.Section_Name in sectionKey) {
                sectionCols[sectionKey[section.Section_Name]] = {
                    ...sectionCols[sectionKey[section.Section_Name]],
                    [section.Supplier_ID]: section[getScoreKey(evaluatorSequence)],
                    [`${section.Supplier_ID}_instance_id`]: section._id,
                }
            } else {
                sectionCols.push(
                    {
                        key: section._id,
                        parameters: section.Section_Name,
                        type: "section",
                        [section.Supplier_ID]: section[getScoreKey(evaluatorSequence)] || 0,
                        [`${section.Supplier_ID}_instance_id`]: section._id,
                        children: questionCols
                    }
                )
                sectionKey[section.Section_Name] = sectionCols.length - 1;
            }
        }

        return sectionCols;
    }

    async function buildCommercialItems(instanceIds: string[], SourcingDetails: any) {
        const applicableCommercialInfo = SourcingDetails[Applicable_commercial_info]
        let commercials: TableRowData[] = []
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
            applicableCommercialInfo.forEach((info: string) => {
                let newCommercialsInfos = {
                    key: `${info.replaceAll(" ", "_")}_Score_${evaluatorSequence}`,
                    type: "line_item_info",
                    parameters: info,
                    [Supplier_ID]: rest[`${info.replaceAll(" ", "_")}_Score_${evaluatorSequence}`]
                }
                commercials.push(newCommercialsInfos)
            })

            rest[`Table::Line_Items`].forEach((item: any) => {
                lineItems?.children?.push({
                    key: item._id,
                    type: "line_item",
                    parameters: item.Item.Item,
                    [Supplier_ID]: item[`Score_${evaluatorSequence}`],
                    [getResponseKey(Supplier_ID)]: `$${item.Line_Total}`
                })
            });
            lineItems[Supplier_ID] = rest[`Line_Items_Score_${evaluatorSequence}`]
        }
        commercials.push(lineItems);
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
                                mergeCell={record.mergeCell}
                                evaluatorSequence={evaluatorSequence}
                                isViewOnly={isViewOnly || !record.editScore}
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

function RowRender({ record: { id, key, type, ...rest }, mergeCell, evaluatorSequence, isViewOnly = true }: any) {
    const [scoreValue, setScoreValue] = useState(0);

    useEffect(() => {
        if (rest[id]) {
            setScoreValue(rest[id])
        }
    }, [rest[id]])

    async function saveScore() {
        let dataform = type == "section" ? supplierResponseSection : supplierResponseQuestion;
        let payload: any = {}
        payload[`Score_${evaluatorSequence}`] = scoreValue;

        const lineDetails: any[] = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${dataform}/${key}`, {
            method: "POST",
            body: JSON.stringify(payload)
        }));
        return lineDetails
    }

    return (
        <div style={{
            height: "100%", width: "100%", display:"flex", alignItems:"center"
        }} >
            {isViewOnly ?
                <div style={{textAlign: "left", paddingLeft: 15}} >
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
                        if (scoreValue != rest[key]) {
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
