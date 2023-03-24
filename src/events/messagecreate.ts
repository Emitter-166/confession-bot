import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, PermissionFlagsBits } from "discord.js";

export const message_create_listener = (client: Client) => {
    client.on('messageCreate', async msg => {
        if(msg.author === client.user) return;

        //command
        if(!(msg.content.toLocaleLowerCase() === "!confession-button")) return;
        if(!msg.member?.permissions.has(PermissionFlagsBits.Administrator)) return;

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId('confession-confess')
                    .setStyle(ButtonStyle.Success)
                    .setLabel('Confess now!')
                    .setEmoji('📨')
            ])

            const embed = new EmbedBuilder()
                .setTitle("Start a confession")
                .setDescription(`Click the button below to start a confession!

                **Cooldown:** 6 Hours
                
                *Note: If your confession is deemed NFSW, it will be denied and the staff will know who sent the confession.*`)
                .setColor('Green');

            msg.channel.send({embeds: [embed], components: [row]});
            msg.delete();
    })
}