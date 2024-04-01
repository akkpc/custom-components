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
            const parsedTabs = JSON.parse(availableTabs || "[]");
            const supplier_response_current_tab_id = await KFSDK.app.getVariable("sourcing_custom_tab_key")

            setTabs(parsedTabs);
            setCurrentTab(supplier_response_current_tab_id)
        })()
    }, [])

    useEffect(() => {
        (async () => {
            if (currentTab) {
                const { allComponents } = await KFSDK.app.page.getAllParameters();
                if(allComponents) {
                    let components = JSON.parse(allComponents);
                    await hideAll(components);
                }
                
                const index = tabs.findIndex((t) => t.key == currentTab)
                if (index >= 0) {
                    const cTab = await KFSDK.app.page.getComponent(tabs[index].componentId);
                    cTab.show();
                }
            }
        })()
    }, [currentTab])

    async function hideAll(allComponents: string[]) {
        for await (const tab of allComponents) {
            const cTab = await KFSDK.app.page.getComponent(tab);
            cTab.hide();
        }
    }

    return (
        <div style={{
            paddingLeft:5,
            display: "flex",
            alignItems: "center",
            columnGap: 15,
            height: "100vh",
            overflow:"-moz-hidden-unscrollable"
        }}>
            {
                tabs.map(({ key, componentId, name }) => {
                    return (
                        <TabButton
                            tabKey={key}
                            name={name}
                            setCurrentTab={setCurrentTab}
                            onClick={async () => {
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
                textShadow: "none",
                borderColor: "#292D37"
            }}
            onClick={() => {
                onClick();
                setCurrentTab(key);
            }}
            key={key}
            className="hide-hover"
        >
            {name}
        </Button>
    )
}
