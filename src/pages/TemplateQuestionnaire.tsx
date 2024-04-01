import { Modal, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { KFButton } from '../components/KFButton';
import { QuestionCard } from '../components/QuestionCard';
import { SectionCard } from '../components/SectionCard';
import { getUniqueString, parseJSON, scrollIntoView } from '../helpers';
import { borderColor, primaryBackground, questionnaireBackground } from '../helpers/colors';
import { useAlert } from '../hooks/useAlert';
import { KFLoader } from '../components/KFLoader';
const KFSDK = require('@kissflow/lowcode-client-sdk')

export type Section = {
  Section_ID: string;
  Section_Name: string;
  Section_Sequence: number;
  Template_ID: string;
  _id: string;
  _is_created?: boolean;
};

export type Question = {
  _id: string;
  Question_ID: string;
  Question: string;
  Response_Type: string;
  Weightage: number;
  Dropdown_options?: {
    Name: string;
    _id: string;
  }[],
  Template_ID: string;
  Section_ID: string;
};

const dataforms = {
  template: {
    section: "Sourcing_Template_Sections_A00",
    question: "Sourcing_Template_Questions_A00"
  },
  editTemplate: {
    section: "Sourcing_Sections_A00",
    question: "Sourcing_Questions_A00"
  }
}

const appBarHeight = 50;
export function TemplateQuestionnaire() {
  const [sections, setSections] = useState<Section[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [editActiveIndex, setEditActiveIndex] = useState<string>();
  const [activeSection, setActiveSection] = useState<{
    _id: string,
    Section_ID: string
  }>();
  const [templateId, setTemplateId] = useState("");
  const [openDiscardAlert, setOpenDiscardAlert] = useState(false);
  const { alertContext, showInvalidInputError, showSuccessInput } = useAlert();
  const [openSectionDiscard, setOpenSectionDiscard] = useState(false);
  const [newSectionLoading, setNewSectionLoading] = useState(false)
  const [dataform, setDataform] = useState<typeof dataforms.template>();
  const [sourcingEventId, setSourcingEventId] = useState();
  const [eventStage, setEventStage] = useState();
  const [contentLoaded, setContentLoaded] = useState(false);
  const [saveLoading,setSaveLoading] = useState(false);

  const prevQuestionState = useRef(questions);
  const addQuestionRef = useRef<any>(null);
  const addSectionRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      await KFSDK.initialize();
      let allParams = await KFSDK.app.page.popup.getAllParameters();
      // let sid = "Pk8qlYcGIz7o"
      // setTemplateId(sid)
      // let allParams: any = {
      //   template_id: "Pk8qlYcGIz7o"
      // }
      // let allParams: any = {
      //   Sourcing_Event_ID: "Pk8w4SWdScSU",
      //   eventStage: "RFP"
      // }
      setContentLoaded(false);
      if (allParams.template_id) {
        setTemplateId(allParams.template_id)
        setDataform(dataforms.template)
      }
      if (allParams.Sourcing_Event_ID) {
        setDataform(dataforms.editTemplate);
        setSourcingEventId(allParams.Sourcing_Event_ID);
        setEventStage(allParams.eventStage)
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      await refetchSections();
    })()
  }, [templateId, sourcingEventId])

  useEffect(() => {
    (async () => {
      if (activeSection) {
        const newQuestions = await getQuestionsBySection(activeSection.Section_ID);
        prevQuestionState.current = JSON.parse(JSON.stringify(newQuestions));
        setQuestions(newQuestions);
        scrollIntoView(addSectionRef);
      }
    })()
  }, [activeSection])

  useEffect(() => {
    if (questions && KFSDK?.app) {
      (async () => {
        await KFSDK.app.setVariable({
          isUnsavedQuestion: true
        })
        scrollIntoView(addQuestionRef);
        setContentLoaded(true);
      })()
    }
  }, [questions])

  async function refetchSections() {
    if (templateId) {
      await getSections([
        {
          "LHSField": "Template_ID",
          "Operator": "EQUAL_TO",
          "RHSType": "Value",
          "RHSValue": templateId,
          "RHSField": null,
          "LHSAttribute": null,
          "RHSAttribute": null
        }
      ]);
    }
    if (sourcingEventId) {
      await getSections([
        ...getSourcingFilter()
      ]);
    }
  }

  async function getSections(filter: Record<string, any>[]) {
    const sectionResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${dataform?.section}/allitems/list?&page_number=1&page_size=10000`,
      {
        method: "POST",
        body: JSON.stringify({
          Filter: {
            "AND": [
              {
                "AND": [
                  ...filter
                ]
              }
            ]
          }
        })
      }).catch((err: any) => console.log("cannot fetch", err))
    const sections: Section[] = sectionResponse.Data;
    setSections(sections)
    if (sections.length > 0) {
      setActiveSection({
        _id: sections[0]._id,
        Section_ID: sections[0].Section_ID
      })
    } else {
      await createSection(`Section 1`);
    }
  }


  async function getQuestionsBySection(sectionId: string) {
    let additionalFilter = getSourcingFilter();
    const questionResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${dataform?.question}/allitems/list?&page_number=1&page_size=10000`,
      {
        method: "POST",
        body: JSON.stringify({
          Filter: {
            "AND": [
              {
                "AND": [
                  {
                    "LHSField": "Section_ID",
                    "Operator": "EQUAL_TO",
                    "RHSType": "Value",
                    "RHSValue": sectionId,
                    "RHSField": null,
                    "LHSAttribute": null,
                    "RHSAttribute": null
                  },
                  ...additionalFilter
                ]
              }
            ]
          }
        })
      }).catch((err: any) => console.log("cannot fetch", err))
    let questions: Question[] = questionResponse.Data;
    questions = questions.map((question) => {
      if (question.Dropdown_options) {
        question.Dropdown_options = parseJSON(question.Dropdown_options as any);
      }
      return question;
    })
    return questions;
  }

  async function createSection(sectionName: string) {
    setNewSectionLoading(true);
    const newSection = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${dataform?.section}/batch`,
      {
        method: "POST",
        body: JSON.stringify([{
          Section_Name: sectionName,
          Section_Sequence: sections.length + 1,
          Template_ID: templateId,
          _is_created: true,
          ...getSourcingNewItemProps()
        }])
      }).catch((err: any) => console.log("cannot fetch", err))
    await refetchSections();
    // setActiveSection(newSection[0]._id)
    setActiveSection({
      _id: newSection[0]._id,
      Section_ID: newSection[0].Section_ID
    })
    setEditActiveIndex(newSection[0]._id)
    setNewSectionLoading(false);
  }

  function validateInput(current: Question[]) {
    const invalidIds = []
    for (let i = 0; i < current.length; i++) {
      const currentQ = current[i]
      let valid = false;
      if (currentQ.Question && currentQ.Response_Type) {
        if (currentQ.Response_Type == "single_select") {
          if (currentQ.Dropdown_options && currentQ.Dropdown_options?.length > 0) {
            valid = true
          }
        } else {
          valid = true;
        }
      }
      if (!valid) {
        invalidIds.push(currentQ.Question_ID);
      }
    }
    return invalidIds;
  }

  async function saveQuestionChanges(data: any[]) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${dataform?.question}/batch`,
      {
        method: "POST",
        body: JSON.stringify(data)
      }).catch((err: any) => console.log("cannot fetch", err))
    // await getQuestionsBySection();
  }

  async function updateSection(sectionId: string, sectionName: Question) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${dataform?.section}/${sectionId}`,
      {
        method: "POST",
        body: JSON.stringify({
          Section_Name: sectionName,
          _id: sectionId
        })
      }).catch((err: any) => console.log("cannot fetch", err))
    await refetchSections();
  }

  async function deleteSection(section: { _id: string, Section_ID: string }) {
    const sectionQuestions = await getQuestionsBySection(section.Section_ID);
    await deleteQuestions(sectionQuestions.map((q) => ({ _id: q._id }))).catch((err) => console.log("error", err))
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${dataform?.section}/batch/delete`,
      {
        method: "POST",
        body: JSON.stringify([{
          _id: section._id
        }])
      }).catch((err: any) => console.log("cannot fetch", err))
    await refetchSections();
  }

  async function deleteQuestions(data: any[]) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/${dataform?.question}/batch/delete`,
      {
        method: "POST",
        body: JSON.stringify(data)
      }).catch((err: any) => console.log("cannot fetch", err))
  }

  async function onSave(changedQuestions: Question[]) {
    const invalidIds = validateInput(changedQuestions);
    if (invalidIds.length > 0) {
      showInvalidInputError("Please fill all the empty fields");
    } else {
      const { deletedDelta, delta } = calculateDelta(changedQuestions, prevQuestionState.current, templateId);
      console.log("delta", delta, deletedDelta)
      if (delta.length > 0) {
        await saveQuestionChanges(delta);
      }
      if (deletedDelta.length > 0) {
        await deleteQuestions(deletedDelta);
      }
      // setActiveSection((val) => val);
      prevQuestionState.current = changedQuestions;
      showSuccessInput("Question saved successfully");
    }
  }

  function showValidationMessages(callback: () => void, section?: Section) {
    const { deletedDelta, delta } = calculateDelta(questions, prevQuestionState.current, templateId);
    if (delta.length > 0 || deletedDelta.length > 0) {
      setOpenDiscardAlert(true);
    } else {
      if (questions.length == 0) {
        if (!section || activeSection?._id != section._id) {
          setOpenSectionDiscard(true);
        }
      } else {
        callback();
      }
    }
  }

  function getSourcingFilter() {
    if (sourcingEventId && eventStage) {
      return [
        {
          "LHSField": "Sourcing_Event_ID",
          "Operator": "EQUAL_TO",
          "RHSType": "Value",
          "RHSValue": sourcingEventId,
          "RHSField": null,
          "LHSAttribute": null,
          "RHSAttribute": null
        },
        {
          "LHSField": "Event_Stage",
          "Operator": "EQUAL_TO",
          "RHSType": "Value",
          "RHSValue": eventStage,
          "RHSField": null,
          "LHSAttribute": null,
          "RHSAttribute": null
        },
      ]
    }
    return []
  }

  function getSourcingNewItemProps() {
    if (sourcingEventId && eventStage) {
      return {
        Event_Stage: eventStage,
        Sourcing_Event_ID: sourcingEventId,
      }
    }
    return {}
  }

  return (
    <div>
      {alertContext}
      {contentLoaded ?
        <div style={{
          display: "flex",
          flexDirection: "row",
          height: "100vh",
        }} >
          <div
            // className='scrollable-container'
            style={{
              overflow: "scroll",
              width: "30%",
              borderRight: `1px solid ${borderColor}`,
              backgroundColor: primaryBackground,
              padding: 15,
              overflowX: "hidden"
            }} >
            <div>
              <Typography style={{ color: "rgba(97, 101, 108, 1)", fontSize: 18 }} >Sections</Typography>
              {
                sections.map((section, index) =>
                  <div key={index} style={{ marginTop: 10 }} >
                    <SectionCard
                      index={index + 1}
                      section_name={section.Section_Name}
                      rest={section}
                      isEditActive={section._id == editActiveIndex}
                      isActive={activeSection?._id == section._id}
                      onClick={() => {
                        showValidationMessages(() => {
                          setActiveSection({
                            _id: section._id,
                            Section_ID: section.Section_ID
                          })
                        }, section);
                      }}
                      onPressEnter={async (e) => {
                        let sectionName = e.currentTarget.value;
                        await updateSection(section._id, sectionName);
                        setActiveSection({
                          _id: section._id,
                          Section_ID: section.Section_ID
                        })
                        setEditActiveIndex("")
                      }}
                      onEdit={() => setEditActiveIndex(section._id)}
                      onDelete={async () => await deleteSection(section)}
                      onKeyUp={(e) => {
                        e.preventDefault()
                        if (e.key == "Escape") {
                          setEditActiveIndex("");
                        }
                      }}
                    />
                  </div>
                )
              }
              {
                <div ref={addSectionRef} >
                  <KFButton
                    buttonType='primary'
                    onClick={async () => {
                      showValidationMessages(async () => {
                        await createSection(`Section ${sections.length + 1}`);
                      });
                    }}
                    style={{
                      marginTop: 10
                    }}
                    loading={newSectionLoading}
                  >Add Section
                  </KFButton>
                </div>
              }
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "70%",
              backgroundColor: questionnaireBackground,
              overflow: "hidden",
              height: "100%"
            }}
          >
            <div
              // className='scrollable-container'
              style={{
                height: "93%",
                overflow: "scroll",
                padding: questions.length == 0 ? "0px" : 15,
                overflowX: "hidden"
              }}>
              {questions.length > 0 && <Typography style={{ color: "rgba(97, 101, 108, 1)", fontSize: 18 }} >Commodity enquiries questionnaires</Typography>}
              {
                questions.length ? questions.map((question, index) => {
                  return (
                    <div key={index} style={{ marginTop: 10 }} >
                      <QuestionCard
                        index={index}
                        question={question}
                        setQuestions={setQuestions}
                      />
                    </div>
                  )
                }) :
                  <EmptyPage>
                    <KFButton
                      buttonType='primary'
                      onClick={async () => {
                        setQuestions((prevQuestions: any[]) => {
                          return [...prevQuestions, {
                            _id: getUniqueString(),
                            Question_ID: getUniqueString(),
                            Response_Type: "short_text",
                            Weightage: 0,
                            Question: "",
                            Section_ID: activeSection?.Section_ID,
                            ...getSourcingNewItemProps()
                          }]
                        })
                      }}
                    >Add Questionnaire</KFButton>
                  </EmptyPage>
              }
              {
                questions.length > 0 &&
                <div ref={addQuestionRef} >
                  <KFButton
                    buttonType='primary'
                    onClick={async () => {
                      // await createQuestion("", "");
                      setQuestions((prevQuestions: any[]) => {
                        return [...prevQuestions, {
                          _id: getUniqueString(),
                          Question_ID: getUniqueString(),
                          Response_Type: "short_text",
                          Weightage: 0,
                          Question: "",
                          Section_ID: activeSection?.Section_ID,
                          ...getSourcingNewItemProps()
                        }]
                      })
                    }}
                    style={{
                      marginTop: 10
                    }}
                  >Add Questionnaire</KFButton>
                </div>
              }
            </div>
            <div style={{
              backgroundColor: "white",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              width: "100%",
              borderTop: "1px solid #DEEAFF"
            }} >
              <div style={{ padding: 20 }} >
                <KFButton
                  buttonType='secondary'
                  onClick={() => {
                    showValidationMessages(() => { });
                  }}
                  style={{
                    marginRight: 10,
                    // backgroundColor: primaryBackground 
                  }}
                >
                  Discard
                </KFButton>
                <KFButton
                  loading={saveLoading}
                  buttonType='primary'
                  // style={{ backgroundColor: buttonDarkBlue, color: "white" }}
                  onClick={async () => {
                    setSaveLoading(true)
                    await onSave(questions)
                    setSaveLoading(false)
                  }}
                >
                  Save
                </KFButton>
              </div>
            </div>
          </div>
        </div> : 
        <KFLoader/>
        }
      <Modal
        title="Discard Changes"
        open={openDiscardAlert}
        onOk={() => {
          setQuestions(prevQuestionState.current)
          setOpenDiscardAlert(false)
        }}
        onCancel={() => {
          setOpenDiscardAlert(false)
        }}
      >
        <p>Are you sure want to discard changes ?</p>
      </Modal>
      <Modal
        title="Discard Section"
        open={openSectionDiscard}
        onOk={async () => {
          if (activeSection) {
            await deleteSection(activeSection)
          }
          setOpenSectionDiscard(false)
        }}
        onCancel={() => {
          setOpenSectionDiscard(false)
        }}
      >
        <p>
          Current section is empty, are you sure want to discard the section ?
        </p>
      </Modal>
    </div>
  )
}


export function EmptyPage({ children }: any) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      height: "100%"
    }} >
      <img src={process.env.PUBLIC_URL + "/svgs/empty_questions.svg"} ></img>
      <Typography style={{ color: "rgba(97, 101, 108, 1)", fontSize: 18, marginTop: 20 }} >Commodity enquiries questionnaires</Typography>
      <div style={{ marginTop: 10 }} >
        {children}
      </div>
    </div>
  )
}


export function calculateDelta(current: Question[], prev: Question[], templateId: string) {
  const delta = []
  let prevQuestionIndex: number[] = []
  for (let i = 0; i < current.length; i++) {
    let currentQ = current[i];
    const index = prev.findIndex((q) => q._id == currentQ._id);

    // if (currentQ.Response_Type == "single_select" && currentQ.Dropdown_options) {
    //   currentQ = { ...currentQ, "Table::Dropdown_options": currentQ.Dropdown_options }
    // }

    if (index >= 0) {
      const prevState = prev[index];
      prevQuestionIndex.push(index);
      let changed = false;

      if (prevState.Question == currentQ.Question && prevState.Response_Type == currentQ.Response_Type) {
        if (currentQ.Response_Type == "single_select" && currentQ.Dropdown_options) {
          if (prevState.Dropdown_options?.length == currentQ.Dropdown_options?.length) {
            for (let j = 0; j < prevState.Dropdown_options?.length; j++) {
              if (prevState.Dropdown_options[j].Name != currentQ.Dropdown_options[j].Name) {
                changed = true;
                break;
              }
            }
          } else {
            changed = true;
          }
        }
      } else {
        changed = true;
      }
      if (changed) {
        delta.push({
          ...currentQ,
          // "Table::Dropdown_options": currentQ.Dropdown_options,
          Dropdown_options: currentQ.Response_Type == "single_select" ? JSON.stringify(currentQ.Dropdown_options) : null,
          Template_ID: templateId
        })
      }
    } else {
      delta.push({
        ...currentQ,
        _id: undefined,
        Question_ID: undefined,
        _is_created: true,
        Dropdown_options: currentQ.Response_Type == "single_select" ? JSON.stringify(currentQ.Dropdown_options) : null,
        Template_ID: templateId
      })
    }
  }

  const deletedDelta = prev.filter((_, index) => !prevQuestionIndex.includes(index)).map(({ _id }) => ({ _id }))

  return {
    delta,
    deletedDelta
  };
}