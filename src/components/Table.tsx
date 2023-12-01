import React, { useState } from 'react';
import { Checkbox, Space, Switch, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import { DownOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';

interface DataType {
    key: React.ReactNode;
    parameters: string;
    sup_01: number;
    sup_02: number;
    children?: DataType[];
}

function getColorCode(number: number) {
    if (number >= 0 && number <= 4) {
        const startColor = [255, 90, 90];
        const endColor = [253, 213, 207];
        const step = 1 / 4;
        const rgb = startColor.map((channel, index) =>
            Math.round(channel - step * number * (startColor[index] - endColor[index]))
        );
        return `rgb(${rgb.join(', ')})`;
    } else if (number >= 5 && number <= 7) {
        const startColor = [255, 253, 211];
        const endColor = [251, 245, 44];
        const step = 1 / 2;
        const rgb = startColor.map((channel, index) =>
            Math.round(channel - step * (number - 5) * (startColor[index] - endColor[index]))
        );
        return `rgb(${rgb.join(', ')})`;
    } else if (number >= 8 && number <= 10) {
        const startColor = [220, 255, 215]
        const endColor = [120, 255, 60]
        const step = 1 / 2;
        const rgb = startColor.map((channel, index) =>
            Math.round(channel - step * (number - 8) * (startColor[index] - endColor[index]))
        );
        return `rgb(${rgb.join(', ')})`;
    } else {
        return "white"
    }
}


const data: DataType[] = [
    {
        key: 1,
        parameters: 'OverAll Score',
        sup_01: 8,
        sup_02: 10,
    },
    {
        key: 3,
        parameters: 'Technial Score',
        sup_01: 9,
        sup_02: 8,
        children: [
            {
                key: 31,
                parameters: 'Section 1',
                sup_01: 10,
                sup_02: 3,
                children: [
                    {
                        key: 311,
                        parameters: 'Question 1',
                        sup_01: 6,
                        sup_02: 4,
                    },
                    {
                        key: 312,
                        parameters: 'Question 2',
                        sup_01: 6,
                        sup_02: 4,
                    },
                    {
                        key: 313,
                        parameters: 'Question 2',
                        sup_01: 6,
                        sup_02: 4,
                    },
                ],
            },
            {
                key: 32,
                parameters: 'Section 2',
                sup_01: 4,
                sup_02: 4,
                children: [
                    {
                        key: 321,
                        parameters: 'Question 1',
                        sup_01: 6,
                        sup_02: 4,
                    },
                    {
                        key: 322,
                        parameters: 'Question 2',
                        sup_01: 6,
                        sup_02: 4,
                    },
                ],
            }
        ],
    },
    {
        key: 13,
        parameters: 'Commercials',
        sup_01: 6,
        sup_02: 4,
        children: [
            {
                key: 1311,
                parameters: 'PT',
                sup_01: 8,
                sup_02: 5,
            },
            {
                key: 1312,
                parameters: 'ST',
                sup_01: 8,
                sup_02: 6,
            },
            {
                key: 1313,
                parameters: 'SC',
                sup_01: 8,
                sup_02: 6,
            },
            {
                key: 1314,
                parameters: 'Lines',
                sup_01: 8,
                sup_02: 6,
                children: [
                    {
                        key: 13141,
                        parameters: 'Line 1',
                        sup_01: 9,
                        sup_02: 4,
                    },
                    {
                        key: 13142,
                        parameters: 'Line 2',
                        sup_01: 9,
                        sup_02: 4,
                    },
                    {
                        key: 13143,
                        parameters: 'Line 3',
                        sup_01: 9,
                        sup_02: 4,
                    },
                    {
                        key: 13144,
                        parameters: 'Line 4',
                        sup_01: 9,
                        sup_02: 4,
                    },
                ]
            }
        ],
    },
];

const rowSelection: TableRowSelection<DataType> = {
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    onSelect: (record, selected, selectedRows) => {
        console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
        console.log(selected, selectedRows, changeRows);
    },
};


const AccordionTable: React.FC = () => {

    const [selectedColumn, setSelectedColumn] = useState<string>();

    function getTitleWithCheckbox(key: string, title: string) {
        return <div style={{ display: "flex" }} >
            <Checkbox disabled={selectedColumn ? selectedColumn !== key : false}
                onChange={(event) => event.target.checked ? setSelectedColumn(key) : setSelectedColumn("")} style={{ marginRight: 5 }} ></Checkbox>
            <p>{title}</p>
        </div>
    }

    const columns: ColumnsType<DataType> = [
        {
            title: getTitleWithCheckbox('parameters', "Parameters"),
            dataIndex: 'parameters',
            key: 'parameters'
        },
        {
            title: getTitleWithCheckbox('sup_01', "Sup - 01"),
            dataIndex: 'sup_01',
            key: 'sup_01',
            render: (text) => (
                <div style={{ backgroundColor: getColorCode(text), height: "100%" }} >
                    <p>{text}</p>
                </div>
            ),
        },
        {
            // title: 'Address',
            title: getTitleWithCheckbox('sup_02', "Sup - 02"),
            dataIndex: 'sup_02',
            key: 'sup_02',
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                rowSelection={{ ...rowSelection }}
                dataSource={data}
            />
        </>
    );
};

export { AccordionTable };