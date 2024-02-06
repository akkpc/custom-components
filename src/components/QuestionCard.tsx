import { Card, Col, Input, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import { Question } from './SideBar';

interface Props {
    index: number;
    question: Question;
    updateQuestion: (questionId: string, questionName: string, responseType: string) => Promise<void>;
    deleteQuestion: (questionId: string) => Promise<void>;
}

const types = [
    {
        value: 'single_select',
        label: 'Single Select',
        enableOptions: true
    },
    {
        value: 'date_time',
        label: 'Date & Time',
    },
    {
        value: "short_text",
        label: "Short Text"
    },
    {
        value: "long_text",
        label: "Long Text"
    }
]

export function QuestionCard(props: Props) {
    const { index, question: { Question_ID, Question, Response_Type }, deleteQuestion, updateQuestion } = props;
    const [question, setQuestion] = useState(Question);
    const [responseType, setResponseType] = useState("short_text");

    useEffect(() => {
        if (Question) {
            setQuestion(Question);
        }
        if (Response_Type) {
            setResponseType(Response_Type)
        }
    }, [Question, Response_Type])
    return (
        <div key={index} >
            <Card key={index} style={{ borderRadius: 4, borderColor: "rgba(222, 234, 255, 1)", padding: 10 }}>
                <Row align={"middle"} >
                    {/* <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} > */}
                    <Col span={22} >
                        <Input
                            onPressEnter={async () => await props.updateQuestion(Question_ID, question, responseType)}
                            style={{ height: 35, width: "80%", padding: 0, borderRadius: 0 }}
                            prefix={<div style={{ backgroundColor: "rgba(222, 234, 255, 1)", width: 40, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }} >{index + 1}.</div>}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </Col>
                    <Col span={2} >
                        <div style={{ width: 30, display: "flex", alignItems: "center", justifyContent: "center" }} >
                            <img onClick={async () => await deleteQuestion(Question_ID)} style={{ cursor: "pointer" }} src={process.env.PUBLIC_URL + '/svgs/trash.svg'} />
                        </div>
                    </Col>
                    {/* </div> */}
                </Row>
                <div>
                    <p style={{ color: "rgba(175, 183, 199, 1)" }} >Choose answer type</p>
                    <Select
                        showSearch
                        placeholder="Select Field Type"
                        optionFilterProp="children"
                        onChange={(value) => setResponseType(value)}
                        onSearch={() => { }}
                        options={types}
                        style={{ width: 300 }}
                        defaultValue={"short_text"}
                    />
                </div>
                {types.find((val) => val.value == responseType)?.enableOptions &&
                    <div>
                        <p style={{ color: "rgba(175, 183, 199, 1)" }} >Options</p>
                    </div>}
            </Card>
        </div>
    )
}
