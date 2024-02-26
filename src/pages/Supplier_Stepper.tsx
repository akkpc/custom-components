import { Typography } from "antd";
import React, { useEffect, useState } from 'react';
import { stepperEdgeColor, stepperEdgeCompletedColor } from "../helpers/colors";
const KFSDK = require("@kissflow/lowcode-client-sdk")

const description = 'This is a description.';


type Steps = {
  key: string;
  title: string;
  description: string;
  imageName?: string;
  isCompleted?: boolean;
}

type StageParams = {
  endDate: string;
}

const staticSteps: Steps[] = [
  {
    key: "1",
    title: "Supplier Consent",
    description: new Date().toLocaleString(),
    imageName: "stepper_clarification_icon.svg",
    isCompleted: true
  },

  {
    key: "6",
    title: "Supplier Clarifications",
    description: new Date().toLocaleString(),
    imageName: "stepper_clarification_icon.svg",
  },

  {
    key: "7",
    title: "Award Communication",
    description: new Date().toLocaleString(),
    imageName: "stepper_award_icon.svg",
  }
]


const completedIcon = "stepper_completed_icon.svg";

const Supplier_Stepper: React.FC = () => {

  const [steps, setSteps] = useState<Steps[]>([])
  const [completedKey, setCompletedKey] = useState();

  useEffect(() => {
    (async () => {
      await KFSDK.initialize();
      let allParams = await KFSDK.app.page.getAllParameters();

      const stages: Record<string, string> = JSON.parse(allParams.stepperObj || "{}");
      const currentStage = allParams.currentStage;
      const dynamicStages: any[] = getStepperObject(stages)
      setSteps(dynamicStages);
    })()
  }, [])

  function getStepperObject(stages: Record<string, string>) {
    let columns = []
    if (stages.hasOwnProperty("SupplierConsent")) {
      columns.push({
        key: "SupplierConsent",
        title: "Supplier Consent",
        description: stages["SupplierConsent"],
        imageName: "stepper_clarification_icon.svg",
      })
    }

    if (stages.hasOwnProperty("RFI")) {
      columns.push({
        key: "RFI",
        title: "RFI Response",
        description: stages["RFI"],
        imageName: "stepper_pending_icon.svg",
      })
    }

    if (stages.hasOwnProperty("RFP")) {
      columns.push({
        key: "RFP",
        title: "RFP Response",
        description: stages["RFP"],
        imageName: "stepper_pending_icon.svg",
      })
    }

    if (stages.hasOwnProperty("RFP_Supplier_Clarification")) {
      columns.push({
        key: "RFP_Supplier_Clarification",
        title: "Supplier Clarification",
        description: stages["RFP_Supplier_Clarification"],
        imageName: "stepper_clarification_icon.svg",
      })
    }

    if (stages.hasOwnProperty("RFQ")) {
      columns.push({
        key: "RFQ",
        title: "Supplier Clarification",
        description: stages["RFQ"],
        imageName: "stepper_pending_icon.svg",
      })
    }

    if (stages.hasOwnProperty("AwardCommunicaiton")) {
      columns.push({
        key: "AwardCommunicaiton",
        title: "Award Communication",
        description: stages["AwardCommunicaiton"],
        imageName: "stepper_award_icon.svg",
      })
    }
    return columns
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
      <div>
        {
          steps.map(({ key, imageName, title, description }, index) => {
            if (completedKey == key) {
              setCompletedKey(undefined);
            }
            return (
              <div style={{ display: "flex" }} key={index} >
                <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }} >
                  <img style={{ zIndex: 1000 }} src={`${process.env.PUBLIC_URL}/svgs/${completedKey ? completedIcon : imageName}`} ></img>
                  {
                    (index < steps.length - 1) &&
                    <div style={{ height: 70, width: 9, backgroundColor: completedKey ? stepperEdgeCompletedColor : stepperEdgeColor, marginTop: -3 }} ></div>
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
    </div>
  )
}

export {
    Supplier_Stepper
};

