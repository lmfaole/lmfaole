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

const defaultDateFormat = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
}