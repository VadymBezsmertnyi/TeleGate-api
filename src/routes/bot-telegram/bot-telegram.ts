import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const startBotTelegram = async () => {
  dotenv.config();

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("❌ TELEGRAM_BOT_TOKEN не задано");
    return;
  }

  console.log("🔑 Токен знайдено, ініціалізація бота...");

  const bot = new Telegraf(token);

  bot.on("my_chat_member", async (ctx) => {
    const chat = ctx.update.my_chat_member.chat;
    const newStatus = ctx.update.my_chat_member.new_chat_member.status;

    if (
      chat.type === "group" ||
      chat.type === "supergroup" ||
      chat.type === "channel"
    ) {
      console.log("Назва:", chat.title);
      chat.title = chat.title || "Без назви";
      /* await saveChatToDB({
    chatId: chat.id,
    title: chat.title,
    type: chat.type,
    botStatus: newStatus,
  }); */
    } else {
      console.log("Це приватний чат:", chat.username || chat.first_name);
      /* await saveChatToDB({
    chatId: chat.id,
    title: chat.title,
    type: chat.type,
    botStatus: newStatus,
  }); */
    }

    if (newStatus === "administrator" || newStatus === "member")
      await ctx.reply("Привіт! Я підключився до групи 🚀");
  });

  bot.on("chat_member", async (ctx) => {
    console.log("Новий статус чату:", ctx.update.chat_member);
    // new_chat_member.user — це сам користувач, якого торкнулась подія
    //await upsertUser(new_chat_member.user); // збережи user у БД
    /* await upsertMembership(
    chat.id,
    new_chat_member.user.id,
    new_chat_member.status
  );  */ // member/administrator/creator/left/kicked
  });

  // 3) фіксуй активних дописувачів (коли privacy off)
  bot.on("message", async (ctx) => {
    console.log("Новий допис:", ctx);
    /* await upsertUser(from);
  await upsertMembership(chat.id, from.id, "member"); // актуалізуй статус */
  });

  bot.command("admins", async (ctx) => {
    const admins = await ctx.telegram.getChatAdministrators(ctx.chat!.id);
    await ctx.reply(
      "Адміни:\n" + admins.map((a) => `• ${a.user.first_name}`).join("\n")
    );
  });

  try {
    console.log("🔄 Перезапуск бота...");

    // Спробуємо спочатку отримати інформацію про бота
    try {
      const me = await bot.telegram.getMe();
      console.log(`🤖 Інформація про бота: @${me.username} (ID: ${me.id})`);
    } catch (tokenError) {
      console.error("❌ Помилка токена або доступу до API:", tokenError);
      return;
    }

    console.log("🚀 Запускаю бота...");
    await bot.launch();
    console.log(`✅ Бот успішно запущено! Username: @${bot.botInfo?.username}`);

    process.once("SIGINT", () => {
      console.log("🛑 Отримано SIGINT, зупиняю бота...");
      bot.stop("SIGINT");
    });
    process.once("SIGTERM", () => {
      console.log("🛑 Отримано SIGTERM, зупиняю бота...");
      bot.stop("SIGTERM");
    });
  } catch (e) {
    console.error("❌ Помилка запуску бота:", e);
  }
};

export default startBotTelegram;
