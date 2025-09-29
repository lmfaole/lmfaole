let today = new Date();
let lastWeek = new Date();
let nextWeek = new Date();
let lastMonth = new Date();
let nextMonth = new Date();
let lastYear = new Date();
let nextYear = new Date();

lastWeek.setDate(today.getDate() - 7);
nextWeek.setDate(today.getDate() + 7);

lastMonth.setDate(today.getMonth() - 1);
nextMonth.setDate(today.getMonth() + 1);

lastYear.setDate(today.getFullYear() - 1);
nextYear.setDate(today.getFullYear() + 1);

const defaultDateFormat = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
}

function toInputFormat(dateToBeFormatted) {
    const date = new Date(dateToBeFormatted);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    if (day < 10) {
        day = `0${day}`
    }

    if (month < 10) {
        month = `0${month}`
    }

    return `${year}-${month}-${day}`;
}