import { Button } from 'antd';
import React, { Dispatch, useEffect, useState } from 'react';
const KFSDK = require("@kissflow/lowcode-client-sdk")

interface ButtonProps {
    name: string;
    onClick: () => void;
    tabKey: string;
    setCurrentTab: Dispatch<React.SetStateAction<string>>;
    isActive: boolean;
}

interface Tab {
    key: string;
    componentId: string;
    name: string;
    hideComponents: string[]
}

declare global {
    interface Window {
        tabDocument: any;
    }
}

export default function CustomTab() {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [currentTab, setCurrentTab] = useState<string>("");
    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            const { availableTabs } = await KFSDK.app.page.getAllParameters();
            const supplier_response_current_tab_id = await KFSDK.app.getVariable("sourcing_custom_tab_key")

            setTabs(JSON.parse(availableTabs || "[]"));
            setCurrentTab(supplier_response_current_tab_id)
        })()
    }, [])

    useEffect(() => {
        (async () => {
            if (currentTab) {
                console.log("currentTab ,", currentTab)
                await hideAll();
                const index = tabs.findIndex((t) => t.key == currentTab)
                const cTab = await KFSDK.app.page.getComponent(tabs[index].componentId);
                cTab.show();
            }
        })()
    }, [currentTab])

    async function hideAll() {
        for await (const tab of tabs) {
            const cTab = await KFSDK.app.page.getComponent(tab.componentId);
            cTab.hide();
        }
    }

    return (
        <div style={{
            padding: 5,
            display: "flex",
            alignItems: "center",
            gap: 15
        }}>
            {
                tabs.map(({ key, componentId, name }) => {
                    return (
                        <TabButton
                            tabKey={key}
                            name={name}
                            setCurrentTab={setCurrentTab}
                            onClick={async () => {
                                await hideAll();
                                const activeComponent = await KFSDK.app.page.getComponent(componentId);
                                activeComponent.show();
                                setCurrentTab(key);
                                await KFSDK.app.setVariable("sourcing_custom_tab_key", key)
                            }}
                            isActive={currentTab == key}
                            key={key}
                        />
                    )
                })
            }
        </div>
    )
}

function TabButton({ name, onClick, tabKey: key, isActive, setCurrentTab }: ButtonProps) {
    return (
        <Button
            id={key}
            type={'default'}
            style={{
                borderRadius: 15,
                height: 28,
                minWidth: 92,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                backgroundColor: (isActive) ? "#F1F5FA" : "transparent",
                boxShadow: "none",
                textShadow: "none"
            }}
            onClick={() => {
                onClick();
                setCurrentTab(key);
            }}
            key={key}
        >
            {name}
        </Button>
    )
}
