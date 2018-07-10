
import './style.css';
import template from './template.html';
import Vue from 'vue';

module.exports = {
    name: 'year',
    template: template,
    replace: true,
    props: {},
    data() {
        const date = new Date();
        let year = date.getFullYear();
        return {
            yearText: '',
            chosenYear: null,
            yearList: [],
            year: year
        }
    },
    created() {
        this.initYearList();
    },
    methods: {
        initYearList() {
            this.yearList = [];
            for(let i = 2013 ; i <= this.year ; i++) {
                this.yearList.push({
                    name: i,
                    isSelected: false,
                    // hasArrive: i === this.year
                });
            }
        },
        chooseYear(item, i) {
            // if(item == this.year) return ;
            this.yearList.forEach((item, index) => {
                item.isSelected = index === i;
            })
            this.chosenYear = this.year = this.yearList[i].name;
            this.yearText = `${this.chosenYear}年`;
        }
    }
}