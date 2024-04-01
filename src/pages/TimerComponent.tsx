import { Typography } from 'antd'
import { useEffect, useState } from 'react'
const KFSDK = require('@kissflow/lowcode-client-sdk')

const label: Record<string, string> = {
  days: "Day",
  hours: "Hour",
  minutes: "Minute",
  seconds: "Second"
}
export function TimerComponent() {
  const [timeData, setTimeData] = useState<Record<string, number>>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [size, setSize] = useState<"small" | "big">("small")
  // const [eventDueFinished,setEventDueFinished] = useState(false);

  function isValidDate(dateString: string) {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.toString() !== "Invalid Date";
  }

  function parseDateStringWithTimezone(dateString: string) {
    // if (isValidDate(dateString)) return new Date(dateString);
    var dateParts = dateString.split(" ");
    var dateComponent = dateParts.slice(0, 4).join(" ");
    var timeComponent = dateParts[4] + " " + dateParts[5];

    var date = new Date(dateComponent);
    var timeMatch: any = timeComponent.match(/(\d+):(\d+)/);
    var hours = parseInt(timeMatch[1]);
    var minutes = parseInt(timeMatch[2]);
    var timezoneOffsetHours = parseInt(dateParts[6].substring(3, 6)) / 100;
    hours -= timezoneOffsetHours;

    date.setHours(hours, minutes);

    return date;
  }

  function convertStringToDate(dateString: string | Date): Date {
    if (typeof dateString == "string") {
      if (isValidDate(dateString)) return new Date(dateString);
      let dateTimePart = dateString.split(' ')[0];
      let dateObject = new Date(dateTimePart);

      return dateObject;
    }
    return dateString
  }

  useEffect(() => {

    (async () => {
      await KFSDK.initialize();
      let allParams = await KFSDK.app.page.getAllParameters();
      const date = allParams.timer_date;

      if (allParams.timerSize == "big") {
        setSize("big");
      }

      if (date) {
        const parsedDate = parseDateStringWithTimezone(date);
        console.log("parsedDate", parsedDate, parsedDate.getTime())
        if (!isNaN(parsedDate.getTime())) {
          const timer = setInterval(() => {
            const now = new Date()
            const diff = parsedDate.getTime() - now.getTime();
            if (diff <= 0) {
              setTimeData({
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
              })
              clearInterval(timer);
            } else {

              let days = Math.floor(diff / (1000 * 60 * 60 * 24))
              let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
              let minutes = Math.floor(((diff % (1000 * 60 * 60))) / (1000 * 60))
              let seconds = Math.floor(((diff % (1000 * 60))) / (1000))
              let data = {
                days,
                hours,
                minutes,
                seconds
              };
              setTimeData(data)
            }
          }, 1000)
          return () => {
            clearInterval(timer);
          }
        }
      }
    })()
  }, [])

  return (
    <div>
      <div style={{
        display: "flex",
        // backgroundColor:"red",
        width: "90%",
        justifyContent: "space-between"
      }} >
        {
          Object.keys(timeData).map((key: string, index) => (
            <div key={index}>
              <Box size={size} number={timeData[key].toString()} text={`${label[key]}${timeData[key] > 1 ? "s" : ""}`} />
            </div>
          ))
        }
      </div>
    </div>
  )
}

function Box({ number, text, size }: any) {
  return (
    <div style={{
      border: size == "small" ? "1px solid #DEEAFF" : "",
      width: size == "small" ? 40 : 65,
      height: size == "small" ? 40 : 65,
      padding: 1,
      backgroundColor: "#eef5ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      borderRadius: size == "small" ? 5 : 10
    }} >
      <Typography style={{ fontSize: size == "small" ? 16 : 28, fontWeight: 600 }} >{number}</Typography>
      <Typography style={{ fontSize: size == "small" ? 9 : 11, color: "#080E19" }} >{text}</Typography>
    </div>
  )
}
