import { ButtonInteraction, Client, InteractionType } from "discord.js";
import { accept, confess, decline, reveal } from "../confession-handler";

export const interaction_create_listener = (client: Client) => {
    client.on('interactionCreate', async int => {
        
        if(int.isButton()) {
            accept(int as ButtonInteraction);
            decline(int as ButtonInteraction);
            reveal(int as ButtonInteraction);
            confess(int as ButtonInteraction);
        }
    })
}