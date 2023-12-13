
function getColorCode(number: number) {
    if (number >= 0 && number <= 3) {
        const startColor = [255, 90, 90];
        const endColor = [253, 213, 207];
        const step = 1 / 4;
        const rgb = startColor.map((channel, index) =>
            Math.round(channel - step * number * (startColor[index] - endColor[index]))
        );
        return `rgb(${rgb.join(', ')})`;
    } else if (number >= 4 && number <= 7) {
        const startColor = [255, 253, 211];
        const endColor = [251, 245, 44];
        const step = 1 / 2;
        const rgb = startColor.map((channel, index) =>
            Math.round(channel - step * (number - 4) * (startColor[index] - endColor[index]))
        );
        return `rgb(${rgb.join(', ')})`;
    } else if (number >= 8) {
        const startColor = [220, 255, 215]
        const endColor = [120, 255, 60]
        const step = 1 / 2;
        const rgb = startColor.map((channel, index) =>
            Math.round(channel - step * (number - 8) * (startColor[index] - endColor[index]))
        );
        return `rgb(${rgb.join(', ')})`;
    } else {
        return "white"
    }
}


export {
    getColorCode
};

