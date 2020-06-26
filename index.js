const Telegraf = require( 'telegraf' );
const Markup = require( 'telegraf/markup' );
const cron = require( 'node-cron' );

const express = require( 'express' );
const app = express();
const port = process.env.PORT || 3000;

const bot = new Telegraf( '1137259099:AAHwplIAUxASWAiTTJZ3n1mJRgBXb1LkKus' );

let state = {
  firstTrainingPeople: {
    title: '19:30',
    count: 0,
    people: [],
  },
  secondTrainingPeople: {
    title: '21:00',
    count: 0,
    people: [],
  },
  collectiveTraining: {
    title: '20:00',
    count: 0,
    people: [],
  }
};

let isAllow = false;

cron.schedule( '10 10 * * 1,3,5', () => {
  isAllow = true;
  state = {};
  bot.telegram.sendMessage(
    '-321378259',
    'Ребята записываемся на тренировку через бота @cortezmma_bot'
  );
} );

bot.start( ( ctx ) => ctx.reply( 'Чтобы выбрать время для тренировки напиши /choose. Бот активен только в дни тренировок (Понедельник, Среда, Пятница)' ) );

if ( isAllow ) {
  bot.command( 'choose', ( { reply } ) => {
    reply( 'Выберите время, бойцы !!!', Markup
      .keyboard( [
        [ '👊 19:30 (+)' ],
        [ '👊 21:00 (+)' ],
        [ '👊 19:30 (-)' ],
        [ '👊 21:00 (-)' ],
      ] )
      .oneTime()
      .resize()
      .extra()
    )
  } );
}

bot.hears( '👊 19:30 (+)', ( ctx ) => {
  state.firstTrainingPeople.count += 1;
  state.firstTrainingPeople.people.push( {
    firstName: ctx.update.message.from.first_name,
    lastName: ctx.update.message.from.last_name,
  } );
  state.collectiveTraining.count += 1;
  state.collectiveTraining.people.push( {
    firstName: ctx.update.message.from.first_name,
    lastName: ctx.update.message.from.last_name,
  } )
} );

bot.hears( '👊 21:00 (+)', ( ctx ) => {
  state.secondTrainingPeople.count += 1;
  state.secondTrainingPeople.people.push( {
    firstName: ctx.update.message.from.first_name,
    lastName: ctx.update.message.from.last_name,
  } );
  state.collectiveTraining.count += 1;
  state.collectiveTraining.people.push( {
    firstName: ctx.update.message.from.first_name,
    lastName: ctx.update.message.from.last_name,
  } )
} );

bot.hears( '👊 19:30 (-)', ( ctx ) => {
  state.firstTrainingPeople.count += 1;
  state.firstTrainingPeople.people.push( {
    firstName: ctx.update.message.from.first_name,
    lastName: ctx.update.message.from.last_name,
  } );
} );

bot.hears( '👊 21:00 (-)', ( ctx ) => {
  state.secondTrainingPeople.count += 1;
  state.secondTrainingPeople.people.push( {
    firstName: ctx.update.message.from.first_name,
    lastName: ctx.update.message.from.last_name,
  } );
} );

cron.schedule( '0 16 * * 1,3,5', () => {

  if ( state.firstTrainingPeople.count + state.secondTrainingPeople.count >= 13 ) {

    let firstUsers = state.firstTrainingPeople.people.map( ( i ) => {
      return i.firstName;
    } );

    let secondUsers = state.secondTrainingPeople.people.map( ( i ) => {
      return i.firstName;
    } );

    bot.telegram.sendMessage(
      '-321378259',
      `Первая группа 19:30 (${state.firstTrainingPeople.count}) (${firstUsers}).Вторая группа 21:00 (${state.secondTrainingPeople.count}) (${secondUsers})`,
      { parse_mode: "HTML" }
    )
  } else {

    let collectiveUsers = state.collectiveTraining.people.map( ( i ) => {
      return i.firstName;
    } );

    bot.telegram.sendMessage(
      '-321378259',
      `Сегодня общая тренировка на 20:00.Количество людей ${state.collectiveTraining.count} (${collectiveUsers})`
    )
  }

} );

bot.launch();

app.listen( port, () => console.log( `Server on port ${port}` ) );