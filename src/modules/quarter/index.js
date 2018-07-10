
import './style.css';
import template from './template.html';
import Vue from 'vue';

module.exports = {
    name: 'quarter',
    template: template,
    replace: true,
    props: {},
    data() {
        return {
            quarterText: '',
            viewYear: null,
            quarterList: [
                {
                    name: '第一季度',
                    value: 1,
                    hasFinish: true
                },
                {
                    name: '第二季度',
                    value: 2,
                    hasFinish: true
                },
                {
                    name: '第三季度',
                    value: 3,
                    hasFinish: true                    
                },
                {
                    name: '第四季度',
                    value: 4,
                    hasFinish: true                    
                }
            ],
            chosenQuarter: null,
            beginDate: '',
            endDate: ''
        }
    },
    created() {
        const today = new Date();
        this.viewYear = today.getFullYear();
    },
    watch: {
        'viewYear'(n) {
            const today = new Date();
            // 如果是当前年需置灰未结束的季度
            let tMonth = today.getMonth() + 1;
            
            if (n === today.getFullYear()) {
                if (tMonth <= 3) {
                    this.quarterList[1].hasFinish = this.quarterList[2].hasFinish = this.quarterList[3].hasFinish= false;
                } else if (tMonth <= 6 && tMonth > 3) {
                    this.quarterList[2].hasFinish = this.quarterList[3].hasFinish= false;
                }else if (tMonth < 9 && tMonth > 6) {
                    this.quarterList[3].hasFinish = false;
                }
            } else {
                this.quarterList[0].hasFinish = this.quarterList[1].hasFinish = this.quarterList[2].hasFinish = this.quarterList[3].hasFinish = true;
            }
        }
    },
    methods: {
        chooseQuarter(i) {
            // 当前点击季度为未结束状态则不执行后续操作
            if ( !this.quarterList[i].hasFinish ) return;
        
            this.quarterText = `${this.viewYear}年${this.quarterList[i].name}`;
            this.chosenQuarter = i + 1;
            switch(i){
                case 0:
                    this.beginDate = `${this.viewYear}-01`;
                    this.endDate = `${this.viewYear}-03`;
                    break;  
                case 1:
                    this.beginDate = `${this.viewYear}-04`;
                    this.endDate = `${this.viewYear}-06`;
                    break; 
                case 2:
                    this.beginDate = `${this.viewYear}-07`;
                    this.endDate = `${this.viewYear}-09`;
                    break; 
                case 3:
                    this.beginDate = `${this.viewYear}-10`;
                    this.endDate = `${this.viewYear}-12`;
                    break;          
                default:
                    break;         
            }
        },
        /**
        * 切换年
        */
        yearClick(flag) {
            let nowDate = new Date();
            // 2013~当年
            this.viewYear = ((this.viewYear < nowDate.getFullYear() && flag > 0) || (this.viewYear > 2013 && flag < 0)) ? (this.viewYear + flag) : this.viewYear;
        },
    }
}