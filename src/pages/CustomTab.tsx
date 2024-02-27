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

const tabs = [
    {
        key: "q_and_a",
        componentId: "Container_QNpAY2qEr",
        name: "Q&A"
    },
    {
        key: "questionnaires",
        componentId: "Container_JzO2vWLyR",
        name: "Questionnaires"
    },
    {
        key: "lines",
        componentId: "Container_kou7_plwp",
        name: "Lines"
    }
]

export default function CustomTab() {
    const [currentTab, setCurrentTab] = useState<string>("q_and_a");
    useEffect(() => {
        (async () => {
            await KFSDK.initialize();
        })()
    }, [])

    async function hideAll() {
        const qnaComponent = await KFSDK.app.page.getComponent("Container_QNpAY2qEr");
        const questionnaireComponent = await KFSDK.app.page.getComponent("Container_JzO2vWLyR");
        const lineComponent = await KFSDK.app.page.getComponent("Container_kou7_plwp");
        qnaComponent.hide()
        questionnaireComponent.hide()
        lineComponent.hide()
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
                boxShadow:"none",
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
