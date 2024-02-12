import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Select, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getUniqueString } from '../helpers';
import { Question } from '../pages/SideBar';

interface Props {
    index: number;
    question: Question;
    setQuestions: React.Dispatch<React.SetStateAction<Question[]>>
}
interface OptionProps {
    _id: string,
    Name: string,
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
    const { index, question: questionProps, setQuestions } = props;
    const [question, setQuestion] = useState<Question>({} as any);
    const [options, setOptions] = useState<{ Name: string, _id: string }[]>([])
    const [activeOption, setActiveOption] = useState<string>("")

    useEffect(() => {
        if (questionProps) {
            if (questionProps.Question_ID) {
                setQuestion({ ...questionProps });
            }
            if (questionProps.Response_Type == "single_select" && questionProps.Dropdown_options_field) {
                setOptions(questionProps.Dropdown_options_field)
            }
        }
    }, [questionProps])

    useEffect(() => {
        if (options.length > 0) {
            setQuestion((q) => ({ ...q, Dropdown_options_field: options }))
        }
    }, [options])

    useEffect(() => {
        if (question) {
            setQuestions((prevQuestions) => {
                const index = prevQuestions.findIndex((q) => q.Question_ID == question.Question_ID);
                if (index >= 0) {
                    prevQuestions[index] = question;
                }
                return prevQuestions
            })
        }
    }, [question])

    function createNewOption() {
        let id = getUniqueString();
        setOptions((options) => [...options, {
            _id: id,
            Name: "",
        }])
        setActiveOption(id)
    }

    function copyQuestion(index: number) {
        let id = getUniqueString();
        setQuestions((question) => {
            question.splice(index, 0, {
                ...question[index],
                _id: id,
                Question_ID: id
            });
            return [...question]
        })
    }

    return (
        <div key={index} >
            <Card key={index} style={{ borderRadius: 4, borderColor: "rgba(222, 234, 255, 1)", padding: 10 }}>
                <Row align={"middle"} >
                    {/* <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} > */}
                    <Col span={22} >
                        <Input
                            // onPressEnter={async () => setQuestion((q) => {...q, Question: })}
                            style={{ height: 35, width: "80%", padding: 0, borderRadius: 0 }}
                            prefix={<div style={{ backgroundColor: "rgba(222, 234, 255, 1)", width: 40, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }} >{index + 1}.</div>}
                            value={question.Question}
                            onChange={(e) => setQuestion((q) => ({ ...q, Question: e.target.value }))}
                        />
                    </Col>
                    <Col span={2} >
                        <div style={{ width: 30, display: "flex", alignItems: "center", justifyContent: "center" }} >
                            <img
                                onClick={() => copyQuestion(index)}
                                style={{ cursor: "pointer", marginRight: 5 }}
                                src={process.env.PUBLIC_URL + '/svgs/copy_icon.svg'}
                            />
                            <img onClick={() => {
                                setQuestions((prevQuestions: Question[]) => {
                                    return prevQuestions.filter((currQuestion) => currQuestion.Question_ID != question.Question_ID)
                                });
                            }} style={{ cursor: "pointer" }} src={process.env.PUBLIC_URL + '/svgs/trash.svg'} />
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
                        onChange={(value) => setQuestion((q) => ({ ...q, Response_Type: value }))}
                        onSearch={() => { }}
                        options={types}
                        style={{ width: 300 }}
                        defaultValue={"short_text"}
                        value={question.Response_Type}
                    />
                </div>
                {types.find((val) => val.value == question.Response_Type)?.enableOptions &&
                    <div>
                        <p style={{ color: "rgba(175, 183, 199, 1)" }} >Options</p>
                        <div>
                            {
                                question?.Dropdown_options_field && question?.Dropdown_options_field.map((record, index) => {
                                    return <div key={index} style={{ marginTop: 3, marginBottom: 5 }} >
                                        <Option createNewOption={createNewOption} setActiveId={setActiveOption} activeId={activeOption} record={record} setOptions={setOptions} />
                                    </div>
                                })
                            }
                        </div>
                        <div style={{ marginTop: 2 }} >
                            <Button
                                icon={<PlusOutlined style={{ fontWeight: "500" }} />}
                                style={{ color: "#003c9c", fontWeight: "500" }}
                                onClick={createNewOption}
                                type="link"
                            >Add Option</Button>
                        </div>
                    </div>
                }
            </Card>
        </div>
    )
}



export function Option({ record, setOptions, activeId, setActiveId, createNewOption }: any) {
    const [value, setValue] = useState("")

    useEffect(() => {
        if (record.Name) {
            setValue(record.Name)
        }
    }, [record.Name])

    useEffect(() => {
        if (value) {
            setOptions((options: OptionProps[]) => {
                let index = options.findIndex(({ _id: id }) => id == record._id)
                options[index].Name = value;
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
                            onPressEnter={createNewOption}
                        ></Input> :
                        <Typography
                            onClick={() => {
                                setActiveId(record._id)
                            }}
                            style={{ margin: 2, cursor: "pointer" }} >
                            {value}
                        </Typography>
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