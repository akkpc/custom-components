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

export default function CustomTab() {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [currentTab, setCurrentTab] = useState<string>("");
    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
            const { availableTabs, initialTab } = await KFSDK.app.page.getAllParameters();
            setTabs(JSON.parse(availableTabs || "[]"));
            setCurrentTab(initialTab)
        })()
    }, [])

    useEffect(() => {
        (async () => {
            if (currentTab) {
                await enableHiddenTabs();
                let tabIndex = tabs.findIndex((tab) => tab.key == currentTab);
                let ctab = tabs[tabIndex]
                for await (const tab of ctab.hideComponents) {
                    const cTab = await KFSDK.app.page.getComponent(tab);
                    cTab.hide();
                }
            }
        })()
    }, [currentTab])

    async function hideAll() {
        for await (const tab of tabs) {
            const cTab = await KFSDK.app.page.getComponent(tab.componentId);
            cTab.hide();
        }
    }

    async function enableHiddenTabs() {
        for await (const tab of tabs) {
            for await (const c of tab.hideComponents) {
                const cTab = await KFSDK.app.page.getComponent(c);
                cTab.show();
            }
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
