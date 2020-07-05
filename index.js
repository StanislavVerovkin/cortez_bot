require('dotenv').config();
const cron = require('node-cron');

const Telegraf = require('telegraf');
const Markup = require('telegraf/markup');
const app = require('./app');

const port = process.env.PORT || 3000;

const groupId = '-321378259';
const userId = '280891433';

const bot = new Telegraf(process.env.BOT_TOKEN);

let state = {
  firstTraining: [] ,
  secondTraining: [] ,
  collectiveTraining: [] ,
  badFighters: [] ,
};

bot.start(( ctx ) => {
  ctx.reply(
    `Привет ${ctx.from.first_name}! \n` +
    'Для выбора времени пиши /choose. \n' +
    'Бот активен только в дни тренировок. \n' +
    '(Понедельник, Среда, Пятница).'
  )
});

cron.schedule('06 20 * * 1,3,5' , () => {

  clearState();

  bot.telegram.sendMessage(
    groupId ,
    '🔴Внимание🔴\n' +
    '\n' +
    '📝 Предварительная запись\n' +
    '(До 16:00)\n' +
    '(Новые правила)\n' +
    '\n' +
    'Жмем сюда @cortezmma_bot \n' +
    'Выбираем время тренировки на которое вам удобно\n' +
    '🔹19:30\n' +
    '🔹21:00\n' +
    '\n' +
    'Усреднённое время - 20:00 \n' +
    'Где плюс означает, что вам удобно усреднённое время, а минус - неудобно\n'
  );

});

bot.command('choose' , ( { reply } ) => {
  reply('Выберите время, бойцы !!!' , Markup
    .keyboard([
      [ '👊 19:30 (+)' , '👊 19:30 (-)' ] ,
      [ '👊 21:00 (+)' , '👊 21:00 (-)' ] ,
      [ '👎 -' ] ,
    ])
    .oneTime()
    .resize()
    .extra()
  )
});

bot.hears('👊 19:30 (+)' , ( ctx ) => {
  setState('firstTraining' , ctx);
});

bot.hears('👊 21:00 (+)' , ( ctx ) => {
  setState('secondTraining' , ctx);
});

bot.hears('👊 19:30 (-)' , ( ctx ) => {
  setState('firstTraining' , ctx);
});

bot.hears('👊 21:00 (-)' , ( ctx ) => {
  setState('secondTraining' , ctx);
});

bot.hears('👎 -' , ( ctx ) => {
  setState('badFighters' , ctx);
});

bot.command('result' , () => {

  let firstFighters = mapUsers(state.firstTraining);
  let secondFighters = mapUsers(state.secondTraining);

  let firstArr = filterUsers(state.firstTraining);
  let secondArr = filterUsers(state.secondTraining);

  state.collectiveTraining = firstArr.concat(secondArr);

  let collectiveFighters = mapUsers(state.collectiveTraining);

  bot.telegram.sendMessage(
    userId ,
    '<b>19:30</b> \n' +
    `<i>Количество бойцов:</i> ${state.firstTraining.length} \n` +
    `<i>Бойцы:</i> ${firstFighters} \n` +
    '\n' +
    '<b>21:00</b> \n' +
    `<i>Количество бойцов:</i> ${state.secondTraining.length} \n` +
    `<i>Бойцы:</i> ${secondFighters} \n` +
    '\n' +
    '<b>20:00</b> \n' +
    `<i>Количество бойцов:</i> ${state.collectiveTraining.length} \n` +
    `<i>Бойцы:</i> ${collectiveFighters} \n` +
    '\n' +
    `<b>Бойцы которые минуснулись</b> \n` +
    `<i>Количество бойцов:</i> ${state.badFighters.length} \n` +
    `<i>Бойцы:</i> ${state.badFighters} \n` ,
    { parse_mode: "HTML" }
  )

});

cron.schedule('07 20 * * 1,3,5' , () => {
  bot.telegram.sendMessage(
    userId ,
    'Привет! Время проверить кто будет на тренировке. \n' +
    'Жми /result чтобы узнать результат.'
  )
});

bot.launch();

function setState ( choiceTraining , ctx ) {
  switch ( ctx.match ) {
    case '👊 19:30 (+)':
      if ( state[ choiceTraining ].length !== 0 ) {
        checkOrder(choiceTraining , ctx , true);
      } else {
        createFirstOrder(choiceTraining , ctx , true);
      }
      break;
    case '👊 19:30 (-)':
      if ( state[ choiceTraining ].length !== 0 ) {
        checkOrder(choiceTraining , ctx , true);
      } else {
        createFirstOrder(choiceTraining , ctx , true);
      }
      break;
    case '👊 21:00 (+)':
      if ( state[ choiceTraining ].length !== 0 ) {
        checkOrder(choiceTraining , ctx , true);
      } else {
        createFirstOrder(choiceTraining , ctx , true);
      }
      break;
    case '👊 21:00 (-)':
      if ( state[ choiceTraining ].length !== 0 ) {
        checkOrder(choiceTraining , ctx , true);
      } else {
        createFirstOrder(choiceTraining , ctx , true);
      }
      break;
    case '👎 -':
      state[ choiceTraining ].push(ctx.update.message.from.first_name);
      ctx.reply('Жаль что тебя не будет 😟');
      break;
  }
}

function clearState () {
  state.firstTraining = [];
  state.secondTraining = [];
  state.collectiveTraining = [];
  state.badFighters = [];
}

function mapUsers ( state ) {
  return state.map(( i ) => {
    return i.name;
  })
}

function filterUsers ( arr ) {
  return arr.filter(( i ) => {
    return i.additionalTime;
  })
}

function checkOrder ( choiceTraining , ctx , additionalTime ) {
  state[ choiceTraining ].forEach(i => {
    if ( ctx.from.id === i.id ) {
      ctx.reply('Дядя, ты уже записался!');
    } else {
      createFirstOrder(choiceTraining , ctx , additionalTime);
    }
  });
}

function createFirstOrder ( choiceTraining , ctx , additionalTime ) {
  state[ choiceTraining ].push({
    time: ctx.match ,
    additionalTime ,
    id: ctx.from.id ,
    name: ctx.update.message.from.first_name ,
  });
  ctx.reply('Спасибо за запись! Ждем!')
}

app.listen(port , () => console.log(`Server on port ${port}`));