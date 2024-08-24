import moment from 'moment-timezone';

export const formatToJakartaTime = (date) => {
    return moment(date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss.SSS Z');
};