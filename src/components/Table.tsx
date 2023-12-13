import { Checkbox, Table } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useState } from 'react';
import { getColorCode } from '../helpers';
import { baseUrl } from '../helpers/constants';
const KFSDK = require("@kissflow/lowcode-client-sdk")

interface SupplierSection {
    _id: string;
    Supplier_Name: string;
    sections: Sections[]
}

interface Sections {
    _id: string;
    Section_name: string;
    questions: {
        _id: string;
        Questions: string;
        Score: number;
        Text_response: string;
        Response_type: string;
    }[]
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
interface SupplierData {
    Sourcing_event__Section_look_up: {
        _id: string;
        Name: string;
        Sourcing_event_ID: string;
        Sourcing_event_name: string;
        Sourcing_event__Template_ID: string;
        Template_ID: string;
        Template_name: string;
        Section_name: string;
        Section_sequence: string;
    };
    Supplier_name: {
        _id: string;
        Name: string;
        Supplier_Name: string;
    };
    Questions: string;
    Response_type: string;
    Sourcing_event__Section_ID: string;
    Sourcing_event_ID: string;
    Sourcing_event_name: string;
    Untitled_Field: string;
    Template_name: string;
    Sourcing_event__Section_name: string;
    Sourcing_event__Template_ID: string;
    Supplier__Question_ID: string;
    Supplier_Email: string;
    Supplier_line_ID: string;
    Question: string;
    Response_type_1: string;
    Supplier_Name__Text: string;
    Score?: number;
    Text_response: string;
    _id: string;
}

interface SourcingData {
    Sourcing_line_items_look_up: {
        _id: string;
        Name: string;
        Item: string;
        Item_description: string;
        Quantity: number;
        UOM: string;
    };
    Supplier_name: {
        _id: string;
        Name: string;
        Supplier_Name: string;
    };
    Item: string;
    Item_Description: string;
    Sourcing_event_ID: string;
    Supplier_Line_ID: string;
    Score: number;
    UOM: string;
    Sourcing_line_items_id: string;
    Quantity: number;
    Price: string;
    Amount: string;
    Price_1: string;
    _id: string;
}

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


const AccordionTable: React.FC = () => {
    const [selectedColumn, setSelectedColumn] = useState<string>();
    const [contentLoaded, setContentLoaded] = useState(false);
    const [columns, setColumns] = useState<any[]>([])
    const [data, setData] = useState<any[]>([])

    const suppliers: SupplierSection[] = [{
        _id: "Pk8LrjrVGBG7",
        Supplier_Name: "Wonderla Solutions",
        sections: []
    }
]

    const sourcingEventId = "Pk8LrgSigCnz";

    function getTitleWithCheckbox(key: string, title: string) {
        return <div style={{ display: "flex" }} >
            <Checkbox disabled={selectedColumn ? selectedColumn !== key : false}
                onChange={(event) => event.target.checked ? setSelectedColumn(key) : setSelectedColumn("")} style={{ marginRight: 5 }} ></Checkbox>
            <p>{title}</p>
        </div>
    }


    function buildColumns() {
        const columns: any = [{
            title: "Parameters",
            dataIndex: 'parameters',
            key: 'parameters',
            width: `${70/suppliers.length}%`
        }];
        suppliers.forEach(({ _id, Supplier_Name }) => {
            columns.push({
                title: getTitleWithCheckbox(_id, Supplier_Name),
                children: [
                    {
                        title: "Response",
                        dataIndex: getResponseKey(_id),
                        key: getResponseKey(_id),
                        // width: "20%",
                        render: (text: string, record: any) => ({
                            children: <RowRender text={text} />,
                            props: {
                                colSpan: record.mergeCell ? 0 : 1, // No colSpan for this column
                            },
                        }),
                    },
                    {
                        title: "Score",
                        dataIndex: _id,
                        key: _id,
                        // render: rowRender,
                        // width: "10%",
                        render: (text: string, record: any) => ({
                            children: <RowRender text={text} />,
                            props: {
                                colSpan: record.mergeCell ? 2 : 1, // No colSpan for this column
                            },
                        }),
                    }],
            })
        })
        setColumns(columns)
    }


    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            await getSupplierQuestions(sourcingEventId);
            buildColumns();
            setContentLoaded(true);
        })()
    }, [])

    const getSupplierLineItems = async (sourcing_event_id: string) => {
        const queries = `page_number=1&page_size=100000&_application_id=Sourcing_App_A00`

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
                            }
                        ]
                    }
                ]
            }
        }

        const lineItems: SourcingData[] = (await KFSDK.api(`${baseUrl}/form/2/AcS4izpPbKF37/Price_Details_A00/view/Pricing_Details_Evaluator_Page_A00/preview?${queries}`, {
            method: "POST",
            body: JSON.stringify(payload)
        })).Data

        return lineItems;
    }

    const getSupplierTechninalItems = async (sourcing_event_id: string) => {
        const queries = `page_number=1&page_size=1000000&_application_id=Sourcing_App_A00`

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
                            }
                        ]
                    }
                ]
            }
        }

        const questionsWithSection: SupplierData[] = (await KFSDK.api(`${baseUrl}/form/2/AcS4izpPbKF37/Supplier_Sourcing_event_Questions_A00/view/Supplier_Questions_A00/preview?${queries}`, {
            method: "POST",
            body: JSON.stringify(payload)
        })).Data

        return questionsWithSection;
    }

    function getResponseKey(id: string) {
        return `${id}_response`
    }


    const getSupplierQuestions = async (sourcing_event_id: string) => {
        console.log("supplier questions triggered")
        const technicalItems = await getSupplierTechninalItems(sourcing_event_id);
        let sections: any[] = []

        technicalItems.forEach((question) => {
            const sectionIndex = sections.findIndex((section: any) => question.Sourcing_event__Section_ID == section.key)
            if (sectionIndex >= 0) {
                sections[sectionIndex][question.Supplier_name._id] = sections[sectionIndex][question.Supplier_name._id] + question.Score || 0

                sections[sectionIndex].children.push(
                    {
                        key: question.Supplier__Question_ID,
                        parameters: question.Questions,
                        [question.Supplier_name._id]: question.Score || 0,
                        [getResponseKey(question.Supplier_name._id)]: question.Text_response || `No response`
                    }
                )
            } else {
                const newSection = {
                    key: question.Sourcing_event__Section_ID,
                    parameters: question.Sourcing_event__Section_name,
                    [question.Supplier_name._id]: question.Score || 0,
                    children: [{
                        key: question.Supplier__Question_ID,
                        parameters: question.Questions,
                        [question.Supplier_name._id]: question.Score || 0,
                        [getResponseKey(question.Supplier_name._id)]: question.Text_response || `No response`
                    }],
                    mergeCell: true
                }
                sections.push(newSection)
            }
        })

        let overallData: any = {
            key: 1,
            parameters: 'OverAll Score',
            mergeCell: true,
        }

        let technicalData: any = {
            key: 2,
            parameters: 'Technial Score',
            children: sections,
            mergeCell: true,
        }

        let commercialData: any = {
            key: 3,
            parameters: 'Commercial Score',
            children: [],
            mergeCell: true,
        }

        let lineItemsData: any = {
            key: 4,
            parameters: 'Line Items',
            children: [],
            mergeCell: true,
        }

        const lineItems = await getSupplierLineItems(sourcing_event_id);
        let lineItemsScores: any[] = []
        lineItems.forEach((lineItem) => {
            lineItemsScores.push({
                key: lineItem._id,
                parameters: lineItem.Item,
                [lineItem.Supplier_name._id]: lineItem.Score || 0,
                [getResponseKey(lineItem.Supplier_name._id)]: lineItem.Amount,
                showCheckBox: true
            })
            lineItemsData[lineItem.Supplier_name._id] = (lineItemsData[lineItem.Supplier_name._id] || 0) + lineItem.Score || 0
        })

        lineItemsData.children = lineItemsScores
        commercialData.children.push(lineItemsData)


        // Calculate Find Overall Score
        suppliers.forEach((supplier) => {
            sections = sections.map((section) => ({
                ...section,
                [supplier._id]: section[supplier._id] / section.children.length
            }))
            technicalData[supplier._id] = sections.reduce((prev, section) => prev + section[supplier._id], 0) / sections.length

            lineItemsData[supplier._id] = lineItemsData[supplier._id] / lineItemsData.children.length

            commercialData[supplier._id] = commercialData.children.reduce((prev: number, sec: any) => prev + sec[supplier._id], 0) / commercialData.children.length

            overallData[supplier._id] = (technicalData[supplier._id] + commercialData[supplier._id]) / 2
        })

        setData([overallData, technicalData, commercialData])
        return suppliers;
    }

    return (
        <div>
            {contentLoaded ? <Table
                columns={columns}
                rowSelection={{ ...rowSelection }}
                dataSource={data}
                // style={{ width: "50%" }}
                bordered
                pagination={false}
                className="custom-table"
            /> : "Loading..."}
        </div>
    );
};

function RowRender({ text }: any) {
    return (
        <div style={{ backgroundColor: getColorCode(text), display: "flex", alignItems: "center", justifyContent: "center" }} >
            <p style={{ fontWeight: "bold" }} >{text}</p>
        </div>)
}
export { AccordionTable };
