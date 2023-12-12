import { Checkbox, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useRef, useState } from 'react';
import { getColorCode } from '../helpers';
import { baseUrl } from '../helpers/constants';
const KFSDK = require("@kissflow/lowcode-client-sdk")

const lineItemsKeys = "1314";

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
    sup_01: number;
    sup_02: number;
    children?: DataType[];
    childUrl?: string;
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

const data: DataType[] = [
    {
        key: 1,
        parameters: 'OverAll Score',
        sup_01: 8,
        sup_02: 10,
    },
    {
        key: 3,
        parameters: 'Technial Score',
        sup_01: 9,
        sup_02: 8,
        children: []
    },
    {
        key: 13,
        parameters: 'Commercials',
        sup_01: 6,
        sup_02: 4,
        children: [
            {
                key: 1311,
                parameters: 'PT',
                sup_01: 8,
                sup_02: 5,
            },
            {
                key: 1312,
                parameters: 'ST',
                sup_01: 8,
                sup_02: 6,
            },
            {
                key: 1313,
                parameters: 'SC',
                sup_01: 8,
                sup_02: 6,
            },
            {
                key: 1314,
                parameters: 'Lines',
                sup_01: 8,
                sup_02: 6,
                children: []
            }
        ],
    },
];

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
        className: record.key?.toString().includes(lineItemsKeys) ? "" : "hide-row"
    }),
    hideSelectAll: true,
};


const AccordionTable: React.FC = () => {
    const [selectedColumn, setSelectedColumn] = useState<string>();

    // let kf: any = useRef(null);
    let kf = ["Pk7jlvyCwcHa", "Pk7jlvzfM_yn"]
    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            const questions = await getSupplierQuestions();
        })()
    }, [])


    const getSupplierQuestions = async () => {
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
                                "RHSValue": "Pk8LrgSigCnz",
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

        const suppliers: SupplierSection[] = [{
            _id: "Pk8LrjrVGBG7",
            Supplier_Name: "Wonderla Solutions",
            sections: []
        }]

        suppliers.forEach((supplier) => {
            const questions = questionsWithSection.filter((q) => q.Supplier_name._id == supplier._id);
            const sections: Sections[] = []
            questions.forEach((question) => {
                const sectionIndex = sections.findIndex((section: any) => section.Sourcing_event__Section_ID == question.Sourcing_event__Section_ID)
                const newQuestion = {
                    _id: question._id,
                    Questions: question.Questions,
                    Score: question?.Score || 0,
                    Text_response: question.Text_response,
                    Response_type: question.Response_type
                }
                if (sectionIndex >= 0) {
                    sections[sectionIndex].questions.push(newQuestion);
                } else {
                    sections.push({
                        _id: question.Sourcing_event__Section_ID,
                        Section_name: question.Sourcing_event__Section_name,
                        questions: [newQuestion]
                    })
                }
            })
            supplier.sections = sections
        })

        return questionsWithSection;
    }

    function getTitleWithCheckbox(key: string, title: string) {
        return <div style={{ display: "flex" }} >
            <Checkbox disabled={selectedColumn ? selectedColumn !== key : false}
                onChange={(event) => event.target.checked ? setSelectedColumn(key) : setSelectedColumn("")} style={{ marginRight: 5 }} ></Checkbox>
            <p>{title}</p>
        </div>
    }

    async function getDataByURL(dataUrl: string) {
        const data = await KFSDK.api(`${baseUrl}/${dataUrl}`);
        return data
    }

    const columns: ColumnsType<DataType> = [
        {
            title: "Parameters",
            dataIndex: 'parameters',
            key: 'parameters'
        },
        {
            title: getTitleWithCheckbox('sup_01', "Sup - 01"),
            dataIndex: 'sup_01',
            key: 'sup_01',
            render: rowRender,
            width: "20%"
        },
        {
            // title: 'Address',
            title: getTitleWithCheckbox('sup_02', "Sup - 02"),
            dataIndex: 'sup_02',
            key: 'sup_02',
            width: "20%",
            render: rowRender
        },
    ];

    return (
        <div>
            <Table
                columns={columns}
                rowSelection={{ ...rowSelection }}
                dataSource={data}
                // style={{ width: "50%" }}
                bordered
                pagination={false}
                className="custom-table"
            // expandable={{
            //     async onExpand(expanded, record) {
            //         console.log("record.childUrl", record.childUrl)
            //         if (record.childUrl) {
            //             let data = await getDataByURL(record.childUrl);
            //             let sections = data.Data.map((section: any, index: number) => {
            //                 console.log("section" , section)
            //                 return ({
            //                 key: 3 + index,
            //                 parameters: section.Section_name,
            //                 sup_01: 9,
            //                 sup_02: 8,
            //                 children: [],
            //             })})
            //             console.log("Data", sections)
            //             record.children?.push(...sections)
            //         }
            //         // console.log("Expanded Row : " , expanded, record)

            //     },
            // }}
            />
        </div>
    );
};

function rowRender(text: any) {
    return (
        <div style={{ backgroundColor: getColorCode(text), display: "flex", alignItems: "center", justifyContent: "center" }} >
            <p style={{ fontWeight: "bold" }} >{text}</p>
        </div>)
}
export { AccordionTable };
