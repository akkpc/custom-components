import { Button, Card, Col, Input, Row, Select, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getUniqueString } from '../helpers';
import { Question } from '../pages/TemplateQuestionnaire';

interface Props {
    index: number;
    question: Question;
    setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
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
        iconName: "single_select.svg",
        bgColor: "#D9EED8",
        enableOptions: true
    },
    {
        value: 'date_time',
        label: 'Date & Time',
        iconName: "date_time.svg",
        bgColor: "#F6D9ED",
    },
    {
        value: "short_text",
        label: "Short Text",
        iconName: "short_text.svg",
        bgColor: "#CBEFFF",
    },
    {
        value: "long_text",
        label: "Long Text",
        iconName: "long_text.svg",
        bgColor: "#E2E2F8",
    }
]

const inputBoxWidth = 300;
const inputBoxHeight = 40;
const maxCharLength = 100;
export function QuestionCard(props: Props) {
    const { index, question: questionProps, setQuestions } = props;
    const [question, setQuestion] = useState<Question>({} as any);
    const [options, setOptions] = useState<{ Name: string, _id: string }[]>([])
    const [activeOption, setActiveOption] = useState<string>("")
    const [mouseEnteredKey, setMouseEnteredKey] = useState("")

    useEffect(() => {
        if (questionProps) {
            if (questionProps._id) {
                setQuestion({ ...questionProps });
            }
            if (questionProps.Response_Type == "single_select" && questionProps.Dropdown_options) {
                setOptions(questionProps.Dropdown_options)
            }
        }
    }, [questionProps])

    useEffect(() => {
        if (options.length > 0) {
            setQuestion((q) => ({ ...q, Dropdown_options: options }))
        }
    }, [options])

    useEffect(() => {
        if (question) {
            setQuestions((prevQuestions) => {
                const index = prevQuestions.findIndex((q) => q._id == question._id);
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

    function getResponseType() {
        return types.find(({ value }) => value == question.Response_Type)
    }

    return (
        <div key={index} >
            <Card
                onMouseEnter={() => {
                    setMouseEnteredKey(() => question._id)
                }}
                onMouseLeave={() => setMouseEnteredKey("")}
                key={index}
                style={{
                    borderRadius: 4, borderColor: "rgba(222, 234, 255, 1)", padding: 10
                }}>
                <Row align={"middle"} >
                    {/* <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} > */}
                    <Col span={22} >
                        <div style={{ width: "80%"}} >
                            <Input
                                style={{ height: 35, padding: 0, borderRadius: 4 }}
                                prefix={
                                    <div
                                        style={{
                                            backgroundColor: "rgba(222, 234, 255, 1)",
                                            width: 40,
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderTopLeftRadius: 4,
                                            borderBottomLeftRadius: 4
                                        }}
                                    >{index + 1}.
                                    </div>}
                                value={question.Question}
                                onChange={(e) =>  {
                                    if(e.target.value.length <= maxCharLength) {
                                        setQuestion((q) => ({ ...q, Question: e.target.value }))
                                    }
                                }}
                            />
                            <Typography style={{textAlign:"right", fontSize: 12, fontWeight: 400, color:"#AFB7C7", marginTop: 5}} >{maxCharLength - question?.Question?.length || 0} Characters remaining</Typography>
                        </div>
                    </Col>
                    <Col span={2} >
                        {mouseEnteredKey == question._id &&
                            <div style={{ width: 30, display: "flex", alignItems: "center", justifyContent: "center" }} >
                                <img
                                    onClick={() => copyQuestion(index)}
                                    style={{ cursor: "pointer", marginRight: 5 }}
                                    src={process.env.PUBLIC_URL + '/svgs/duplicate_icon.svg'}
                                />
                                <img onClick={() => {
                                    setQuestions((prevQuestions: Question[]) => {
                                        return prevQuestions.filter((currQuestion) => currQuestion._id != question._id)
                                    });
                                }} style={{ cursor: "pointer" }} src={process.env.PUBLIC_URL + '/svgs/trash.svg'} />
                            </div>}
                    </Col>
                    {/* </div> */}
                </Row>
                <div>
                    <p style={{ color: "rgba(175, 183, 199, 1)" }} >Choose answer type</p>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        height: inputBoxHeight,
                        border: "1px solid #d9d9d9",
                        borderRadius: 4,
                        width: inputBoxWidth
                    }} >
                        <div style={{
                            width: 40,
                            borderRight: "1px solid #d9d9d9",
                            height: "100%",
                            backgroundColor: getResponseType()?.bgColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }} >
                            {/* {JSON.stringify(getResponseType()?.iconName)} */}
                            <img src={process.env.PUBLIC_URL + `/svgs/${getResponseType()?.iconName}`} ></img>
                        </div>
                        <Select
                            placeholder="Select Field Type"
                            optionFilterProp="children"
                            onChange={(value) => setQuestion((q) => ({ ...q, Response_Type: value }))}
                            // onSearch={() => { }}
                            options={types}
                            style={{
                                width: inputBoxWidth - 40,
                                height: "100%",
                            }}
                            defaultValue={"short_text"}
                            value={question.Response_Type}
                            removeIcon
                            variant='borderless'
                        />
                    </div>
                </div>
                {types.find((val) => val.value == question.Response_Type)?.enableOptions &&
                    <div>
                        <p style={{ color: "rgba(175, 183, 199, 1)" }} >Options</p>
                        <div>
                            {
                                question?.Dropdown_options && question?.Dropdown_options.map((record, index) => {
                                    return <div key={index} style={{ marginTop: 3, marginBottom: 5 }} >
                                        <Option
                                            createNewOption={createNewOption}
                                            setActiveId={setActiveOption}
                                            activeId={activeOption}
                                            record={record}
                                            setOptions={setOptions}
                                        />
                                    </div>
                                })
                            }
                        </div>
                        <div style={{ marginTop: 2 }} >
                            <Button
                                style={{ color: "#003c9c", fontWeight: "500", padding: 0 }}
                                onClick={createNewOption}
                                type="link"
                            >+ Add option</Button>
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

    function saveOptions() {
        if (value) {
            setOptions((options: OptionProps[]) => {
                let index = options.findIndex(({ _id: id }) => id == record._id)
                options[index].Name = value;
                return [...options]
            })
            setActiveId(() => "")
        } else {
            setOptions((options: OptionProps[]) => {
                return options.filter(({ _id: id }) => id != record._id)
            })
        }
    }
    return (
        <div key={record._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} >
            <div>
                {
                    activeId == record._id ?
                        <Input
                            placeholder='Enter option content'
                            style={{ borderRadius: 2, width: inputBoxWidth, height: inputBoxHeight, }}
                            onChange={(event) => setValue(event.target.value)}
                            onPressEnter={saveOptions}
                            onBlur={saveOptions}
                            value={value}
                            autoFocus
                        ></Input>
                        :

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: inputBoxWidth,
                            height: inputBoxHeight,
                            border: "1px solid #F0F3F7",
                            borderRadius: 4
                        }} >
                            <div style={{
                                width: "85%",
                                paddingLeft: 10,
                                cursor: "pointer",
                                height: "100%",
                                display: "flex",
                                alignItems: "center"
                            }}
                                onClick={() => {
                                    setActiveId(record._id)
                                }}
                            >
                                <Typography style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }} >
                                    {value}
                                </Typography>
                            </div>
                            <div style={{
                                width: "15%",
                                borderLeft: "1px solid #F0F3F7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%"
                            }} >
                                <img
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setOptions((options: OptionProps[]) => {
                                            return [...options.filter(({ _id }) => _id != record._id)]
                                        })
                                    }} src={process.env.PUBLIC_URL + "/svgs/discard_icon.svg"} ></img>
                            </div>
                        </div>
                }
            </div>
        </div>
    )
}