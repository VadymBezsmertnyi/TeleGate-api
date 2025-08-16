import GroupModel from "../groups/group.model";
import MemberModel from "../members/member.model";
import { GroupDataI, MemberDataI } from "./bot-telegram.types";
import UserModel from "../users/users.model";

export const getUserPhotoUrl = async (
  bot: any,
  userId: string
): Promise<string | undefined> => {
  try {
    // Спочатку спробуємо отримати інформацію про користувача
    let userInfo: any = null;
    try {
      userInfo = await bot.telegram.getChat(parseInt(userId));
      
      // Перевіряємо, чи є фотографія в userInfo
      if (userInfo && userInfo.photo) {
        const file = await bot.telegram.getFile(userInfo.photo.big_file_id);
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        
        if (botToken && file && file.file_path) {
          return `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
        }
      }
    } catch (userError) {
      console.warn(`⚠️ Не вдалося отримати інформацію про користувача ${userId}:`, userError);
    }

    // Якщо не вдалося отримати через userInfo, спробуємо getUserProfilePhotos
    const userPhotos = await bot.telegram.getUserProfilePhotos(
      parseInt(userId),
      { limit: 1 }
    );

    if (userPhotos.total_count > 0 && userPhotos.photos.length > 0) {
      const photo = userPhotos.photos[0][0];
      const file = await bot.telegram.getFile(photo.file_id);
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      if (botToken && file && file.file_path) {
        return `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
      }
    }

    return undefined;
  } catch (error) {
    console.warn(`Помилка при отриманні фото користувача ${userId}:`, error);
    return undefined;
  }
};

export const createOrUpdateMember = async (memberData: MemberDataI) => {
  const existingMember = await MemberModel.findOne({
    tgUserId: memberData.tgUserId,
  });

  if (existingMember) {
    // Оновлюємо фотографію якщо вона змінилася
    if (
      memberData.photoUrl &&
      memberData.photoUrl !== existingMember.photoUrl
    ) {
      existingMember.photoUrl = memberData.photoUrl;
    }
    
    // Оновлюємо інформацію про приватність
    if (memberData.hasPrivateForwards !== undefined) {
      existingMember.hasPrivateForwards = memberData.hasPrivateForwards;
    }
    
    if (memberData.privacySettings && existingMember.privacySettings) {
      if (memberData.privacySettings.profilePhotos) {
        existingMember.privacySettings.profilePhotos = memberData.privacySettings.profilePhotos;
      }
      if (memberData.privacySettings.lastSeen) {
        existingMember.privacySettings.lastSeen = memberData.privacySettings.lastSeen;
      }
      if (memberData.privacySettings.forwards) {
        existingMember.privacySettings.forwards = memberData.privacySettings.forwards;
      }
    }
    
    await existingMember.save();
    return existingMember;
  }

  const newMember = new MemberModel({
    tgUserId: memberData.tgUserId,
    isBot: memberData.isBot,
    firstName: memberData.firstName,
    lastName: memberData.lastName,
    username: memberData.username,
    languageCode: memberData.languageCode,
    canJoinGroups: memberData.canJoinGroups,
    canReadAllGroupMessages: memberData.canReadAllGroupMessages,
    supportsInlineQueries: memberData.supportsInlineQueries,
    photoUrl: memberData.photoUrl,
    hasPrivateForwards: memberData.hasPrivateForwards || false,
    privacySettings: memberData.privacySettings || {
      profilePhotos: 'contacts',
      lastSeen: 'contacts',
      forwards: 'contacts'
    },
    user: memberData.userId,
  });

  const savedMember = await newMember.save();

  if (!memberData.isBot) {
    try {
      const user = await UserModel.findOne({
        telegramId: parseInt(memberData.tgUserId),
      });
      if (user) {
        savedMember.user = user._id;
        await savedMember.save();

        await UserModel.findByIdAndUpdate(user._id, {
          $addToSet: { members: savedMember._id },
        });
      }
    } catch (error) {
      console.warn("Помилка при зв'язуванні члена з користувачем:", error);
    }
  }

  return savedMember;
};

export const createOrUpdateGroup = async (groupData: GroupDataI) => {
  const existingGroup = await GroupModel.findOne({
    tgChatId: groupData.tgChatId,
  });
  if (existingGroup) {
    existingGroup.botStatus = groupData.botStatus;
    existingGroup.addedBy = groupData.addedBy as any;
    if (groupData.title) existingGroup.title = groupData.title;
    if (groupData.description)
      existingGroup.description = groupData.description;
    if (groupData.photoUrl) existingGroup.photoUrl = groupData.photoUrl;
    return await existingGroup.save();
  }

  const newGroup = new GroupModel({
    tgChatId: groupData.tgChatId,
    type: groupData.type,
    title: groupData.title,
    description: groupData.description,
    photoUrl: groupData.photoUrl,
    isForum: groupData.isForum,
    allMembersAreAdministrators: groupData.allMembersAreAdministrators,
    acceptedGiftTypes: groupData.acceptedGiftTypes,
    botStatus: groupData.botStatus,
    addedBy: groupData.addedBy,
  });

  return await newGroup.save();
};

export const synchronizeGroupMemberRelationship = async (
  groupId: string,
  memberId: string,
  shouldAdd: boolean = true
) => {
  try {
    if (shouldAdd) {
      await GroupModel.findByIdAndUpdate(groupId, {
        $addToSet: { members: memberId },
      });
      await MemberModel.findByIdAndUpdate(memberId, {
        $addToSet: { groups: groupId },
      });
      const member = await MemberModel.findById(memberId);
      if (member && member.user) {
        await UserModel.findByIdAndUpdate(member.user, {
          $addToSet: { groups: groupId },
        });
        await GroupModel.findByIdAndUpdate(groupId, {
          $addToSet: { users: member.user },
        });
      }
    } else {
      await GroupModel.findByIdAndUpdate(groupId, {
        $pull: { members: memberId },
      });
      await MemberModel.findByIdAndUpdate(memberId, {
        $pull: { groups: groupId },
      });
      const member = await MemberModel.findById(memberId);
      if (member && member.user) {
        await UserModel.findByIdAndUpdate(member.user, {
          $pull: { groups: groupId },
        });
        await GroupModel.findByIdAndUpdate(groupId, {
          $pull: { users: member.user },
        });
      }
    }
  } catch (error) {
    console.warn(
      "Помилка при синхронізації зв'язків групи та учасника:",
      error
    );
  }
};

export const determineRole = (
  status: string
): "admin" | "moderator" | "member" => {
  switch (status) {
    case "creator":
    case "administrator":
      return "admin";
    case "member":
      return "member";
    default:
      return "member";
  }
};

export const updateGroupInfoFromTelegram = async (chatId: string, bot: any) => {
  try {
    const chat = await bot.telegram.getChat(chatId);
    let photoUrl: string | undefined;
    if (chat.photo) {
      try {
        const file = await bot.telegram.getFile(chat.photo.big_file_id);
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (botToken)
          photoUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
      } catch (error) {
        console.warn("Помилка при отриманні фото групи:", error);
      }
    }

    const groupData: Partial<GroupDataI> = {
      title: chat.title,
      description: chat.description,
      photoUrl,
    };

    const existingGroup = await GroupModel.findOne({ tgChatId: chatId });
    if (existingGroup) {
      if (groupData.title) existingGroup.title = groupData.title;
      if (groupData.description)
        existingGroup.description = groupData.description;
      if (groupData.photoUrl) existingGroup.photoUrl = groupData.photoUrl;
      await existingGroup.save();

      return existingGroup;
    }

    return null;
  } catch (error) {
    console.warn("Помилка при оновленні інформації про групу:", error);
    return null;
  }
};

export const processMentionedUsers = async (
  bot: any,
  message: any,
  groupId: string
): Promise<void> => {
  try {
    console.log(`🔍 Аналіз повідомлення для згадок...`);
    console.log(`📝 Message type:`, message.type || 'text');
    console.log(`📝 Message text:`, message.text);
    console.log(`📋 Message entities:`, JSON.stringify(message.entities, null, 2));
    console.log(`📊 Entities type:`, typeof message.entities);
    console.log(`📊 Is array:`, Array.isArray(message.entities));
    
    // Перевіряємо, чи є текст в повідомленні
    if (!message.text) {
      console.log(`❌ Повідомлення не містить тексту`);
      return;
    }
    
    // Перевіряємо, чи є @ в тексті
    if (!message.text.includes('@')) {
      console.log(`❌ Повідомлення не містить @ символів`);
      // Але все одно продовжуємо для reply/forwarded повідомлень
    }
    
    // Перевіряємо наявність згадок в повідомленні
    if (!message.entities || !Array.isArray(message.entities)) {
      console.log(`❌ Немає entities або entities не є масивом`);
      return;
    }

    const mentionedUsers: string[] = [];

    // Знаходимо всі згадки користувачів
    for (const entity of message.entities) {
      console.log(`🔍 Entity:`, JSON.stringify(entity, null, 2));
      console.log(`📋 Entity type:`, entity.type);
      console.log(`👤 Entity user:`, entity.user);
      
      if (entity.type === 'mention' && entity.user) {
        console.log(`✅ Знайдено mention з user:`, entity.user.id);
        mentionedUsers.push(entity.user.id.toString());
      } else if (entity.type === 'text_mention' && entity.user) {
        console.log(`✅ Знайдено text_mention з user:`, entity.user.id);
        mentionedUsers.push(entity.user.id.toString());
      } else if (entity.type === 'mention' && !entity.user) {
        console.log(`⚠️ Entity mention без user об'єкта, буде оброблено через regex`);
      } else if (entity.type === 'text_mention' && !entity.user) {
        console.log(`⚠️ Entity text_mention без user об'єкта, буде оброблено через regex`);
      } else {
        console.log(`❌ Entity не є згадкою користувача`);
      }
    }

    // Додаткова перевірка: шукаємо @username в тексті
    if (message.text && typeof message.text === 'string') {
      const mentionRegex = /@(\w+)/g;
      const matches = message.text.match(mentionRegex);
      if (matches) {
        console.log(`🔍 Знайдено @username в тексті:`, matches);
        for (const match of matches) {
          const username = match.substring(1); // Видаляємо @
          console.log(`👤 Шукаємо користувача з username:`, username);
          
          try {
            // Спробуємо знайти користувача за username через getChat
            const userChat = await bot.telegram.getChat(`@${username}`);
            if (userChat && userChat.id) {
              console.log(`✅ Знайдено користувача за username:`, userChat.id);
              if (!mentionedUsers.includes(userChat.id.toString())) {
                mentionedUsers.push(userChat.id.toString());
              }
            }
          } catch (error) {
            console.log(`❌ Не вдалося знайти користувача за username ${username}:`, error);
            
            // Альтернативний спосіб: спробуємо через getChatMember
            try {
              const chatMember = await bot.telegram.getChatMember(message.chat.id, `@${username}`);
              if (chatMember && chatMember.user) {
                console.log(`✅ Знайдено користувача через getChatMember:`, chatMember.user.id);
                if (!mentionedUsers.includes(chatMember.user.id.toString())) {
                  mentionedUsers.push(chatMember.user.id.toString());
                }
              }
            } catch (memberError) {
              console.log(`❌ Не вдалося знайти користувача через getChatMember:`, memberError);
            }
          }
        }
      }
    }

    console.log(`📝 Знайдено згадок користувачів: ${mentionedUsers.length}`);

    // Перевіряємо reply повідомлення
    if (message.reply_to_message && message.reply_to_message.from) {
      console.log(`🔄 Це reply повідомлення від користувача:`, message.reply_to_message.from.id);
      if (!mentionedUsers.includes(message.reply_to_message.from.id.toString())) {
        mentionedUsers.push(message.reply_to_message.from.id.toString());
        console.log(`✅ Додано користувача з reply повідомлення`);
      }
    }

    // Перевіряємо forwarded повідомлення
    if (message.forward_from) {
      console.log(`📤 Це forwarded повідомлення від користувача:`, message.forward_from.id);
      if (!mentionedUsers.includes(message.forward_from.id.toString())) {
        mentionedUsers.push(message.forward_from.id.toString());
        console.log(`✅ Додано користувача з forwarded повідомлення`);
      }
    }

    // Перевіряємо нових членів групи
    if (message.new_chat_members && Array.isArray(message.new_chat_members)) {
      console.log(`👥 Нові члени групи:`, message.new_chat_members.length);
      for (const newMember of message.new_chat_members) {
        if (newMember.id && !mentionedUsers.includes(newMember.id.toString())) {
          mentionedUsers.push(newMember.id.toString());
          console.log(`✅ Додано нового члена групи:`, newMember.id);
        }
      }
    }

    // Видаляємо дублікати
    const uniqueUsers = [...new Set(mentionedUsers)];
    console.log(`📊 Загальна кількість користувачів для обробки: ${uniqueUsers.length}`);
    console.log(`👥 Список унікальних користувачів:`, uniqueUsers);

    // Додаємо відправника повідомлення, якщо він ще не в списку
    // (зазвичай відправник вже оброблений в основному коді, тому пропускаємо)
    if (message.from && message.from.id && !mentionedUsers.includes(message.from.id.toString())) {
      console.log(`ℹ️ Відправник ${message.from.id} вже оброблений в основному коді, пропускаємо`);
    } else if (message.from && message.from.id) {
      console.log(`ℹ️ Відправник вже в списку:`, message.from.id);
    }

    // Обробляємо кожного згаданого користувача
    for (const userId of uniqueUsers) {
      try {
        console.log(`👤 Обробляємо згаданого користувача: ${userId}`);
        
        // Перевіряємо, чи користувач вже існує в базі даних
        const existingMember = await MemberModel.findOne({ tgUserId: userId });
        if (existingMember) {
          console.log(`ℹ️ Користувач ${userId} вже існує в БД, оновлюємо інформацію`);
        }
        
        // Отримуємо інформацію про користувача
        const userInfo = await bot.telegram.getChat(parseInt(userId));
        
        // Отримуємо фотографію користувача
        let photoUrl: string | undefined;
        try {
          photoUrl = await getUserPhotoUrl(bot, userId);
        } catch (photoError) {
          console.warn(`⚠️ Помилка отримання фото для згаданого користувача ${userId}:`, photoError);
        }

        // Створюємо або оновлюємо члена
        const memberData: MemberDataI = {
          tgUserId: userId,
          isBot: userInfo.is_bot || false,
          firstName: userInfo.first_name,
          lastName: userInfo.last_name,
          username: userInfo.username,
          languageCode: userInfo.language_code,
          photoUrl: photoUrl,
          hasPrivateForwards: userInfo.has_private_forwards || false,
          privacySettings: {
            profilePhotos: userInfo.has_private_forwards ? 'contacts' : 'everybody',
            lastSeen: userInfo.has_private_forwards ? 'contacts' : 'everybody',
            forwards: userInfo.has_private_forwards ? 'contacts' : 'everybody'
          }
        };

        const member = await createOrUpdateMember(memberData);
        
        // Синхронізуємо зв'язок з групою
        await synchronizeGroupMemberRelationship(
          groupId,
          member._id.toString(),
          true
        );

        console.log(`✅ Згаданий користувач ${userId} оброблений успішно`);
        
      } catch (userError) {
        console.warn(`⚠️ Помилка обробки згаданого користувача ${userId}:`, userError);
      }
    }
  } catch (error) {
    console.warn(`⚠️ Помилка обробки згадок користувачів:`, error);
  }
};
