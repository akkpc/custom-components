import { Checkbox } from 'antd'
import React, { useEffect, useState } from 'react'
const KFSDK = require("@kissflow/lowcode-client-sdk")

export function CheckboxComponent() {

    const [checked, setChecked] = useState(false)

    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            console.log("KFSDK : " , await KFSDK?.app.getVariable("checkbox_enabled"))
        })()
    }, [])

    // useEffect(() => {
    //     KFSDK.app.page.setVariable({
    //         checkbox_enabled: checked
    //     })
    // },[checked])

    return (
        <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
    )
}
