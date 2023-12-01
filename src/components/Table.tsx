import { Checkbox, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useState } from 'react';
import { getColorCode } from '../helpers';

const lineItemsKeys = "1314";

interface DataType {
    key: React.ReactNode;
    parameters: string;
    sup_01: number;
    sup_02: number;
    children?: DataType[];
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
    getCheckboxProps: (record) => ({
        className: record.key?.toString().includes(lineItemsKeys) ? "" : "hide-row"
    }),
    hideSelectAll: true,
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
            title: "Parameters",
            dataIndex: 'parameters',
            key: 'parameters'
        },
        {
            title: getTitleWithCheckbox('sup_01', "Sup - 01"),
            dataIndex: 'sup_01',
            key: 'sup_01',
            render: rowRender,
            width: "20%"
        },
        {
            // title: 'Address',
            title: getTitleWithCheckbox('sup_02', "Sup - 02"),
            dataIndex: 'sup_02',
            key: 'sup_02',
            width: "20%",
            render: rowRender
        },
    ];

    return (
        <div style={{display:"flex",alignItems:"center", justifyContent:"center"}} >
            <Table
                columns={columns}
                rowSelection={{ ...rowSelection }}
                dataSource={data}
                style={{ width: "50%", borderColor:"red"}}
                bordered
                pagination={false}
                className="custom-table"
            />
        </div>
    );
};

// function rowRender(text: any) {
//     return (
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }} >
//             <Tag color={getColorCode(text)} style={{ fontWeight: "bold", width: 40, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft:4, paddingRight:4 }} >
//                 <p style={{ color: "black", fontWeight: "bold", padding: 0, margin: 0 }} >{text}</p>
//             </Tag>
//         </div>
//     )
// }
function rowRender(text: any) {
    return (
        <div style={{ backgroundColor: getColorCode(text), display: "flex", alignItems: "center", justifyContent: "center" }} >
            <p style={{ fontWeight: "bold" }} >{text}</p>
        </div>)
}
export { AccordionTable };
