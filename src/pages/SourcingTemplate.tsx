import { CaretRightOutlined } from '@ant-design/icons';
import { Button, Collapse, Modal, Typography, theme } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { QuestionCard } from '../components/QuestionCard';
import { getUniqueString, parseJSON } from '../helpers';
import { borderColor, buttonDarkBlue, primaryBackground, questionnaireBackground } from '../helpers/colors';
import { useAlert } from '../hooks/useAlert';
import { Section } from './TemplateQuestionnaire';
const KFSDK = require('@kissflow/lowcode-client-sdk')

export type EventSection = {
  Sourcing_Event_Section_ID: string;
  Section_Sequence: number;
  Section_ID: string;
  Section_Name: string;
  Sourcing_Event_ID: string;
  Template_ID: string;
  Event_Number: string;
  Event_Stage: string;
  Instance_ID: string;
  _id: string;
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
};

type EventQuestion = {
  Sourcing_Event_Question_ID: string;
  Template_ID: string;
  Section_ID: string;
  Event_Number: string;
  Sourcing_Event_ID: string;
  Question_ID: string;
  Question: string;
  _id: string;
  Event_Stage: string;
  Instance_ID: string;
};

export type Template = {
  _id: string;
  Sourcing_Event_Template__ID: string,
  Sourcing_Event_ID: string,
  Event_Number: string,
  Event_Name: string,
  Template_ID: string,
  Template_Name: string;
  Event_Stage: string;
  Instance_ID: string;
}

type Dataform = {
  template: string,
  section: string,
  question: string,
  sectionFilter: any,
  questionFilter: any
}

const appBarHeight = 50;

export function SourcingTemplate() {
  const [sections, setSections] = useState<EventSection[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [editActiveIndex, setEditActiveIndex] = useState<{
    _id: string,
    Section_ID: string
  }>();
  const [activeSection, setActiveSection] = useState<{
    _id: string,
    Section_ID: string
  }>();
  const [activeTemplate, setActiveTemplate] = useState<string>();
  const [sourcingEventId, setSourcingEventId] = useState("");
  const [openDiscardAlert, setOpenDiscardAlert] = useState(false);
  const { alertContext, showInvalidInputError, showSuccessInput } = useAlert();
  const prevQuestionState = useRef(questions);
  const { token } = theme.useToken();

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  useEffect(() => {
    (async () => {
      await KFSDK.initialize();
      let allParams = await KFSDK.app.page.popup.getAllParameters();
      if (allParams.Sourcing_Event_ID) {
        setSourcingEventId(allParams.Sourcing_Event_ID)
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      if (sourcingEventId) {
        await getTemplatesBySourcingEvent();
      }
    })()
  }, [sourcingEventId])

  useEffect(() => {
    (async () => {
      if (activeTemplate) {
        await getSectionsByTemplate();
      }
    })()
  }, [activeTemplate])

  useEffect(() => {
    (async () => {
      if (activeSection) {
        const newQuestions = await getQuestionsBySection();
        prevQuestionState.current = JSON.parse(JSON.stringify(newQuestions));
        setQuestions(newQuestions);
      }
    })()
  }, [activeSection])

  useEffect(() => {
    if (questions && KFSDK?.app) {
      (async () => {
        console.log("isUnsavedQuestion : ", await KFSDK.app.getVariable("isUnsavedQuestion"))
        await KFSDK.app.setVariable({
          isUnsavedQuestion: true
        })
      })()
    }
  }, [questions])

  async function getTemplatesBySourcingEvent() {
    const templatesResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Templates_A01/allitems/list?&page_number=1&page_size=10000`,
      {
        method: "POST",
        body: JSON.stringify({
          Filter: {
            "AND": [
              {
                "OR": [
                  {
                    "LHSField": "Sourcing_Event_ID",
                    "Operator": "EQUAL_TO",
                    "RHSType": "Value",
                    "RHSValue": sourcingEventId,
                    "RHSField": null,
                    "LHSAttribute": null,
                    "RHSAttribute": null
                  }
                ]
              }
            ]
          }
        })
      }).catch((err: any) => console.log("cannot fetch", err))
    const templates: Template[] = templatesResponse.Data;
    setTemplates(templates)
    if (templates.length > 0) {
      setActiveTemplate(templates[0].Template_ID)
    }
  }

  async function getSectionsByTemplate() {
    const sectionResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Sections_A00/allitems/list?&page_number=1&page_size=10000`,
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
                    "LHSAttribute": null,
                    "RHSAttribute": null
                  },
                  {
                    "LHSField": "Template_ID",
                    "Operator": "EQUAL_TO",
                    "RHSType": "Value",
                    "RHSValue": activeTemplate,
                    "RHSField": null,
                    "LHSAttribute": null,
                    "RHSAttribute": null
                  }
                ]
              }
            ]
          }
        })
      }).catch((err: any) => console.log("cannot fetch", err))
    const sections: EventSection[] = sectionResponse.Data;
    setSections(sections)
    if (sections.length > 0) {
      setActiveSection({
        _id: sections[0]._id,
        Section_ID: sections[0].Section_ID
      })
    }
  }

  async function getQuestionsBySection() {
    const questionResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Questions_A00/allitems/list?&page_number=1&page_size=10000`,
      {
        method: "POST",
        body: JSON.stringify({
          Filter: {
            "AND": [{
              "AND": [
                {
                  "LHSField": "Section_ID",
                  "Operator": "EQUAL_TO",
                  "RHSType": "Value",
                  "RHSValue": activeSection?.Section_ID,
                  "RHSField": null,
                  "LHSAttribute": null,
                  "RHSAttribute": null
                },
                {
                  "LHSField": "Sourcing_Event_ID",
                  "Operator": "EQUAL_TO",
                  "RHSType": "Value",
                  "RHSValue": sourcingEventId,
                  "RHSField": null,
                  "LHSAttribute": null,
                  "RHSAttribute": null
                }
              ]
            }]
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
    const newSection = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Sections_A00/batch`,
      {
        method: "POST",
        body: JSON.stringify([{
          Section_Name: sectionName,
          Section_Sequence: sections.length + 1,
          Sourcing_Event_ID: sourcingEventId,
          Event_Number: "",
          Event_Name: "",
          Template_ID: "",
          Section_ID: "",
          _is_created: true
        }])
      }).catch((err: any) => console.log("cannot fetch", err))
    await getSectionsByTemplate();
    setActiveSection({
      _id: newSection[0]._id,
      Section_ID: newSection[0].Section_ID
    })
    setEditActiveIndex({
      _id: newSection[0]._id,
      Section_ID: newSection[0].Section_ID
    })
  }

  function calculateDelta(current: Question[], prev: Question[]) {
    const delta = []
    let prevQuestionIndex: number[] = []
    for (let i = 0; i < current.length; i++) {
      let currentQ = current[i];
      const index = prev.findIndex((q) => q.Question_ID == currentQ.Question_ID);

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
            Dropdown_options: currentQ.Response_Type == "single_select" ? JSON.stringify(currentQ.Dropdown_options) : null,
            Template_ID: sourcingEventId
          })
        }
      } else {
        delta.push({
          ...currentQ,
          _id: undefined,
          Question_ID: undefined,
          _is_created: true,
          Dropdown_options: currentQ.Response_Type == "single_select" ? JSON.stringify(currentQ.Dropdown_options) : null,
          Template_ID: sourcingEventId
        })
      }
    }

    const deletedDelta = prev.filter((_, index) => !prevQuestionIndex.includes(index)).map(({ _id }) => ({ _id }))

    return {
      delta,
      deletedDelta
    };
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
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Questions_A00/batch`,
      {
        method: "POST",
        body: JSON.stringify(data)
      }).catch((err: any) => console.log("cannot fetch", err))
    // await getQuestionsBySection();
  }

  async function updateSection(sectionId: string, sectionName: Question) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Sections_A00/${sectionId}`,
      {
        method: "POST",
        body: JSON.stringify({
          Section_Name: sectionName,
          _id: sectionId
        })
      }).catch((err: any) => console.log("cannot fetch", err))
    await getSectionsByTemplate();
  }

  async function deleteSection(sectionId: string) {
    await deleteQuestions(questions.map((q) => ({ _id: q._id }))).catch((err) => console.log("error", err))
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Sections_A00/batch/delete`,
      {
        method: "POST",
        body: JSON.stringify([{
          _id: sectionId
        }])
      }).catch((err: any) => console.log("cannot fetch", err))
    await getSectionsByTemplate();
  }

  async function deleteQuestions(data: any[]) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Questions_A00/batch/delete`,
      {
        method: "POST",
        body: JSON.stringify(data)
      }).catch((err: any) => console.log("cannot fetch", err))
  }

  async function onSave() {
    const invalidIds = validateInput(questions);
    if (invalidIds.length > 0) {
      showInvalidInputError("Please fill all the empty fields");
    } else {
      const { deletedDelta, delta } = calculateDelta(questions, prevQuestionState.current);
      console.log("delta", delta, deletedDelta)
      if (delta.length > 0) {
        await saveQuestionChanges(delta);
      }
      if (deletedDelta.length > 0) {
        await deleteQuestions(deletedDelta);
      }
      // setActiveSection((val) => val);
      prevQuestionState.current = questions;
      showSuccessInput("Question saved successfully");
    }
  }

  return (
    <div>
      {alertContext}
      {sourcingEventId ?
        <div style={{
          display: "flex",
          flexDirection: "row",
          height: window.innerHeight - appBarHeight,
        }} >
          <div className='scrollable-container'
            style={{ height: window.innerHeight - appBarHeight, overflow: "scroll", width: "35%", borderRight: `1px solid ${borderColor}`, backgroundColor: primaryBackground, padding: 5 }} >
            <Collapse
              // ghost
              style={{ backgroundColor: "transparent" }}
              bordered={false}
              defaultActiveKey={activeTemplate}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              onChange={(templateId) => {
                setSections([]);
                setActiveTemplate(templateId[templateId.length - 1]);
              }}
              activeKey={activeTemplate ? [activeTemplate] : activeTemplate}
              items={templates.map(({ Template_Name, Template_ID, _id }, index) => (
                {
                  key: Template_ID,
                  label: Template_Name,
                  style: panelStyle,
                  children: (
                    <div style={{ margin: 10 }} >
                      {/* <Typography style={{ color: "rgba(97, 101, 108, 1)", fontSize: 18 }} >Sections</Typography> */}
                      {
                        sections.map((section, index) =>
                          <div key={index} style={{ marginTop: 10 }} >
                            <Section
                              index={index + 1}
                              section_name={section.Section_Name}
                              rest={section}
                              isEditActive={section._id == editActiveIndex?._id}
                              isActive={activeSection?._id == section._id}
                              onClick={() => {
                                const { deletedDelta, delta } = calculateDelta(questions, prevQuestionState.current);
                                if (delta.length > 0 || deletedDelta.length > 0) {
                                  setOpenDiscardAlert(true);
                                } else {
                                  setActiveSection({
                                    _id: section._id,
                                    Section_ID: section.Section_ID
                                  })
                                }
                              }}
                              onPressEnter={async (e) => {
                                let sectionName = e.currentTarget.value
                                await updateSection(section._id, sectionName);
                                setEditActiveIndex({
                                  _id: section._id,
                                  Section_ID: section.Section_ID
                                })
                              }}
                              onEdit={() => setEditActiveIndex({
                                _id: section._id,
                                Section_ID: section.Section_ID
                              })}
                              onDelete={async () => await deleteSection(section._id)}
                              onKeyUp={(e) => {
                                e.preventDefault();
                                if (e.key == "Escape") {
                                  setEditActiveIndex({
                                    _id: "",
                                    Section_ID: ""
                                  });
                                }
                              }}
                            />
                          </div>
                        )
                      }
                      <Button
                        onClick={async () => {
                          await createSection("");
                        }}
                        style={{ color: "rgba(0, 60, 156, 1)", backgroundColor: "rgba(238, 245, 255, 1)", borderColor: "rgba(0, 60, 156, 1)", marginTop: 10 }} >Add Section</Button>
                    </div>
                  )
                }
              ))}
            >
            </Collapse>
          </div>
          <div className='scrollable-container' style={{ height: window.innerHeight - appBarHeight, overflow: "scroll", width: "100%", backgroundColor: questionnaireBackground }}>
            <div style={{ margin: 10 }} >
              <Typography style={{ color: "rgba(97, 101, 108, 1)", fontSize: 18 }} >Commodity enquiries questionnaires</Typography>
              {
                questions && questions.map((question, index) => {
                  return (
                    <div key={index} style={{ marginTop: 10 }} >
                      <QuestionCard
                        index={index}
                        question={question}
                        setQuestions={setQuestions}
                      />
                    </div>
                  )
                })
              }
              {
                <Button
                  onClick={async () => {
                    // await createQuestion("", "");
                    setQuestions((prevQuestions: any[]) => {
                      const n_id = getUniqueString();
                      return [...prevQuestions, {
                        Question_ID: n_id,
                        Response_Type: "short_text",
                        Weightage: 0,
                        Question: "",
                        Section_ID: activeSection?.Section_ID,
                        Sourcing_Event_Question_ID: n_id,
                        Template_ID: activeTemplate,
                        Sourcing_Event_ID: sourcingEventId,
                      }]
                    })
                  }}
                  style={{ color: "rgba(0, 60, 156, 1)", backgroundColor: "rgba(238, 245, 255, 1)", borderColor: "rgba(0, 60, 156, 1)", marginTop: 10 }}
                >Add Questionnaire</Button>
              }
            </div>
          </div>
        </div> : <div>Loading....</div>}
      <div style={{
        backgroundColor: "white",
        position: "fixed",
        bottom: 0,
        width: "100%",
        height: appBarHeight,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center"
      }} >
        <div style={{ padding: 20 }} >
          <Button onClick={() => setOpenDiscardAlert(true)} style={{ marginRight: 3, backgroundColor: primaryBackground }}  >Discard</Button>
          <Button
            style={{ backgroundColor: buttonDarkBlue, color: "white" }}
            onClick={onSave}
          >
            Save
          </Button>
        </div>
      </div>
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
    </div>
  )
}