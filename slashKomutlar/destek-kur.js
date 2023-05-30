const { MessageEmbed,Client,CommandInteraction,MessageActionRow,MessageButton,Permissions } = require("discord.js");
const { openticket } = require("../ayarlar.json");
const db = require("../models/ticketSetup")
module.exports = {
    name:"destek-oluştur",
    description: '📁 Destek Sistemini ayarlarsınız',
    type:'CHAT_INPUT',
    category:"ticket",
    options:[
        {
            name:"kanal",
            description:"Destek kanalını ayarlarsınız",
            required:true,
            type:7,
            channelTypes:["GUILD_TEXT"],
        },
        {
            name:"kategori",
            description:"Destek kanalının kategorisini ayarlarsınız",
            type:7,
            channelTypes:["GUILD_CATEGORY"],
            required:true
        },
        {
            name:"log",
            description:"Destek kanalının Loglarının gideceği kanalı ayarlarsınız",
            type:7,
            channelTypes:["GUILD_TEXT"],
            required:true
        },
        {
            name:"rol",
            description:"Destek talebi ile ilgilenecke yetkili rolü",
            type:8,
            required:true
        },
        {
            name:"açıklama",
            description:"Destek oluşturma kanalına gönderilecek Embed mesajın açıklaması",
            type:3,
            required:true
        },
        {
            name:"buton",
            description:"Destek oluşturma kanalına gönderilecek Embed mesajın butonu",
            type:3,
            required:true
        },
        
        
    ],
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({content:"Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!",ephemeral:true});

        const {guild, options} = interaction;
        try{
            const channel = options.getChannel("kanal");
            if(channel.type !== "GUILD_TEXT") return interaction.reply({content:"Destek Kanal tipi `GUILD_TEXT` olmalıdır!",ephemeral:true});
            const category = options.getChannel("kategori");
            if(category.type !== "GUILD_CATEGORY") return interaction.reply({content:"Destek kategori tipi `GUILD_CATEGORY` olmalıdır!",ephemeral:true});
            const transcripts = options.getChannel("log");
            if(transcripts.type !== "GUILD_TEXT") return interaction.reply({content:"Log Kanal tipi `GUILD_TEXT` olmalıdır!",ephemeral:true});
            const handlers = options.getRole("rol");
            const everyone = guild.id;
            const description = options.getString("açıklama");
            const buton = options.getString("buton");

            await db.findOneAndUpdate(
                {GuildID: guild.id},
                {
                    Channel: channel.id,
                    Category: category.id,
                    Transcripts: transcripts.id,
                    Handlers: handlers.id,
                    Everyone: everyone,
                    Description: description,
                    Buttons:[buton],
                },
                {
                    new:true,
                    upsert:true,
                }
                );

                const embed = new MessageEmbed()
                .setAuthor({
                    name:`${guild.name} | Destek Sistemi`,
                    iconURL:guild.iconURL({dynamic:true})
                })
                .setDescription(
                    description
                )
                .setImage("")
                .setColor("GREEN");
        
                const Buton = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setCustomId("destek")
                    .setLabel(buton)
                    .setStyle("SECONDARY")
                    .setEmoji("📩")
                )
                interaction.reply({content:"Gönderildi!",ephemeral:true});
                guild.channels.cache.get(channel.id)
                .send({embeds:[embed], components:[Buton]});
            

        }catch{
            interaction.reply({content:"Bir hata oluştu",ephemeral:true});
        }  
}
};