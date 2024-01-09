const axios = require('axios');
const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const Parse = require('parse/node');

Parse.initialize("hZs01wOa42vE6ZRTfBvZqOjfBOlZb0ghi6w33IQT","WycOEo4n1SeLe9O4ZH3MdAgBURAFSWnc1ru4wGJF");
Parse.serverURL = 'https://parseapi.back4app.com/'

let movieArr = [];

let now = new Date();
now = now.toISOString();
let slicer = now.indexOf('T');
now = now.slice(0, 10);
let i = 0;
axios({
    method: 'get',
    url: `https://kinokassa.kinoplan24.ru/api/v2/release/playbill?city_id=46&date=${now}`,
    headers: {'X-Application-Token': 'Pshm8LrxVQe19ouONPLD5SXWtaDhIKfM', 'X-Platform': 'widget'}
  })
    .then(function (response) {
        while(i< response.data.releases.length){
          let seances = []
          response.data.releases[i].seances.forEach(function (seance){
            let time = seance.start_date_time;
            let slicer = time.indexOf('T') + 1;
            time = time.slice(slicer);
            slicer = time.indexOf('.');
            time = time.slice(0, slicer);
            time = time.slice(0, -3);
            seances.push(time)
          })
            movieArr.push({ seances: seances, title: response.data.releases[i].title, poster: response.data.releases[i].poster,
               genre : response.data.releases[i].genres[0].title });
            i++;
        }
    });

    let movieArr2 = [];
    let seances2 = [];

    axios({
      method: 'get',
      url: `https://smolensk.kinoafisha.info/cinema/8177009/schedule/`
    })
      .then(function (response) {
        //console.log(response.data);
        const dom = new JSDOM(response.data);
        const movies = dom.window.document.querySelectorAll(".showtimesMovie_name");
        movies.forEach(function (movie) {
          const seances = movie.closest(".showtimes_item").querySelectorAll('.session_time');
          let poster = movie.closest(".showtimes_item").querySelector('.showtimesMovie_poster').innerHTML;
          let genre = movie.closest(".showtimes_item").querySelector('.showtimesMovie_categories').textContent;
          let slicer = poster.indexOf('"')+ 1;
          poster = poster.slice(slicer);
          slicer = poster.indexOf('"')
          poster = poster.slice(0, slicer);
          seances2 = [];
          seances.forEach(function (seance) {
            seances2.push(seance.textContent);
          })
          movieArr2.push({title: movie.textContent, seances: seances2, poster: poster, genre: genre});
        })
      });

      let movieArr3 = [];
      axios({
        method: 'get',
        url: `https://kinokassa.kinoplan24.ru/api/v2/release/playbill?city_id=46&date=${now}`,
        headers: {'X-Application-Token': 'TpoJflUI4lY945APjVbo7nAHsLAhbw4m', 'X-Platform': 'widget'}
      })
        .then(function (response) {
          while(i< response.data.releases.length){
            let seances = []
            response.data.releases[i].seances.forEach(function (seance){
              let time = seance.start_date_time;
              let slicer = time.indexOf('T') + 1;
              time = time.slice(slicer);
              slicer = time.indexOf('.');
              time = time.slice(0, slicer);
              time = time.slice(0, -3);
              seances.push(time)
            })
              movieArr3.push({ seances: seances, title: response.data.releases[i].title, poster: response.data.releases[i].poster,
                 genre : response.data.releases[i].genres[0].title});
              i++;
          }
        })

const bot = new Telegraf('6715614972:AAGyeJQ0r2mWzSlKXH9kJ3I1zLcK4c8exXo');

let { Markup } = require("telegraf");

function getMenu() {
  return Markup.keyboard([
    ["Смена"],["Мираж"],["Сильвер Синема"]
  ]).resize();
}
bot.start(ctx => {
    ctx.reply('Здравствуйте! Выберите кинотеатр, чтобы узнать доступные сеансы:', getMenu())
})
bot.hears("Смена", (ctx) => {
    movieArr.forEach((movie) => {ctx.replyWithHTML(`<b>${movie.title}</b>\n\n Жанр: ${movie.genre}\n\n` + `${movie.seances}` + `\n\n${movie.poster}`);})
})
bot.hears("Мираж", (ctx) => {
  movieArr2.forEach((movie) => {ctx.replyWithHTML(`<b>${movie.title}</b>\n\n Жанр: ${movie.genre}\n\n` + `${movie.seances}`  + `\n\n${movie.poster}`)})
})
bot.hears("Сильвер Синема", (ctx) => {
  movieArr3.forEach((movie) => {ctx.replyWithHTML(`<b>${movie.title}</b>\n\n Жанр: ${movie.genre}\n\n` + `${movie.seances}` + `\n\n${movie.poster}`)})
})

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
