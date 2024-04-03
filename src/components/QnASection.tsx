import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Checkbox, Grid, Tag, Typography } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import moment from 'moment'
import { useEffect, useState } from 'react'

const { useBreakpoint } = Grid;

interface Props {
    questions: any[],
    disableAnswer?: boolean,
    hideSupplierName?: boolean,
    hidePrivateCheckBox?: boolean,
    hideSearch?: boolean,
    enableAnswer?: boolean,
    KFSDK: any,
    refetch: () => any
}

export function QnASection({ questions, ...rest }: Props) {
    const [currentAnswer, setCurrentAnswer] = useState("");
    return (
        questions.length > 0 ? <div style={{ border: "0.6px solid grey", borderRadius: 5 }} >
            {
                questions.map((question, index) => {
                    return (
                        <div key={index} >
                            <QuestionArea question={question} index={index} rest={rest} key={index} KFSDK={rest.KFSDK} currentAnswer={currentAnswer} setCurrentAnswer={setCurrentAnswer} />
                            {(index < questions.length - 1) && <div style={{ width: "100%", border: "0.4px solid #D5D5D5" }} ></div>}
                        </div>
                    )
                })
            }
        </div> : <div>No data found</div>
    )
}

function QuestionArea(props: { question: any, index: number, rest: any, KFSDK: any, currentAnswer: string, setCurrentAnswer: (ca: string) => void }) {
    const [answer, setAnswer] = useState("");
    const { question: q, index, rest, KFSDK, currentAnswer, setCurrentAnswer } = props;

    useEffect(() => {
        if (q["Procurement_Team_response"]) {
            setAnswer(q["Procurement_Team_response"])
        }
        return () => {
            setAnswer("")
        }
    }, [q["Procurement_Team_response"]])

    async function postResponse(response: string, _id: string) {
        await KFSDK.api(`/form/2/${KFSDK.account._id}/Supplier_QnA_Clarification_A00/${_id}`,
            {
                method: "POST",
                body: JSON.stringify({
                    Procurement_Team_response: response,
                    _id
                })
            })
    }
    async function deleteResponse(_id: string) {
        await KFSDK.api(`/form/2/${KFSDK.account._id}/Supplier_QnA_Clarification_A00/batch/delete`,
            {
                method: "POST",
                body: JSON.stringify([{
                    _id
                }])
            })
    }

    return (
        <div key={index}>
            <div style={{ padding: 10 }} >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                    {q["Created_By_1"] && <Tag style={{ backgroundColor: "#F2F2F2" }} >{q["Created_By_1"]}</Tag>}
                    {q["CreatedAt"] && <p style={{ color: "#BFBFBF" }} >on {moment(new Date(q["CreatedAt"])).format('MM/DD/YYYY h:mm A')}</p>}
                </div>
                <div style={{ fontWeight: "bold", fontSize: 16 }} >
                    {q["Question"]}
                </div>
                {
                    <div style={{ border: "0.6px solid grey", borderRadius: 5, margin: 20, padding: 10, backgroundColor: "#fbfbfb" }} >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: 2, marginBottom: 4 }} >
                            <Typography>{"Response"}</Typography>
                            <Typography style={{ color: "#BFBFBF" }} >
                                on {moment(q["Created_At"]).format('MM/DD/YYYY h:mm A')}
                                {/* on {moment(q.respondedCreated).format('MM/DD/YYYY h:mm A')} */}
                            </Typography>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }} >
                            <TextArea
                                onChange={(e) => setAnswer(e.target.value)}
                                autoSize={{ minRows: 3, maxRows: 5 }}
                                style={{ width: "100%", marginRight: 10 }}
                                value={answer}
                                disabled={currentAnswer === q["_id"] ? false : true}
                            />
                            {!rest.disableAnswer && <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }} >
                                {currentAnswer === q["_id"] && <Button onClick={async () => {
                                    await postResponse(answer, q["_id"])
                                    setCurrentAnswer("")
                                }} type="primary" style={{ backgroundColor: "#003c9c", color: "white", fontWeight: "bold", marginBottom: 5 }}>Post</Button>}
                                <div style={{ display: "flex" }} >
                                    <Button onClick={() => {
                                        setCurrentAnswer(q["_id"])
                                        rest.refetch()
                                    }} type='dashed' >
                                        <EditOutlined style={{ fontSize: 20, color: "grey" }} />
                                    </Button>
                                    <Button onClick={() => {
                                        deleteResponse(q["_id"])
                                        rest.refetch()
                                    }} type='text' >
                                        <DeleteOutlined style={{ fontSize: 20, color: "red" }} />
                                    </Button>
                                </div>
                            </div>}
                        </div>
                        {!rest.hidePrivateCheckBox && <div style={{ marginTop: 8 }} >
                            <Checkbox style={{ fontSize: 14 }} >Mark as private answer</Checkbox>
                        </div>}
                    </div>
                    // : <p>Not yet answered</p>
                }
            </div>
        </div>
    )
}