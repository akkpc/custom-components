import {
    createHashRouter
} from "react-router-dom";
import { BarChart } from "../pages/BarChart";
import { BasicChart } from "../pages/BasicChart";
import { Buyer_Stepper } from "../pages/Buyer_Stepper";
import UICalender from "../pages/Calender";
import CustomTab from "../pages/CustomTab";
import { LineChart } from "../pages/LineChart";
import { QuestionTab } from "../pages/QuestionTab";
import { SourcingTemplate } from "../pages/SourcingTemplate";
import { SupplierResponsePage } from "../pages/SupplierResponseQuestions";
import { Supplier_Stepper } from "../pages/Supplier_Stepper";
import { AccordionTable } from "../pages/Table";
import { AccordionTableWeightage } from "../pages/Table_Weightage";
import { TemplateQuestionnaire } from "../pages/TemplateQuestionnaire";
import { CheckboxComponent } from "../pages/TermsAndCondition";
import { TimerComponent } from "../pages/TimerComponent";

function Rest() {
    return (
        <div>
            Hello
            <button onClick={() => {
                console.log("ndffnkjdbfhjkd ")
                alert("Anfijdfns")
            }} >fnkdfs</button>
        </div>
    )
}

const router = createHashRouter([
    {
        path: "/",
        element: <div>Home Page</div>
    },
    {
        path: "/calendar",
        element: <UICalender />
    },
    {
        path: "/line-chart",
        element: <LineChart />,
    },
    {
        path: "/bar",
        element: <BarChart />,
    },
    {
        path: "/test/test",
        element: <BasicChart />
    },
    {
        path: "/table",
        element: <AccordionTable />
    },
    {
        path: "/qna_tab",
        element: <QuestionTab />
    },
    {
        path: "/add_template_question",
        element: <TemplateQuestionnaire />
    },
    {
        path: "/stepper",
        element: <Supplier_Stepper />
    },
    {
        path: "/buyer_stepper",
        element: <Buyer_Stepper />
    },
    {
        path: "/weightage",
        element: <AccordionTableWeightage />
    },
    {
        path: "/modify_sourcing_templates",
        element: <SourcingTemplate />
    },
    {
        path: "/c",
        element: <SupplierResponsePage />
    },
    {
        path: "/timer",
        element: <TimerComponent />
    },
    {
        path: "/checkbox",
        element: <CheckboxComponent />
    },
    {
        path: "/supplier_response_tab",
        element: <CustomTab />
    }
], {
    basename: "/custom-components"
});

export {
    router
};
