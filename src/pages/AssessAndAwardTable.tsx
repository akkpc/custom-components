import { Checkbox, Table, Typography } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useState } from 'react';
import { KFButton } from '../components/KFButton';
import { KFLoader } from '../components/KFLoader';
import { getColorCode } from '../helpers';
import { tableFontColor } from '../helpers/colors';
import { Applicable_commercial_info, dataforms, leafNodes, rootNodes as oldRootNode, processes } from '../helpers/constants';
import { showMessage } from '../hooks/KFFunctions';
import { SourcingMaster, SourcingSupplierResponses } from '../types';
const KFSDK = require("@kissflow/lowcode-client-sdk")

const {
    supplierResponses,
    supplierResponseSection,
    supplierResponseQuestion,
    supplierAwardingForm
} = dataforms;

const {
    SourcingMaster: SourcingMasterProcess,
    SupplierLineItem
} = processes;

let rootNodes = oldRootNode.concat("root");
const allNodes = rootNodes.concat(leafNodes)

enum ResponseStatus {
    Active = "Active",
    Draft = "Draft"
}

enum Evaluation_Status {
    Completed = "Completed",
    Not_Completed = "Not Completed"
}

interface DataType {
    key: React.ReactNode;
    parameters: string;
    Pk8LrjrVGBG7: number;
    sup_02: number;
    children?: DataType[];
    childUrl?: string;
    showCheckBox?: boolean;
    path: []
}

interface TableRowData {
    key: string;
    parameters: string;
    type: typeof allNodes[number];
    children?: TableRowData[];
    [key: string]: any;
}

interface SupplierSection {
    _id: string;
    Section_ID: string;
    Template_ID: string;
    Sourcing_Event_ID: string;
    Supplier_ID: string;
    Event_Stage: string;
    Instance_ID: string;
    Section_Name: string;
    Progress: number;
    Score: number;
    Score_1: number;
    Score_2: number;
    Score_3: number;
    Weighted_Score: number;
    Agg_Weighted_Score: number;
};
interface SupplierQuestion {
    _id: string;
    Section_ID: string;
    Template_ID: string;
    Question_ID: string;
    Question: string;
    Response_Type: string;
    Sourcing_Event_ID: string;
    Weightage: number;
    Supplier_ID: string;
    Event_Stage: string;
    Instance_ID: string;
    Dropdown_options: string;
    Score: number;
    Score_1: number;
    Score_2: number;
    Score_3: number;
    Text_Response: string;
    Weighted_Score: number;
};


const AssessAndAwardTable: React.FC = () => {
    const [selectedSupplier, setSelectedSupplier] = useState("")
    const [contentLoaded, setContentLoaded] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [sourcingEventId, setSourcingEventId] = useState<string>("");
    const [columns, setColumns] = useState<any[]>([])
    const [data, setData] = useState<any[]>([])
    const [isViewOnly, setIsViewOnly] = useState(true);
    const [selectedLineItems, setSelectedLineItems] = useState<any[]>([]);
    const [respondedSuppliers, setRespondedSuppliers] = useState<SourcingSupplierResponses[]>([]);
    const [enableAwarding, setEnableAwarding] = useState(false);
    const [freezeAwarding, setFreezeAwarding] = useState(false);
    const [showResponse, setShowResponse] = useState(true);
    const [showRating, setShowRating] = useState(true);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    const rowSelection: TableRowSelection<DataType> = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedLineItems(selectedRows);
        },
        onSelect: (record, selected, selectedRows) => {
            console.log(record, selected, selectedRows);
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
            console.log(selected, selectedRows, changeRows);
        },
        getCheckboxProps: (record) => ({
            className: record.showCheckBox ? "" : "hide-row"
        }),
        hideSelectAll: true,
        selectedRowKeys: selectedLineItems.map(({ key }) => key)
    };

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            // let { sourcing_event_id = "Pk8tSMkhCnRj", supplierIds } = await KFSDK.app.page.getAllParameters();
            let { sourcing_event_id, supplierIds } = await KFSDK.app.page.getAllParameters();
            const viewOnly = false
            setSuppliers(JSON.parse(supplierIds))
            setSourcingEventId(sourcing_event_id)
            setIsViewOnly(viewOnly);
        })();
    }, [])

    useEffect(() => {
        if (sourcingEventId) {
            (async () => {
                const sourcingDetails: SourcingMaster = await getSourcingDetails(sourcingEventId)

                let respondedSuppliers = suppliers.map((response, index) => {
                    let supplierIndex = sourcingDetails["Table::Add_Existing_Suppliers"].findIndex((s) => s.Supplier_Name_1._id == response.Supplier_ID)
                    if (supplierIndex >= 0) {
                        let { First_Name_1 } = sourcingDetails["Table::Add_Existing_Suppliers"][supplierIndex]
                        return {
                            ...response,
                            Supplier_Name: First_Name_1
                        }
                    }
                    return {
                        ...response,
                        Supplier_Name: `Supplier ${index + 1}`
                    }
                })

                const questionnaires = await buildTechnicalItems(respondedSuppliers, sourcingDetails.Current_Stage);
                const commercials = await buildCommercialItems(respondedSuppliers, sourcingDetails);

                let overAllScore: TableRowData = {
                    key: `Score`,
                    parameters: "OverAll Score",
                    type: "root",
                    children: [questionnaires, commercials]
                }

                for (let i = 0; i < respondedSuppliers.length; i++) {
                    const { Supplier_ID: supplierId, Score } = respondedSuppliers[i];
                    overAllScore[supplierId] = questionnaires[supplierId] + commercials[supplierId];
                    overAllScore[`${supplierId}_instance_id`] = respondedSuppliers[i]._id;
                }

                console.log("overAllScore: ", overAllScore)
                if (sourcingDetails.Freeze_Award) {
                    setFreezeAwarding(true);
                }
                setRespondedSuppliers(respondedSuppliers);
                setData([overAllScore]);
                buildColumns(respondedSuppliers, "");
                setContentLoaded(true);
            })()
        }
    }, [sourcingEventId])

    useEffect(() => {
        if (selectedSupplier != undefined) {
            buildColumns(respondedSuppliers, selectedSupplier);
        }
    }, [selectedSupplier])

    useEffect(() => {
        if (selectedSupplier && selectedLineItems.length > 0) {
            setEnableAwarding(true);
        } else {
            setEnableAwarding(false);
        }
    }, [selectedSupplier, selectedLineItems])

    useEffect(() => {
        if (showResponse != undefined && showRating != undefined) {
            buildColumns(respondedSuppliers, selectedSupplier);
        }
    }, [showResponse, showRating])

    async function updateAwarding() {
        let response = respondedSuppliers.find((s) => s.Supplier_ID == selectedSupplier)
        let lineItemFilter: Record<string, any>[] = []
        const payload = selectedLineItems.map((lineItem) => {
            lineItemFilter.push({
                "LHSField": "Line_Item_ID",
                "Operator": "EQUAL_TO",
                "RHSType": "Value",
                "RHSValue": lineItem["key"],
                "RHSField": null,
                "RHSParam": "",
                "LHSAttribute": null,
                "RHSAttribute": null
            })
            return ({
                Line_Item_ID: lineItem["key"],
                Response_ID: response?._id,
                _is_created: true
            })
        }
        )
        const previousLines = (await KFSDK.api(`/form/2/${KFSDK.account._id}/${supplierAwardingForm}/allitems/list`, {
            method: "POST",
            body: JSON.stringify({
                Filter: {
                    "AND": [
                        {
                            "LHSField": "Response_ID",
                            "Operator": "EQUAL_TO",
                            "RHSType": "Value",
                            "RHSValue": response?._id,
                            "RHSField": null,
                            "RHSParam": "",
                            "LHSAttribute": null,
                            "RHSAttribute": null
                        },
                        {
                            "OR": lineItemFilter
                        }
                    ]
                }
            })
        }));
        console.log("previousLines.Data", previousLines.Data, payload)
        if (previousLines.Data.length > 0) {
            showMessage(KFSDK, "Item already awarded to the selected supplier")
        } else {
            (await KFSDK.api(`/form/2/${KFSDK.account._id}/${supplierAwardingForm}/batch`, {
                method: "POST",
                body: JSON.stringify(payload)
            }));
            showMessage(KFSDK, "Item awarded successfully")
        }
    }



    async function buildTechnicalItems(respondedSuppliers: SourcingSupplierResponses[], currentStage: string) {
        let sections = await getSupplierSections(sourcingEventId, currentStage);
        let questions = await getSupplierQuestions(sourcingEventId, currentStage);

        let technicalItems: TableRowData[] = [];
        let sectionKey: Record<string, number> = {}
        let questionKey: Record<string, number> = {}

        let questionnaires: TableRowData = {
            key: `Questionnaire_Score`,
            parameters: "Questionnaire",
            type: "questionnaire",
            path: [0],
            children: []
        };
        // let sectionsColumns = questionnaires.children ? questionnaires.children : [];

        for (let i = 0; i < sections.length; i++) {
            const { Supplier_ID, ...section } = sections[i];
            const supplierResponse = respondedSuppliers.find((supplier) => supplier.Supplier_ID == Supplier_ID)
            const sectionQuestion = questions.filter((q) => (q.Section_ID == section.Section_ID && q.Supplier_ID == Supplier_ID))

            if (section.Section_ID in sectionKey) {
                technicalItems[sectionKey[section.Section_ID]] = {
                    ...technicalItems[sectionKey[section.Section_ID]],
                    [`${Supplier_ID}_instance_id`]: section._id,
                    [`${Supplier_ID}`]: section.Agg_Weighted_Score,
                    // [`${Supplier_ID}`]: section.Weighted_Score,
                }
            } else {
                technicalItems.push(
                    {
                        key: section.Section_ID,
                        parameters: section.Section_Name,
                        type: "section",
                        children: [],
                        path: [0, technicalItems.length],
                        [`${Supplier_ID}_instance_id`]: section._id,
                        [`${Supplier_ID}`]: section.Agg_Weighted_Score,
                        // [`${Supplier_ID}`]: section.Weighted_Score
                    }
                )
                sectionKey[section.Section_ID] = technicalItems.length - 1;
            }

            let currentItem = technicalItems[sectionKey[section.Section_ID]];
            let questionCols = currentItem?.children || [];

            for (let j = 0; j < sectionQuestion.length; j++) {
                let { Question_ID, Question, _id, Text_Response, ...rest } = sectionQuestion[j]
                if (Question_ID in questionKey) {
                    questionCols[questionKey[Question_ID]] = {
                        ...questionCols[questionKey[Question_ID]],
                        [Supplier_ID]: rest.Weighted_Score || 0,
                        [getResponseKey(Supplier_ID)]: Text_Response,
                        [`${Supplier_ID}_instance_id`]: _id,
                    }
                } else {
                    questionCols.push(
                        {
                            key: Question_ID,
                            parameters: Question,
                            type: "question",
                            editScore: true,
                            path: [...currentItem.path, questionCols.length],
                            [Supplier_ID]: rest.Weighted_Score || 0,
                            [getResponseKey(Supplier_ID)]: Text_Response,
                            [`${Supplier_ID}_instance_id`]: _id,
                        }
                    )
                    questionKey[Question_ID] = questionCols.length - 1;
                }
            }
            questionnaires[`${Supplier_ID}_instance_id`] = supplierResponse?._id
            questionnaires[Supplier_ID] = supplierResponse?.Agg_Weighted_Questionnaire_Score;
            // questionnaires[Supplier_ID] = supplierResponse?.Questionnaire_Weighted_Score;
        }

        questionnaires.children = technicalItems;

        return questionnaires
    }

    async function buildCommercialItems(supplierResponses: SourcingSupplierResponses[], SourcingDetails: any) {
        const applicableCommercialInfo = SourcingDetails[Applicable_commercial_info]
        const commercialInfoKeys: Record<string, number> = {};
        let commercials: TableRowData = {
            key: `Commercial_Score`,
            parameters: "Commercials",
            type: "commercial_details",
            children: [],
            path: [1]
        }
        let lineItems: TableRowData = {
            key: `Line_Items_Score`,
            parameters: "Line Items",
            type: "line_items",
            children: [],
        }

        for await (const response of supplierResponses) {
            const {
                Line_Item_instance_id: id,
                _id,
                // Commercial_Weighted_Score,
                Agg_Weighted_Commercial_Score
            } = response;
            const {
                Supplier_ID,
                ...rest
            } = (await KFSDK.api(`/process/2/${KFSDK.account._id}/admin/${SupplierLineItem}/${id}`));
            let commercialSum = 0

            for (const info of applicableCommercialInfo) {
                let key = `Weighted_${info.replaceAll(" ", "_")}_Score`;

                if (key in commercialInfoKeys && commercials.children) {
                    commercials.children[commercialInfoKeys[key]] = {
                        ...commercials.children[commercialInfoKeys[key]],
                        [Supplier_ID]: rest[key],
                        [`${Supplier_ID}_instance_id`]: id,
                        [getResponseKey(Supplier_ID)]: rest[info.replaceAll(" ", "_")]
                    }
                } else {
                    commercialInfoKeys[key] = commercials.children ? commercials.children?.length : 0;
                    commercials.children?.push({
                        key,
                        type: "line_item_info",
                        parameters: info,
                        editScore: true,
                        path: [1, commercials.children?.length],
                        [Supplier_ID]: rest[key],
                        [`${Supplier_ID}_instance_id`]: id,
                        [getResponseKey(Supplier_ID)]: rest[info.replaceAll(" ", "_")]
                    })
                }

                commercialSum += rest[key];
            }

            let lines = rest[`Table::Line_Items`];
            // let lineItemsSum = 0;

            if (lines.length > 0) {
                for (const item of lines) {
                    let key = item.Item?._id;
                    if (key in commercialInfoKeys && lineItems.children) {
                        lineItems.children[commercialInfoKeys[key]] = {
                            ...lineItems.children[commercialInfoKeys[key]],
                            [`${Supplier_ID}_instance_id`]: id,
                            [Supplier_ID]: item.Weighted_Score,
                            [getResponseKey(Supplier_ID)]: `$${item.Line_Total}`,
                        }
                    } else {
                        commercialInfoKeys[key] = lineItems.children ? lineItems.children?.length : 0;
                        lineItems.children?.push({
                            key: item._id,
                            type: "line_item",
                            parameters: item.Item?.Item,
                            editScore: true,
                            path: [1, commercials.children?.length, lineItems.children?.length],
                            [`${Supplier_ID}_instance_id`]: id,
                            [Supplier_ID]: item.Weighted_Score,
                            [getResponseKey(Supplier_ID)]: `$${item.Line_Total}`,
                            showCheckBox: true
                        })
                    }
                    // lineItemsSum += item[`Score`];
                }
            }

            // lineItems[Supplier_ID] = rest.Line_Item_Weighted_Score;
            // commercials[Supplier_ID] = Commercial_Weighted_Score;
            lineItems[Supplier_ID] = rest.Agg_weighted_line_item_score;
            commercials[Supplier_ID] = Agg_Weighted_Commercial_Score;

            lineItems[`${Supplier_ID}_instance_id`] = id;
            commercials[`${Supplier_ID}_instance_id`] = _id;
        }
        commercials.children?.push(lineItems);
        return commercials;
    }

    function buildColumns(suppliers: SourcingSupplierResponses[], selectedSupplier: string) {
        const columns: any = [{
            title: "Parameters",
            dataIndex: 'parameters',
            key: 'parameters',
            fixed: "left",
            width: "40%",
            className: "table-header table-parameter",
            render: (text: string, record: any, index: any) => (
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingLeft: getLeftPadding(record.type)
                }} >
                    <div style={{ display: "flex", color: tableFontColor, width: "100%" }}  >
                        <Typography style={{ width: record.type == "question" ? "95%" : "100%" }} >
                            {record.type != "question" && `${index + 1}. `} {text}
                        </Typography>
                    </div>
                </div>
            )
        }];
        suppliers.forEach(({ Supplier_ID: _id, Supplier_Name }, index) => {
            const column: any = {
                key: _id,
                title: <CustomTitle
                    key={index}
                    _id={_id}
                    title={Supplier_Name}
                    selectedSupplier={selectedSupplier}
                    setSelectedSupplier={setSelectedSupplier}
                />,
                children: [
                    {
                        title: "Response",
                        dataIndex: getResponseKey(_id),
                        key: getResponseKey(_id),
                        render: (text: string, record: any) => ({
                            children: <p style={{ marginLeft: 8 }} >{text}</p>
                        }),
                        // width: 300,
                        width: "auto",
                        hidden: !showResponse
                    },
                    {
                        title: "Rating",
                        dataIndex: _id,
                        key: _id,
                        render: (text: string, record: any) => ({
                            children: <RowRender
                                record={record}
                                isViewOnly={isViewOnly || !record.editScore}
                                text={text}
                                supplierId={_id}
                            // data={data}
                            />
                        }),
                        // width: 130,
                        width: "auto",
                        hidden: !showRating
                    }
                ],
                width: "auto"
            }
            columns.push(column)
        })
        setColumns(columns)
    }

    const getSourcingDetails = async (sourcing_event_id: string) => {
        const sourcingdetails = (await KFSDK.api(`/process/2/${KFSDK.account._id}/admin/${SourcingMasterProcess}/${sourcing_event_id}`));
        return sourcingdetails;
    }

    const getSourcingSupplierResponses = async (sourcing_event_id: string) => {
        const sourcingdetails = (await KFSDK.api(`/form/2/${KFSDK.account._id}/${supplierResponses}/allitems/list`, {
            method: "POST",
            body: JSON.stringify({
                Filter: {
                    "AND": [
                        {
                            "LHSField": "Sourcing_Event_ID",
                            "Operator": "EQUAL_TO",
                            "RHSType": "Value",
                            "RHSValue": sourcing_event_id,
                            "RHSField": null,
                            "RHSParam": "",
                            "LHSAttribute": null,
                            "RHSAttribute": null
                        },
                        {
                            "LHSField": "Response_Status",
                            "Operator": "EQUAL_TO",
                            "RHSType": "Value",
                            "RHSValue": ResponseStatus.Active,
                            "RHSField": null,
                            "RHSParam": "",
                            "LHSAttribute": null,
                            "RHSAttribute": null
                        },
                        {
                            "LHSField": "Evaluation_Status",
                            "Operator": "EQUAL_TO",
                            "RHSType": "Value",
                            "RHSValue": Evaluation_Status.Not_Completed,
                            "RHSField": null,
                            "RHSParam": "",
                            "LHSAttribute": null,
                            "RHSAttribute": null
                        },
                    ]
                }
            })
        }));
        return sourcingdetails;
    }

    const getSupplierSections = async (sourcing_event_id: string, currentStage: string) => {
        const queries = `page_number=1&page_size=100000`
        const payload =
        {
            "Filter": {
                "AND": [
                    {
                        "AND": [
                            {
                                "LHSField": "Sourcing_Event_ID",
                                "Operator": "EQUAL_TO",
                                "RHSType": "Value",
                                "RHSValue": sourcing_event_id,
                                "RHSField": null,
                                "RHSParam": "",
                                "LHSAttribute": null,
                                "RHSAttribute": null
                            },
                            {
                                "LHSField": "Event_Stage",
                                "Operator": "EQUAL_TO",
                                "RHSType": "Value",
                                "RHSValue": currentStage,
                                "RHSField": null,
                                "RHSParam": "",
                                "LHSAttribute": null,
                                "RHSAttribute": null
                            }
                        ]
                    }
                ]
            }
        }

        const sections: SupplierSection[] = (await KFSDK.api(`/form/2/${KFSDK.account._id}/${supplierResponseSection}/allitems/list?${queries}`, {
            method: "POST",
            body: JSON.stringify(payload)
        })).Data

        return sections;
    }

    const getSupplierQuestions = async (sourcing_event_id: string, currentStage: string) => {
        const queries = `page_number=1&page_size=100000`
        const payload =
        {
            "Filter": {
                "AND": [
                    {
                        "AND": [
                            {
                                "LHSField": "Sourcing_Event_ID",
                                "Operator": "EQUAL_TO",
                                "RHSType": "Value",
                                "RHSValue": sourcing_event_id,
                                "RHSField": null,
                                "RHSParam": "",
                                "LHSAttribute": null,
                                "RHSAttribute": null
                            },
                            {
                                "LHSField": "Event_Stage",
                                "Operator": "EQUAL_TO",
                                "RHSType": "Value",
                                "RHSValue": currentStage,
                                "RHSField": null,
                                "RHSParam": "",
                                "LHSAttribute": null,
                                "RHSAttribute": null
                            }
                        ]
                    }
                ]
            }
        }

        const questions: SupplierQuestion[] = (await KFSDK.api(`/form/2/${KFSDK.account._id}/${supplierResponseQuestion}/allitems/list?${queries}`, {
            method: "POST",
            body: JSON.stringify(payload)
        })).Data

        return questions;
    }

    function getResponseKey(id: string) {
        return `${id}_response`
    }
    return (
        contentLoaded ?
            <div>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: 10
                }} >
                    <div>

                        <Checkbox
                            checked={showResponse}
                            onChange={(e) => setShowResponse(e.target.checked)}
                        >Show Response</Checkbox>
                        <Checkbox
                            checked={showRating}
                            onChange={(e) => setShowRating(e.target.checked)}
                        >Show Rating</Checkbox>
                    </div>
                    <div style={{
                        display: "flex",
                        alignItems: "center"
                    }} >
                        <KFButton
                            style={{ marginRight: 10 }}
                            onClick={async () => {
                                KFSDK.app.page.openPopup("Popup_wmSGkBozN");
                            }} buttonType='secondary'
                        >Awarded Items</KFButton>
                        <KFButton
                            onClick={async () => {
                                if (freezeAwarding) {
                                    showMessage(KFSDK, "Awarding has been freezed")
                                } else {
                                    await updateAwarding();
                                    setSelectedLineItems([])
                                    setSelectedSupplier("")
                                }
                            }} buttonType='primary'
                            disabled={!enableAwarding}
                        >Award</KFButton>
                    </div>
                </div>

                <Table
                    style={{ marginBottom: 20 }}
                    columns={columns}
                    rowSelection={{ ...rowSelection }}
                    dataSource={data}
                    bordered
                    pagination={false}
                    className="custom-table-weightage"
                    scroll={{ x: window.innerWidth - 100, y: window.innerHeight - 200 }}
                    rowClassName={(record: any) => {
                        let classNames = ""
                        if (record.type == "root") {
                            classNames = classNames + "sticky-header-row "
                        }
                        if (expandedRows.includes(record.key)) {
                            classNames = classNames + "newclass-assess"
                        } else {
                            classNames = classNames + "row-class"
                        }
                        return classNames;
                    }
                    }
                    expandable={{
                        onExpand(expanded, record) {
                            if (expanded) {
                                setExpandedRows((rows: string[]) => [...rows, record.key]);
                            } else {
                                setExpandedRows((rows) => [...rows.filter((r) => r != record.key)])
                            }
                        },
                        expandIcon: customExpandIcon,
                        defaultExpandedRowKeys: ["Score", "Commercial_Score", "Line_Items_Score"]
                    }}
                    rootClassName='root'
                    rowKey={(record) => record.key}
                />
            </div> :
            <KFLoader />
    );
};

function RowRender({ record: { key, type, path, ...rest }, text, supplierId }: any) {
    const [scoreValue, setScoreValue] = useState(0);

    useEffect(() => {
        if (rest[supplierId]) {
            setScoreValue(Number(rest[supplierId].toFixed(0)))
        }
    }, [rest[supplierId]])

    return (
        <div style={{
            height: "100%", width: "100%", display: "flex", alignItems: "center",
            // backgroundColor: "#fafafa"
            backgroundColor: getColorCode(scoreValue)
        }} >
            {
                <div style={{ textAlign: "left", paddingLeft: 15 }} >
                    {scoreValue}
                </div>
            }
        </div>)
}

export function CustomTitle({ _id, title, selectedSupplier, setSelectedSupplier }: { _id: string, title: string | undefined, selectedSupplier: string, setSelectedSupplier: React.Dispatch<React.SetStateAction<string>> }) {
    return (
        <div key={_id} style={{ display: "flex" }} >
            <Checkbox
                checked={selectedSupplier == _id}
                disabled={selectedSupplier ? selectedSupplier != _id : false}
                onChange={(event) => {
                    if (event.target.checked) {
                        setSelectedSupplier(() => _id)
                    } else {
                        setSelectedSupplier(() => "")
                    }
                }} style={{ marginRight: 5 }} ></Checkbox>
            <p>{title}</p>
        </div>)
}

export function customExpandIcon(props: any) {
    if (rootNodes.includes(props.record.type)) {
        if (props.expanded) {
            return (
                <div style={{ marginLeft: props.record.type == "line_items" ? 50 : 0 }} >
                    <a style={{ color: 'black', position: "relative", float: "left", marginRight: 15, marginLeft: 15 }} onClick={e => {
                        props.onExpand(props.record, e);
                    }}>
                        <img src={process.env.PUBLIC_URL + "/svgs/expand.svg"} ></img>
                    </a>
                </div>
            )
        } else {
            return (
                <div style={{ marginLeft: props.record.type == "line_items" ? 50 : 0 }} >
                    <a style={{ color: 'black', position: "relative", float: "left", marginRight: 15, marginLeft: 15 }} onClick={e => {
                        props.onExpand(props.record, e);
                    }}>
                        <img src={process.env.PUBLIC_URL + "/svgs/minimize.svg"} ></img>
                    </a>
                </div>
            )
        }
    }
}


function getLeftPadding(key: string) {
    if (key == "question") return 35
    if (key == "line_item_info") return 36
    if (key == "line_item") return 60
    return 0;
}


export { AssessAndAwardTable };
