import { Button, Card, Col, Input, Row, Select, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Question } from './SideBar';
import Link from 'antd/es/typography/Link';

interface Props {
    index: number;
    question: Question;
    updateQuestion: (questionId: string, questionName: string, responseType: string) => Promise<void>;
    deleteQuestion: (questionId: string) => Promise<void>;
}
interface OptionProps {
    _id: string,
    name: string,
    order?: number,
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
    const [options, setOptions] = useState<OptionProps[]>([])
    const [activeId, setActiveId] = useState("-1")

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
                            <img onClick={async () => await deleteQuestion(Question_ID)} style={{ cursor: "pointer", marginRight: 5 }} src={process.env.PUBLIC_URL + '/svgs/copy_icon.svg'} />
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
                        <div>
                            {
                                options.map((record) => {
                                    return <div style={{ marginTop: 3, marginBottom: 5 }} >
                                        <Option activeId={activeId} record={record} setOptions={setOptions} />
                                    </div>
                                })
                            }
                        </div>
                        <div style={{ marginTop: 2 }} >
                            <Link onClick={
                                () => {
                                    setOptions((options) => [...options, {
                                        _id: (options.length + 1).toString(),
                                        name: "",
                                    }])
                                    setActiveId((options.length + 1).toString())
                                }} >Add Option</Link>
                        </div>
                    </div>
                }
            </Card>
        </div>
    )
}



export function Option({ record, setOptions, activeId }: any) {
    const [value, setValue] = useState("")

    useEffect(() => {
        if (value) {
            setOptions((options: OptionProps[]) => {
                let index = options.findIndex(({ _id: id }) => id == record._id)
                options[index].name = value;
                return [...options]
            })
        }
    }, [value])
    return (
        <div key={record._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} >
            <div>
                {
                    activeId == record._id ?
                        <Input
                            placeholder='Enter option content'
                            style={{ borderRadius: 2, width: 250 }}
                            onChange={(event) => setValue(event.target.value)}
                        ></Input> :
                        <Typography>{value}</Typography>
                }
            </div>
            <div>
                <img onClick={() => {
                    setOptions((options: OptionProps[]) => {
                        return [...options.filter(({ _id }) => _id != record._id)]
                    })
                }} src={process.env.PUBLIC_URL + "/svgs/close.svg"} ></img>
            </div>
        </div>
    )
}