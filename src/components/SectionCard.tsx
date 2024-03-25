import { Card, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { KFLoader } from "./KFLoader";

interface SectionProps {
  index: number,
  section_name: string,
  rest: any,
  isEditActive: boolean,
  isActive: boolean,
  onPressEnter: (e: any) => Promise<void>,
  onEdit: () => void,
  onDelete: () => Promise<void>,
  onClick: () => void,
  onKeyUp: (e: any) => void
}

export function SectionCard(props: SectionProps) {
  const { index, section_name, isEditActive, isActive, onPressEnter, onEdit, onDelete, onClick, onKeyUp } = props;
  const [hover, setHover] = useState(false)
  const [inputValue, setInputValue] = useState(`Section ${index}`);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (section_name) {
      setInputValue(section_name);
    }
  }, [section_name])

  async function saveSection(e: any) {
    if (e.target.value) {
      setLoading(true);
      await onPressEnter(e);
      setLoading(false);
    }
  }
  return (
    <div key={index} >
      <Card
        style={{
          borderRadius: 4,
          borderColor: "rgba(222, 234, 255, 1)",
          padding: 5,
          backgroundColor: isActive ? "rgba(238, 245, 255, 1)" : "white"
        }}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {<div>
          <Typography style={{ fontSize: 12 }}  >Section {index}</Typography>
          {!loading ?
            <div>
              {
                isEditActive ?
                  <Input
                    autoFocus
                    onBlur={saveSection}
                    onPressEnter={saveSection}
                    style={{ fontSize: 15 }}
                    onKeyUp={onKeyUp}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  /> :
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 30 }} >
                    <Typography style={{ fontSize: 15 }} >{section_name}</Typography>
                    {hover &&
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }} >
                        <img onClick={onEdit} style={{ marginRight: 5, cursor: "pointer" }} src={process.env.PUBLIC_URL + '/svgs/edit.svg'} />
                        <img onClick={async () => {
                          setLoading(true);
                          await onDelete();
                          setLoading(false);
                        }} style={{ cursor: "pointer" }} src={process.env.PUBLIC_URL + '/svgs/trash.svg'} />
                      </div>}
                  </div>
              }
            </div> : <KFLoader />
          }
        </div>
        }
      </Card>
    </div>
  )
}