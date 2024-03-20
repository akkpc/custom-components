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
            key: "Accepted",
            label: "Accepted",
            color: "#EFD780"
        },
        {
            key: "Rejected",
            label: "Rejected",
            color: "red"
        },
        {
            key: "Not_Responded",
            label: "Not Responded",
            color: "#FAFAFA"
        },
        {
            key: "Responded",
            label: "Responded",
            color: "#7EBC7C"
        },
    ]

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            const sourcingEventId = "Pk8v30tNL3Kt";
            const { Data } = await getSourcingTasks(sourcingEventId);
            let total = Data.length;
            let accepted = Data.filter((res: any) => res.Consent_Status == "Accepted").length
            let declined = Data.filter((res: any) => res.Consent_Status == "Declined").length
            let not_responded = (total - (accepted + declined))
            let responded = Data.filter((res: any) => res.Response_Status == "Responded").length
            value[0] = {
                ...value[0],
                value: total,
                percentage: 100
            };
            value[1] = {
                ...value[1],
                value: accepted,
                percentage: (accepted / total) * 100
            };
            value[2] = {
                ...value[2],
                value: declined,
                percentage: (declined / total) * 100
            };
            value[3] = {
                ...value[3],
                value: not_responded,
                percentage: (not_responded / total) * 100
            };
            value[4] = {
                ...value[4],
                value: responded,
                percentage: (responded / total) * 100
            };

            value.sort((v1, v2) => {
                if (v1.value && v2.value) {
                    return (v2?.value - v1?.value)
                }
                return 0;
            });
            console.log("tasks", value)
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
        <div>
            <div style={{
                display: "flex",
                width: "99%",
                height: 30,
                border: "1px solid #D2DDEC",
                borderRadius: 25,
                padding: 1,
                alignItems: "center",
                justifyContent: "flex-start",
                left: 0
            }} >
                {
                    chartData.map((v, index) => {
                        return (
                            <Tooltip color={v.color} title={`${v.value} ${v.label}`} placement="top">
                                <div key={index} style={{
                                    backgroundColor: v.color,
                                    borderRadius: 20,
                                    height: 28,
                                    width: `${(v.percentage || 0) == 0 ? 0 : v?.percentage && v?.percentage - (10.2 + (index * 3))}%`,
                                    position: "absolute",
                                    left: 3,
                                    right: 3,
                                    borderRight: "2px solid white",
                                    borderTop: "2px solid white",
                                    borderBottom: "2px solid white",
                                    maxWidth: "100%",
                                }}
                                >

                                </div>
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
                                <Col span={12} style={{ marginTop: 2 }}>
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
