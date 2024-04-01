import { Col, Row, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { dataforms } from "../helpers/constants";
const KFSDK = require("@kissflow/lowcode-client-sdk")

interface ChartData {
    key: string;
    label: string;
    color: string;
    value?: number;
    percentage?: number;
}

interface Props {
    color: string,
    label: string
}

const {
    sourcingSupplierTasks
} = dataforms;

export function ProgressChart() {
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const value: ChartData[] = [
        {
            key: "Invited",
            label: "Invited",
            color: "#F09541"
        },
        {
            key: "Responded",
            label: "Responded",
            color: "#7EBC7C"
        },
        {
            key: "Not_Responded",
            label: "Not Responded",
            color: "#FAFAFA"
        },
        {
            key: "Rejected",
            label: "Rejected",
            color: "red"
        }
    ]

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            const { id: sourcingEventId } = await KFSDK.app.page.getAllParameters();
            const { Data } = await getSourcingTasks(sourcingEventId);
            let total = Data.length;
            let declined = Data.filter((res: any) => res.Consent_Status == "Declined").length
            let responded = Data.filter((res: any) => res.Response_Status == "Responded").length
            let not_responded = Data.filter((res: any) => res.Response_Status == "Not Responded").length
            value[0] = {
                ...value[0],
                value: total,
                percentage: 100
            };
            value[1] = {
                ...value[1],
                value: responded,
                percentage: (responded / total) * 100
            };
            value[2] = {
                ...value[2],
                value: not_responded,
                percentage: (not_responded / total) * 100
            };
            value[3] = {
                ...value[3],
                value: declined,
                percentage: (declined / total) * 100
            };

            value.sort((v1, v2) => {
                if (v1.value && v2.value) {
                    return (v2?.value - v1?.value)
                }
                return 0;
            });
            console.log("tasks", value, Data)
            setChartData(value);
        })()
    }, [])

    const getSourcingTasks = async (sourcing_event_id: string) => {
        const sourcingdetails = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${sourcingSupplierTasks}/allitems/list`, {
            method: "POST",
            body: JSON.stringify({
                Filter: {
                    "AND": [
                        {
                            "LHSField": "Event_ID",
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
            })
        }));
        return sourcingdetails;
    }

    return (
        <div style={{ padding: 5 }} >
            <div style={{
                display: "flex",
                width: "100%",
                height: 41,
                border: "2px solid #D2DDEC",
                borderRadius: 25,
                // padding: 1,
                alignItems: "center",
                justifyContent: "flex-start",
            }} >
                {
                    chartData.map((v, index) => {
                        return (
                            <Tooltip
                                key={index}
                                title={`${v.value} ${v.label}`}
                                placement="bottom"
                                color={v.color}
                                overlayInnerStyle={{ color: "black" }}
                            >
                                {(v.percentage && v.percentage > 0) ?
                                    <div key={index} style={{
                                        backgroundColor: v.color,
                                        borderRadius: 20,
                                        height: 35,
                                        width: index == 0 ? "96%" : `${(v.percentage || 0) == 0 ? 0 : v?.percentage && v?.percentage - (10.2 + (index * 3))}%`,
                                        position: "fixed",
                                        left: 10,
                                        borderRight: "2px solid white",
                                        borderTop: "2px solid white",
                                        borderBottom: "2px solid white",
                                        maxWidth: "100%",
                                    }}
                                    >
                                    </div> : ""}
                            </Tooltip>
                        )
                    })
                }
            </div>
            <div
                style={{
                    marginTop: 20,
                    overflow: "hidden"
                }}
            >
                <Row gutter={12} style={{ overflow: "hidden" }} >
                    {
                        value.map(({ label, color }, index) => {
                            return (
                                <Col key={index} span={12} style={{ marginTop: 2 }}>
                                    <Label key={index} label={label} color={color} />
                                </Col>
                            )
                        })
                    }
                </Row>
            </div>
        </div>
    )
}

function Label({ color, label }: Props) {
    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }} >
            <div style={{ borderRadius: 6, border: `1px solid grey`, width: 10, height: 10, backgroundColor: color }} >
            </div>
            <div style={{ fontSize: 15, color: "grey", marginLeft: 5 }} >
                {label}
            </div>
        </div>
    )
}
