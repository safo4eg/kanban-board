let boardTemplate = 'templates/board.html';
let columnTemplate = 'templates/column.html';
let cardTemplate = 'templates/card.html';
let cardEditTemplate = 'templates/card-edit.html';


let templates = getTemplates(columnTemplate, boardTemplate, cardTemplate, cardEditTemplate);
templates.then(array => {
    columnTemplate = array[0];
    boardTemplate = array[1];
    cardTemplate = array[2];
    cardEditTemplate = array[3];

    let eventBus = new Vue();

    let boardBody = {
        template: boardTemplate,

        mounted() {
            eventBus.$on('card-edit', (columnUnique, cardUnique, status) => {
                this.changeCard(columnUnique, cardUnique, 'update', {'isEdit': status});
            });

            eventBus.$on('save-card', (columnUnique, cardUnique, title, desc, deadline, timeEdit, amountEdit) => {
                let changes = {
                    'title': title,
                    'desc': desc,
                    'dates': {
                        'deadline': deadline,
                        'edit': timeEdit,
                    },
                    'isEdit': false,
                    'amountEdit': amountEdit
                };
                this.changeCard(columnUnique, cardUnique,'update', changes);
            });

            eventBus.$on('delete-card', (columnUnique, cardUnique) => {
                this.changeCard(columnUnique, cardUnique,'delete');
            });
        },

        data() {
            return {
                columns: [
                    {
                        unique: 1,
                        status: 'backlog',
                        title: 'Backlog',
                        cards: [], // массив обьектов с карточками
                    },

                    {
                        unique: 2,
                        status: 'work',
                        title: 'In work',
                        cards: [],
                    },

                    {
                        unique: 3,
                        status: 'test',
                        title: 'For testing',
                        cards: [],
                    },

                    {
                        unique: 4,
                        status: 'complete',
                        title: 'Completed',
                        cards: [],
                    }
                ],
            }
        },

        methods: {
            addCard(unique) {
               let card = {
                   unique: Date.now(),
                   title: 'Новая задача',
                   desc: 'Описание задачи',
                   isEdit: false,
                   amountEdit: 0,
                   dates: {
                       creation: Date.now(),
                       edit: null,
                       completion: null,
                       deadline: null,
                   },
               };

               this.columns.forEach(column => {
                   if(column.unique === unique) column.cards.push(card);
               });
            },

            changeCard(columnUnique, cardUnique, action, obj=null) {
                this.columns.forEach(column => {
                    if(column.unique === columnUnique) {
                        column.cards.forEach((card, index) => {
                            if(card.unique === cardUnique) {
                                if(action === 'delete') column.cards.splice(index, 1);
                                else if(action === 'update') {
                                    let entries = Object.entries(obj);
                                    entries.forEach(entry => {
                                        if(entry[0] !== 'dates') card[`${entry[0]}`] = entry[1];
                                        else {
                                            let dates = Object.entries(entry[1]);
                                            dates.forEach(date => {
                                                if(typeof date[1] === 'string') card.dates[`${date[0]}`] = this.parseDateToTimestamp(date[1]);
                                                else card.dates[`${date[0]}`] = date[1];
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }, //changeCard

            parseDateToTimestamp(str) {
                let values = str.split('.');
                values[1] = values[1] - 1;
                values = values.map(value => {
                   return +value;
                }).reverse();

                let timestamp = new Date(...values).getTime();
                return timestamp;
            }
        }

    };

    let columnBody = {
        template: columnTemplate,

        props: {
            unique: {
                type: Number,
                required: true
            },

            status: {
                type: String,
                required: true
            },

            title: {
                type: String,
                required: true
            },

            cards: {
                type: Array,
                required: false
            }
        },

        data() {
            return {

            }
        },
    };

    let cardBody = {
        template: cardTemplate,

        props: {
            columnUnique: {
                type: Number,
                required: true
            },

            inputInfo: {
                type: Object,
                required: true
            },

            className: {
                type: String,
                required: false
            },
        },

        data() {
            return {

            }
        },

        methods: {
            changeEditStatus() {
                eventBus.$emit('card-edit', this.columnUnique, this.inputInfo.unique, true);
            },

            parseDateFromTimestamp(timestamp) {
                if(timestamp !== null) {
                    let date = new Date(timestamp);
                    let year = date.getFullYear();
                    let month = date.getMonth() + 1;
                    let day = date.getDate();
                    month = month < 10? `0${month}`: month;
                    day = day < 10? `0${day}`: day;
                    let str = year + '.' + month + '.' + day;
                    return str;
                } else return '';
            },

            deleteCard() {
                eventBus.$emit('delete-card', this.columnUnique, this.inputInfo.unique);
            }
        }
    };

    let cardEditBody = {
        template: cardEditTemplate,

        props: {
            className: {
                type: String,
                required: true
            },

            initialValues: {
                type: Object,
                required: true
            },

            columnUnique: {
                type: Number,
                required: true
            },

            formattedDeadline: {
                type: String,
                required: true
            },

            formattedCreation: {
                type: String,
                required: true
            }
        },

        data() {
            return {
                title: this.initialValues.title,
                desc: this.initialValues.desc,
                deadline: this.formattedDeadline,
                timeEdit: Date.now(),
                errors: {}
            }
        },

        computed: {
            rows() {
                if(this.desc.length === 0) return 1;
                return Math.ceil(this.desc.length / 23);
            }
        },

        methods: {
            save() {
                let errors = {};
                if(this.deadline.search(/^\d{2}\.\d{2}\.\d{4}$/) === -1) errors.deadline = 'Неверный формат';
                if(Object.keys(errors).length !== 0) this.errors = errors;
                else {
                    eventBus.$emit('save-card', this.columnUnique, this.initialValues.unique, this.title, this.desc, this.deadline, this.timeEdit, ++this.initialValues.amountEdit);
                }
            },

            cancel() {
                eventBus.$emit('card-edit',this.columnUnique, this.initialValues.unique, false);
            }
        }
    }

    Vue.component('board', boardBody);
    Vue.component('column', columnBody);
    Vue.component('card', cardBody);
    Vue.component('card-edit', cardEditBody);
    let app = new Vue({el: '#app'});
});


async function getTemplates(...pathTemplates) {
    let promises = [];

    for(let template of pathTemplates) {
        let promise = new Promise((resolve, reject) => {
            fetch(template).then(
                response => {
                    if(response.ok) resolve(response.text());
                    else reject('Ошибка');
                });
        });

        promises.push(promise);
    }

    let result = await Promise.all(promises);
    return result;
}