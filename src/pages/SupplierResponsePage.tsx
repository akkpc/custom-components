import { CaretRightOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';
import React from 'react';
import type { CollapseProps } from 'antd';
import { Collapse, Typography, theme } from 'antd';
import TextArea from 'antd/es/input/TextArea';

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
        borderRadius: 4,
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
        <div style={{ borderTop: "1px solid #D8DCE5", backgroundColor: "white", padding: 15 }} >
            <div style={{ marginTop: 10 }} >
                {text}
                <div>
                    <div style={{display:"flex", alignItems:"center"}} > 
                        <Typography>
                            QUESTION
                        </Typography>
                        <Typography>
                            What are the quality control procedures and standards in place for the manufacturing of the product?
                        </Typography>
                    </div>
                    <div>
                        <Typography>
                            ANSWER
                        </Typography>
                        <TextArea placeholder='Enter your Answer here' >

                        </TextArea>
                    </div>
                </div>
            </div>
        </div>
    )
}

export {
    SupplierResponsePage
};