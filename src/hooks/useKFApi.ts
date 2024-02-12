import React, { useEffect, useReducer, useRef } from 'react'
const KFSDK = require("@kissflow/lowcode-client-sdk")

function useKFApi() {
    let variables = useRef(null);
    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            variables.current = await new Promise((res, rej) => {
                try {
                    KFSDK.context.watchParams((data: any) => res(data));
                }
                catch (e) {
                    rej("Cannot get variables")
                }
            })
        })()
    }, [])

    return [variables]

}

export { useKFApi }