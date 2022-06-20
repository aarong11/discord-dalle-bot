import Discord from "discord.js";
import dotenv from "dotenv";
import axios from "axios";
import DataImageAttachment from "dataimageattachment";

dotenv.config();
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
});

client.on("reconnecting", () => {
  console.log(`Reconnecting - ${client.user.tag}!`)
});

client.on("disconnect", () => {
  console.log(`Disconnect - ${client.user.tag}!`)
});

client.on("message", async message => {
  if (message.author.bot) return;


  if (message.content.startsWith("!img ")) {
    const prompt = message.content.split(" ");

    let promptWords = "";
    for(let i = 1; i < prompt.length; i++) {
      promptWords = `${promptWords} ${prompt[i]}`;
    }

    async function postEmbed(response, message, promptWords) {
      
        const imageData = `${response.data}`
        const imageStream = new Buffer(imageData, 'base64');
        const attachment = new Discord.MessageEmbed(imageStream);
  
        const embed = new Discord.MessageEmbed({
          title: promptWords,
          description: `@${message.author.tag}`,
          image: {
              url: "attachment://img.jpeg"
          },
          timestamp: new Date
        })

        embed.setFooter(`Requested by @${message.author.tag}`)

        message.channel.send(`An image of ${promptWords}`, {
          embed: embed,
          files: [new DataImageAttachment(imageStream, "flower.jpeg")]
        })
    }

    const result = axios.post(`${process.env.API_URL}/dalle`, {"text":`${promptWords}`,"num_images":1},
    {
        "headers": {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Bypass-Tunnel-Reminder": "go",
          "mode": "no-cors",
          "Content-Type": "text/plain;charset=UTF-8",
      },
    })

    result.then((data) => {
      postEmbed(data, message, promptWords);
    })
    .catch((ex) => {
      message.channel.send(`Exception: ${ex}`);
    })

    return;
  }

  if (message.content.startsWith("!")) {
    //custom commands
  }
  if (message.mentions.has(client.user.id) || message.content.toString().includes(process.env.ROBOT_USER_ID)) {
    //openaiAnswer(message, client);
  }
});


client.login(process.env.CLIENT_TOKEN);