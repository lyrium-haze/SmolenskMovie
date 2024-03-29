const axios = require('axios');
const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let smena = [];

let now = new Date();
now = now.toISOString();
let slicer = now.indexOf('T');
now = now.slice(0, 10);
let i = 0;
function kinokassaHandler(response, movieArr) {
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
}
axios({
    method: 'get',
    url: `https://kinokassa.kinoplan24.ru/api/v2/release/playbill?city_id=46&date=${now}`,
    headers: {'X-Application-Token': 'Pshm8LrxVQe19ouONPLD5SXWtaDhIKfM', 'X-Platform': 'widget'}
  })
    .then(function (response) {
      kinokassaHandler(response, smena);
    });

    let mirage = [];
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
          mirage.push({title: movie.textContent, seances: seances2, poster: poster, genre: genre});
        })
      });

      let silver = [];
      axios({
        method: 'get',
        url: `https://kinokassa.kinoplan24.ru/api/v2/release/playbill?city_id=46&date=${now}`,
        headers: {'X-Application-Token': 'TpoJflUI4lY945APjVbo7nAHsLAhbw4m', 'X-Platform': 'widget'}
      })
        .then(function (response) {
          kinokassaHandler(response, silver);
        })
        let sovr = [];
        axios({
          method: 'get',
          url: `https://kinokassa.kinoplan24.ru/api/v2/release/playbill?city_id=46&date=${now}`,
          headers: {'X-Application-Token': '9kC5cjMhH2AWQiiSLswBI7RJrcepOwNz', 'X-Platform': 'widget'}
        })
          .then(function (response) {
              kinokassaHandler(response, sovr);
          });


const bot = new Telegraf(process.env.BOT_TOKEN);

let { Markup } = require("telegraf");

function getMenu() {
  return Markup.keyboard([
    ["Смена"],["Мираж"],["Сильвер Синема"],["Современник"]
  ]).resize();
}
bot.start(ctx => {
    ctx.reply('Здравствуйте! Выберите кинотеатр, чтобы узнать доступные сеансы:', getMenu())
})
bot.hears("Смена", (ctx) => {
    smena.forEach((movie) => {ctx.replyWithHTML(`<b>${movie.title}</b>\n\n Жанр: ${movie.genre}\n\n` + `${movie.seances}` + `\n\n${movie.poster}`);})
})
bot.hears("Мираж", (ctx) => {
  mirage.forEach((movie) => {ctx.replyWithHTML(`<b>${movie.title}</b>\n\n Жанр: ${movie.genre}\n\n` + `${movie.seances}`  + `\n\n${movie.poster}`)})
})
bot.hears("Сильвер Синема", (ctx) => {
  silver.forEach((movie) => {ctx.replyWithHTML(`<b>${movie.title}</b>\n\n Жанр: ${movie.genre}\n\n` + `${movie.seances}` + `\n\n${movie.poster}`)})
})
bot.hears("Современник", (ctx) => {
  sovr.forEach((movie) => {ctx.replyWithHTML(`<b>${movie.title}</b>\n\n Жанр: ${movie.genre}\n\n` + `${movie.seances}` + `\n\n${movie.poster}`)})
})

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
