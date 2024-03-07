
interface ChartData {
    label: string;
    color: string;
    value: number;
}

interface Props {
    color: string,
    label: string
}

export function ProgressChart() {
    const value: ChartData[] = [
        {
            label: "Notified",
            value: 100,
            color: "#7EBC7C"
        },
        {
            label: "Responded",
            value: 90,
            color: "#EFD780"
        },
        {
            label: "Views",
            value: 80,
            color: "#F09541"
        },
        {
            label: "Not Respond",
            value: 20,
            color: "#FAFAFA"
        },
    ]
    value.sort((v1, v2) => v2?.value - v1.value);
    return (
        <div>
            <div style={{
                display: "flex",
                width: "90%",
                height: 30,
                border: "1px solid #D2DDEC",
                borderRadius: 25,
                padding: 1,
                alignItems: "center",
                justifyContent: "flex-start",
                left: 0
            }} >
                {
                    value.map((v,index) => {
                        return (
                            <div key={index} style={{
                                backgroundColor: v.color,
                                borderRadius: 20,
                                height: 28,
                                width: `${v.value - 10.2}%`,
                                position: "absolute",
                                left: 3,
                                right: 3,
                                borderRight: "2px solid white",
                                borderTop: "2px solid white",
                                borderBottom: "2px solid white",
                                maxWidth: "100%",
                            }}  >
                            </div>
                        )
                    })
                }
            </div>
            <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-around",
                marginTop: 20
            }} >
                {
                    value.map(({ label, color }, index) => {
                        return (
                            <Label key={index} label={label} color={color} />
                        )
                    })
                }
            </div>
        </div>
    )
}

function Label({ color, label }: Props) {
    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }} >
            <div style={{ borderRadius: 6, border: `1px solid grey`, width: 10, height: 10, backgroundColor: color }} >
            </div>
            <div style={{ fontSize: 15, color: "grey", marginLeft: 5 }} >
                {label}
            </div>
        </div>
    )
}
