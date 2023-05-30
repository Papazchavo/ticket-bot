const { MessageEmbed,Client,CommandInteraction } = require("discord.js");
module.exports = {
    name:"Banka",
    description: '📁 Banka Hesapları',
    type:'CHAT_INPUT',
    category:"info",
    options:[],
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    run: async (client, interaction) => {
const embed1 = new MessageEmbed()
.setDescription('**IBAN**\n\n``\n\n \n\n ')
.setImage('https://cdn.discordapp.com/attachments/734420155609776149/1060264583962562620/Enpara.png')
.setFooter(client.user.tag, client.user.avatarURL())
.setTimestamp();
const embed2 = new MessageEmbed()
.setDescription('**İNİNAL BARKOD**\n\n``')
.setImage('https://cdn.discordapp.com/attachments/734420155609776149/1060264794432745582/ininal-kart-visa-kredi-karti.png')
.setFooter(client.user.tag, client.user.avatarURL())
.setTimestamp();
const embed3 = new MessageEmbed()
.setDescription('**PAPARA NO**\n\n``')
.setImage('https://cdn.discordapp.com/attachments/734420155609776149/1060265499893694504/mobile_carousel.png')
.setFooter(client.user.tag, client.user.avatarURL())
.setTimestamp();
await interaction.reply({
embeds: [embed1, embed2, embed3]
});
},
};