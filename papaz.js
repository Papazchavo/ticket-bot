const fs = require("fs");
const {Client, Intents, MessageActionRow,MessageButton,MessageEmbed,Collection} = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const TicketSetupData = require("./models/ticketSetup")
const db = require("./models/ticket")
const {createTranscript} = require("discord-html-transcripts");
const Discord = require('discord.js');
const moment = require('moment');
const client = new Client({
  fetchAllMembers: true,
  intents:[
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    
  ]});
const {token,mongoDB} = require("./ayarlar.json");

const mongoose = require("mongoose");
mongoose.connect(mongoDB)
.then(() => console.log("Connect MongoDb"))
.catch(console.error);



global.client = client;
client.commands = (global.commands = []);
fs.readdir("./slashKomutlar/", (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        let props = require(`./slashKomutlar/${file}`);

        client.commands.push({
             name: props.name.toLowerCase(),
             description: props.description,
             options: props.options,
             category: props.category,
             
        })
        console.log(`👌 Slash Komut Yüklendi: ${props.name}`);
    });
});

fs.readdir("./events/", (_err, files) => {
    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        
        console.log(`👌 Event yüklendi: ${eventName}`);
        client.on(eventName, (...args) => {
           event(client, ...args);
        });
    });
});

client.on("ready", async () => {

    const rest = new REST({ version: "9" }).setToken(token);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: client.commands,
    });
  } catch (error) {
    console.error(error);
  }
});


client.login(token);



client.on("interactionCreate",async interaction => {
  if(!interaction.isButton()) return
  const { guild,customId,channel,member } = interaction;
  
      
      const Data = await TicketSetupData.findOne({ GuildID: guild.id });
      if(!Data) return;
  

  if(!["close","sil","lock","unlock"].includes(customId)) return;

    if(!TicketSetupData) 
    return interaction.reply({content:`Bu sistem için veriler eski`,ephemeral:true});

    
    const Embed = new MessageEmbed().setColor("BLUE");
    
   db.findOne({ChannelID: channel.id}, async (err, docs) => {
     if(err) throw err;
     if(!docs)
     return interaction.reply({
       content:"destek talebi hakkında veri bulunamadı lütfen manuel işlem yapınız",
       ephemeral:true
     }) .catch(err => interaction.channel.send({content:`${err}`,ephemeral:true}));
     

     switch(customId){
       case "sil":
        interaction.reply({content:"Kanal siliniyor",ephemeral:false});
        await channel.delete();
         break;

         case "lock":
           if(docs.Locked == true) return interaction.reply({content:"Bu destek talebi zaten kilitli",ephemeral:true})
           .catch(err => interaction.channel.send({content:`${err}`,ephemeral:true}));

           await db.updateOne({ChannelID: channel.id}, {Locked: true})
           Embed.setDescription(`🔒 | Destek talebi kilitlendi`)
           
           docs.MembersID.forEach(async (m) => {
           channel.permissionOverwrites.edit(m, {
              SEND_MESSAGES: false,
              VIEW_CHANNEL: false,
            })
            }) 
            interaction.reply({embeds:[Embed]})
            .catch(err => interaction.channel.send({content:`${err}`,ephemeral:true}));
          break; 

          case "unlock":
            if(docs.Locked == false) return interaction.reply({content:"Bu destek talebi zaten açık",ephemeral:true})
            .catch(err => interaction.channel.send({content:`${err}`,ephemeral:true}));
            await db.updateOne({ChannelID: channel.id}, {Locked: false})
            Embed.setDescription(`🔓 | Destek talebi açıldı`)
            docs.MembersID.forEach(async (m) => {
            channel.permissionOverwrites.edit(m, {
                SEND_MESSAGES: true,
               VIEW_CHANNEL: true,
               })
             })
              interaction.reply({embeds:[Embed]})
              .catch(err => interaction.channel.send({content:`${err}`,ephemeral:true}));
          break;

          case "close":
             
             if(docs.Closed){
              await interaction.reply({
                content:"Bu destek talebi zaten kapatılmış",
                components:
                [new MessageActionRow()
                  .addComponents(
                new MessageButton()
                .setCustomId("sil")
                .setLabel("Kanalı Sil")
                .setStyle("SECONDARY")
                .setEmoji("🗑️"),
             )],ephemeral:false}).catch(err => interaction.channel.send({content:`${err}`}));
             return;
             }  
 const dosya = await createTranscript(channel, {
   limit: -1,
   returnBuffer: false,
   fileName: `${docs.TicketID}.html`,
 });
 
 await db.updateOne({ChannelID: channel.id}, {Closed: true});
 await guild.channels.cache.get(Data.Transcripts).send({
   embeds: [Embed.setTitle(`Transcripts Type: ${docs.Type}\nTicket ID: ${docs.TicketID}`)],
 files: [dosya],
 });
 interaction.reply({content:`Destek talebi Kaydedildi ve kapatıldı!\nBu kanal 5 saniye sonra silinecektir`})
 .catch(err => interaction.channel.send({content:`${err}`,ephemeral:true}));

 setTimeout(() => {
  channel.delete();
 },5000)
            break;
      }

  })
  
})
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
client.on('ready', async () => {
  setInterval(() => {
   client.user.setActivity(`PAPAZ GERİ DÖNDÜ`, {
       type: "STREAMING",
      url: "https://www.twitch.tv/papazxd"});
}, 10000);
})
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



let g1emoji = ` `
let c2emoji = `` 
let toplamuye = ` `
let hspkrls = ``
let onay = `<a:onay:1109106351570952192>`
let red = `<a:red:1109106353085095938>`


client.on("guildMemberAdd", member => {
  member.roles.add("1104895497640095744") //////// otorol rol ver 

  let aylar = {
    "01": "Ocak",
    "02": "Şubat",
    "03": "Mart",
    "04": "Nisan",
    "05": "Mayıs",
    "06": "Haziran",
    "07": "Temmuz",
    "08": "Ağustos",
    "09": "Eylül",
    "10": "Ekim",
    "11": "Kasım",
    "12": "Aralık"
}

let bitiş = member.user.createdAt
let günü = moment(new Date(bitiş).toISOString()).format('DD')
let ayı = moment(new Date(bitiş).toISOString()).format('MM').replace("01", "Ocak").replace("02","Şubat").replace("03","Mart").replace("04", "Nisan").replace("05", "Mayıs").replace("06", "Haziran").replace("07", "Temmuz").replace("08", "Ağustos").replace("09", "Eylül").replace("10","Ekim").replace("11","Kasım").replace("12","Aralık")
let yılı =  moment(new Date(bitiş).toISOString()).format('YYYY')
let saati = moment(new Date(bitiş).toISOString()).format('HH:mm')

let günay = `${günü} ${ayı} ${yılı} ${saati}`  

let süre = member.user.createdAt
let gün = moment(new Date(süre).toISOString()).format('DD')
let hafta = moment(new Date(süre).toISOString()).format('WW')
let ay = moment(new Date(süre).toISOString()).format('MM')
let ayy = moment(new Date(süre).toISOString()).format('MM')
let yıl =  moment(new Date(süre).toISOString()).format('YYYY')
let yıl2 = moment(new Date().toISOString()).format('YYYY')

let netyıl = yıl2 - yıl

let created = ` ${netyıl} yıl  ${ay} ay ${hafta} hafta ${gün} gün önce`

let kontrol;
if(süre < 1296000000) kontrol = `${red} Bu hesap şüpheli!`
if(süre > 1296000000) kontrol = `${onay} Bu hesap güvenli!`

  const kanal = "1109104144813408276"////////////////giriş log id
  const embed2 = new Discord.MessageEmbed()
  .setColor('6d6ee8')
  .setDescription(`${g1emoji} Selam ${member} **Hostedu Bilişim**'a Hoş Geldin!
  
  ${toplamuye} Seninle Beraber (**${member.guild.memberCount}**) kişiyiz!

  ${hspkrls} Hesabın (**${günay}**) tarihinde oluşturulmuştur!

  ${kontrol}
  `)
  .setFooter(client.user.tag, client.user.avatarURL())
  .setThumbnail("https://cdn.discordapp.com/attachments/1087835164664668323/1109107231317839923/Profil1.png")
  .setTimestamp()
  member.guild.channels.cache.get(kanal).send({embeds: [embed2]});
  console.log(`[Papaz Otorol]: ${member.user.tag} sunucumuza katıldı!`)
})

client.on("guildMemberRemove", member => {

  let aylar = {
    "01": "Ocak",
    "02": "Şubat",
    "03": "Mart",
    "04": "Nisan",
    "05": "Mayıs",
    "06": "Haziran",
    "07": "Temmuz",
    "08": "Ağustos",
    "09": "Eylül",
    "10": "Ekim",
    "11": "Kasım",
    "12": "Aralık"
}

let bitiş = member.user.createdAt
let günü = moment(new Date(bitiş).toISOString()).format('DD')
let ayı = moment(new Date(bitiş).toISOString()).format('MM').replace("01", "Ocak").replace("02","Şubat").replace("03","Mart").replace("04", "Nisan").replace("05", "Mayıs").replace("06", "Haziran").replace("07", "Temmuz").replace("08", "Ağustos").replace("09", "Eylül").replace("10","Ekim").replace("11","Kasım").replace("12","Aralık")
let yılı =  moment(new Date(bitiş).toISOString()).format('YYYY')
let saati = moment(new Date(bitiş).toISOString()).format('HH:mm')

let günay = `${günü} ${ayı} ${yılı} ${saati}`  

let süre = member.user.createdAt
let gün = moment(new Date(süre).toISOString()).format('DD')
let hafta = moment(new Date(süre).toISOString()).format('WW')
let ay = moment(new Date(süre).toISOString()).format('MM')
let ayy = moment(new Date(süre).toISOString()).format('MM')
let yıl =  moment(new Date(süre).toISOString()).format('YYYY')
let yıl2 = moment(new Date().toISOString()).format('YYYY')

let netyıl = yıl2 - yıl

let created = ` ${netyıl} yıl  ${ay} ay ${hafta} hafta ${gün} gün önce`

  const kanal = "1109104144813408276" ////////////////çıkış log id
  const embed2 = new Discord.MessageEmbed()
  .setColor('6d6ee8')
  .setDescription(`${c2emoji} ${member} Aramızdan Ayrıldı!
  
  ${toplamuye} Onsuz Sadece (**${member.guild.memberCount}**) kişiyiz!

  ${hspkrls} Hesabı (**${günay}**) tarihinde oluşturulmuş.
  `)
  .setFooter(client.user.tag, client.user.avatarURL())
  .setThumbnail("https://media.discordapp.net/attachments/969254982983503942/999443908490707025/output-onlinegiftools_5_2.gif")
  .setTimestamp()
  member.guild.channels.cache.get(kanal).send({embeds: [embed2]});
  console.log(`[Papaz Otorol]: ${member.user.tag} sunucumuzdan ayrıldı!`)
})
