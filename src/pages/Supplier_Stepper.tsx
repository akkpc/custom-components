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

const completedIcon = "stepper_completed_icon.svg";

const stepsMetaData: Steps[] = [
  {
    key: "SupplierConsent",
    title: "Supplier Consent",
    imageName: "stepper_clarification_icon.svg",
  },
  {
    key: "RFI",
    title: "RFI Response",
    imageName: "stepper_pending_icon.svg",
  },
  {
    key: "RFP",
    title: "RFP Response",
    imageName: "stepper_pending_icon.svg",
  },
  {
    key: "RFP_Supplier_Clarification",
    title: "Supplier Clarification",
    imageName: "stepper_clarification_icon.svg",
  },
  {
    key: "RFQ",
    title: "Supplier Clarification",
    imageName: "stepper_pending_icon.svg",
  },
  {
    key: "AwardCommunicaiton",
    title: "Award Communication",
    imageName: "stepper_award_icon.svg",
  }
]

const availableStages = stepsMetaData.map(({ key }) => key);

const Supplier_Stepper: React.FC = () => {

  const [steps, setSteps] = useState<Steps[]>([])

  useEffect(() => {
    (async () => {
      await KFSDK.initialize();
      let allParams = await KFSDK.app.page.getAllParameters();


      const stages: Record<string, string> = JSON.parse(allParams.stepperObj || "{}");
      const currentStage = allParams.currentStage;
      const dynamicStages: any[] = await getStepperObject(stages, currentStage)
      console.log("dynamicStages" , dynamicStages, currentStage, stages)
      setSteps(dynamicStages);
    })()
  }, [])

  async function getStepperObject(stages: Record<string, string>, currentStage: string) {
    let columns = stepsMetaData.filter(({ key }) => stages.hasOwnProperty(key)).map((stage) => ({ ...stage, description: stages[stage.key] }))
    if (availableStages.includes(currentStage)) {
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].key == currentStage) {
          break;
        }
        columns[i].isCompleted = true;
      }
    }

    return columns
  }

  return (
    steps.length > 0 ? <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
      <div>
        {
          steps.map(({ imageName, title, description, isCompleted }, index) => {
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
  Supplier_Stepper
};

