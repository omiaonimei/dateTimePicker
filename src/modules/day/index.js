
import './style.css';
import template from './template.html';
import Vue from 'vue';

const tipservice = require('../../../../../../public/service/tipservice.js');
const datePickerCommon = require('../../datePickerCommon.js');

module.exports = {
    name: 'day',
    template: template,
    replace: true,
    props: {
        isDateRange: {             //是否为日期范围的选择，否则单日
            type: Boolean,
            default: true
        },
        maxDate: {
            type: String,
            default: ''
        },
        minDate: {
            type: String,
            default: ''
        },
        hasTimePicker: {
            type: Boolean,
            default: false
        },
        value: {
            type: String,
            default: ''
        }
    },
    data() {
        const today = new Date();
        return {
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
            hasChosenRange: false,                  //判断是否已有选定时间区间
            chosenDate: this.value,                          //为单日选择时的文案显示
            scrollDirection: 0,
            chosenDateTime: '00:00:00',
            beginDateTime: '00:00:00',
            endDateTime:'23:59:59',
            showTimeTable: false,
            styleObj: {},
            timePickerType: ''
        }
    },
    created() {
        this.createdDateData();
    },
    watch: {
        'beginDate'(n, o) {
            if (datePickerCommon.dateValidate(n)) {
                let tempBeginDate = new Date(n);
                this.viewYear = tempBeginDate.getFullYear();
                this.viewMonth = tempBeginDate.getMonth() + 1;
                this.createdDateData(this.viewYear, this.viewMonth);
                this.getIsInRange();
                this.hasChosenRange = datePickerCommon.dateValidate(this.endDate);
            } else if ( !n && o && this.hasTimePicker) {
                // 此处的判断因未找到点击确定后beginDate和endDate被赋空值的原因暂做这样的处理
                this.beginDate = o;
            }
        },
        'endDate'(n, o) {
            if (datePickerCommon.dateValidate(n)) {
                let tempEndDate = new Date(n);
                this.viewYear = tempEndDate.getFullYear();
                this.viewMonth = tempEndDate.getMonth() + 1;
                this.createdDateData(this.viewYear, this.viewMonth);
                this.getIsInRange();
                this.hasChosenRange = datePickerCommon.dateValidate(this.beginDate);
            } else if ( !n && o && this.hasTimePicker) {
                this.endDate = o;
            }
        },
        'chosenDate'(n) {
            // 单日手动输入锁定日期
            if (!n) {
                this.createdDateData(this.viewYear, this.viewMonth);
                return;
            }
            if (datePickerCommon.dateValidate(n)) {
                let tempChosenDate = new Date(n);
                if (this.viewYear != tempChosenDate.getFullYear()  || this.viewMonth != tempChosenDate.getMonth() + 1) {
                    this.viewYear = tempChosenDate.getFullYear();
                    this.viewMonth = tempChosenDate.getMonth() + 1;
                    this.createdDateData(this.viewYear, this.viewMonth);
                }
                this.getIsInRange();
            }
        },
        'chosenDateTime'(n, o) {
            if (n.length !== 8) { return ;}
            this.getChooseTimeAuto(n)
        },
        'beginDateTime'(n, o) {
            if(!o) {
                this.getChooseTimeAuto('00:00:00')
                return;
            }
            if (n.length !== 8) { return ;}
            this.getChooseTimeAuto(n);
            
        },
        'endDateTime'(n, o) {
            if(!o) {
                this.getChooseTimeAuto('00:00:00')
                return;
            }
            if (n.length !== 8) { return ;}
            this.getChooseTimeAuto(n);
        },
        'showTimeTable'(n, o) {
            // 选择时分秒的面板隐藏时无法执行eTarget.scrollTop赋值操作
            if (n) {
                switch(this.timePickerType){
                    case 'begin':
                        this.getChooseTimeAuto(this.beginDateTime);
                        break;
                    case 'end':
                        this.getChooseTimeAuto(this.endDateTime);
                        break;
                }
            }
        }
    },
    methods: {
        // 时间范围选择时 显示时分秒显示器
        showTimePickerbox(time) {
            this.timePickerType = time;
            this.showTimeTable = true;
            switch(time) {
                case 'begin':
                    this.beginDateTime = this.beginDateTime || '00:00:00';
                    this.getChooseTimeAuto(this.beginDateTime);
                    this.styleObj = {
                        left: '178px'
                    }
                    break;
                case 'end':
                    this.endDateTime = this.endDateTime || '00:00:00';
                    this.getChooseTimeAuto(this.endDateTime);
                    this.styleObj = {
                        left: '310px'
                    }
                    break;
            }
        },
        hideTimePickerBox() {
            this.showTimeTable = false;
        },
        // 禁用时间组件外的滚动事件
        scrollFobidden(e) {
            /* e = e || window.event;
            if (e.stopPropagation) e.stopPropagation();
            else e.cancelBubble = true;
            
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false; */
        },
        // 点击时分秒
        chooseTime(e, id, scrollNum) {
            let eTarget = null;
            if (id) {
                eTarget = document.getElementById(id);
                eTarget.scrollTop = parseInt(scrollNum)*32;
            } else{
                eTarget = document.getElementById(e.target.parentNode.id);
                eTarget.scrollTop = parseInt(e.target.innerHTML)*32 || eTarget.scrollTop;
            }
        },
        getChooseTimeAuto(time) {
            let newArr = time.split(':');
            if (this.showTimeTable) {
                this.chooseTime(null, 'time-picker-box__item-hour', parseInt(newArr[0]));
                this.chooseTime(null, 'time-picker-box__item-minute', parseInt(newArr[1]));
                this.chooseTime(null, 'time-picker-box__item-second', parseInt(newArr[2]));
            }
        },
        // 时分秒滚动事件
        timeScroll(e) {
            let eTarget = document.getElementById(e.target.id);
            // 滚动距离小于上次滚动即为向上滚动做+1算法  否则向下做取整算法  
            eTarget.scrollTop = this.scrollDirection < eTarget.scrollTop ? Math.ceil(eTarget.scrollTop/32)*32 : parseInt(eTarget.scrollTop/32)*32;
            let num = eTarget.scrollTop/32,
                tempTimeText = '';
            for(let i in eTarget.children) {
                if (isNaN(parseInt(i))) break;
                if (i == num ) {
                    eTarget.children[i].className = 'item__list-item item__list-item-chosen';
                    tempTimeText = eTarget.children[i].innerHTML;
                } else {
                    eTarget.children[i].className = 'item__list-item';
                }
            }
            this.scrollDirection = eTarget.scrollTop;
            // 需对开始时间、结束时间，单选日做不同绑定变量的赋值
            let tempTimeArr = [];
            switch(this.timePickerType) {
                case 'begin':
                    tempTimeArr = this.beginDateTime.split(':');
                    break;
                case 'end':
                    tempTimeArr = this.endDateTime.split(':');
                    break;
                default:
                    tempTimeArr = this.chosenDateTime.split(':');
                    break;
            }
            if (e.target.id.indexOf('hour') > -1) {
                tempTimeArr[0] = tempTimeText;
            } else if(e.target.id.indexOf('minute') > -1) {
                tempTimeArr[1] = tempTimeText;
            } else if(e.target.id.indexOf('second') > -1) {
                tempTimeArr[2] = tempTimeText;
            }

            switch(this.timePickerType) {
                case 'begin':
                    this.beginDateTime = tempTimeArr.join(':');
                    break;
                case 'end':
                    this.endDateTime = tempTimeArr.join(':');
                    break;
                default:
                    this.chosenDateTime = tempTimeArr.join(':');
                    break;
            }
        },
        /**
         * 实现日历面板
         * @param {Number} y 年
         * @param {Number} m 月
         * 年月传值需同时传与不传
         * notThisMonth 可为-1（上一月） 0（当前月） 1（下一月）
         * 每次调用绘制面板方法时需考虑到原设置的区块属性被初始化还原
         */
        createdDateData(y, m) {
            // 用作计算日期的参数对象
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
                    day: preMonthDay - i,
                    date: {
                        year: countDate.month === 1 ? countDate.year - 1 : countDate.year,
                        month: countDate.month === 1 ? 12 : countDate.month - 1,
                        day: preMonthDay - i
                    },
                    notThisMonth: -1,
                    isChosenBeginDay: null,
                    isChosenEndDay: null,
                    isRangeHover: false
                })
            }
            this.date.reverse();
            // 当月显示的天
            for (let i = 0; i < nowMonthDay; i++) {
                let tepmDate = {
                    year: countDate.year,
                    month: countDate.month,
                    day: i + 1
                }       // 当前区块的年月日参数
                this.date.push({
                    day: i + 1,
                    date: tepmDate,
                    notThisMonth: 0,
                    isChosenBeginDay: null,
                    isChosenEndDay: null,
                    isRangeHover: false,     //是否在选择的日期范围内
                    isInLimitRange: true     //是否在限制时间范围内
                })
            }

            // 下一月显示几天
            let resDateLength = 42 - this.date.length;
            for (let i = 0; i < resDateLength; i++) {
                this.date.push({
                    day: i + 1,
                    date: {
                        year: countDate.month === 12 ? countDate.year + 1 : countDate.year,
                        month: countDate.month === 12 ? 1 : countDate.month + 1,
                        day: i + 1
                    },
                    notThisMonth: 1,
                    isChosenBeginDay: null,
                    isChosenEndDay: null,
                    isRangeHover: false
                })
            }

            if (!this.beginDate && !this.endDate) {
                this.getIsInRange();
            }
        },
        /**
        * 切换年
        */
        yearClick(flag) {
            this.viewYear = this.viewYear + flag;
            this.createdDateData(this.viewYear, this.viewMonth);
            this.getIsInRange();
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
            this.getIsInRange();            
        },
        /**
         * 判断是否在所选的开始日期与结束日期区域内
         * @param {Object} obj 滑过的对象
         * 当有obj入参时说明在执行滑动事件，不需对开始日期与结束日期做操作
         */
        getIsInRange(obj) {
            // 单日操作
            if (!this.isDateRange) {
                let tempChosenDate = new Date(this.chosenDate);
                this.date.forEach((item, index) => {
                    item.isChosenBeginDay = this.chosenDate ? datePickerCommon.isEqualDate(tempChosenDate, new Date(`${item.date.year}-${item.date.month}-${item.date.day}`)) : false;
                    item.isInLimitRange = this.isDateInLimitRange(item.date);
                })
                return;
            }
            // 日期范围选择操作
            let tempBeginDate = new Date(this.beginDate),
                tempEndDate = obj ? new Date(datePickerCommon.formatDate(obj)) : new Date(this.endDate),
                rangeBeginTime = tempBeginDate.getTime(),
                rangeEndTime = tempEndDate.getTime();
            // 1、存在开始日期无结束日期   2、开始日期与结束日期都存在  3、开始日期与结束日期都不存在
            if (this.beginDate && !this.endDate) {
                this.date.forEach((item, index) => {
                    // 判断item的年月日是否与开始日期一致
                    item.isChosenBeginDay = datePickerCommon.isEqualDate(tempBeginDate, new Date(`${item.date.year}-${item.date.month}-${item.date.day}`));
                    item.isChosenEndDay = false;
                    let rangeItemTime = new Date(datePickerCommon.formatDate(item.date)).getTime(),
                        tempIsRangeHover = datePickerCommon.isDateInRange(rangeItemTime, rangeBeginTime, rangeEndTime);      
                    item.isRangeHover = tempIsRangeHover;
                    item.isInLimitRange = this.isDateInLimitRange(item.date);
                })
            } else if (this.beginDate && this.endDate) {
                this.date.forEach((item, index) => {
                    // 判断item的年月日是否与开始日期一致
                    item.isChosenBeginDay = datePickerCommon.isEqualDate(tempBeginDate, new Date(`${item.date.year}-${item.date.month}-${item.date.day}`));
                    // 判断item的年月日是否与结束日期一致
                    item.isChosenEndDay = datePickerCommon.isEqualDate(tempEndDate, new Date(`${item.date.year}-${item.date.month}-${item.date.day}`));
                    // 判断是否在选定区域内
                    let rangeItemTime = new Date(datePickerCommon.formatDate(item.date)).getTime(),
                        tempIsRangeHover = datePickerCommon.isDateInRange(rangeItemTime, rangeBeginTime, rangeEndTime);
                    item.isRangeHover = tempIsRangeHover;
                    // 判断是否在最大最小日期范围内
                    item.isInLimitRange = this.isDateInLimitRange(item.date);
                })
            } else if (!this.beginDate && !this.endDate) {
                this.date.forEach((item, index) => {
                    item.isInLimitRange = this.isDateInLimitRange(item.date);
                })
            }
        },
        /**
        * 点击某天
        */
        chooseDay(obj) {
            switch (obj.notThisMonth) {
                // 上一月和下一月的日期 切换月份 只需重绘日历面板
                case -1:
                case 1:
                    this.monthClick(obj.notThisMonth);
                    return;
                    break;
                // 当前月
                case 0:
                default:
                    break;
            }
            // 日期区间限制外的日期点击不需往下执行
            if (!obj.isInLimitRange) { return }

            // 单日选择只需控制chosenDate
            if (!this.isDateRange) {
                this.chosenDate = datePickerCommon.formatDate(obj.date);
                return;
            }

            // 如果开始日期有内容则自动填充结束日期
            let objDate = new Date(datePickerCommon.formatDate(obj.date)),
                beginDateTime = new Date(datePickerCommon.beginDate),
                tempDate = this.beginDate;
            
            if (this.beginDate && !this.endDate) {                         // 只存在一个日期时
                // 开始时间大于结束时间时需要替换
                let isBenginOverEnd = beginDateTime.getTime() > objDate.getTime();
                if (isBenginOverEnd) {
                    this.beginDate = datePickerCommon.formatDate(obj.date);
                    this.endDate = tempDate;
                } else {
                    this.endDate = datePickerCommon.formatDate(obj.date);
                }
                this.hasChosenRange = true;
            } else if (this.beginDate && this.endDate) {                  //存在两个日期时 清空并选定开始时间
                this.beginDate = datePickerCommon.formatDate(obj.date);
                this.endDate = '';
                this.hasChosenRange = false;
                this.getIsInRange();
            } else {                                                    
                this.beginDate = datePickerCommon.formatDate(obj.date);
                this.hasChosenRange = false;
            }
        },
        /**
         * 滑过获取区域
         * @param {Object} obj 滑过的对象
         * 控制存在一个已选日期时滑动锁定的区域
         */
        setDateHoverCls(obj) {
            // 当开始日期有值且结束日期为空时为滑动渲染日期范围
            if (this.beginDate && !this.endDate) this.getIsInRange(obj);
        },
        /**
         * 实现对日历最小日期与最小日期的限制
         * @param {Object} obj 
         */
        isDateInLimitRange(obj) {
            // 减去八小时的差异
            let tempDateTime = new Date(datePickerCommon.formatDate(obj)).getTime() - 28800000,
                tempMaxDateTime = new Date(this.maxDate).getTime(),
                tempMinDateTime = new Date(this.minDate).getTime();
            if (this.maxDate && this.minDate) {
                return tempDateTime <= tempMaxDateTime && tempDateTime >= tempMinDateTime;
            } else if (this.maxDate && !this.minDate) {
                return tempDateTime <= tempMaxDateTime;
            } else if (!this.maxDate && this.minDate) {
                return tempDateTime >= tempMinDateTime;
            } else {
                return true;
            }
        },
        leaveDateTable() {
            !this.hasChosenRange && this.date.forEach((item) => {
                item.isRangeHover = false;
            })
        }
    },
    filters: {
        filterAddZero(n) {
            return n < 10 ? '0'+n : n
        }
    },
    events: {
        datePickerTableClear() {
            this.createdDateData();
        }
    }
}