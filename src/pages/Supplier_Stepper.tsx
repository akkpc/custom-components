import { Typography } from "antd";
import React, { useEffect, useState } from 'react';
import { convertStringToDate, getDateObj } from "../helpers";
import { stepperEdgeColor, stepperEdgeCompletedColor } from "../helpers/colors";
import { KFLoader } from "../components/KFLoader";
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
      let { task_id } = await KFSDK.app.page.getAllParameters();
      const dynamicStages: any[] = await getStepperObject(task_id)
      setSteps(dynamicStages);
    })()
  }, [])

  async function getStepperObject(id: string) {
    const taskDetails = await KFSDK.api(`/form/2/${KFSDK.account._id}/Sourcing_Supplier_Tasks_A00/${id}`);
    const eventId = taskDetails.Event_ID

    const SourcingDetails: any = await KFSDK.api(`/process/2/${KFSDK.account._id}/admin/Sourcing_Master_A00/${eventId}`);
    const {
      Current_Stage,
      RSVP_End_Date_3,
      Awarding_Communication,
      Event_Type,
      RFI_End_Date,
      RFP_End_Date,
      RFQ_End_Date
    }: any = SourcingDetails;

    let stepperObj: any = {
      SupplierConsent: convertStringToDate(RSVP_End_Date_3),
      AwardCommunicaiton: convertStringToDate(Awarding_Communication)
    }
    console.log("Event_Type :  ", Event_Type)
    if (Event_Type.includes("RFI")) {
      stepperObj.RFI = convertStringToDate(RFI_End_Date)
    }

    if (Event_Type.includes("RFP")) {
      stepperObj.RFP = convertStringToDate(RFP_End_Date)
      stepperObj.RFP_Supplier_Clarification = convertStringToDate(RFP_End_Date)
    }

    if (Event_Type.includes("RFQ")) {
      stepperObj.RFQ = convertStringToDate(RFQ_End_Date)
    }

    let currentStage = "SupplierConsent";
    if (taskDetails.Consent_Status == "Accepted") {
      currentStage = Current_Stage;
    }

    const time: any = getDateObj(SourcingDetails[`${Current_Stage}_End_Date`])?.getTime();
    if (time) {
      if (time < new Date().getTime()) {
        if (Current_Stage == "RFP") {
          currentStage = "RFP_Supplier_Clarification";
        } else {
          currentStage = "AwardCommunicaiton";
        }
      }
    }

    if(taskDetails.Response_Status == "Responded") {
      currentStage = "RFP_Supplier_Clarification";
    }

    let columns = stepsMetaData.filter(({ key }) => stepperObj.hasOwnProperty(key)).map((stage) => ({ ...stage, description: stepperObj[stage.key] }))
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
    </div> : <KFLoader/>
  )
}

export {
  Supplier_Stepper
};

