import { Typography } from 'antd'
import moment from 'moment'
import { useEffect, useState } from 'react'
const KFSDK = require('@kissflow/lowcode-client-sdk')

const label: Record<string, string> = {
  days: "Day",
  hours: "Hours",
  minutes: "Mins",
  seconds: "Sec"
}
export function TimerComponent() {
  const [timeData, setTimeData] = useState<Record<string, number>>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
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
      
      if (date) {
        const parsedDate = parseDateStringWithTimezone(date);
        console.log("parsedDate",parsedDate,parsedDate.getTime())
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
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "start"
    }} >
      <div style={{ display: "flex", gap: 10 }} >
        {
          Object.keys(timeData).map((key: string, index) => (
            <div key={index} style={{ gap: 10 }} >
              <Box number={timeData[key].toString()} text={label[key]} />
            </div>
          ))
        }
      </div>
    </div>
  )
}

function Box({ number, text }: any) {
  return (
    <div style={{
      border: "1px solid #DEEAFF",
      width: 40,
      height: 40,
      padding: 1,
      backgroundColor: "#F4F9FF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      borderRadius: 5
    }} >
      <Typography style={{ fontSize: 16, fontWeight: 600 }} >{number}</Typography>
      <Typography style={{ fontSize: 10 }} >{text}</Typography>
    </div>
  )
}
