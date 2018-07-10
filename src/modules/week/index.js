
import './style.css';
import template from './template.html';
import Vue from 'vue';

const tipservice = require('../../../../../../public/service/tipservice.js');
const datePickerCommon = require('../../datePickerCommon.js');

module.exports = {
    name: 'week',
    template: template,
    replace: true,
    props: {},
    data() {
        const today = new Date;
        return {
            dateRangeText: '',
            days: ['日', '一', '二', '三', '四', '五', '六'],
            date: [],                               //日期面板数据     
            todayDate: {
                year: today.getFullYear(),
                month: today.getMonth() + 1,
                day: today.getDate()
            },                                      //始终存放当天日期
            viewYear: today.getFullYear(),          //日期面板上的年份
            viewMonth: today.getMonth() + 1,        //日期面板上的月份
            beginDate: '',                          //开始时间文案显示
            endDate: '',                            //结束时间文案显示
        }
    },
    created() {
        this.createdDateData();
    },
    watch: {
        'beginDate'(n) {
            // 获取滑过的区块与锁定开始日期
            this.getIsInRange();
        },
        'endDate'(n) {
            this.getIsInRange();
        }
    },
    methods: {
        /**
         * 实现日历面板
         * 当有入参时即为切换年月，无入参默认当前年月
         * notThisMonth 可为-1（上一月） 0（当前月） 1（下一月）
         * 每次调用绘制面板方法时需考虑到原设置的区块属性被初始化还原
         */
        createdDateData(y, m) {
            let countDate = {
                year: y && m ? y : this.todayDate.year,
                month: y && m ? m : this.todayDate.month
            };

            const nowMonthDay = datePickerCommon.countMonthDay(countDate.year, countDate.month),   //当月天数
                preMonthDay = datePickerCommon.countMonthDay(countDate.year, countDate.month - 1),   //上一月天数
                nextMonthDay = datePickerCommon.countMonthDay(countDate.year, countDate.month + 1),   //下一月天数
                nowMonthFirstDay = datePickerCommon.countWeekDay(countDate.year, countDate.month, 1),   //当月第一天周几
                nowMonthLastDay = datePickerCommon.countWeekDay(countDate.year, countDate.month, nowMonthDay);   //当月最后一天周几
            this.date = [];
            // 上一月显示的后几天
            for (let i = 0; i < nowMonthFirstDay; i++) {
                this.date.push({
                    index: (preMonthDay - i) - 1,
                    day: preMonthDay - i,
                    date: {
                        year: countDate.month === 1 ? countDate.year - 1 : countDate.year,
                        month: countDate.month === 1 ? 12 : countDate.month - 1,
                        day: preMonthDay - i
                    },
                    notThisMonth: -1,
                    isChosenBeginDay: null,
                    isChosenEndDay: null,
                    isChosenRangeHover: false,
                    isRangeHover: false
                })
            }
            this.date.reverse();
            // 当月显示的天
            for (let i = 0; i < nowMonthDay; i++) {
                this.date.push({
                    index: this.date.length,
                    day: i + 1,
                    date: {
                        year: countDate.year,
                        month: countDate.month,
                        day: i + 1
                    },
                    notThisMonth: 0,
                    isChosenBeginDay: null,
                    isChosenEndDay: null,
                    isChosenRangeHover: false,
                    isRangeHover: false
                })
            }

            // 下一月显示几天
            let resDateLength = 42 - this.date.length;
            for (let i = 0; i < resDateLength; i++) {
                this.date.push({
                    index: this.date.length,
                    day: i + 1,
                    date: {
                        year: countDate.month === 12 ? countDate.year + 1 : countDate.year,
                        month: countDate.month === 12 ? 1 : countDate.month + 1,
                        day: i + 1
                    },
                    notThisMonth: 1,
                    isChosenBeginDay: null,
                    isChosenEndDay: null,
                    isChosenRangeHover: false,
                    isRangeHover: false
                })
            }

            // 切换月份与年时调用createdDateData会导致属性被初始化还原，因此调用该方法再做一次遍历
            if (this.beginDate && this.endDate) {
                this.getIsInRange();
            }   
        },
        /**
         * 切换年
         */
        yearClick(flag) {
            this.viewYear = this.viewYear + flag;
            this.createdDateData(this.viewYear, this.viewMonth);
        },
        /**
         * 切换月份
         */
        monthClick(flag) {
            if (this.viewMonth === 12 && flag > 0) {
                this.viewMonth = 1;
                this.viewYear++;
            } else if (this.viewMonth === 1 && flag < 0) {
                this.viewMonth = 12;
                this.viewYear--;
            } else {
                this.viewMonth = this.viewMonth + flag;
            }

            this.createdDateData(this.viewYear, this.viewMonth);
        },
        /**
         * 滑过获取区域
         */
        setDateHoverCls(obj, i) {
            // 拿到日期，获取周几
            let weekDay = datePickerCommon.countWeekDay(obj.year, obj.month, obj.day) || 7;
            let beginIndex = i - weekDay + 1,
                endIndex = beginIndex + 6;
            if (beginIndex < 0)  return;
            this.date.forEach((item, index) => {
                item.isRangeHover = index >= beginIndex && index <= endIndex;
            })
        },
        /**
         * 判断是否在区域内
         * 开始时间  结束时间
         */
        getIsInRange() {
            let tempBeginDate = new Date(this.beginDate),
                tempEndDate = new Date(this.endDate),
                rangeBeginTime = tempBeginDate.getTime(),
                rangeEndTime = tempEndDate.getTime();

            // 选中开始时间到结束时间之间的日期区块，需对开始时间与结束时间做特殊处理显示
            this.date.forEach( (item, index) => {
                let rangeItemTime = new Date(datePickerCommon.formatDate(item.date));
                    rangeItemTime = rangeItemTime.getTime();
                // 开始时间
                item.isChosenBeginDay = this.beginDate && datePickerCommon.isEqualDate(tempBeginDate, new Date(`${item.date.year}-${item.date.month}-${item.date.day}`));
                // 结束时间
                item.isChosenEndDay = this.endDate && datePickerCommon.isEqualDate(tempEndDate, new Date(`${item.date.year}-${item.date.month}-${item.date.day}`));
                let tempIsRangeHover = datePickerCommon.isDateInRange(rangeItemTime, rangeBeginTime, rangeEndTime);
                item.isChosenRangeHover = tempIsRangeHover;
            })
        },
        /**
         * 点击某天
         */
        chooseDay(obj, i) {
            switch (obj.notThisMonth) {
                // 上一月和下一月的日期 切换月份
                case -1:
                case 1:
                    this.monthClick(obj.notThisMonth);
                    return;
                    break;
                // 当前月
                case 0:
                    break;
                default:
                    break
            }
            // 拿到日期，获取周几
            let weekDay = datePickerCommon.countWeekDay(obj.date.year, obj.date.month, obj.date.day);
            let beginIndex = i - weekDay + 1,
                endIndex = beginIndex + 6;
            if (endIndex < 42 && beginIndex >= 0) {
                this.beginDate = datePickerCommon.formatDate(this.date[beginIndex].date);
                this.endDate = datePickerCommon.formatDate(this.date[endIndex].date);
            }
            this.dateRangeText = `${this.beginDate} 至 ${this.endDate}`;
        },
        leaveDateTable() {
            this.date.forEach((item) => {
                item.isRangeHover = false;
            })
        },
    }
}