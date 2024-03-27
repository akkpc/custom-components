import { Checkbox, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { KFButton } from '../components/KFButton';
import { dataforms, lineComponentId, lineItemTypes, processes, questionnaireComponentId } from '../helpers/constants';
const KFSDK = require("@kissflow/lowcode-client-sdk")

enum StatusType {
    Not_Responded = "Not Responded",
    Accepted = "Accepted",
    Declined = "Declined",
}

const title = "Are you sure want to reject this Event ?";
const content = "You are about to reject this event, You can't participate this event anymore";

const {
    sourcingSupplierTasks,
    supplierResponses
} = dataforms;
const {
    SourcingMaster,
    SupplierLineItem
} = processes;
export function CheckboxComponent() {

    const [checked, setChecked] = useState(false)
    const [supplierTaskId, setSupplierTaskID] = useState("")
    const [currentConsentStatus, setCurrentConsentStatus] = useState<StatusType>()
    const [loading, setLoading] = useState(false)
    const [eventEnded, setEventEnded] = useState(false);
    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            const { supplierTaskId: stid, end_date, allow_multiple_bid } = await KFSDK.app.page.getAllParameters();
            let date = getDate(end_date);
            if (date) {
                if (date?.getTime() <= new Date().getTime()) {
                    setEventEnded(true);
                }
            }
            setSupplierTaskID(stid);
        })()
    }, [])

    useEffect(() => {
        (async () => {
            if (supplierTaskId) {
                const my_task: any = await getDetail(supplierTaskId);
                setCurrentConsentStatus(my_task.Consent_Status);
            }
        })()
    }, [supplierTaskId])

    async function updateConsent(isAccepted: boolean) {
        const consent: any[] = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${sourcingSupplierTasks}/${supplierTaskId}`, {
            method: "POST",
            body: JSON.stringify({
                Consent_Status: isAccepted ? "Accepted" : "Declined"
            })
        })).Data
        return consent
    }

    async function getDetail(supplierTaskId: string) {
        const my_task: any[] = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${sourcingSupplierTasks}/${supplierTaskId}`))
        return my_task
    }

    async function createOrContinueSupplierResponses() {
        const taskDetails = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${sourcingSupplierTasks}/${supplierTaskId}`);
        const { Event_ID: eventId, Supplier_Email: supplier_email } = taskDetails;
        const SourcingDetails = await KFSDK.api(`${process.env.REACT_APP_API_URL}/process/2/${KFSDK.account._id}/admin/${SourcingMaster}/${eventId}`);
        const prevResponses = await getPrevSupplierResponses(taskDetails, SourcingDetails);

        const {
            _id: sourcingEventId,
            _created_by: { Name },
            Current_Stage
        } = SourcingDetails;


        let payload: any = {
            sourcingEventId,
            currentStage: Current_Stage,
            timer_date: getDate(SourcingDetails[`${Current_Stage}_End_Date`]),
            eventStartDate: convertDatetoLocaleString(SourcingDetails[`${Current_Stage}_Start_Date`]),
            eventEndDate: convertDatetoLocaleString(SourcingDetails[`${Current_Stage}_End_Date`]),
            Event_Type: JSON.stringify(SourcingDetails.Event_Type),
            event_owner_name: Name,
            supplier_email,
            supplierTaskId
        };

        if (prevResponses.length > 0) {
            const { Line_Item_instance_id, Line_item_activity_instance_id, Response_Status } = prevResponses[0];
            if (lineItemTypes.includes(Current_Stage) && Line_item_activity_instance_id && Line_Item_instance_id) {
                payload = {
                    ...payload,
                    line_id: Line_Item_instance_id,
                    line_aid: Line_item_activity_instance_id,
                    Response_Status
                }
            }
        } else {
            let response = await createResponse(taskDetails, SourcingDetails);
            payload.res_instance_id = response._id;
            console.log("Response created : ", response)

            if (Current_Stage != "RFQ") {
                await addQuestionnaireToSupplier(response._id, taskDetails, SourcingDetails);
            }

            if (SourcingDetails["Table::RFQ_Configuration"]) {
                const { _id, _activity_instance_id, ...rest } = await createLineItem(response, taskDetails, SourcingDetails);
                const updatedResonse = await KFSDK.api(
                    `${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${supplierResponses}/${response._id}`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            Line_Item_instance_id: _id,
                            Line_item_activity_instance_id: _activity_instance_id
                        })
                    });
                console.log("Response Line items created : ", _id, _activity_instance_id, rest, updatedResonse)
                payload.line_id = _id;
                payload.line_aid = _activity_instance_id;
            }
        }
        const questionnaireTab = {
            key: "questionnaires",
            componentId: questionnaireComponentId,
            name: "Questionnaires",
            hideComponents: []
        }
        const lineTab = {
            key: "lines",
            componentId: lineComponentId,
            name: "Lines",
            hideComponents: []
        }

        const availableTabs = []
        let initialTab = questionnaireTab.key;
        const eventTypes = SourcingDetails.Event_Type
        if (Current_Stage == "RFI") {
            availableTabs.push(questionnaireTab)
        }
        if (Current_Stage == "RFP") {
            availableTabs.push(questionnaireTab)
            if (!eventTypes.includes("RFQ")) {
                availableTabs.push(lineTab)
            }
        }
        if (Current_Stage == "RFQ") {
            availableTabs.push(lineTab)
            initialTab = lineTab.key;
        }

        const sourcing_event_number = await KFSDK.app.page.getParameter('sourcing_event_number');
        await KFSDK.app.setVariable("sourcing_custom_tab_key", "questionnaires")

        const allComponents = ["Container_VRSTDYbWW" , "Container_ZUfUF-TIt"]
        KFSDK.app.openPage("Sourcing_Supplier_Response_Page_A00", {
            ...payload,
            user_type: "supplier",
            sourcing_event_id: sourcingEventId,
            availableTabs: JSON.stringify(availableTabs),
            initialTab,
            sourcing_event_number,
            allComponents: JSON.stringify(allComponents)
        });
        setLoading(false);
    }

    async function getPrevSupplierResponses(taskDetails: Record<string, any>, SourcingDetails: Record<string, any>) {
        const { _id, Current_Stage } = SourcingDetails;
        const { Supplier_ID } = taskDetails;
        const response_list = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${supplierResponses}/allitems/list`,
            {
                method: "POST",
                body: JSON.stringify({
                    Filter: {
                        "AND": [
                            {
                                "AND": [
                                    {
                                        "LHSField": "Sourcing_Event_ID",
                                        "Operator": "EQUAL_TO",
                                        "RHSType": "Value",
                                        "RHSValue": _id,
                                        "RHSField": null,
                                        "RHSParam": "",
                                        "LHSAttribute": null,
                                        "RHSAttribute": null
                                    },
                                    {
                                        "LHSField": "Response_Type",
                                        "Operator": "EQUAL_TO",
                                        "RHSType": "Value",
                                        "RHSValue": Current_Stage,
                                        "RHSField": null,
                                        "RHSParam": "",
                                        "LHSAttribute": null,
                                        "RHSAttribute": null
                                    },
                                    {
                                        "LHSField": "Supplier_ID",
                                        "Operator": "EQUAL_TO",
                                        "RHSType": "Value",
                                        "RHSValue": Supplier_ID,
                                        "RHSField": null,
                                        "RHSParam": "",
                                        "LHSAttribute": null,
                                        "RHSAttribute": null
                                    }
                                ]
                            }
                        ]
                    }
                })
            }
        ).catch((err: any) => {
            console.log("Cannot fetch prev responses", err)
        })
        const prevResponses = response_list.Data;
        return prevResponses;
    }



    async function createResponse(taskDetails: Record<string, any>, SourcingDetails: Record<string, any>) {
        const { Supplier_ID: supplierId, Supplier_Name } = taskDetails;
        const { _id, Current_Stage } = SourcingDetails;
        const payload = {
            Sourcing_Event_ID: _id,
            Supplier_ID: supplierId,
            Supplier_Name,
            Response_Type: Current_Stage,
            Response_Status: "Draft",
            _is_created: true
        }
        const response = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${supplierResponses}/batch`,
            {
                method: "POST",
                body: JSON.stringify([payload])
            });

        return response[0];
    }

    async function createLineItem(res: any, taskDetails: Record<string, any>, SourcingDetails: Record<string, any>) {
        const { _id: id, Supplier_ID: supplierId, Supplier_Name } = taskDetails;
        const { _id: eventId, Current_Stage, Applicable_commercial_info } = SourcingDetails;
        const payload = {
            Sourcing_Event_ID: eventId,
            Supplier_ID: supplierId,
            Sourcing_Type: Current_Stage,
            Applicable_commercial_info: Applicable_commercial_info,
            "Table::Line_Items": SourcingDetails["Table::RFQ_Configuration"].map((items: any) => {
                let { _id, Item, Item_Description, Unit_of_Measure, Quantity, Request_Quote_For, Weightage, sourcing_event_id, item_id } = items;
                return {
                    Item: {
                        _id: _id,
                        _parent_id: eventId,
                        Item: Item,
                        Item_Description: Item_Description,
                        Unit_of_Measure: Unit_of_Measure,
                        Quantity: Quantity,
                        Request_Quote_For: Request_Quote_For,
                        Weightage: Weightage,
                        sourcing_event_id: sourcing_event_id,
                        item_id
                    }
                }
            }),
            Response_ID: res._id,
            Supplier_Task_ID: id
        }
        const response = await KFSDK.api(`/process/2/${KFSDK.account._id}/${SupplierLineItem}`,
            {
                method: "POST",
                body: JSON.stringify(payload)
            });
        return response;
    }

    async function addQuestionnaireToSupplier(instance_id: string, taskDetails: Record<string, any>, SourcingDetails: Record<string, any>) {
        const { _id, Current_Stage, Evaluator_Count } = SourcingDetails;
        const { Supplier_ID } = taskDetails;

        const flowLogicPayload = {
            Supplier_ID,
            Sourcing_Event_ID: _id,
            Event_Stage: Current_Stage,
            Instance_ID: instance_id
        }

        console.log("Questionnaire flowLogicPayload", flowLogicPayload)

        var component_filter = {
            "Filter": {
                "AND": [{
                    "AND": [
                        {
                            "LHSField": "Sourcing_Event_ID",
                            "Operator": "EQUAL_TO",
                            "RHSType": "Value",
                            "RHSValue": _id,
                            "RHSField": null,
                            "RHSParam": "",
                            "LHSAttribute": null,
                            "RHSAttribute": null
                        },
                        {
                            "LHSField": "Event_Stage",
                            "Operator": "EQUAL_TO",
                            "RHSType": "Value",
                            "RHSValue": Current_Stage,
                            "RHSField": null,
                            "RHSParam": "",
                            "LHSAttribute": null,
                            "RHSAttribute": null
                        }
                    ]
                }]
            }
        }

        const template = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Templates_A01/allitems/list?page_number=1&page_size=1000000`,
            {
                method: "POST",
                body: JSON.stringify(component_filter),
            }).then((res: any) => res.Data[0]).catch((err: any) => console.log("Error in fetching template"));

        const sections = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Sections_A00/allitems/list?page_number=1&page_size=1000000`,
            {
                method: "POST",
                body: JSON.stringify(component_filter),
            }).then((res: any) => res.Data).catch((err: any) => console.log("Cannot get sections"));

        const questions = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Questions_A00/allitems/list?page_number=1&page_size=1000000`,
            {
                method: "POST",
                body: JSON.stringify(component_filter),
            }).then((res: any) => res.Data).catch((err: any) => console.log("Cannot get questions"));

        let templatePayload = [{
            ...flowLogicPayload,
            Template_Name: template.Template_Name,
            Weightage: template.Weightage,
            Evaluator_Count,
            _is_created: true
        }]

        let sectionPayload = sections.map((section: any) => ({
            ...flowLogicPayload,
            Section_Name: section.Section_Name,
            Section_Sequence: section.Section_Sequence,
            Weightage: section.Weightage,
            Template_ID: section.Template_ID,
            Section_ID: section.Section_ID,
            Evaluator_Count,
            _is_created: true
        }))

        let questionPayload = questions.map((question: any) => ({
            ...flowLogicPayload,
            Question: question.Question,
            Weightage: question.Weightage,
            Response_Type: question.Response_Type,
            Dropdown_options: question.Dropdown_options,
            Template_ID: question.Template_ID,
            Section_ID: question.Section_ID,
            Question_ID: question.Question_ID,
            Evaluator_Count,
            _is_created: true
        }))

        console.log("sectionPayload : ", templatePayload, sectionPayload, questionPayload)

        await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Supplier_Response_Templat_A00/batch`,
            { method: "POST", body: JSON.stringify(templatePayload) }).catch((err: any) => {
                console.log("Could not update template", err)
            })

        await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Supplier_Response_Section_A00/batch`,
            { method: "POST", body: JSON.stringify(sectionPayload) }).catch((err: any) => {
                console.log("Could not update template", err)
            })

        await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Supplier_Response_Questio_A01/batch`,
            { method: "POST", body: JSON.stringify(questionPayload) }).catch((err: any) => {
                console.log("Could not update template", err)
            })
    }

    function convertDatetoLocaleString(dateString: string) {
        const date = dateString.split(" ")[0]
        return new Date(date).toLocaleDateString()
    }

    function getDate(dateString: string) {
        if (dateString) {
            var dateTimePart = dateString.split(' ')[0];
            var dateObject = new Date(dateTimePart);
            return dateObject
        }
        return;
    }

    // async function checkEventDeadlineStatus() {
    //     const SourcingDetails = await KFSDK.api(`${process.env.REACT_APP_API_URL}/process/2/${KFSDK.account._id}/admin/${SourcingMaster}/${eventId}`);
    // }

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // backgroundColor: "red",
            height: "100vh"
        }} >
            {
                eventEnded ?
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                        justifyContent: "space-between"
                    }} >
                        <Typography.Text>
                            Event ended, <a
                                style={{ fontWeight: "bold" }}
                                type='link'
                                // buttonType='secondary'
                                onClick={() => {
                                    KFSDK.app.openPage("Sourcing_Buyer_My_Tasks_A00")
                                }}
                            >
                                Go back
                            </a>
                        </Typography.Text>
                    </div>

                    :
                    currentConsentStatus && <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-around",
                        height: "100%"
                    }} >
                        {(currentConsentStatus == StatusType.Not_Responded) ? <div
                            style={{
                                display: "flex",
                            }}
                        >
                            <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                            <Typography style={{ marginLeft: 8, fontSize: 15 }} >
                                Read and Accept
                                <a
                                    target='__blank'
                                    href={`${process.env.REACT_APP_API_URL}/view/filepreview/form/${sourcingSupplierTasks}/${supplierTaskId}/Terms__Conditions?fileindex=0`}
                                >&nbsp;Terms & Conditions</a>
                            </Typography>
                        </div> :
                            (currentConsentStatus == StatusType.Accepted) ? <Typography style={{ marginLeft: 8, fontSize: 15 }} >
                                Read Accepted
                                <a
                                    target='__blank'
                                    href={`${process.env.REACT_APP_API_URL}/view/filepreview/form/${sourcingSupplierTasks}/${supplierTaskId}/Terms__Conditions?fileindex=0`}
                                >&nbsp;Terms & Conditions</a>
                            </Typography> : <></>
                        }
                        <div>
                            {currentConsentStatus == StatusType.Accepted ? <KFButton
                                buttonType='primary'
                                // style={{ backgroundColor: "red", marginRight: 10, fontWeight: "600" }}
                                // className=""
                                loading={loading}
                                onClick={async () => {
                                    setLoading(true);
                                    await createOrContinueSupplierResponses();
                                }}
                            >Continue</KFButton>
                                :
                                currentConsentStatus == StatusType.Declined ?
                                    <div>
                                        <Typography>Declined</Typography>
                                    </div> :
                                    <div>
                                        <KFButton
                                            buttonType='primary'
                                            style={{ backgroundColor: "red", marginRight: 10, fontWeight: "600" }}
                                            className=""
                                            onClick={async () => {
                                                KFSDK.client.showConfirm({
                                                    title,
                                                    content
                                                }).then(async (action: any) => {
                                                    if (action === "OK") {
                                                        await updateConsent(false)
                                                    }
                                                    else {
                                                    }
                                                })
                                            }}
                                        >Reject Invite</KFButton>
                                        <KFButton
                                            loading={loading}
                                            buttonType="primary"
                                            disabled={!checked}
                                            style={{ backgroundColor: "green", color: "white", fontWeight: "600" }}
                                            className=""
                                            onClick={async () => {
                                                setLoading(true);
                                                await updateConsent(true)
                                                await createOrContinueSupplierResponses();
                                            }}
                                        >Accept Invite</KFButton>
                                    </div>
                            }
                        </div>
                    </div>
            }
        </div>
    )
}
