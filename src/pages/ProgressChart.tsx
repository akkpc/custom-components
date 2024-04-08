import { Col, Row } from "antd";
import { useEffect, useState } from "react";
import { indexOfMax } from "../helpers";
import { dataforms } from "../helpers/constants";
const KFSDK = require("@kissflow/lowcode-client-sdk")

interface ChartData {
    key: string;
    label: string;
    color: string;
    value?: number;
    percentage?: number;
    isMax?: boolean;
}

interface Props {
    color: string,
    label: string,
    value?: number,
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
            color: "#EFD780"
        },
        {
            key: "Responded",
            label: "Responded",
            color: "#7EBC7C"
        },
        {
            key: "Rejected",
            label: "Rejected",
            color: "#EC8F8C"
        }
    ]

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            const { id: sourcingEventId } = await KFSDK.app.page.getAllParameters();
            const { Data } = await getSourcingTasks(sourcingEventId);
            console.log("Data", Data, sourcingEventId)
            let total = Data.length;
            let declined = Data.filter((res: any) => res.Consent_Status == "Declined").length
            let responded = Data.filter((res: any) => res.Response_Status == "Responded").length
            let invited = Data.length;
            // let declined = 5
            // let responded = 2
            // let invited = 10
            let items = [invited, responded, declined]
            let maxIndex = indexOfMax(items);
            // value[0] = {
            //     ...value[0],
            //     value: total,
            //     percentage: 100
            // };
            value[0] = {
                ...value[0],
                value: invited,
                percentage: (invited / items[maxIndex]) * 100
            };
            value[1] = {
                ...value[1],
                value: responded,
                percentage: (responded / items[maxIndex]) * 100
            };
            value[2] = {
                ...value[2],
                value: declined,
                percentage: (declined / items[maxIndex]) * 100
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
        const sourcingdetails = (await KFSDK.api(`/form/2/${KFSDK.account._id}/${sourcingSupplierTasks}/allitems/list`, {
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
                alignItems: "center",
                justifyContent: "flex-start"
            }} >
                {chartData.length > 0 &&
                    <div
                        style={{
                            margin: 3,
                            backgroundColor: chartData[0].color,
                            display: "flex",
                            width: "100%",
                            borderRadius: 20,
                            height: 35,
                            alignItems: "center"
                        }}
                    >
                        {chartData[1].value ? <div
                            style={{
                                backgroundColor: chartData[1].color,
                                display: "flex",
                                width: `${(chartData[1]?.percentage)}%`,
                                borderRadius: 20,
                                height: 35,
                                borderRight: "2px solid white",
                                borderTop: "2px solid white",
                                borderBottom: "2px solid white",
                                zIndex: 100
                            }}
                        >
                        </div> : <></>}

                        {chartData[2]?.value ?
                            <div
                                style={{
                                    backgroundColor: chartData[2].color,
                                    width: `calc(${(chartData[2]?.percentage)}% + 6px)`,
                                    borderTopRightRadius: 20,
                                    borderBottomRightRadius: 20,
                                    height: 35,
                                    marginLeft: -10,
                                    borderRight: "2px solid white",
                                    borderTop: "2px solid white",
                                    borderBottom: "2px solid white",
                                }}
                            >
                            </div> : <></>
                        }
                    </div>}
            </div>
            <div
                style={{
                    marginTop: 20,
                    overflow: "hidden"
                }}
            >
                <Row gutter={12} style={{ overflow: "hidden" }} >
                    {
                        chartData.map(({ label, color, value }, index) => {
                            return (
                                <Col key={index} span={12} style={{ marginTop: 2 }}>
                                    <Label key={index} label={label} color={color} value={value} />
                                </Col>
                            )
                        })
                    }
                </Row>
            </div>
        </div>
    )
}

function Label({ color, label, value }: Props) {
    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }} >
            <div style={{ borderRadius: 6, border: `1px solid grey`, width: 10, height: 10, backgroundColor: color }} >
            </div>
            <div style={{ fontSize: 15, color: "grey", marginLeft: 5 }} >
                {label} {`(${value})`}
            </div>
        </div>
    )
}
