const fs = require("fs/promises");
const TelegramBot = require("node-telegram-bot-api");
const BlaguesAPI = require("blagues-api");
const text2png = require("text2png");

/* require("dotenv").config();
 */
const token = process.env.BOT_TOKEN;
const blagueToken = process.env.BLAGUES_TOKEN;
const blagues = new BlaguesAPI(blagueToken);
const jokesBot = new TelegramBot(token, { polling: true });

jokesBot.onText(/blague (.+)/, async (msg, match) => {
  const { id } = msg.chat;
  const blague = await blagues.fromId(match[1]);
  if (blague.status === 404) {
    jokesBot.sendMessage(id, "Déso, Blague non trouvée");
    return;
  }

  const part1 = `Type : ${blague.type}\nBlague : ${blague.joke}`;
  const part2 = `Réponse : ${blague.answer}`;

  jokesBot.sendMessage(id, part1);
  const t = setTimeout(() => jokesBot.sendMessage(id, part2), 5000);
  clearTimeout(t);
});

jokesBot.onText(/blagueImage (.+)/, async (msg, match) => {
  const { id } = msg.chat;
  const blague = await blagues.fromId(match[1]);
  if (blague.status === 404) {
    jokesBot.sendMessage(id, "Déso, Blague non trouvée");
    return;
  }
  const blagueImage = `Type : ${blague.type}\nBlague : ${blague.joke}\nRéponse : ${blague.answer}`;
  await fs.writeFile("out.png", text2png(blagueImage, { padding: 20, bgColor: "white" }));
  jokesBot.sendPhoto(id, await fs.readFile("out.png"));
  await fs.unlink("out.png");
});

jokesBot.onText(/help (.+)/, (msg, match) => {
  const { id } = msg.chat;
  const help =
    "Commandes valables:\n1- blague\n2-blagueImage\nCommande à renter plus le numéro de la blague";
  jokesBot.sendMessage(id, help);
});
