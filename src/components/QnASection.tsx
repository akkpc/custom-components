import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Checkbox, Grid, Tag, Typography } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import moment from 'moment'
import { useEffect } from 'react'

const { useBreakpoint } = Grid;

interface Props {
    questions: any[],
    disableAnswer?: boolean,
    hideSupplierName?: boolean,
    hidePrivateCheckBox?: boolean,
    hideSearch?: boolean,
}

export function QnASection({ questions, ...rest }: Props) {

    const breakPoints = useBreakpoint()
    useEffect(() => {
        console.log("breakPoints", breakPoints.md)
    }, [])
    return (
        questions.length > 0 ? <div style={{ border: "0.6px solid grey", borderRadius: 5 }} >
            {
                questions.map((q, index) => {
                    return (
                        <div key={index}>
                            <div style={{ padding: 10 }} >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                                    <Tag style={{ backgroundColor: "#F2F2F2" }} >{q["Column_82SF6ZHv1v"].Name}</Tag>
                                    {q["Column_PWT5GT6Xc4"] && <p style={{ color: "#BFBFBF" }} >on {moment(new Date(q["Column_PWT5GT6Xc4"])).format('MM/DD/YYYY h:mm A')}</p>}
                                </div>
                                <div style={{ fontWeight: "bold", fontSize: 16 }} >
                                    {q["Column-7V9JJbYOJ9"]}
                                </div>
                                <div style={{ border: "0.6px solid grey", borderRadius: 5, margin: 20, padding: 10, backgroundColor: "#fbfbfb" }} >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: 2, marginBottom: 4 }} >
                                        <Typography>{"Answer"}</Typography>
                                        <Typography style={{ color: "#BFBFBF" }} >
                                            on {moment(q["Column_xZsD2lBToY"]).format('MM/DD/YYYY h:mm A')}
                                            {/* on {moment(q.respondedCreated).format('MM/DD/YYYY h:mm A')} */}
                                        </Typography>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }} >
                                        <TextArea
                                            // onChange={(e) => setValue(e.target.value)}
                                            placeholder="Response"
                                            autoSize={{ minRows: 3, maxRows: 5 }}
                                            style={{ width: "100%", marginRight: 10 }}
                                            value={q["Column_w2Oc0EUSch"]}
                                            disabled={rest.disableAnswer}
                                        />
                                        {!rest.disableAnswer && <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }} >
                                            <Button disabled type="primary" style={{ backgroundColor: "#003c9c", color: "white", fontWeight: "bold", marginBottom: 5 }}>Post</Button>
                                            <div style={{ display: "flex" }} >
                                                <Button type='dashed' >
                                                    <EditOutlined style={{ fontSize: 20, color: "grey" }} />
                                                </Button>
                                                <Button type='text' >
                                                    <DeleteOutlined style={{ fontSize: 20, color: "red" }} />
                                                </Button>
                                            </div>
                                        </div>}
                                    </div>
                                    {!rest.hidePrivateCheckBox && <div style={{ marginTop: 8 }} >
                                        <Checkbox style={{ fontSize: 14 }} >Mark as private answer</Checkbox>
                                    </div>}
                                </div>
                            </div>
                            {(index < questions.length - 1) && <div style={{ width: "100%", border: "0.4px solid #D5D5D5" }} ></div>}
                        </div>
                    )
                })
            }
        </div> : <div>No data found</div>
    )
}

const styles = {

}