import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ColorResolvable, EmbedBuilder, TextBasedChannel } from "discord.js"
import path from 'path';
import natural from 'natural';
import color from 'color';
import {sequelize, client} from './index';

require('dotenv').config({
    path: path.join(__dirname, ".env")
})

export const sendConfession = async (msg: string) => {
    if(!client.isReady()) return;
    const channelId = process.env._CONFESSION_CHANNEL_ID
    if(!channelId) return;

    const channel = await client.channels.fetch(channelId) as TextBasedChannel;

    if(!channel) return;


    const embed = new EmbedBuilder()
        .setTitle("Secret confession")
        .setDescription("```" + replaceSentences(replaceWords(msg)) + "```")
        .setColor(analyzeMood(msg) as ColorResolvable);

    return await channel.send({embeds: [embed]});
}


export const sendConfirmation = async (msg: string): Promise<string> => {
    if(!client.isReady()) return 'none';

    const channelId = process.env._CONFIRMATION_CHANNEL_ID
    if(!channelId) return 'none';

    const channel = await client.channels.fetch(channelId) as TextBasedChannel;

    if(!channel) return 'none';


    const actionRows = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setCustomId('confession-approve')
                .setStyle(ButtonStyle.Success)
                .setLabel('approve')
                .setEmoji('✅'),

            new ButtonBuilder()
                .setCustomId('confession-decline')
                .setStyle(ButtonStyle.Danger)
                .setLabel('reject')
                .setEmoji('⛔'),

            new ButtonBuilder()
                .setCustomId('confession-reveal')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('reveal')
                .setEmoji('⚠')
                .setDisabled(true)
        ])

    const embed = new EmbedBuilder()
        .setTitle("Confession approval")
        .setDescription("```" + msg + "```")
        .setColor('Grey');

    const sent_message = await channel.send({embeds: [embed], components: [actionRows]})
    return sent_message.id;
}

export const accept = async (btn: ButtonInteraction) => {

    if(btn.customId !== "confession-approve") return;
    btn.reply({ephemeral: true, content: '✅'});

    const msg = btn.message;

    const embed = new EmbedBuilder(msg.embeds[0].data);
        embed.setColor("Green")

        const actionRows = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setCustomId('confession-approve')
                .setStyle(ButtonStyle.Success)
                .setLabel('approve')
                .setEmoji('✅')
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId('confession-decline')
                .setStyle(ButtonStyle.Danger)
                .setLabel('reject')
                .setEmoji('⛔')
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId('confession-reveal')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('reveal')
                .setEmoji('⚠')
                .setDisabled(true)
        ])

    //changing embed color and disabling button
    msg.edit({components: [actionRows], embeds: [embed], content: `🟩 approved by <@${btn.user.id}> `})

    const confession_string = msg.embeds[0].description?.replaceAll('`', "");
    //sending the confession
    const confession_message = await sendConfession(confession_string as string);

    //sending them dm
    const confessions = sequelize.model('confessions');

    const confession = await confessions.findOne({
        where: {
            confessionId: msg.id
        }
    })

    if(!confession){
        console.log("no confession with that id found");
        return; 
    }

    const userId = confession.get("userId") as string;

    const user = await client.users.fetch(userId);

    const dm = await user.createDM();

    const rows = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setLabel('View confession')
                .setEmoji("💌")
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${confession_message?.guildId}/${confession_message?.channelId}/${confession_message?.id}`)
        ])
    const approvedEmbed = new EmbedBuilder()
        .setTitle("Your confession was approved!")
        .setColor('Green');
    
    dm.send({embeds: [approvedEmbed], components: [rows]});


}

export const reveal = async (btn: ButtonInteraction) => {
    if(btn.customId !== "confession-reveal") return;
    btn.reply({ephemeral: true, content: '✅'});
    
    const msg = btn.message;

    const embed = new EmbedBuilder(msg.embeds[0].data);
        embed.setColor("Grey")

        const actionRows = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setCustomId('confession-approve')
                .setStyle(ButtonStyle.Success)
                .setLabel('approve')
                .setEmoji('✅')
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId('confession-decline')
                .setStyle(ButtonStyle.Danger)
                .setLabel('reject')
                .setEmoji('⛔')
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId('confession-reveal')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('reveal')
                .setEmoji('⚠')
                .setDisabled(true)
        ])

    //changing embed color and disabling button
    const edited_confirmation = msg.edit({components: [actionRows], embeds: [embed], content: `❔ revealed by <@${btn.user.id}> `})

    

    //sending them dm
    const confessions = sequelize.model('confessions');

    const confession = await confessions.findOne({
        where: {
            confessionId: msg.id
        }
    })

    if(!confession){
        console.log("no confession with that id found");
        msg.react('⛔')
        return; 
    }

    (await edited_confirmation).edit(`❔ revealed by <@${btn.user.id}> \n ⚠ confessed by <@${confession.get("userId")}>`);

}

export const decline = async (btn: ButtonInteraction) => {
    if(btn.customId !== "confession-decline") return;
    btn.reply({ephemeral: true, content: '✅'});
    
    const msg = btn.message;

    const embed = new EmbedBuilder(msg.embeds[0].data);
        embed.setColor("Red")

        const actionRows = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setCustomId('confession-approve')
                .setStyle(ButtonStyle.Success)
                .setLabel('approve')
                .setEmoji('✅')
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId('confession-decline')
                .setStyle(ButtonStyle.Danger)
                .setLabel('reject')
                .setEmoji('⛔')
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId('confession-reveal')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('reveal')
                .setEmoji('⚠')
                .setDisabled(false)
        ])

    //changing embed color and disabling button
    msg.edit({components: [actionRows], embeds: [embed], content: `🟥 declined by <@${btn.user.id}> `})

    

    //sending them dm
    const confessions = sequelize.model('confessions');

    const confession = await confessions.findOne({
        where: {
            confessionId: msg.id
        }
    })

    if(!confession){
        console.log("no confession with that id found");
        return; 
    }

    const userId = confession.get("userId") as string;

    const user = await client.users.fetch(userId);

    const dm = await user.createDM();

    const rows = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setLabel('Learn why')
                .setEmoji("⁉")
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/channels/859736561830592522/1032502809918181416/1049552641404973106`)
        ])
    const approvedEmbed = new EmbedBuilder()
        .setTitle("Your confession was rejected!")
        .setColor('Red');
    
    dm.send({embeds: [approvedEmbed], components: [rows]});
}

export const confess = async (btn: ButtonInteraction) => {
    if(btn.customId !== "confession-confess") return;
    btn.reply({ephemeral: true, content: '✅ *sending you a dm, make sure your dms are enabled*'});

    const user = btn.user;
    if(!user) return;
    const dm = await user.createDM();

    const previous_message = (await dm.messages.fetch({limit: 100})).find(v => {
        if(v.author !== client.user) return v;
    })
    let created = 0;
    if(previous_message) created = previous_message.createdTimestamp;

    const current = Date.now();
    
    if(!(current>created + 0)){
        const nextTime = created + 21600000 + "";
        const embed = new EmbedBuilder()
        .setTitle("Whoa! Relax")
        .setDescription(`**you can confess again in <t:${nextTime.slice(0, nextTime.length - 3)}:R>**`)
        .setColor('White');

    dm.send({embeds: [embed]});
    return;
    }
    
    const embed = new EmbedBuilder()
        .setTitle('You may start your confession now!')
        .setDescription('*Note: As soon as you send your confession, it will be automatically submitted for approval.*')
        .setColor('White');

    dm.send({embeds: [embed]});


    const collector = dm.createMessageCollector({time: 3600000});
    
    collector.on('collect', async (msg, msgs) => {
        if(msg.author === client.user) return;
        msg.react('✅');

        const confessionId = await sendConfirmation(msg.content)
        const userId = msg.author.id;
        const confessedAt = msg.createdAt;
        const confession_string = msg.content;

        const confessions = sequelize.model('confessions');

        confessions.create({
            confessionId: confessionId,
            userId: userId,
            confession: confession_string,
            confessedAt: confessedAt
        })

        const embed = new EmbedBuilder()
        .setTitle('Confession sent for approval!')
        .setColor('Green');

        dm.send({embeds: [embed]});

        collector.stop('confessed');
    })
    
    collector.on('end', c => {
        if(collector.endReason !== "confessed"){
            const embed = new EmbedBuilder()
            .setTitle('Confession timed out')
            .setColor('Grey');
    
            dm.send({embeds: [embed]});
        }
    })
}
 

export const analyzeMood = (msg: string) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(msg.toLowerCase());

  const sentimentAnalyzer = new natural.SentimentAnalyzer("English", natural.PorterStemmer, "afinn");
  const score = sentimentAnalyzer.getSentiment(tokens);
    

  if (score > 0) {
    const colorValue = color('#f2a8e1').saturate(Math.abs(score)).hex();
    return colorValue;
  } else if (score < 0) {
    const colorValue = color('#AEB6B7').desaturate(Math.abs(score)).hex();
    return colorValue;
  } else {
    return '#ffffff';
  }
};

export const replaceWords = (message: string): string => {
    const regex = /\|\|([\w\s]+)\|\|/g;
    let match = regex.exec(message);
  
    while (match !== null) {
      const word = match[1].replace(/\s+/g, ''); // remove spaces
      const numHashes = word.length - 1;
      const hashes = '#'.repeat(numHashes);
      message = message.replace(match[0], `${word[0]}${hashes}`);
      match = regex.exec(message);
    }
  
    return message;
  };
  
  export const replaceSentences = (message: string): string => {
    const regex = /\|\|([^|]+)\|\|/g;
    let match = regex.exec(message);
  
    while (match !== null) {
      const sentence = match[1];
      const numHashes = sentence.length - 1;
      const hashes = '# '.repeat(numHashes).trim();
      const visibleWord = sentence.split(' ')[0];
      message = message.replace(match[0], `${visibleWord[0]}${hashes}`);
      match = regex.exec(message);
    }
  
    return message;
  };
  
  
  
  