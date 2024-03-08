import { InputNumber, Table } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useState } from 'react';
import { SourcingMasterProcess } from '../helpers/constants';
import { SourcingMaster } from '../types';
const KFSDK = require("@kissflow/lowcode-client-sdk")

const supplierResponseTemplate = "Sourcing_Supplier_Response_Templat_A00"
const supplierResponseSection = "Sourcing_Supplier_Response_Section_A00"
const supplierResponseQuestion = "Sourcing_Supplier_Response_Questio_A01"
const supplierResponseCommercials = "Sourcing_Supplier_Line_Items_A00"

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
    type: "question" | "section";
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
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [sourcingEventId, setSourcingEventId] = useState<string>("");
    const [columns, setColumns] = useState<any[]>([])
    const [data, setData] = useState<any[]>([])
    const [currentStage, setCurrentStage] = useState("");
    const [evaluatorSequence, setEvaluatorSequence] = useState(0);

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            // let allParams = await KFSDK.app.page.getAllParameters();
            // const sourcing_event_id = allParams.sourcing_event_id;
            const sourcing_event_id = "Pk8qwoggRz6U";
            const eventStage = "RFP"
            const evaluator_sequence = 1;

            const sourcingDetails: SourcingMaster = await getSourcingDetails(sourcing_event_id)
            const suppliers = sourcingDetails["Table::Add_Existing_Suppliers"].map((supplier) => ({
                _id: supplier.Supplier_Name_1._id,
                Supplier_Name: supplier.First_Name_1
            }))
            setCurrentStage(eventStage);
            setSuppliers(suppliers)
            setSourcingEventId(sourcing_event_id)
            setEvaluatorSequence(evaluator_sequence)
        })()
    }, [])

    useEffect(() => {
        if (sourcingEventId && suppliers) {
            (async () => {
                buildColumns();
                const sections = await getSupplierSections(sourcingEventId, currentStage);
                const questions = await getSupplierQuestions(sourcingEventId, currentStage);

                const tableData: TableRowData[] = [];

                for (let i = 0; i < sections.length; i++) {
                    const section = sections[i];
                    let newSection: TableRowData = {
                        id: section.Supplier_ID,
                        key: section._id,
                        parameters: section.Section_Name,
                        [section.Supplier_ID]: section[getScoreKey(evaluatorSequence)],
                        type: "section",
                        mergeCell: true,
                        children: questions.filter((q) => (q.Section_ID == section.Section_ID && q.Supplier_ID == section.Supplier_ID)).map((q) => ({
                            id: section.Supplier_ID,
                            key: q._id,
                            parameters: q.Question,
                            [q.Supplier_ID]: q[getScoreKey(evaluatorSequence)] || 0,
                            [getResponseKey(q.Supplier_ID)]: q.Text_Response,
                            type: "question",
                        }))
                    }
                    tableData.push(newSection)
                }
                console.log("tableData", tableData)
                setData(tableData);
                setContentLoaded(true);
            })()
        }
    }, [suppliers])

    function getTitleWithCheckbox(key: string, title: string) {
        return <div style={{ display: "flex" }} >
            {/* <Checkbox disabled={selectedColumn ? selectedColumn !== key : false}
                onChange={(event) => event.target.checked ? setSelectedColumn(key) : setSelectedColumn("")} style={{ marginRight: 5 }} ></Checkbox> */}
            <p>{title}</p>
        </div>
    }


    function buildColumns() {
        const columns: any = [{
            title: "Parameters",
            dataIndex: 'parameters',
            key: 'parameters',
            fixed: "left",
            width: 300
        }];
        suppliers.forEach(({ _id, Supplier_Name }) => {
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
                        width: 300,
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
                            />
                        }),
                        width: 130,
                    }],
            })
        })
        setColumns(columns)
    }

    const getSourcingDetails = async (sourcing_event_id: string) => {
        const sourcingdetails = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/process/2/${KFSDK.account._id}/admin/${SourcingMasterProcess}/${sourcing_event_id}`));
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
                                "LHSField": "Sourcing_event_ID",
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
                        "OR": [
                            {
                                "LHSField": "Sourcing_event_ID",
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
                scroll={{ x: window.innerWidth, y: window.innerHeight - 115 }}
            /> : "Loading..."}
        </div>
    );
};

function RowRender({ record: { id, key, type, ...rest }, mergeCell, evaluatorSequence }: any) {
    const [scoreValue, setScoreValue] = useState(0);

    useEffect(() => {
        console.log("first", rest, key, id)
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
            display: "flex", alignItems: "center", justifyContent: "center", height: "100%"
        }} >
            {
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
                />
            }
        </div>)
}
export { Evaluation_Table };
