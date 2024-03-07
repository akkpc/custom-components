import { Typography } from "antd";
import React, { useEffect, useState } from 'react';
import { stepperEdgeColor, stepperEdgeCompletedColor } from "../helpers/colors";
const KFSDK = require("@kissflow/lowcode-client-sdk")

const description = 'This is a description.';


type Steps = {
  key: string;
  title: string;
  description?: string;
  imageName?: string;
  isCompleted?: boolean;
}

type StageParams = {
  endDate: string;
}

const stepperMeta: Steps[] = [
  {
    key: "event_creation_draft",
    title: "Event Creation (Draft)",
    imageName: "stepper_award_icon.svg",
  },
  {
    key: "awaiting_rfi_response",
    title: "Awaiting RFI Response",
    imageName: "stepper_award_icon.svg",
  },
  {
    key: "rfi_evaluation_qualification",
    title: "RFI Evaluation & Qualification",
    imageName: "stepper_award_icon.svg",
  },
  {
    key: "rfp_configuration",
    title: "RFP Configuration",
    imageName: "stepper_award_icon.svg",
  },
  {
    key: "awaiting_rfp_response",
    title: "Awaiting RFP Response",
    imageName: "stepper_award_icon.svg",
  },
  {
    key: "rfp_technical_evaluation",
    title: "RFP / Technical Evaluation",
    imageName: "stepper_award_icon.svg",
  },
  {
    key: "rfq_configuration",
    title: "RFQ Configuration",
    imageName: "stepper_award_icon.svg",
  },
  {
    key: "awaiting_rfq_response",
    title: "Awaiting RFQ Response",
    imageName: "stepper_award_icon.svg",
  },
  {
    key: "rfq_commercial_evaluation",
    title: "RFQ / Commercial Evaluation",
    imageName: "stepper_award_icon.svg",
  },
  {
    key: "assess_award",
    title: "Assess & Award",
    imageName: "stepper_award_icon.svg",
  },
  {
    key: "post_award_actions",
    title: "Post Award Actions",
    imageName: "stepper_award_icon.svg",
  },
  {
    key: "completed",
    title: "Completed",
    imageName: "stepper_award_icon.svg",
  },
];
const availableStages = stepperMeta.map((step) => step.key)

const completedIcon = "stepper_completed_icon.svg";

const Buyer_Stepper: React.FC = () => {

  const [steps, setSteps] = useState<Steps[]>([])

  useEffect(() => {
    (async () => {
      await KFSDK.initialize();
      let allParams = await KFSDK.app.page.getAllParameters();

      const stages: Record<string, string> = JSON.parse(allParams.stepper || "{}");
      const currentStage = (allParams.current_status);
      const dynamicStages: any[] = getStepperObject(stepperMeta, stages, currentStage)
      console.log("Stages : ", dynamicStages, currentStage)
      setSteps(dynamicStages);
    })()
  }, [])

  function getStepperObject(stepperMeta: Steps[], stages: Record<string, string>, currentStage: string) {
    let columns = stepperMeta.filter(({ key }) => stages.hasOwnProperty(key)).map((stage) => ({ ...stage, description: stages[stage.key] }))
    if (availableStages.includes(currentStage)) {
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].key == currentStage) {
          break;
        }
        columns[i].isCompleted = true;
      }
    }

    return columns;
  }

  return (
    steps.length > 0 ? <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
      <div>
        {
          steps.map(({ key, imageName, title, description, isCompleted }, index) => {
            return (
              <div style={{ display: "flex" }} key={index} >
                <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }} >
                  <img style={{ zIndex: 1000 }} src={`${process.env.PUBLIC_URL}/svgs/${isCompleted ? completedIcon : imageName}`} ></img>
                  {
                    (index < steps.length - 1) &&
                    <div style={{ height: 70, width: 9, backgroundColor: isCompleted ? stepperEdgeCompletedColor : stepperEdgeColor, marginTop: -3 }} ></div>
                  }
                </div>
                <div style={{ marginLeft: 10 }} >
                  <Typography style={{ fontSize: 15, color: "#080E19", fontWeight: "600" }} >
                    {title}
                  </Typography>
                  <Typography style={{ fontSize: 12, color: "#61656C", fontWeight: "400" }} >
                    {description}
                  </Typography>
                </div>
              </div>
            )
          }
          )
        }
      </div>
    </div> : <div>Loading...</div>
  )
}

export {
  Buyer_Stepper
};

