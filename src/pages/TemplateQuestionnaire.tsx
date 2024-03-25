import { Button, Card, Input, Modal, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { KFButton } from '../components/KFButton';
import { KFLoader } from '../components/KFLoader';
import { QuestionCard } from '../components/QuestionCard';
import { getUniqueString, parseJSON } from '../helpers';
import { borderColor, buttonDarkBlue, primaryBackground, questionnaireBackground } from '../helpers/colors';
import { useAlert } from '../hooks/useAlert';
import { SectionCard } from '../components/SectionCard';
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

const appBarHeight = 50;
export function TemplateQuestionnaire() {
  const [sections, setSections] = useState<Section[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [editActiveIndex, setEditActiveIndex] = useState<string>();
  const [activeSection, setActiveSection] = useState<string>();
  const [templateId, setTemplateId] = useState("");
  const [openDiscardAlert, setOpenDiscardAlert] = useState(false);
  const { alertContext, showInvalidInputError, showSuccessInput } = useAlert();
  const prevQuestionState = useRef(questions);
  const [openSectionDiscard, setOpenSectionDiscard] = useState(false);
  const [newSectionLoading, setNewSectionLoading] = useState(false)

  useEffect(() => {
    (async () => {
      await KFSDK.initialize();
      // let allParams = await KFSDK.app.page.popup.getAllParameters();
      let sid = "Pk8qlYcGIz7o"
      console.log("Id : ", sid)
      setTemplateId(sid)
      // if (allParams.template_id) {
      //   setTemplateId(allParams.template_id)
      // }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      if (templateId) {
        await getSectionsByTemplate();
      }
    })()
  }, [templateId])

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
        await KFSDK.app.setVariable({
          isUnsavedQuestion: true
        })
      })()
    }
  }, [questions])

  async function getSectionsByTemplate() {
    const sectionResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Sections_A00/allitems/list?&page_number=1&page_size=10000`,
      {
        method: "POST",
        body: JSON.stringify({
          Filter: {
            "AND": [
              {
                "OR": [
                  {
                    "LHSField": "Template_ID",
                    "Operator": "EQUAL_TO",
                    "RHSType": "Value",
                    "RHSValue": templateId,
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
    const sections: Section[] = sectionResponse.Data;
    setSections(sections)
    if (sections.length > 0) {
      setActiveSection(sections[0].Section_ID)
    } else {
      await createSection("");
    }
  }

  async function getQuestionsBySection() {
    const questionResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Questions_A00/allitems/list?&page_number=1&page_size=10000`,
      {
        method: "POST",
        body: JSON.stringify({
          Filter: {
            "AND": [
              {
                "OR": [
                  {
                    "LHSField": "Section_ID",
                    "Operator": "EQUAL_TO",
                    "RHSType": "Value",
                    "RHSValue": activeSection,
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
    const newSection = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Sections_A00/batch`,
      {
        method: "POST",
        body: JSON.stringify([{
          Section_Name: sectionName,
          Section_Sequence: sections.length + 1,
          Template_ID: templateId,
          _is_created: true
        }])
      }).catch((err: any) => console.log("cannot fetch", err))
    await getSectionsByTemplate();
    setActiveSection(newSection[0]._id)
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
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Questions_A00/batch`,
      {
        method: "POST",
        body: JSON.stringify(data)
      }).catch((err: any) => console.log("cannot fetch", err))
    // await getQuestionsBySection();
  }

  async function updateSection(sectionId: string, sectionName: Question) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Sections_A00/${sectionId}`,
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
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Sections_A00/batch/delete`,
      {
        method: "POST",
        body: JSON.stringify([{
          _id: sectionId
        }])
      }).catch((err: any) => console.log("cannot fetch", err))
    await getSectionsByTemplate();
  }

  async function deleteQuestions(data: any[]) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Questions_A00/batch/delete`,
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
      const { deletedDelta, delta } = calculateDelta(questions, prevQuestionState.current, templateId);
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

  function showValidationMessages(callback: () => void, section?: Section) {
    const { deletedDelta, delta } = calculateDelta(questions, prevQuestionState.current, templateId);
    if (delta.length > 0 || deletedDelta.length > 0) {
      setOpenDiscardAlert(true);
    } else {
      if (questions.length == 0) {
        if (!section || activeSection != section.Section_ID) {
          setOpenSectionDiscard(true);
        }
      } else {
        callback();
      }
    }
  }

  return (
    <div>
      {alertContext}
      {templateId ?
        <div style={{
          display: "flex",
          flexDirection: "row",
          height: "94vh",
        }} >
          <div
            // className='scrollable-container'
            style={{
              overflow: "scroll",
              width: "30%",
              borderRight: `1px solid ${borderColor}`,
              backgroundColor: primaryBackground,
              padding: 15
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
                      isEditActive={section.Section_ID == editActiveIndex}
                      isActive={activeSection == section.Section_ID}
                      onClick={() => {
                        showValidationMessages(() => {
                          setActiveSection(section._id)
                        }, section);
                      }}
                      onPressEnter={async (e) => {
                        let sectionName = e.currentTarget.value;
                        await updateSection(section.Section_ID, sectionName);
                        setActiveSection(section.Section_ID)
                        setEditActiveIndex("")
                      }}
                      onEdit={() => setEditActiveIndex(section.Section_ID)}
                      onDelete={async () => deleteSection(section.Section_ID)}
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
                <KFButton
                  buttonType='primary'
                  onClick={async () => {
                    showValidationMessages(async () => {
                      await createSection("");
                    });
                  }}
                  style={{
                    marginTop: 10
                  }}
                  loading={newSectionLoading}
                >Add Section
                </KFButton>
              }
            </div>
          </div>
          <div
            // className='scrollable-container'
            style={{
              height: questions.length == 0 ? "100%" : "auto",
              overflow: "scroll",
              width: "70%",
              backgroundColor: questionnaireBackground,
              padding: questions.length == 0 ? "0px" : 15
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
                  <Button
                    onClick={async () => {
                      setQuestions((prevQuestions: any[]) => {
                        return [...prevQuestions, {
                          Question_ID: getUniqueString(),
                          Response_Type: "short_text",
                          Weightage: 0,
                          Question: "",
                          Section_ID: activeSection
                        }]
                      })
                    }}
                    style={{
                      color: "rgba(0, 60, 156, 1)",
                      backgroundColor: "rgba(238, 245, 255, 1)",
                      borderColor: "rgba(0, 60, 156, 1)",
                      // marginTop: 10
                    }}
                  >Add Questionnaire</Button>
                </EmptyPage>
            }
            {
              questions.length > 0 &&
              <Button
                onClick={async () => {
                  // await createQuestion("", "");
                  setQuestions((prevQuestions: any[]) => {
                    return [...prevQuestions, {
                      Question_ID: getUniqueString(),
                      Response_Type: "short_text",
                      Weightage: 0,
                      Question: "",
                      Section_ID: activeSection
                    }]
                  })
                }}
                style={{
                  color: "rgba(0, 60, 156, 1)",
                  backgroundColor: "rgba(238, 245, 255, 1)",
                  borderColor: "rgba(0, 60, 156, 1)",
                  marginTop: 10
                }}
              >Add Questionnaire</Button>
            }
          </div>
        </div> : <div>Loading....</div>}
      <div style={{
        backgroundColor: "white",
        width: "100%",
        height: appBarHeight,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0
      }} >
        <div style={{ padding: 20 }} >
          <Button
            onClick={() => {
              showValidationMessages(() => { });
            }}
            style={{ marginRight: 3, backgroundColor: primaryBackground }}
          >
            Discard
          </Button>
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
    const index = prev.findIndex((q) => q.Question_ID == currentQ.Question_ID);

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