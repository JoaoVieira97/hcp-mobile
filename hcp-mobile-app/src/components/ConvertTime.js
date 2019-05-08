import moment from 'moment';


export default class ConvertTime {

    constructor() {
        this.date = {};
    }

    setDate = (date) => {
        this.date = moment(date+'+00:00', 'YYYY-MM-DD HH:mm:ssZZ').format()
    };

    getDate = () => {
        return this.date;
    };

    getTimeObject = () => {
        return ConvertTime._reformatDate(this.date);
    };

    /**
     * Reformat the given date.
     * @param date Date format must be 'YYYY-MM-DDTHH:mm:ss'.
     * @returns {{date: string, hour: string}}
     * @private
     */
    static _reformatDate(date) {

        const regexOutput = (date.slice(0,19)).split(/[:\-T]/);
        const dateString = regexOutput[2] + '/' + regexOutput[1] + '/' + regexOutput[0];
        const hourString = regexOutput[3] + ':' + regexOutput[4] + 'h';

        return {
            date: dateString,
            hour: hourString
        };
    }
}