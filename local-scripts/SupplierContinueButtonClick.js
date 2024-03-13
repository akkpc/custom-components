const dataform = "Supplier_Responses_A00"
const lineItemTypes = ["RFP", "RFQ"]

const ctx = kf.account;

const id = await kf.app.page.getParameter('supplierTaskId');

const taskDetails = await kf.api(`/form/2/${kf.account._id}/Sourcing_Supplier_Tasks_A00/${id}`);
const { Event_ID: eventId, Supplier_ID: supplierId, Supplier_Email: supplier_email } = taskDetails;

const SourcingDetails = await kf.api(`/process/2/${kf.account._id}/admin/Sourcing_Master_A00/${eventId}`);

const {
  _id: sourcingEventId,
  _created_by: {Name}
} = SourcingDetails;

const response_list = await kf.api("/form/2/" + kf.account._id + `/${dataform}/allitems/list?page_size=1000`,
  {
    method: "POST",
    body: JSON.stringify({
      Filter: {
        "AND": [
          {
            "AND": [
              {
                "LHSField": "Sourcing_Event_ID",
                "Operator": "EQUAL_TO",
                "RHSType": "Value",
                "RHSValue": sourcingEventId,
                "RHSField": null,
                "RHSParam": "",
                "LHSAttribute": null,
                "RHSAttribute": null
              },
              {
                "LHSField": "Response_Type",
                "Operator": "EQUAL_TO",
                "RHSType": "Value",
                "RHSValue": SourcingDetails.Current_Stage,
                "RHSField": null,
                "RHSParam": "",
                "LHSAttribute": null,
                "RHSAttribute": null
              },
              {
                "LHSField": "Response_Status",
                "Operator": "EQUAL_TO",
                "RHSType": "Value",
                "RHSValue": "Draft",
                "RHSField": null,
                "RHSParam": "",
                "LHSAttribute": null,
                "RHSAttribute": null
              },
              {
                "LHSField": "Supplier_ID",
                "Operator": "EQUAL_TO",
                "RHSType": "Value",
                "RHSValue": supplierId,
                "RHSField": null,
                "RHSParam": "",
                "LHSAttribute": null,
                "RHSAttribute": null
              }
            ]
          }
        ]
      }
    })
  }
);

const prevResponses = response_list.Data;
const currentStage = SourcingDetails.Current_Stage;

console.log("prevResponses",prevResponses)

let payload = {
  sourcingEventId,
  currentStage,
  timer_date: SourcingDetails[`${currentStage}_End_Date`],
  eventStartDate: convertDatetoLocaleString(SourcingDetails[`${currentStage}_Start_Date`]),
  eventEndDate: convertDatetoLocaleString(SourcingDetails[`${currentStage}_End_Date`]),
  Event_Type: JSON.stringify(SourcingDetails.Event_Type),
  event_owner_name: Name,
  supplier_email
};

if (prevResponses.length > 0) {
  const { Line_Item_instance_id, Line_item_activity_instance_id } = prevResponses[0];
  if (lineItemTypes.includes(currentStage) && Line_item_activity_instance_id && Line_Item_instance_id) {
    payload = {
      ...payload,
      line_id: Line_Item_instance_id,
      line_aid: Line_item_activity_instance_id,
    }
  }
} else {
  let response = await createResponse();
  payload.res_instance_id = response._id;
  console.log("Response created : ", response)

  if (currentStage != "RFQ") {
    await addQuestionnaireToSupplier(response._id);
  }

  if (SourcingDetails["Table::RFQ_Configuration"]) {
    const { _id, _activity_instance_id, ...rest } = await createLineItem(response);
    const updatedResonse = await kf.api(`/form/2/${ctx._id}/Supplier_Responses_A00/${response._id}`,
      {
        method: "POST",
        body: JSON.stringify({
          Line_Item_instance_id: _id,
          Line_item_activity_instance_id: _activity_instance_id
        })
      });
    console.log("Response Line items created : ", _id, _activity_instance_id, rest, updatedResonse)
    payload.line_id = _id;
    payload.line_aid = _activity_instance_id;
  }
}


const questionnaireComponentId = "Container_VRSTDYbWW"
const lineComponentId = "Container_ZUfUF-TIt"
const bottomBarId = "Container_qFMQa_opE"
const saveAndNext = "Button_JEohX7XXs4"
const submit = "Button_rMW8fFJS2m"
const questionnaireTab = {
  key: "questionnaires",
  componentId: questionnaireComponentId,
  name: "Questionnaires",
  hideComponents: []
}
const lineTab = {
  key: "lines",
  componentId: lineComponentId,
  name: "Lines",
  hideComponents: []
}

const availableTabs = []
let initialTab = questionnaireTab.key;
const eventTypes = SourcingDetails.Event_Type
if (currentStage == "RFI") {
  // questionnaireTab.hideComponents.push(saveAndNext)
  availableTabs.push(questionnaireTab)
}
if (currentStage == "RFP") {
  availableTabs.push(questionnaireTab)

  if (!eventTypes.includes("RFQ")) {
    availableTabs.push(lineTab)
    // questionnaireTab.hideComponents.push(submit)
  } else {
    // questionnaireTab.hideComponents.push(saveAndNext)
  }
}
if (currentStage == "RFQ") {
  availableTabs.push(lineTab)
  initialTab = lineTab.key;
}
console.log("Payload : " , payload)
const Sourcing_Event_Number = await kf.app.page.getVariable("Sourcing_Event_Number");
// kf.app.openPage("Sourcing_Supplier_Response_Page_A00", payload);
await kf.app.setVariable("sourcing_custom_tab_key", "questionnaires")
kf.app.openPage("Sourcing_Supplier_Response_Page_A00", {
  ...payload,
  user_type: "supplier",
  buyer_email: "aanand@kissflow.com",
  sourcing_event_id: sourcingEventId,
  availableTabs: JSON.stringify(availableTabs),
  initialTab,
  sourcing_event_number: Sourcing_Event_Number
});


async function createResponse(additionalPayload = {}) {
  const payload = {
    Sourcing_Event_ID: sourcingEventId,
    Supplier_ID: supplierId,
    Response_Type: currentStage,
    Response_Status: "Draft",
    _is_created: true,
    ...additionalPayload
    // Status: "draft",
  }
  const response = await kf.api("/form/2/" + ctx._id + "/Supplier_Responses_A00/batch",
    {
      method: "POST",
      body: JSON.stringify([payload])
    });

  return response[0];
}

async function createLineItem(res) {
  const payload = {
    Sourcing_Event_ID: sourcingEventId,
    Supplier_ID: supplierId,
    Sourcing_Type: currentStage,
    Applicable_commercial_info: SourcingDetails.Applicable_commercial_info,
    "Table::Line_Items": SourcingDetails["Table::RFQ_Configuration"],
    Response_ID: res._id,
    Supplier_Task_ID: id
  }
  const response = await kf.api("/process/2/" + ctx._id + "/Sourcing_Supplier_Line_Items_A00",
    {
      method: "POST",
      body: JSON.stringify(payload)
    });
  return response;
}

async function addQuestionnaireToSupplier(instance_id) {
  const { _id, Current_Stage } = SourcingDetails;

  const flowLogicPayload = {
    Supplier_ID: supplierId,
    Sourcing_Event_ID: _id,
    Event_Stage: Current_Stage,
    Instance_ID: instance_id
  }

  console.log("Questionnaire flowLogicPayload", flowLogicPayload)

  var component_filter = {
    "Filter": {
      "AND": [{
        "AND": [
          {
            "LHSField": "Sourcing_Event_ID",
            "Operator": "EQUAL_TO",
            "RHSType": "Value",
            "RHSValue": SourcingDetails._id,
            "RHSField": null,
            "RHSParam": "",
            "LHSAttribute": null,
            "RHSAttribute": null
          },
          {
            "LHSField": "Event_Stage",
            "Operator": "EQUAL_TO",
            "RHSType": "Value",
            "RHSValue": Current_Stage,
            "RHSField": null,
            "RHSParam": "",
            "LHSAttribute": null,
            "RHSAttribute": null
          }
        ]
      }]
    }
  }

  const template = await kf.api("/form/2/" + kf.account._id + "/Sourcing_Templates_A01/allitems/list?&page_number=1&page_size=1", { method: "POST", body: JSON.stringify(component_filter), }).then((res) => res.Data[0]).catch((err) => console.log("Error in fetching template"));

  const sections = await kf.api("/form/2/" + kf.account._id + "/Sourcing_Sections_A00/allitems/list?&page_number=1&page_size=10000", { method: "POST", body: JSON.stringify(component_filter), }).then((res) => res.Data).catch((err) => console.log("Cannot get sections"));

  const questions = await kf.api("/form/2/" + kf.account._id + "/Sourcing_Questions_A00/allitems/list?&page_number=1&page_size=10000", { method: "POST", body: JSON.stringify(component_filter), }).then((res) => res.Data).catch((err) => console.log("Cannot get questions"));

  let templatePayload = [{
    ...flowLogicPayload,
    Template_Name: template.Template_Name,
    Weightage: template.Weightage,
    _is_created: true
  }]

  let sectionPayload = sections.map((section) => ({
    ...flowLogicPayload,
    Section_Name: section.Section_Name,
    Section_Sequence: section.Section_Sequence,
    Weightage: section.Section_Weightage,
    Template_ID: section.Template_ID,
    Section_ID: section.Section_ID,
    _is_created: true
  }))

  let questionPayload = questions.map((question) => ({
    ...flowLogicPayload,
    Question: question.Question,
    Weightage: question.Weightage,
    Response_Type: question.Response_Type,
    Dropdown_options: question.Dropdown_options,
    Template_ID: question.Template_ID,
    Section_ID: question.Section_ID,
    Question_ID: question.Question_ID,
    _is_created: true
  }))

  console.log("sectionPayload : ", templatePayload, sectionPayload, questionPayload)

  const updateSourcingTemplate = await kf.api("/form/2/" + kf.account._id + "/Sourcing_Supplier_Response_Templat_A00/batch", { method: "POST", body: JSON.stringify(templatePayload) })

  const updateSourcingSections = await kf.api("/form/2/" + kf.account._id + "/Sourcing_Supplier_Response_Section_A00/batch", { method: "POST", body: JSON.stringify(sectionPayload) })

  const updateSourcingQuestions = await kf.api("/form/2/" + kf.account._id + "/Sourcing_Supplier_Response_Questio_A01/batch", { method: "POST", body: JSON.stringify(questionPayload) })
}

function convertDatetoLocaleString(dateString) {
  const date = dateString.split(" ")[0]
  return new Date(date).toLocaleDateString()
}
