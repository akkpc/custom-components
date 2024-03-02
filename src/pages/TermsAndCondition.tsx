import { Checkbox, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { KFButton } from '../components/KFButton'
const KFSDK = require("@kissflow/lowcode-client-sdk")

export function CheckboxComponent() {

    const [checked, setChecked] = useState(false)

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            console.log("KFSDK : ", await KFSDK?.app.getVariable("checkbox_enabled"))
        })()
    }, [])
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
                <div
                    style={{
                        display: "flex",
                    }}
                >
                    <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                    <Typography style={{ marginLeft: 8, fontSize: 15 }} >
                        Read and Accept
                        <a>&nbsp;Terms & Conditions</a>
                    </Typography>
                </div>
                <div>
                    <KFButton
                        buttonType='primary'
                        style={{ backgroundColor: "red", marginRight: 10, fontWeight: "600" }}
                        className=""
                    >Reject Invite</KFButton>
                    <KFButton
                        buttonType="primary"
                        disabled={!checked}
                        style={{ backgroundColor: "green", color: "white", fontWeight: "600" }}
                        className=""
                    >Accept Invite</KFButton>
                </div>
            </div>
        </div>
    )
}
