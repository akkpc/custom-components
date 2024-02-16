import type { CollapseProps } from 'antd';
import { Col, Collapse, Row, Typography, theme } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import type { CSSProperties } from 'react';
import React from 'react';
import { lightGrey } from '../helpers/colors';

const text = `
Design Parameters & Constraints
`;

const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => [
    {
        key: '1',
        label: 'This is panel header 1',
        children:
            <Questionnaire />,
        style: panelStyle,
    },
    {
        key: '2',
        label: 'This is panel header 2',
        children: <Questionnaire />,
        style: panelStyle,
    },
    {
        key: '3',
        label: 'This is panel header 3',
        children: <Questionnaire />,
        style: panelStyle,
    },
];

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
            backgroundColor: "white", 
            padding: 20,
            // margin: 3
            }} >
            <div style={{ marginTop: 10 }} >
                <Typography style={{ fontSize: 15, color: lightGrey, fontWeight: "400" }} >
                    {text}
                </Typography>
                <div style={{paddingTop: 10}} >
                    <Row style={{marginTop:15}} >
                        <Col span={3}  >
                            <Typography style={{fontWeight:"600", fontSize: 14}} >
                                QUESTION
                            </Typography>
                        </Col>
                        <Col span={21} >
                            <Typography>
                                What are the quality control procedures and standards in place for the manufacturing of the product?
                            </Typography>
                        </Col>
                    </Row>
                    <Row style={{marginTop:15}} >
                        <Col span={3}  >
                            <Typography style={{fontWeight:"600", fontSize: 14}} >
                                ANSWER
                            </Typography>
                        </Col>
                        <Col span={21} >
                            <Typography>
                                <TextArea placeholder='Enter your Answer here' ></TextArea>
                            </Typography>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    )
}
interface Props {
    type: string;
    options?: string;
}
// export function GetField({type, options} :Props) {
//     switch(type) {
//         case ""
//     }
// }

export {
    SupplierResponsePage
};
