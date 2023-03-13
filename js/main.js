let boardTemplate = 'templates/board.html';
let columnTemplate = 'templates/column.html';
let cardTemplate = 'templates/card.html';


let templates = getTemplates(columnTemplate, boardTemplate, cardTemplate);
templates.then(array => {
    columnTemplate = array[0];
    boardTemplate = array[1];
    cardTemplate = array[2];

    let boardBody = {
        template: boardTemplate,

        beforeUpdate() {
            console.log('изменения')
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

               console.log(this.columns);
            },
        }

    }; // ..boardBody

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
          className: {
              type: String,
              required: false
          }
        },

        data() {
            return {

            }
        }
    };

    Vue.component('board', boardBody);
    Vue.component('column', columnBody);
    Vue.component('card', cardBody);
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