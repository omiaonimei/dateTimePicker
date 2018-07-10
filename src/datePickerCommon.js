module.exports = {
    /**
    * 计算某月多少天
    * @param {Number} y 年份
    * @param {Number} m 月份
    */
    countMonthDay(y, m) {
        let today = new Date();
        today.setFullYear(y, m, 0);    //0返回最后一天
        return today.getDate();
    },
    /**
    * 计算某天周几
    * @param {Number} y 年
    * @param {Number} m 月
    * @param {Number} d 日
    */
    countWeekDay(y, m, d) {
        let today = new Date();
        today.setFullYear(y, m - 1, d);
        let date = today.getDay();
        return date ? date : 0;         //0表示周天
    },
    /**
    * 日期格式校验
    * @param {String} date 完整日期
    */
    dateValidate(date) {
        const reg = /^\d{4}-(0[1-9]|1[012]|[1-9])-(0[1-9]|[12][0-9]|3[01]|[1-9])$/;
        return reg.test(date);
    },
    /**
     * 时分秒校验
     * @param {String} time 
     */
    timeValidate(time) {
        const reg = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
        return reg.test(time);
    },
    /**
    * 拼装成yyyy-MM-dd格式
    * @param {Object} obj 日期对象 包含年月日三个参数
    */
    formatDate(obj) {
        return `${obj.year}-${(obj.month < 10 ? ('0' + obj.month) : obj.month)}-${(obj.day < 10 ? ('0' + obj.day) : obj.day)}`;
    },
    /**
     * 将正确的日期格式转成obj再调用formatDate做补0操作
     * @param {String} str 
     */
    formatDateByString(str) {
        let tempDate = new Date(str),
            tempDateObj = {
                year: tempDate.getFullYear(),
                month: tempDate.getMonth()+1,
                day: tempDate.getDate()
            };
        return this.formatDate(tempDateObj)
    },
    /**
     * 比较两个日期是否相等
     * @param {Date} date1 
     * @param {Date} date2 
     */
    isEqualDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
    },
    /**
    * 计算某个时间是否在日期范围内 毫秒值
    * @param {Number} nDatetime  需要被判断的日期
    * @param {Number} fDate      开始日期
    * @param {Number} lDate      结束日期
    */
    isDateInRange(nDatetime, fDatetime, lDatetime) {
        //判断是否为滑过区间内 1、面板上的时间大于开始时间且小于滑过停住锁定的时间 2、面板上的时间小于开始时间且大于滑过停住锁定的时间
        return (nDatetime >= fDatetime && nDatetime <= lDatetime) || (nDatetime <= fDatetime && nDatetime >= lDatetime);
    },
}
