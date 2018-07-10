
import './style.css';
import template from './template.html';
import Vue from 'vue';

module.exports = {
    name: 'month',
    template: template,
    replace: true,
    props: {},
    data() {
        const today = new Date();
        return {
            yearMonthText: '',
            viewYear: today.getFullYear(),
            todayDate: {
                year: today.getFullYear(),
                month: today.getMonth() + 1
            },
            chooseDate: {},
            chosenDate: ''
        }
    },
    methods: {
        /**
        * 切换年
        */
        yearClick(flag) {
            let nowDate = new Date();
            // 2013~当年
            this.viewYear = ((this.viewYear < nowDate.getFullYear() && flag > 0) || (this.viewYear > 2013 && flag < 0)) ? (this.viewYear + flag) : this.viewYear;
        },
        chooseMonth(flag) {
            flag++;
            // 如果是今年未过完的月份则不执行点击事件
            if(flag > this.todayDate.month && this.viewYear === this.todayDate.year) return;
            
            this.yearMonthText = `${this.viewYear}年${flag}月`;
            this.chooseDate = {
                year: this.viewYear,
                month: flag
            }
            if(flag < 10){
                flag = '0' + flag;
            }
            this.chosenDate = `${this.viewYear}-${flag}`;
        }
    }
}