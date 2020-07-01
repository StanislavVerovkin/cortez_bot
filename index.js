require( 'dotenv' ).config();

const Telegraf = require( 'telegraf' );
const Markup = require( 'telegraf/markup' );
const app = require( './app' );

const port = process.env.PORT || 3000;
const groupId = '-321378259';

const bot = new Telegraf( process.env.BOT_TOKEN );

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

bot.start( ( ctx ) => {
  ctx.reply(
    `Привет ${ctx.from.first_name}! \n` +
    'Для выбора времени пиши /choose. \n' +
    'Бот активен только в дни тренировок. \n' +
    '(Понедельник, Среда, Пятница).'
  )
} );

bot.command( 'send', () => {

  clearState();

  bot.telegram.sendMessage(
    groupId,
    '🔴Внимание🔴\n' +
    '\n' +
    '📝 Предварительная запись\n' +
    '(До 16:00)\n' +
    '(Новые правила)\n' +
    '\n' +
    'Ищем бота @cortezmma_bot \n' +
    'Выбираем время тренировки на которое вам удобно\n' +
    '🔹19:30\n' +
    '🔹21:00\n' +
    '\n' +
    'Усреднённое время - 20:00 \n' +
    '(в скобочках ставим + или -)\n' +
    'Где плюс означает, что вам удобно усреднённое время, а минус - неудобно\n'
  );
} );

bot.command( 'choose', ( { reply } ) => {
  reply( 'Выберите время, бойцы !!!', Markup
    .keyboard( [
      [ '👊 19:30 (+)' ],
      [ '👊 21:00 (+)' ],
      [ '👊 19:30 (-)' ],
      [ '👊 21:00 (-)' ],
      [ '👎 -' ],
    ] )
    .oneTime()
    .resize()
    .extra()
  )
} );

bot.hears( '👊 19:30 (+)', ( ctx ) => {
  setState( 'firstTrainingPeople', ctx );
} );

bot.hears( '👊 21:00 (+)', ( ctx ) => {
  setState( 'secondTrainingPeople', ctx );
} );

bot.hears( '👊 19:30 (-)', ( ctx ) => {
  setState( 'firstTrainingPeople', ctx );
} );

bot.hears( '👊 21:00 (-)', ( ctx ) => {
  setState( 'secondTrainingPeople', ctx );
} );

bot.command( 'calculate', () => {
  if ( state.firstTrainingPeople.count + state.secondTrainingPeople.count >= 13 ) {

    let firstUsers = mapUsers( state, 'firstTrainingPeople' );
    let secondUsers = mapUsers( state, 'secondTrainingPeople' );

    bot.telegram.sendMessage(
      groupId,
      'Сегодня тренировки по расписанию!\n' +
      '\n' +
      `1️⃣ 19:30-21:00 \n` +
      `<b>Количество бойцов:</b> ${state.firstTrainingPeople.count} \n` +
      `<b>Бойцы:</b> ${firstUsers} \n` +
      '\n' +
      `2️⃣ 21:00-22:30 \n` +
      `<b>Количество бойцов:</b> ${state.secondTrainingPeople.count} \n` +
      `<b>Бойцы:</b> ${secondUsers}`,
      { parse_mode: "HTML" }
    );

    clearState();

  } else if ( state.firstTrainingPeople.count + state.secondTrainingPeople.count === 0 ) {

    bot.telegram.sendMessage(
      groupId,
      'Нет ни одного бойца :('
    );

  } else {

    let collectiveUsers = mapUsers( state, 'collectiveTraining' );

    bot.telegram.sendMessage(
      groupId,
      'Сегодня ОДНА ОБЩАЯ тренировка 👇\n' +
      ' \n' +
      '20:00 - 21:30 \n' +
      '\n' +
      `<b>Количество бойцов:</b> ${state.collectiveTraining.count} \n` +
      `<b>Бойцы:</b> ${collectiveUsers}`,
      { parse_mode: "HTML" }
    );

    clearState();

  }
} );

bot.launch();

function setState ( choiceTraining, ctx ) {

  state[ choiceTraining ].count += 1;
  state[ choiceTraining ].people.push( {
    firstName: ctx.update.message.from.first_name,
    lastName: ctx.update.message.from.last_name,
  } );

  if ( ctx.match === '👊 19:30 (+)' || ctx.match === '👊 21:00 (+)' ) {
    state.collectiveTraining.count += 1;
    state.collectiveTraining.people.push( {
      firstName: ctx.update.message.from.first_name,
      lastName: ctx.update.message.from.last_name,
    } )
  }
}

function clearState () {
  state.firstTrainingPeople.count = 0;
  state.collectiveTraining.count = 0;
  state.secondTrainingPeople.count = 0;
  state.firstTrainingPeople.people = [];
  state.secondTrainingPeople.people = [];
  state.collectiveTraining.people = [];
}

function mapUsers ( state, userType ) {
  return state[ userType ].people.map( ( i ) => {
    return i.firstName;
  } )
}

app.listen( port, () => console.log( `Server on port ${port}` ) );