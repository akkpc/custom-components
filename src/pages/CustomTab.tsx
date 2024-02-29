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

// const qnaComponentId = "Container_QNpAY2qEr"
// const questionnaireComponentId = "Container_JzO2vWLyR"
// const lineComponentId = "Container_kou7_plwp"

const qnaComponentId = "Container_NLO3KNKBV"
const questionnaireComponentId = "Container_SIywL7mzo"
const lineComponentId = "Container_ymVafCM7_"

const tabs = [
    {
        key: "q_and_a",
        componentId: qnaComponentId,
        name: "Q&A"
    },
    {
        key: "questionnaires",
        componentId: questionnaireComponentId,
        name: "Questionnaires"
    },
    {
        key: "lines",
        componentId: lineComponentId,
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
        const qnaComponent = await KFSDK.app.page.getComponent(qnaComponentId);
        const questionnaireComponent = await KFSDK.app.page.getComponent(questionnaireComponentId);
        const lineComponent = await KFSDK.app.page.getComponent(lineComponentId);
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
