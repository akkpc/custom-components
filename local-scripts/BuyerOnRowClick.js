const _id = kf.eventParameters._id

var SourcingDetails = await kf.api(`/process/2/${kf.account._id}/admin/Sourcing_Master_A00/${_id}`);
console.log("SourcingDetails", SourcingDetails)
const {
  Current_Stage,
  RSVP_End_Date_3,
  Awarding_Communication,
  Event_Number,
  Event_Type,
  RFI_Start_Date,
  RFP_Start_Date,
  RFQ_Start_Date,
  RFI_End_Date,
  RFP_End_Date,
  RFQ_End_Date,
  _created_by,
  _current_context,
  _last_completed_step,
  Event_Name,
  Event_Short_Description,
  Category,
  _current_step,
  _status,
  _current_assigned_to,
  Freeze_Award
} = SourcingDetails;

let event_status = "event_creation_draft";
let stepperObj = {
  event_creation_draft: "",
  assess_award: convertStringToDate(Awarding_Communication),
  post_award_actions: "",
  completed: ""
}

if (Event_Type.includes("RFI")) {
  stepperObj.awaiting_rfi_response = convertStringToDate(RFI_End_Date)
  event_status = "awaiting_rfi_response";
  if (getDate(RFI_End_Date).getTime() < new Date().getTime()) {
    stepperObj.rfi_evaluation_qualification = "";
    event_status = "rfi_evaluation_qualification";
  }
}

if (Event_Type.includes("RFP")) {
  // stepperObj.rfp_configuration = convertStringToDate(RFP_Start_Date)
  stepperObj.awaiting_rfp_response = convertStringToDate(RFP_End_Date)
  stepperObj.rfp_technical_evaluation = ""

  if (Current_Stage == "RFP") {
    // if (Event_Type.includes("RFI")) {
    //   event_status = "rfp_configuration";
    // } else {
    //   event_status = "awaiting_rfp_response";
    // }
    event_status = "awaiting_rfp_response";
    if (getDate(RFP_End_Date) < new Date().getTime()) {
      event_status = "rfp_technical_evaluation";
    }
  }
}

if (Event_Type.includes("RFQ")) {
  stepperObj.rfq_configuration = convertStringToDate(RFQ_Start_Date)
  stepperObj.awaiting_rfq_response = convertStringToDate(RFQ_End_Date)
  stepperObj.rfq_commercial_evaluation = ""
  if (Current_Stage == "RFQ") {
    // if (Event_Type.includes("RFP")) {
    //   event_status = "rfq_configuration";
    // } else {
    //   event_status = "awaiting_rfq_response";
    // }
    event_status = "awaiting_rfq_response";
    if (getDate(RFQ_End_Date) < new Date().getTime()) {
      event_status = "rfq_commercial_evaluation";
    }
  }
}

const payload = {
  id: _id,
  aid: _current_context[0]._context_activity_instance_id,
  timer_date: getDate(SourcingDetails[`${Current_Stage}_End_Date`]),
  event_owner_name: _created_by.Name,
  event_owner_email: _created_by.Email,
  current_stage: Current_Stage,
  current_status: encodeURIComponent(_current_step),
  category: Category,
  locale_event_end_date: convertStringToDate(SourcingDetails[`${Current_Stage}_End_Date`]),
  user_type: "buyer",
  event_name: Event_Name,
  event_description: Event_Short_Description,
  eventNumber: Event_Number,
  sourcing_event_id: _id,
  stepper: JSON.stringify(stepperObj),
  end_date: SourcingDetails[`${Current_Stage}_End_Date`],
  timerSize: "big"
}

let pageId = "Sourcing_Buyer_Awaiting_Response_A01";

if (_current_step.includes("Evaluation")) {
  let isEvaluator = _current_assigned_to.findIndex(({ _id }) => _id == kf.user._id);
  if (isEvaluator >= 0) {
    pageId = "Sourcing_Buyer_Evaluation_A00";
  } else {
    payload.aid = _last_completed_step;
  }
} else if (_current_step == "Assess & Award") {
  pageId = "Sourcing_Buyer_Assess_Award_A00";
}

console.log("stepperObj : ", payload)
await kf.app.setVariable("sourcing_custom_tab_key", "Summary")

kf.app.openPage(pageId, payload)


function convertStringToDate(dateString) {
  if (dateString) {
    var dateTimePart = dateString.split(' ')[0];
    var dateObject = new Date(dateTimePart);
    return !isNaN(dateObject.getTime()) ? dateObject.toLocaleDateString() : "Not yet defined";
  }
  return "Not yet defined"
}

function getDate(dateString) {
  if (dateString) {
    var dateTimePart = dateString.split(' ')[0];
    var dateObject = new Date(dateTimePart);
    return dateObject
  }
  return;
}