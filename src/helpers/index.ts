

function generateColorCode(value: number) {
    let color = "";
    if (value >= 1 && value <= 33) {
        color = lerpColor([236, 143, 140, 1], [249, 218, 217, 1], (value - 1) / 33);
    } else if (value >= 34 && value <= 66) {
        color = lerpColor([253, 240, 204, 1], [252, 231, 171, 1], (value - 34) / 33);
    } else if (value >= 67 && value <= 100) {
        color = lerpColor([217, 238, 216, 1], [141, 204, 139, 1], (value - 67) / 33);
    }

    return color;
}

function lerpColor(color1: number[], color2: number[], t: number) {
    let r = Math.round(color1[0] * (1 - t) + color2[0] * t);
    let g = Math.round(color1[1] * (1 - t) + color2[1] * t);
    let b = Math.round(color1[2] * (1 - t) + color2[2] * t);
    let a = 1;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}


function calculateSplitValue(value: number) {
    let sValue = Math.round((100 / value + Number.EPSILON) * 10) / 10;
    let lastValue = Math.round((100 - sValue * (value - 1) + Number.EPSILON) * 10) / 10;
    return {
        value: sValue,
        lastValue
    };
}


function getUniqueString() {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const randomPart = Math.floor(Math.random() * 16777215).toString(16);
    const counter = Math.floor(Math.random() * 4095).toString(16).padStart(4, '0');
    const mongoId = timestamp + randomPart + counter;

    return mongoId;
}

function parseJSON(jsonString: string) {
    try {
        const parsedData = JSON.parse(jsonString);
        return parsedData;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return null
    }
}

function getKey(str: string) {
    return str.replaceAll(" ", "_")
}


function convertStringToDate(dateString: string) {
    if (dateString) {
        var dateTimePart = dateString.split(' ')[0];
        var dateObject = new Date(dateTimePart);
        return !isNaN(dateObject.getTime()) ? dateObject.toLocaleDateString() : "Not yet defined";
    }
    return "Not yet defined"
}

function getDateObj(dateString: string) {
    if (dateString) {
        var dateTimePart = dateString.split(' ')[0];
        var dateObject = new Date(dateTimePart);
        return dateObject
    }
    return;
}
function scrollIntoView(ref: any) {
    if (ref.current) {
        ref.current?.scrollIntoView({ behavior: 'smooth' })
    }
}

export {
    calculateSplitValue, convertStringToDate, generateColorCode as getColorCode, getDateObj, getKey, getUniqueString,
    parseJSON, scrollIntoView
};

