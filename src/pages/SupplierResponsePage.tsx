import type { CollapseProps } from 'antd';
import { Col, Collapse, DatePicker, Input, Progress, Row, Select, Typography, theme } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import type { CSSProperties } from 'react';
import React, { useState } from 'react';
import { lightGrey } from '../helpers/colors';

const text = `
Design Parameters & Constraints
`;


interface Props {
    type: string;
    options?: string;
}

interface NewProps {
    value: any;
    setValue: (value: any) => void;
}

interface HeaderProps {
    text: string,
    progressValue: number
}

function Header({ text, progressValue }: HeaderProps) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
            <Typography>
                {text}
            </Typography>
            <div style={{ width: 147 }} >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                    <Typography style={{fontSize: 12, fontWeight: 400, color: lightGrey}} >Completion</Typography>
                    <Typography style={{fontSize: 12, fontWeight: 500}} >{progressValue}%</Typography>
                </div>
                <Progress
                    percent={progressValue}
                    showInfo={false}
                />
            </div>
        </div>
    )
}


const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => [
    {
        key: '1',
        label: <Header text={"This is panel header 1"} progressValue={30} />,
        children:
            <Questionnaire />,
        style: panelStyle,
    },
    {
        key: '2',
        label: <Header text={"This is panel header 2"} progressValue={0} />,
        children: <Questionnaire />,
        style: panelStyle,
    },
    {
        key: '3',
        label: <Header text={"This is panel header 3"} progressValue={100} />,
        children: <Questionnaire />,
        style: panelStyle,
    },
];

const sampleData = [
    {
        type: "single_select",
        options: JSON.stringify([{
            key: "1",
            value: "Hello"
        },
        {
            key: "2",
            value: "How"
        }])
    },
    {
        type: "short_text"
    },
    {
        type: "date_time"
    },
    {
        type: "text_area"
    }
]

const SupplierResponsePage: React.FC = () => {
    const { token } = theme.useToken();

    const panelStyle: React.CSSProperties = {
        backgroundColor: "#F5F7FA",
        borderRadius: 8,
        marginTop: 10,
        border: "1px solid #D8DCE5",
        padding: 0
    };

    return (
        <div style={{ marginTop: 10, padding: 30 }} >
            <Collapse
                className="supplier-response"
                bordered={false}
                defaultActiveKey={['1']}
                expandIcon={({ isActive }) =>
                    // <CaretRightOutlined rotate={isActive ? 90 : 0} />
                    <img src={`${process.env.PUBLIC_URL}/svgs/accordion_icons.svg`} ></img>
                }
                style={{ background: token.colorBgContainer }}
                items={getItems(panelStyle)}
                rootClassName='supplier-response-item'
            />
        </div>
    );
};

function Questionnaire() {
    return (
        <div style={{
            borderTop: "1px solid #D8DCE5",
            backgroundColor: "white"
            // margin: 3
        }} >
            <div style={{ marginTop: 5 }} >
                <Typography style={{ fontSize: 15, color: lightGrey, fontWeight: "400", margin: 20 }} >
                    {text}
                </Typography>
                {
                    sampleData.map((data, index) => (
                        <div>
                            <div style={{ margin: 20 }} >
                                <Inputs {...data} />
                            </div>
                            {sampleData.length - 1 > index &&
                                <div style={{ borderBottom: "1px solid #D8DCE5", marginTop: 50 }} ></div>}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

function Inputs({ type, options }: Props) {
    const [value, setValue] = useState<any>()
    return (
        <div style={{ paddingTop: 10 }} >
            <Row style={{ marginTop: 15 }} >
                <Col span={3}  >
                    <Typography style={{ fontWeight: 600, fontSize: 14 }} >
                        QUESTION
                    </Typography>
                </Col>
                <Col span={21} >
                    <Typography style={{ fontSize: 14, fontWeight: 500 }} >
                        What are the quality control procedures and standards in place for the manufacturing of the product?
                    </Typography>
                </Col>
            </Row>
            <Row style={{ marginTop: 15 }} >
                <Col span={3}  >
                    <Typography style={{ fontWeight: "600", fontSize: 14 }} >
                        ANSWER
                    </Typography>
                </Col>
                <Col span={21} >
                    {/* <Typography>
                        <TextArea placeholder='Enter your Answer here' ></TextArea>
                    </Typography> */}
                    <GetField type={type} options={options} value={value} setValue={setValue} />
                </Col>
            </Row>
        </div>
    )
}

export function GetField({ type, options, value, setValue }: Props & NewProps) {
    const parsedOptions: any[] = JSON.parse(options ? options : "[]");
    function onChange(event: any, dateString?: any) {
        if (type == "single_select") {
            setValue(event)
        } else if (type == "date_time") {
            setValue(dateString)
        }
        else {
            setValue(event.target.value);
        }
    }

    switch (type) {
        case "short_text":
            return (
                <Input
                    placeholder='Enter your answer here'
                    style={{ height: 40 }}
                    onChange={onChange}
                />
            )
        case "text_area":
            return (
                <TextArea
                    placeholder='Enter your answer here'
                    style={{ minHeight: 106 }}
                    onChange={onChange}
                />
            )
        case "single_select":
            return (
                <Select
                    options={parsedOptions}
                    onChange={onChange}
                    placeholder='Choose your answer here'
                    style={{ height: 40, width: 300 }}
                />
            )
        case "date_time":
            return (
                <DatePicker
                    placeholder='Enter your answer here'
                    onChange={onChange}
                    showTime
                    style={{ height: 40, width: 300 }}
                />
            )
        default:
            return (
                <div>
                    Something went wrong.
                </div>
            )
    }
}

export {
    SupplierResponsePage
};
