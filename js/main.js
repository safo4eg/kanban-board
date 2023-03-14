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

        beforeUpdate() {
            console.log('изменения')
        },

        mounted() {
            eventBus.$on('card-edit', (columnUnique, cardUnique) => {
                    this.columns.forEach(column => {
                        if(column.unique === columnUnique) {
                            column.cards.forEach(card => {
                                if(card.unique === cardUnique) {
                                    card.isEdit = true;
                                }
                            });
                        }
                    });
            });

            eventBus.$on('save-card', (columnUnique, cardUnique, title, desc, deadline) => {
                this.columns.forEach(column => {
                    if(column.unique === columnUnique) {
                        column.cards.forEach(card => {
                            if(card.unique === cardUnique) {
                                card.title = title;
                                card.desc = desc;
                                card.dates.deadline = deadline;
                                card.isEdit = false;
                            }
                        });
                    }
                });
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
                   dates: {
                       creation: Date.now(),
                       edit: null,
                       completion: null,
                       deadline: null
                   },
               };

               this.columns.forEach(column => {
                   if(column.unique === unique) column.cards.push(card);
               });
            },
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

        beforeUpdate() {
            console.log('change in card');
        },

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
                eventBus.$emit('card-edit', this.columnUnique, this.inputInfo.unique);
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
            }
        },

        data() {
            return {
                title: this.initialValues.title,
                desc: this.initialValues.desc,
                deadline: '',
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
                    eventBus.$emit('save-card', this.columnUnique, this.initialValues.unique, this.title, this.desc, this.deadline);
                }
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