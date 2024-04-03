
function getColorCode(number: number) {
    if (number >= 0 && number <= 33) {
        const startColor = [255, 90, 90];
        // const endColor = [253, 213, 207];
        // const step = 1 / 4;
        // const rgb = startColor.map((channel, index) =>
        //     Math.round(channel - step * number * (startColor[index] - endColor[index]))
        // );
        startColor[1] = startColor[1] + (number * 2.5);
        startColor[2] = startColor[2] + (number * 2.5)
        return `rgb(${startColor.join(', ')})`;
    } else if (number >= 34 && number <= 67) {
        const startColor = [255, 255, 210];
        // const endColor = [251, 245, 44];
        // const step = 1 / 2;
        // const rgb = startColor.map((channel, index) =>
        //     Math.round(channel - step * (number - 4) * (startColor[index] - endColor[index]))
        // );
        startColor[2] = startColor[2] - (number * 2);
        return `rgb(${startColor.join(', ')})`;
    } else if (number >= 68) {
        const startColor = [210, 255, 205]
        // const endColor = [120, 255, 60]
        // const step = 1 / 2;
        // const rgb = startColor.map((channel, index) =>
        //     Math.round(channel - step * (number - 8) * (startColor[index] - endColor[index]))
        // );
        startColor[0] = startColor[0] - (number * 2.5);
        startColor[2] = startColor[2] - (number * 2.5);
        return `rgb(${startColor.join(', ')})`;
    } else {
        return "white"
    }
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
    calculateSplitValue,
    getColorCode, getKey, getUniqueString,
    parseJSON,
    convertStringToDate,
    getDateObj,
    scrollIntoView
};

