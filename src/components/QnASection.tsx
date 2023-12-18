import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Checkbox, Grid, Tag, Typography } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import moment from 'moment'
import { useEffect } from 'react'

const data = [
    {
        id: 1,
        supplier: "Staples",
        question: "Can you provide the reference for the case studies in your Industry ?",
        response: "Yes, We will provice",
        questionCreated: new Date(),
        respondedCreated: new Date()
    },
    {
        id: 2,
        supplier: "Staples",
        question: "Can you provide the reference for the case studies in your Industry ?",
        response: "Yes, We will provice",
        questionCreated: new Date(),
        respondedCreated: new Date()
    },
    {
        id: 3,
        supplier: "Staples",
        question: "Can you provide the reference for the case studies in your Industry ?",
        response: "Yes, We will provice",
        questionCreated: new Date(),
        respondedCreated: new Date()
    },
    {
        id: 3,
        supplier: "Staples",
        question: "Can you provide the reference for the case studies in your Industry ?",
        response: "Yes, We will provice",
        questionCreated: new Date(),
        respondedCreated: new Date()
    },
    {
        id: 3,
        supplier: "Staples",
        question: "Can you provide the reference for the case studies in your Industry ?",
        response: "Yes, We will provice",
        questionCreated: new Date(),
        respondedCreated: new Date()
    }
]
const { useBreakpoint } = Grid;

export function QnASection() {

    const breakPoints = useBreakpoint()
    useEffect(() => {
        console.log("breakPoints", breakPoints.md)
    }, [])
    return (
        <div style={{ border: "0.6px solid grey", borderRadius: 5 }} >
            {
                data.map((q, index) => {
                    return (
                        <div key={index}>
                            <div style={{ padding: 10 }} >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                                    <Tag style={{ backgroundColor: "#F2F2F2" }} >{q.supplier.toLocaleUpperCase()}</Tag>
                                    <p style={{ color: "#BFBFBF" }} >on {moment(q.questionCreated).format('MM/DD/YYYY h:mm A')}</p>
                                </div>
                                <div style={{ fontWeight: "bold", fontSize: 16 }} >
                                    {q.question}
                                </div>
                                <div style={{ border: "0.6px solid grey", borderRadius: 5, margin: 20, padding: 10, backgroundColor: "#fbfbfb" }} >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: 2, marginBottom: 4 }} >
                                        <Typography>{"Answer"}</Typography>
                                        <Typography style={{ color: "#BFBFBF" }} >
                                            on {moment(q.respondedCreated).format('MM/DD/YYYY h:mm A')}
                                        </Typography>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }} >
                                        <div>
                                            <TextArea
                                                // onChange={(e) => setValue(e.target.value)}
                                                placeholder="Response"
                                                autoSize={{ minRows: 3, maxRows: 5 }}
                                                style={{ width: 500, marginRight: 10 }}
                                            />
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }} >
                                            <Button disabled type="primary" style={{ backgroundColor: "#003c9c", color: "white", fontWeight: "bold", marginBottom: 5 }}>Post</Button>
                                            <div style={{ display: "flex" }} >
                                                <Button type='dashed' >
                                                    <EditOutlined style={{ fontSize: 20, color: "grey" }} />
                                                </Button>
                                                <Button type='text' >
                                                    <DeleteOutlined style={{ fontSize: 20, color: "red" }} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 8 }} >
                                        <Checkbox style={{ fontSize: 14 }} >Mark as private answer</Checkbox>
                                    </div>
                                </div>
                            </div>
                            {(index < data.length - 1) && <div style={{ width: "100%", border: "0.4px solid #D5D5D5" }} ></div>}
                        </div>
                    )
                })
            }
        </div>
    )
}

const styles = {
    
}