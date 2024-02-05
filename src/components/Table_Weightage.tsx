import { PauseOutlined } from '@ant-design/icons';
import { Button, InputNumber, Table, Tooltip, Typography } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useState } from 'react';
import { sourcing_question_dataform, sourcing_section_dataform } from '../helpers/constants';
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

const totalWeightageLimit = 100;

const AccordionTableWeightage: React.FC = () => {
    const [selectedColumn, setSelectedColumn] = useState<string>();
    const [contentLoaded, setContentLoaded] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [sourcingEventId, setSourcingEventId] = useState<string>("");
    const [columns, setColumns] = useState<any[]>([])
    const [data, setData] = useState<any[]>([])
    const [sectionWeightage, setSectionWeightage] = useState<TableDataType[]>([])
    const [questionWeightage, setQuestionWeightage] = useState<TableDataType[]>([])
    const [showWeightageError, setWeightageError] = useState(false)
    const [expandedRows, setExpandedRows] = useState<string[]>([])

    function validateWeightage() {
        let newSectionWeightage = 0
        let newQuestionWeightages: any[] = []
        data.map((section) => {
            let modifiedIndex = sectionWeightage.findIndex((sec) => sec._id == section.key)
            let newQuestionWeightage = 0
            if (modifiedIndex >= 0) {
                newSectionWeightage += sectionWeightage[modifiedIndex].Weightage;
            } else {
                newSectionWeightage += section.Weightage ?? 0;
            }
            section.children.map((question: any) => {
                let modifiedIndex = questionWeightage.findIndex((q) => q._id == question.key)
                if (modifiedIndex >= 0) {
                    newQuestionWeightage += questionWeightage[modifiedIndex].Weightage;
                } else {
                    newQuestionWeightage += question.Weightage;
                }
            })
            newQuestionWeightages.push(newQuestionWeightage)
        })
        console.log("newQuestionWeightages", newQuestionWeightages, newSectionWeightage)
        return newSectionWeightage <= 100 && newQuestionWeightages.filter((w) => w > 100).length == 0;
    }


    function buildColumns() {
        const columns: any = [{
            title: "Parameters",
            dataIndex: 'parameters',
            key: 'parameters',
            width: "70%",
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
                <RowRender key={record.key} record={record} setSectionWeightage={setSectionWeightage} setQuestionWeightage={setQuestionWeightage} />
            ),
        })
        setColumns(columns)
    }

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            let sourcing_event_id = await KFSDK.app.page.popup.getAllParameters();

            console.log("sourcing_event_id :dsdsd ", sourcing_event_id)

            await getSectiondetailsBySourcingEvent(sourcing_event_id);
            buildColumns();
            setContentLoaded(true);
            setSourcingEventId(sourcing_event_id)
        })()
    }, [])

    useEffect(() => {
        if (expandedRows) {
            console.log("expandedRows", expandedRows)
        }
    }, [expandedRows])

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
            <div style={{ display: "flex", justifyContent: "flex-end", margin: 3, alignItems: "center" }} >
                {showWeightageError && <Text type="danger" style={{ fontSize: 16, marginRight: 5 }} >Weightage should not exceed 100%</Text>}
                <Button
                    type='primary'
                    onClick={async () => {
                        let isValid = validateWeightage()
                        if (isValid) {
                            setWeightageError(false)
                            if (sectionWeightage.length > 0) {
                                await updateWeightage(sectionWeightage, sourcing_section_dataform);
                            }
                            if (questionWeightage.length > 0) {
                                await updateWeightage(questionWeightage, sourcing_question_dataform);
                            }
                        } else {
                            setWeightageError(true)
                        }
                    }}
                >Save</Button>
            </div>
            {contentLoaded ?
                <Table
                    columns={columns}
                    rowSelection={{ ...rowSelection }}
                    dataSource={data}
                    bordered
                    pagination={false}
                    className="custom-table"
                    expandable={{
                        onExpand(expanded, record) {
                            console.log("expanded", expanded, record)
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
                // rowClassName={() => "newclass"}
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
        setValue(value);
    }

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", height: "100%"
        }} key={record.key} >
            {
                <div style={{ padding: 3, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", height: "90%" }} >
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
                                onClick={() => console.log("controls")}
                                style={{ display: "flex", height: 14, width: 18, fontSize: 5, alignItems: "center", justifyContent: "center", color: "rgba(0, 60, 156, 1)", borderColor: "rgba(0, 60, 156, 1)", borderRadius: 3 }}
                                type='primary'
                                size='small'
                                ghost
                                icon={
                                    <Tooltip title="Split equally" >
                                        <PauseOutlined style={{ transform: "rotate(90deg)" }} />
                                    </Tooltip>
                                }
                            />
                        }

                    />
                </div>

            }
        </div>)
}
export { AccordionTableWeightage };
