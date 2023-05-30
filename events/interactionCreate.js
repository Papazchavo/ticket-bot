const {CLient, CommandInteraction, ButtonInteraction, MessageEmbed, MessageButton, MessageActionRow} = require("discord.js");
const fs = require("fs");

/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @param {ButtonInteraction} button
 */
module.exports = async (client, interaction, button) => {
    if (interaction.isCommand()){
    try {
      fs.readdir("./slashKomutlar/", (err, files) => {
        if (err) throw err;

        files.forEach(async (f) => {
          const command = require(`../slashKomutlar/${f}`);
          if (
            interaction.commandName.toLowerCase() === command.name.toLowerCase()
          ) {
            return command.run(client, interaction);
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
    if (interaction.isButton()){

      const {guild, member, customId, channel} = interaction;
      const db = require("../models/ticket")
      const TicketSetupData = require("../models/ticketSetup")
      
      const Data = await TicketSetupData.findOne({ GuildID: guild.id });
      if(!Data) return;

      if(customId == "destek"){
        const id = Math.floor(Math.random() * 90000) + 10000;
        await guild.channels.create(`ticket-${interaction.user.username}`, {
          type: "GUILD_TEXT",
          parent: Data.Category,
          permissionOverwrites: [
            {
              id: member.id,
              allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ATTACH_FILES", "READ_MESSAGE_HISTORY"],
            },
            {
              id: Data.Handlers,
              allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ATTACH_FILES", "READ_MESSAGE_HISTORY"],
            },
            {
              id: Data.Everyone,
              deny: ["VIEW_CHANNEL"],
            }
          ]
        }).then(async (channel) => {
          await db.create({
            GuildID: guild.id,
            MembersID: [member.id],
            TicketID: id,
            ChannelID: channel.id,
            Closed: false,
            Locked: false,
            Type: "Destek",
            Claimed: false,
          })
          const embed = new MessageEmbed()
          .setAuthor({name:` ${guild.name} | Destek ${id}`,iconURL:guild.iconURL({dynamic:true})})
          .setDescription(`Destek ekibi birazdan burdan olur sakın endişelenme! sorununu hemen çözeceklerine inanıyorum :)
          Destek işlemlerini aşağıdaki butonlar ile yapabilirsin.`)

          const buton = new MessageActionRow().addComponents(
            new MessageButton().setCustomId("close").setLabel("Kaydet ve Kapat").setStyle("SECONDARY").setEmoji("💾"),
            new MessageButton().setCustomId("lock").setLabel("Kilitle").setStyle("SECONDARY").setEmoji("🔒"),
            new MessageButton().setCustomId("unlock").setLabel("Aç").setStyle("SUCCESS").setEmoji("🔓"),
          )

          channel.send({content:`${member} Destek talebi açıldı <@&1109096662338654249>`})
          channel.send({embeds:[embed],components:[buton]})
          interaction.reply({content:`Talep açıldı ${channel}`,ephemeral:true});
        })
      }
    
    } 
};