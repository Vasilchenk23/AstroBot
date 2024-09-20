const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const adminChatId = process.env.ADMIN_CHAT_ID;

let userState = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '👋 Привет! Как тебя зовут? 😊');
  userState[chatId] = { step: 'name' };
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (userState[chatId] && userState[chatId].step) {
    switch (userState[chatId].step) {
      case 'name':
        userState[chatId].name = msg.text;

        bot.sendMessage(chatId, '📱 Теперь, пожалуйста, поделись своими контактами:', {
          reply_markup: {
            keyboard: [
              [{ text: '📞 Отправить контакт', request_contact: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        });

        userState[chatId].step = 'contacts';
        break;

      case 'contacts':
        if (msg.contact) {
          userState[chatId].contacts = msg.contact.phone_number;
          bot.sendMessage(chatId, 'Спасибо! 🙌 Какой вопрос ты хочешь задать? ✍️');
          userState[chatId].step = 'question';
        } else {
          bot.sendMessage(chatId, '❗ Пожалуйста, воспользуйся кнопкой для отправки контакта.');
        }
        break;

      case 'question':
        userState[chatId].question = msg.text;

        bot.sendMessage(adminChatId, `🔔 Новый вопрос от ${userState[chatId].name}!\n📞 Контакты: ${userState[chatId].contacts}\n❓ Вопрос: ${userState[chatId].question}`);
        bot.sendMessage(chatId, 'Спасибо! 🙏 Я передал твой вопрос. Ожидай ответа. 💬');

        delete userState[chatId];
        break;

      default:
        bot.sendMessage(chatId, '⚠️ Пожалуйста, напиши /start, чтобы начать заново.');
        break;
    }
  }
});
