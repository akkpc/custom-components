const id = kf.eventParameters._id

const taskDetails = await kf.api(`/form/2/${kf.account._id}/Sourcing_Supplier_Tasks_A00/${id}`);
const eventId = taskDetails.Event_ID

var SourcingDetails = await kf.api(`/process/2/${kf.account._id}/admin/Sourcing_Master_A00/${eventId}`);

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
    _created_by
} = SourcingDetails;

const payload = {
    currentStage: Current_Stage,
    task_id: id,
    consentStatus: taskDetails.Consent_Status,
    supplierTaskId: id,
    event_owner_name: _created_by.Name,
    event_owner_email: _created_by.Email,
    event_start_date: convertStringToDate(SourcingDetails[`${Current_Stage}_Start_Date`]),
    event_end_date: convertStringToDate(SourcingDetails[`${Current_Stage}_End_Date`]),
    sourcing_event_number: Event_Number
}

kf.app.openPage("Copy_of_Sourcing_Supplier_Dashboar_A02", payload)

function convertStringToDate(dateString) {
    if (dateString) {
        var dateTimePart = dateString.split(' ')[0];
        var dateObject = new Date(dateTimePart);
        return !isNaN(dateObject.getTime()) ? dateObject.toLocaleDateString() : "Not yet defined";
    }
    return "Not yet defined"
}