import { Checkbox, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { KFButton } from '../components/KFButton';
const KFSDK = require("@kissflow/lowcode-client-sdk")

enum StatusType {
    Not_Responded = "Not Responded",
    Accepted = "Accepted",
    Declined = "Declined",
}

const title = "Are you sure want to reject this Event ?";
const content = "You are about to reject this event, You can't participate this event anymore";
const continueComponentId = "Container_bcpG-cP9H"
const inputComponentId = "Container_ltTuhc3t6"

export function CheckboxComponent() {

    const [checked, setChecked] = useState(false)
    const [supplierTaskId, setSupplierTaskID] = useState("")
    const [currentConsentStatus, setCurrentConsentStatus] = useState<StatusType>(StatusType.Not_Responded)

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            // await hideAll()
            const { supplierTaskId: stid } = await KFSDK.app.page.getAllParameters()
            console.log("supplierTaskId", stid)
            setSupplierTaskID(stid);
        })()
    }, [])

    useEffect(() => {
        (async () => {
            if (supplierTaskId) {
                const my_task: any = await getDetail(supplierTaskId);
                console.log("first " , my_task)
                await toggle(my_task.Consent_Status);
                setCurrentConsentStatus(my_task.Consent_Status);
            }
        })()
    }, [supplierTaskId])

    async function updateConsent(isAccepted: boolean) {
        const consent: any[] = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Supplier_Tasks_A00/${supplierTaskId}`, {
            method: "POST",
            body: JSON.stringify({
                Consent_Status: isAccepted ? "Accepted" : "Declined"
            })
        })).Data
        return consent
    }

    async function getDetail(supplierTaskId: string) {
        const my_task: any[] = (await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Supplier_Tasks_A00/${supplierTaskId}`))

        return my_task
    }

    async function toggle(currentConsentStatus: StatusType) {
        const continueComponent = await KFSDK.app.page.getComponent(continueComponentId)
        const inputComponent = await KFSDK.app.page.getComponent(inputComponentId)
        console.log("currentConsentStatus" , currentConsentStatus)
        if (currentConsentStatus == StatusType.Accepted) {
            continueComponent.show()
            inputComponent.hide()
        } else {
            inputComponent.show()
            continueComponent.hide()
        }
    }

    // async function hideAll() {
    //     const continueComponent = await KFSDK.app.page.getComponent(continueComponentId)
    //     const inputComponent = await KFSDK.app.page.getComponent(inputComponentId)
    //     inputComponent.hide()
    //     continueComponent.hide()
    // }

    async function refersh() {
        const tandc = await KFSDK.app.page.getComponent(inputComponentId)
        tandc.refresh()
    }
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // backgroundColor: "red",
            height: "100vh"
        }} >
            <div style={{
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
                        <a>&nbsp;Terms & Conditions</a>
                    </Typography>
                </div> :
                    (currentConsentStatus == StatusType.Accepted) ? <Typography style={{ marginLeft: 8, fontSize: 15 }} >
                        Read Accepted
                        <a>&nbsp;Terms & Conditions</a>
                    </Typography> : <></>
                }
                <div>
                    {currentConsentStatus == StatusType.Accepted ? <KFButton
                        buttonType='primary'
                        // style={{ backgroundColor: "red", marginRight: 10, fontWeight: "600" }}
                        // className=""
                        onClick={async () => {

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
                                                await refersh();
                                            }
                                            else {
                                            }
                                        })
                                    }}
                                >Reject Invite</KFButton>
                                <KFButton
                                    buttonType="primary"
                                    disabled={!checked}
                                    style={{ backgroundColor: "green", color: "white", fontWeight: "600" }}
                                    className=""
                                    onClick={async () => {
                                        await updateConsent(true)
                                        await refersh();
                                    }}
                                >Accept Invite</KFButton>
                            </div>
                    }
                </div>
            </div>
        </div>
    )
}
