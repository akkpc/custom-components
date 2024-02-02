import { Button, InputNumber, Table } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useState } from 'react';
import { sourcing_question_dataform, sourcing_section_dataform } from '../helpers/constants';
const KFSDK = require("@kissflow/lowcode-client-sdk")

interface DataType {
    key: React.ReactNode;
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


const AccordionTableWeightage: React.FC = () => {
    const [selectedColumn, setSelectedColumn] = useState<string>();
    const [contentLoaded, setContentLoaded] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [sourcingEventId, setSourcingEventId] = useState<string>("");
    const [columns, setColumns] = useState<any[]>([])
    const [data, setData] = useState<any[]>([])
    const [sectionWeightage, setSectionWeightage] = useState([])
    const [questionWeightage, setQuestionWeightage] = useState([])


    function buildColumns() {
        const columns: any = [{
            title: "Parameters",
            dataIndex: 'parameters',
            key: 'parameters',
            width: "70%"
        }];
        columns.push({
            title: "Weightage",
            dataIndex: "weightage",
            key: "weightage",
            render: (text: string, record: any) => (
                <RowRender key={record.key} record={record} setSectionWeightage={setSectionWeightage} setQuestionWeightage={setQuestionWeightage} />
            ),
        })
        setColumns(columns)
    }

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            let allParams = await KFSDK.app.page.getAllParameters();
            const sourcing_event_id = allParams.sourcing_event_id;

            await getSectiondetailsBySourcingEvent(sourcing_event_id);
            buildColumns();
            setContentLoaded(true);
            setSourcingEventId(sourcing_event_id)
        })()
    }, [])

    const getSectiondetailsBySourcingEvent = async (sourcing_event_id: string) => {
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

        let technicalData = sections.map((section) => ({
            key: section._id,
            parameters: section.Section_Name,
            Weightage: section.Weightage,
            type: "section",
            children: questions.filter((q) => q.Section_ID == section.Section_ID).length > 0 ?
                questions.map((question) => {
                    if (question.Section_ID == section.Section_ID) {
                        return ({
                            key: question._id,
                            parameters: question.Question,
                            Weightage: question.Weightage,
                            type: "question",
                        })
                    }
                }) : []
        }))
        setData(technicalData)
    }

    const getQuestionDetails = async (sourcing_event_id: string) => {
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

    function getResponseKey(id: string) {
        return `${id}_response`
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
            <div style={{ display: "flex", justifyContent: "flex-end", margin: 3 }} >
                <Button
                    type='primary'
                    onClick={async () => {
                        if (sectionWeightage.length > 0) {
                            await updateWeightage(sectionWeightage, sourcing_section_dataform);
                        }
                        if (questionWeightage.length > 0) {
                            await updateWeightage(questionWeightage, sourcing_question_dataform);
                        }
                    }}
                >Save</Button>
            </div>
            {contentLoaded ? <Table
                columns={columns}
                rowSelection={{ ...rowSelection }}
                dataSource={data}
                bordered
                pagination={false}
                className="custom-table"
            /> : "Loading..."}
        </div>
    );
};

function RowRender({ record, setQuestionWeightage, setSectionWeightage, Weightage }: any) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        if (record.Weightage) {
            setValue(record.Weightage)
        }
    }, [])

    const onChangeValue = (value: number) => {
        if (value) {
            console.log("Value : ", value, record.type)
            if (record.type == "section") {
                setSectionWeightage((section: any) => {
                    let newSection = section
                    let sectionIndex = newSection.findIndex((s: any) => s._id == record.key)
                    if (sectionIndex >= 0) {
                        newSection[sectionIndex].Weightage = value
                    } else {
                        newSection = [...newSection, { _id: record.key, Weightage: value }]
                    }
                    return [...newSection]
                })
            }
            if (record.type == "question") {
                setQuestionWeightage((question: any) => {
                    let newQuestion = question
                    let questionIndex = newQuestion.findIndex((s: any) => s._id == record.key)
                    if (questionIndex >= 0) {
                        newQuestion[questionIndex].Weightage = value
                    } else {
                        newQuestion = [...newQuestion, { _id: record.key, Weightage: value }]
                    }
                    return [...newQuestion]
                })
            }
        }
        setValue(value);
    }

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", height: "100%"
        }} key={record.key} >
            {
                <div style={{ padding: 3, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", height: "90%" }} >
                    <InputNumber
                        value={value}
                        min={0}
                        max={100}
                        formatter={(value) => `${value}%`}
                        parser={(value: any) => value!.replace('%', '')}
                        onChange={(value: any) => onChangeValue(value)}
                    />
                </div>

            }
        </div>)
}
export { AccordionTableWeightage };
