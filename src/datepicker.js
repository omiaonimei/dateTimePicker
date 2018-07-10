/**
 * 日期组件
 * 
 * @param {String} style 组件input框的样式
 * @param {Boolean} readonly input框是否可输入,默认为可以输入
 * @param {Boolean} isDateRange 日选择是选择单天还是时间段
 * @param {Boolean} required  日期必填项
 * @param {Boolean} position  日期面板过长，需做样式控制,  right/left
 * @param {Date} maxDate     可选择的最大时间，传格式'yyyy-MM-dd'
 * @param {Date} minDate     可选择的最小时间，传格式'yyyy-MM-dd'
 * @param {Object} params   传递下来的自定义参数，dispatch时原样返回
 * @param {Array} datePickType   自动控制可使用的五种日期选择类型
 * @param {Boolean} hasTimePicker 是否带时分秒选择器    时间范围即isDateRange为true时,时分秒时暂时不做手动输入,需传入readonly为true
 * @param {String} value 默认显示哪天
 */

import './datepicker.css';
import template from './datepicker.html';
import Vue from 'vue';

var tipservice = require('../../../public/service/tipservice.js');
var validateService = require('../../../public/service/validateservice.js');
const datePickerCommon = require('./datePickerCommon.js');

module.exports = {
    name: 'DatePicker',
    template: template,
    replace: true,
    props: {
        style: {},
        readonly: {
            type: Boolean,
            default: false
        },
        isDateRange: {
            type: Boolean,
            default: true
        },
        placeholder: {
            type: String,
            default: '选择日期'
        },
        maxDate: {},
        minDate: {},
        required: {
            type: Boolean,
            default: false
        },
        position: {
            type: String,
            default: 'right'
        },
        params: {
            type: Object,
            default() {
                return {}
            }
        },
        datePickType: {
            type: Array,
            default() {
                return ['D', 'W', 'M', 'Q', 'Y']
            }
        },
        hasTimePicker: {
            type: Boolean,
            default:false
        },
        value: {
            type: String,
            default: ''
        }
    },
    data() {  
        return {
            showDateTable: false,
            datePickerTypeList: [],   // 用作渲染显示的日期选择类型
            datePickerType: 1,        //1日 2周 3月 4季度 5年    
            dateText: this.value,             //选择时间后显示的文本框内容
            validResult: false,       //验证
            validMessage: '',
            styleObj: {}              // 日历面板较大,需要控制偏左偏右位置
        }
    },
    created() { 
        this.initTimePickerType();
        // 设置styleObj
        switch(this.position) {
            case 'left': 
                this.styleObj = {
                    left: '-8px',
                    right: 'unset'
                }
                break;
                
            case 'right':
                this.styleObj = {
                    left: 'unset',
                    right: '-8px'
                }
                break;
            default :
                break;
        }
    },
    watch: {
        'datePickType'(n) {
            this.initTimePickerType();
        },
        'dateText'(n) {
            if (!n) {
                // this.reset();
                this.$dispatch('getDateRange', {
                    type : this.datePickerType,
                    dateRange: {
                        beginDate: '',
                        endDate: ''
                    },
                    params: this.params
                });
                return ;
            };
            // 选择时间段
            let dateRangeData = {};
            if (this.isDateRange) {
                switch(this.datePickerType) {
                    case 1 :
                    case 2 :
                        let dateArr = this.dateText.split(' 至 '),
                            beginDate = new Date(dateArr[0]),
                            endDate = new Date(dateArr[1]);
                        this.$refs['datePickerDay'].beginDate = dateArr[0] && datePickerCommon.dateValidate(dateArr[0]) ? dateArr[0] : '';
                        this.$refs['datePickerDay'].endDate = dateArr[0] && datePickerCommon.dateValidate(dateArr[1]) ?  dateArr[1] : '';
                        // 没有正确的开始日期与结束日期不向上传递结果
                        if (!this.$refs['datePickerDay'].beginDate || !this.$refs['datePickerDay'].endDate || this.$refs['datePickerDay'].beginDate.length !== 10 || this.$refs['datePickerDay'].endDate.length !== 10) return ;
                        dateRangeData = {
                            type: 1,
                            dateRange: {
                                beginDate: datePickerCommon.formatDateByString(dateArr[0]),
                                endDate: datePickerCommon.formatDateByString(dateArr[1])
                            },
                            params: this.params
                        }
                        this.$dispatch('getDateRange', dateRangeData);
                        break;
                    case 3 : 
                        let date = new Date(this.dateText),
                            monthDayNum = datePickerCommon.countMonthDay(date.getFullYear() , date.getMonth()+1)
                        dateRangeData = {
                            type : 3,
                            dateRange: {
                                beginDate: this.dateText + '-01',
                                endDate: this.dateText + '-' + monthDayNum
                            },
                            params: this.params
                        }
                        this.$dispatch('getDateRange', dateRangeData);
                        break;
                    case 4 :
                        let tempEndDate = new Date(this.$refs['datePickerQuarter'].endDate),
                            endeDateDayNum = datePickerCommon.countMonthDay(tempEndDate.getFullYear() , tempEndDate.getMonth()+1)
                        dateRangeData = {
                            type : 4,
                            dateRange: {
                                beginDate: this.$refs['datePickerQuarter'].beginDate + '-01',
                                endDate: this.$refs['datePickerQuarter'].endDate + '-' + this.formateDate(endeDateDayNum)
                            },
                            params: this.params
                        }
                        this.$dispatch('getDateRange', dateRangeData);
                        break;
                    case 5 :
                        dateRangeData = {
                            type : 4,
                            dateRange: {
                                beginDate: this.$refs['datePickerYear'].year + '-01-01',
                                endDate: this.$refs['datePickerYear'].year + '-12-31'
                            },
                            params: this.params
                        }
                        this.$dispatch('getDateRange', dateRangeData);
                        break;
                }
            } else {
                // 选择时间点
                let datePickerValid = (datePickerCommon.dateValidate(n) && n.length == 10),
                    timePickerValid = (datePickerCommon.dateValidate(n.substr(0,10)) && datePickerCommon.timeValidate(n.substr(11,20)) );

                if ( (!datePickerValid && !this.hasTimePicker) || (!timePickerValid && this.hasTimePicker) ) return;
                this.$refs['datePickerDay'].chosenDate = n.substr(0,10);
                this.$refs['datePickerDay'].chosenDateTime = this.hasTimePicker ? n.substr(11,20) : this.$refs['datePickerDay'].chosenDateTime;
                dateRangeData = {
                    type: 1,
                    chosenDate: this.hasTimePicker ? n : n.substr(0,10),
                    params: this.params
                }
                this.$dispatch('getDateRange', dateRangeData);
            }
        }
    },
    methods: {
        // 初始化可用的日期选择类型
        initTimePickerType() {
            this.datePickerTypeList = [];
            this.datePickerType = 1;
            // 初始日期选择类型
            let tempDatePickerTypeList = [
                {
                    name: '日',
                    type: 1,
                    value: 'D',
                    selected: true
                },
                {
                    name: '周',
                    type: 2,
                    value: 'W',
                    selected: false
                },
                {
                    name: '月',
                    type: 3,
                    value: 'M',
                    selected: false
                },
                {
                    name: '季度',
                    type: 4,
                    value: 'Q',
                    selected: false
                },
                {
                    name: '年',
                    type: 5,
                    value: 'Y',
                    selected: false
                }
            ];
            // 获取实际使用的日期选择类型
            tempDatePickerTypeList.forEach((item, index) => {
                if(this.datePickType.includes(item.value)) {
                    this.datePickerTypeList.push(item);
                }
            })
        },
        // 选择获取日期方式
        chooseDatePickerType(i) {
            this.datePickerTypeList.forEach((item, index) => {
                item.selected = index === i ? true : false;
                this.datePickerType = i+1;
            })
        },
        // 重置
        reset() {
            // this.dateText = '';
            // this.dateText = this.isDateRange ? '' : this.value;
            // 置空所选区域与文案显示  返回到当前年月，所选日期置空
            switch(this.datePickerType) {
                case 1 :
                    this.$refs['datePickerDay'].viewYear = this.$refs['datePickerDay'].todayDate.year;
                    this.$refs['datePickerDay'].viewMonth = this.$refs['datePickerDay'].todayDate.month;
                    this.$refs['datePickerDay'].beginDate = this.$refs['datePickerDay'].endDate = this.$refs['datePickerDay'].chosenDate = '';
                    this.$refs['datePickerDay'].hasChosenRange = false;
                    this.$refs['datePickerDay'].createdDateData();
                    break;
                case 2 :
                    this.$refs['datePickerWeek'].viewYear = this.$refs['datePickerWeek'].todayDate.year;
                    this.$refs['datePickerWeek'].viewMonth = this.$refs['datePickerWeek'].todayDate.month;
                    this.$refs['datePickerWeek'].dateRangeText = '';
                    this.$refs['datePickerWeek'].beginDate = this.$refs['datePickerWeek'].endDate = '';
                    this.$refs['datePickerDay'].hasChosenRange = false;
                    this.$refs['datePickerWeek'].createdDateData();
                    break;
                case 3 :
                    this.$refs['datePickerMonth'].viewYear = this.$refs['datePickerMonth'].todayDate.year;
                    this.$refs['datePickerMonth'].yearMonthText = '';
                    this.$refs['datePickerMonth'].chooseDate = {};
                    this.$refs['datePickerMonth'].chosenDate = '';
                    break;
                case 4 :
                    const today = new Date();
                    this.$refs['datePickerQuarter'].quarterText = '';
                    this.$refs['datePickerQuarter'].beginDate = this.$refs['datePickerQuarter'].endDate = '';
                    this.$refs['datePickerQuarter'].chosenQuarter = null;
                    this.$refs['datePickerQuarter'].viewYear = today.getFullYear();
                    break;
                case 5 :
                    this.$refs['datePickerYear'].yearText = '';
                    this.$refs['datePickerYear'].chosenYear = '';
                    this.$refs['datePickerYear'].initYearList();
                    break;
            }
            // this.close();
        },
        // 确定
        submit() {
            // 日期为空时直接关闭,不为空则进行格式校验
            let dateRange = {},
                reg = null;
            switch(this.datePickerType) {
                case 1:
                    // 时间范围与时间点返回格式处理
                    if (!this.isDateRange) {
                        if (!this.$refs.datePickerDay.chosenDate || (this.hasTimePicker && !this.$refs.datePickerDay.chosenDateTime)) {
                            return this.validateTips('日期为空');
                        }
                        if(!datePickerCommon.dateValidate(this.$refs.datePickerDay.chosenDate) || (this.hasTimePicker && !datePickerCommon.timeValidate(this.$refs.datePickerDay.chosenDateTime))) {
                            return this.validateTips('时间格式错误');
                        }
                        let dateRange = {
                            chosenDate : datePickerCommon.formatDateByString(this.$refs.datePickerDay.chosenDate),
                            chosenTime : this.$refs.datePickerDay.chosenDateTime
                        }
                        this.dateText = this.hasTimePicker ? dateRange.chosenDate + ' ' + dateRange.chosenTime : dateRange.chosenDate;
                    } else {
                        let beginDate = this.$refs.datePickerDay.beginDate,
                            endDate = this.$refs.datePickerDay.endDate;
                        if (!beginDate) {
                            return this.validateTips('开始日期为空');
                        };
                        if (!endDate) {
                            return this.validateTips('结束日期为空');
                        };
                        if (!datePickerCommon.dateValidate(beginDate)) {
                            return this.validateTips('开始时间格式错误');
                        }
                        if (!datePickerCommon.dateValidate(endDate)) {
                            return this.validateTips('结束时间格式错误');
                        }
                        if (
                                (!datePickerCommon.timeValidate(this.$refs.datePickerDay.beginDateTime) || 
                                !datePickerCommon.timeValidate(this.$refs.datePickerDay.endDateTime)) &&
                                this.hasTimePicker
                            ) {
                            return this.validateTips('时分秒时间格式错误');
                        }
                        // 开始时间大于结束时间替换值
                        dateRange = {
                            beginDate:this.compareDate(beginDate, endDate) ? endDate : beginDate,
                            endDate: this.compareDate(beginDate, endDate) ? beginDate : endDate,
                            beginDateTime: this.$refs.datePickerDay.beginDateTime,
                            endDateTime: this.$refs.datePickerDay.endDateTime
                        }
                        if (this.hasTimePicker) {
                            this.dateText = datePickerCommon.formatDateByString(dateRange.beginDate) + ' ' + dateRange.beginDateTime + ' 至 ' + datePickerCommon.formatDateByString(dateRange.endDate) + ' ' + dateRange.endDateTime;
                        } else {
                            this.dateText = datePickerCommon.formatDateByString(dateRange.beginDate) + ' 至 ' + datePickerCommon.formatDateByString(dateRange.endDate);
                        }
                        
                    }
                    break;
                case 2: 
                    dateRange = {
                        beginDate: this.$refs.datePickerWeek.beginDate,
                        endDate: this.$refs.datePickerWeek.endDate
                    } 
                    if(!dateRange.beginDate && !dateRange.endDate) {
                        this.dateText = '';
                        this.close();
                        return;
                    }
                    if(!datePickerCommon.dateValidate(dateRange.beginDate)) {
                        return this.validateTips('开始时间格式错误');
                    }
                    if(!datePickerCommon.dateValidate(dateRange.endDate)) {
                        return this.validateTips('结束时间格式错误');
                    }
                    this.dateText = dateRange.beginDate + ' 至 ' + dateRange.endDate;
                    break;
                case 3:
                    dateRange = {
                        chosenDate: this.$refs.datePickerMonth.chosenDate
                    }
                    if(!dateRange.chosenDate) {
                        this.dateText = '';
                        this.close();
                        return;
                    }
                    reg = /^\d{4}-(0[1-9]|[1-9]|1[012])$/;
                    if(!reg.test(dateRange.chosenDate)) {
                        return this.validateTips('时间格式错误');
                    }
                    this.dateText = dateRange.chosenDate;
                    break;
                case 4: 
                    dateRange = {
                        beginDate: this.$refs.datePickerQuarter.beginDate,
                        endDate: this.$refs.datePickerQuarter.endDate
                    } 
                    if(!dateRange.beginDate && !dateRange.endDate) {
                        this.dateText = '';       
                        this.close();
                        return;
                    }
                    reg = /^\d{4}-(0[1-9]|[1-9]|1[012])$/;
                    if(!reg.test(dateRange.beginDate)) {
                        return this.validateTips('开始时间格式错误');
                    }
                    if(!reg.test(dateRange.endDate)) {
                        return this.validateTips('结束时间格式错误');
                    }
                    this.dateText = dateRange.beginDate + ' 至 ' + dateRange.endDate;                    
                    break;
                case 5: 
                    dateRange = {
                        chosenYear: this.$refs.datePickerYear.chosenYear
                    }
                    if(!dateRange.chosenYear) {
                        this.dateText = '';      
                        this.close();
                        return;
                    }
                    reg = /^\d{4}$/;
                    if(!reg.test(dateRange.chosenYear.toString())) {
                        return this.validateTips('时间格式错误');
                    }
                    this.dateText = dateRange.chosenYear;              
                    break;
            }
            let dateRangeData = {
                type: this.datePickerType,
                dateRange: dateRange
            }
            this.close();
        },
        // 时间格式校验错误提示
        validateTips(text) {
            return tipservice.showMessage({
                        msg: text,
                        type: 'error',
                        timeout: 3000
                    });
        },
        /**
         * 比较时间
         */
        compareDate(d1,d2){
            return ((new Date(d1.replace(/-/g,"\/"))) > (new Date(d2.replace(/-/g,"\/"))));
        },
        // 关闭日期面板
        close() {
            this.showDateTable = false;
        },
        // 日或月补0
        formateDate(num) {
            return (num > 9 ? num : ('0'+num));
        }
    },
    ready() {
        document.addEventListener('click', (e) => {
            if (!this.$el || !this.$el.contains(e.target)) {
                this.close();
            }
        }, false);

        let vModelValid = function() {
            let value = this.dateText,
                validMessage = '',
                validResult = true,
                maxDate = this.maxDate,
                minDate = this.minDate;
                
            if (this.required && !value) {
                validResult = false;
                validMessage = '请选择日期';
            } else if (value && this.isDateRange && this.datePickerType === 1 && !this.hasTimePicker) {
                value = value.split(' 至 ');
                // 缺少一个日期 、 时间格式错误 、 不为十个字符长度(显示的输入框限制为yyyy-MM-dd格式) 
                if (value.length != 2 || !datePickerCommon.dateValidate(value[0]) || !datePickerCommon.dateValidate(value[1]) || value[0].length !== 10 || value[1].length !== 10) {
                    validResult = false;
                    validMessage = '时间格式错误';
                } else if ( minDate && maxDate && minDate.getTime() - maxDate.getTime()  > 0) {
                    validResult = false;
                    validMessage = '开始时间大于结束时间';
                } else if (value[0] && value[1] && !!maxDate && ((new Date(value[1]).getTime() - maxDate.getTime()) > 0 || (new Date(value[0]).getTime() - minDate.getTime()) < 0)) {
                    // 第二个时间大于最大时间时  或者第一个时间小于最小时间时
                    validResult = false;
                    validMessage = '时间范围：'+ minDate.getFullYear() + '-' + (minDate.getMonth() + 1) + '-' + minDate.getDate() + '~' + maxDate.getFullYear() + '-' + (maxDate.getMonth() + 1) + '-' + maxDate.getDate();
                }
            } else if (value && !this.isDateRange && this.datePickerType === 1) {
                // 没有时分秒选择时判断日期格式
                let datePickerValid = (datePickerCommon.dateValidate(value) && value.length == 10),
                    timePickerValid = (datePickerCommon.dateValidate(value.substr(0,10)) && datePickerCommon.timeValidate(value.substr(11,20)) );

                if ( (!datePickerValid && !this.hasTimePicker) || (!timePickerValid && this.hasTimePicker) ) {
                    validResult = false;
                    validMessage = '时间格式错误';
                }
            }
            this.validMessage = validMessage;
        }

        validateService.registered(this, vModelValid);

        // 兼容外部世界组件数据是ajax获取的请客
        var valueUnWatch = this.$watch('value', function() {
            var vm = this;

            if (vm.value) {
                vm.dateText = vm.value;
            }

            valueUnWatch();
        });

        this.$watch(function() {
            var vm = this;

            return vm.dateText + (vm.maxDate || '') + (vm.minDate || '');
        }, function() {
            var vm = this;

            vModelValid.call(vm);
            if (!vm.validMessage) {
                vm.value = vm.dateText;
            } 
        });
    },
    components: {
        'day' (resolve) {
            require(['./modules/day'], resolve)
        },
        'week' (resolve) {
            require(['./modules/week'], resolve)
        },
        'month' (resolve) {
            require(['./modules/month'], resolve)
        },
        'quarter' (resolve) {
            require(['./modules/quarter'], resolve)
        },
        'year' (resolve) {
            require(['./modules/year'], resolve)
        }
    },
    events: {
        datePickerTableClear() {
            this.initTimePickerType();
        }
    }
}