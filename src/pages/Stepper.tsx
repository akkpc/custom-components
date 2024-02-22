import { Typography } from "antd";
import React from 'react';
import { stepperEdgeColor, stepperEdgeCompletedColor } from "../helpers/colors";

const description = 'This is a description.';


type Steps = {
  key: string;
  title: string;
  description: string;
  imageName?: string;
  isCompleted?: boolean;
}

const steps: Steps[] = [
  {
    key: "1",
    title: "Supplier Consent",
    description: new Date().toLocaleString(),
    imageName: "stepper_clarification_icon.svg",
    isCompleted: true
  },
  {
    key: "2",
    title: "RFQ Response",
    description: new Date().toLocaleString(),
    imageName: "stepper_pending_icon.svg",
  },
  {
    key: "3",
    title: "Supplier Clarifications",
    description: new Date().toLocaleString(),
    imageName: "stepper_clarification_icon.svg",
  },
  {
    key: "4",
    title: "Award Communication",
    description: new Date().toLocaleString(),
    imageName: "stepper_award_icon.svg",
  }
]

const completedIcon = "stepper_completed_icon.svg";

const StepperComponent: React.FC = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems:"center" }} >
    <div>
      {
        steps.map(({ isCompleted, imageName, title, description }, index) => (
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
        ))
      }
    </div>
  </div>
);

export {
  StepperComponent as Stepper
};
