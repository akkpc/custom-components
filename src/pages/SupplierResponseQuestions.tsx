import type { CollapseProps } from 'antd';
import { Button, Col, Collapse, DatePicker, Input, Progress, Row, Select, Typography, theme } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect, useState } from 'react';
import { parseJSON } from '../helpers';
import { borderColor, buttonDarkBlue, lightGrey } from '../helpers/colors';
import { EventSection, Question } from './SourcingTemplate';
const KFSDK = require('@kissflow/lowcode-client-sdk')

const text = `
Design Parameters & Constraints
`;
const questionnaireDataform = "Sourcing_Supplier_Response_Questio_A01"
const sectionDataform = "Sourcing_Supplier_Response_Section_A00"

interface Props {
    type: string;
    options?: {
        Name: string;
        _id: string;
    }[];
}

interface NewProps {
    value: any;
    setValue: (value: any) => void;
    onBlur: () => void;
}

interface HeaderProps {
    text: string,
    progressValue: number
}

interface SupplierResponseQuestionProps {
    Text_Response: string;
}

function Header({ text, progressValue }: HeaderProps) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
            <Typography>
                {text}
            </Typography>
            <div style={{ width: 147 }} >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                    <Typography style={{ fontSize: 12, fontWeight: 400, color: lightGrey }} >Completion</Typography>
                    <Typography style={{ fontSize: 12, fontWeight: 500 }} >{progressValue}%</Typography>
                </div>
                <Progress
                    percent={progressValue}
                    showInfo={false}
                />
            </div>
        </div>
    )
}

const SupplierResponseQuestions: React.FC = () => {
    const { token } = theme.useToken();
    const [sourcingEventId, setSourcingEventId] = useState("")
    const [sections, setSections] = useState<CollapseProps["items"]>([])

    const panelStyle: React.CSSProperties = {
        backgroundColor: "#F5F7FA",
        borderRadius: 8,
        marginTop: 10,
        border: "1px solid #D8DCE5",
        padding: 0
    };

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            let {currentStage,sourcingEventId} = await KFSDK.app.page.getAllParameters();
            // let {eventStage,sourcingEventId} = {
            //     sourcingEventId: "Pk8khJEoEsJs",
            //     eventStage: "RFP"
            // };
            console.log("Test"  , currentStage, sourcingEventId)

            if (sourcingEventId) {
                setSourcingEventId(sourcingEventId)
                const sections: EventSection[] = await getSectionsBySourcingId(sourcingEventId, currentStage);
                const collapse = sections.map((section) => ({
                    key: section.Section_ID,
                    label: <Header text={section.Section_Name} progressValue={30} />,
                    children:
                        <Questionnaire event_stage={currentStage} sourcingEventId={sourcingEventId} sectionId={section.Section_ID} />,
                    style: panelStyle,
                }))
                setSections(collapse); 
            }
        })()
    }, [])

    async function getSectionsBySourcingId(sourcingEventId: string, event_stage: string) {
        const sectionResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${sectionDataform}/allitems/list?&page_number=1&page_size=10000`,
            {
                method: "POST",
                body: JSON.stringify({
                    Filter: {
                        "AND": [
                            {
                                "AND": [
                                    {
                                        "LHSField": "Sourcing_Event_ID",
                                        "Operator": "EQUAL_TO",
                                        "RHSType": "Value",
                                        "RHSValue": sourcingEventId,
                                        "RHSField": null,
                                        "LHSAttribute": null,
                                        "RHSAttribute": null
                                    },
                                    {
                                        "LHSField": "Event_Stage",
                                        "Operator": "EQUAL_TO",
                                        "RHSType": "Value",
                                        "RHSValue":event_stage ,
                                        "RHSField": null,
                                        "LHSAttribute": null,
                                        "RHSAttribute": null
                                    }
                                ]
                            }
                        ]
                    }
                })
            }).catch((err: any) => console.log("cannot fetch", err))
        const sections: EventSection[] = sectionResponse.Data;
        return sections;
    }


    return (
        <div style={{
            marginTop: 10,
            padding: 30,
            // overflow: "hidden",
            // scrollbarColor: "red",
            // scrollbarWidth: "none"
        }}>
            <div>
                <Collapse
                    className="supplier-response"
                    bordered={false}
                    defaultActiveKey={['1']}
                    expandIcon={({ isActive }) =>
                        // <CaretRightOutlined rotate={isActive ? 90 : 0} />
                        <img src={`${process.env.PUBLIC_URL}/svgs/accordion_icons.svg`} ></img>
                    }
                    style={{ background: token.colorBgContainer }}
                    items={sections}
                    rootClassName='supplier-response-item'
                />
                <div style={{ height: 60 }} ></div>
            </div>
            {/* <div
                style={{
                    position: "fixed",
                    width: "100%",
                    height: 60,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    borderTop: `1px solid ${borderColor}`
                }}
            >
                <div style={{ margin: 10 }} >
                    <Button style={{ marginRight: 10 }} >Close</Button>
                    <Button style={{ backgroundColor: buttonDarkBlue, color: "white" }} >Submit Response</Button>
                </div>
            </div> */}
        </div>
    );
};

function Questionnaire({ sectionId, sourcingEventId, event_stage }: { sectionId: string, sourcingEventId: string, event_stage: string }) {
    const [questions, setQuestions] = useState<(Question & SupplierResponseQuestionProps)[]>([]);
    const [contentLoaded, setContentLoaded] = useState(false);
    useEffect(() => {
        (async () => {
            const questions = await getQuestionsBySection();
            setQuestions(questions);
            setContentLoaded(true);
        })()
    }, [])

    async function getQuestionsBySection() {
        const questionResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${questionnaireDataform}/allitems/list?&page_number=1&page_size=10000`,
            {
                method: "POST",
                body: JSON.stringify({
                    Filter: {
                        "AND": [{
                            "AND": [
                                {
                                    "LHSField": "Section_ID",
                                    "Operator": "EQUAL_TO",
                                    "RHSType": "Value",
                                    "RHSValue": sectionId,
                                    "RHSField": null,
                                    "LHSAttribute": null,
                                    "RHSAttribute": null
                                },
                                {
                                    "LHSField": "Sourcing_Event_ID",
                                    "Operator": "EQUAL_TO",
                                    "RHSType": "Value",
                                    "RHSValue": sourcingEventId,
                                    "RHSField": null,
                                    "LHSAttribute": null,
                                    "RHSAttribute": null
                                },
                                {
                                    "LHSField": "Event_Stage",
                                    "Operator": "EQUAL_TO",
                                    "RHSType": "Value",
                                    "RHSValue":event_stage ,
                                    "RHSField": null,
                                    "LHSAttribute": null,
                                    "RHSAttribute": null
                                }
                            ]
                        }]
                    }
                })
            }).catch((err: any) => console.log("cannot fetch", err))
        let questions: (SupplierResponseQuestionProps & Question)[] = questionResponse.Data;
        questions = questions.map((question) => {
            if (question.Dropdown_options) {
                question.Dropdown_options = parseJSON(question.Dropdown_options as any);
            }
            return question;
        })
        return questions;
    }

    return (
        <div style={{
            borderTop: "1px solid #D8DCE5",
            backgroundColor: "white"
            // margin: 3
        }}
        >
            <div style={{ marginTop: 5 }} >
                <Typography style={{ fontSize: 15, color: lightGrey, fontWeight: "400", margin: 20 }} >
                    {text}
                </Typography>
                {
                    contentLoaded ? questions.map((question, index) => (
                        <div key={question._id} >
                            <div style={{ margin: 20 }} >
                                <Inputs {...question} />
                            </div>
                            {questions.length - 1 > index &&
                                <div style={{ borderBottom: "1px solid #D8DCE5", marginTop: 50 }} ></div>}
                        </div>
                    )) :
                        <div style={{ margin: 20 }} >
                            Loading...
                        </div>
                }
            </div>
        </div>
    )
}

function Inputs({ _id, Response_Type, Question, Dropdown_options, Text_Response }: Question & SupplierResponseQuestionProps) {
    const [value, setValue] = useState<any>()

    useEffect(() => {
        if(Text_Response) {
            setValue(Text_Response);
        }
    }, [Text_Response])

    async function updateQuestion(response: Record<string, any>) {
        await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${questionnaireDataform}/${_id}`,
            {
                method: "POST",
                body: JSON.stringify(response)
            }).catch((err: any) => console.log("cannot fetch", err))
    }

    async function onBlur() {
        await updateQuestion({
            Text_Response: value
        })
    }

    return (
        <div style={{ paddingTop: 10 }} >
            <Row style={{ marginTop: 15 }} >
                <Col span={3}  >
                    <Typography style={{ fontWeight: 600, fontSize: 14 }} >
                        QUESTION
                    </Typography>
                </Col>
                <Col span={21} >
                    <Typography style={{ fontSize: 14, fontWeight: 500 }} >
                        {Question}
                    </Typography>
                </Col>
            </Row>
            <Row style={{ marginTop: 15 }} >
                <Col span={3}  >
                    <Typography style={{ fontWeight: "600", fontSize: 14 }} >
                        ANSWER
                    </Typography>
                </Col>
                <Col span={21} >
                    {/* <Typography>
                        <TextArea placeholder='Enter your Answer here' ></TextArea>
                    </Typography> */}
                    <ResponseField
                        type={Response_Type}
                        options={Dropdown_options ?? Dropdown_options}
                        value={value}
                        setValue={setValue}
                        onBlur={onBlur}
                    />
                </Col>
            </Row>
        </div>
    )
}

export function ResponseField({ type, options, value, setValue, onBlur }: Props & NewProps) {

    function onChange(event: any, dateString?: any) {
        if (type == "single_select") {
            setValue(event)
        } else if (type == "date_time") {
            setValue(dateString)
        }
        else {
            setValue(event.target.value);
        }
    }

    switch (type) {
        case "short_text":
            return (
                <Input
                    placeholder='Enter your answer here'
                    style={{ height: 40 }}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                />
            )
        case "text_area":
            return (
                <TextArea
                    placeholder='Enter your answer here'
                    style={{ minHeight: 106 }}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                />
            )
        case "single_select":
            return (
                <Select
                    options={options}
                    onChange={onChange}
                    placeholder='Choose your answer here'
                    style={{ height: 40, width: 300 }}
                    onBlur={onBlur}
                    value={value}
                />
            )
        case "date_time":
            return (
                <DatePicker
                    placeholder='Enter your answer here'
                    onChange={onChange}
                    showTime
                    style={{ height: 40, width: 300 }}
                    onBlur={onBlur}
                    value={value}
                />
            )
        default:
            return (
                <div>
                    Something went wrong.
                </div>
            )
    }
}

export {
    SupplierResponseQuestions as SupplierResponsePage
};
