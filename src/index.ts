import { Client, IntentsBitField} from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import { Sequelize } from 'sequelize';
import { analyzeMood,  replaceSentences,  replaceWords,  sendConfession, sendConfirmation } from './confession-handler';
import { message_create_listener } from './events/messagecreate';
import { interaction_create_listener } from './events/interactioncreate';

require('dotenv').config({
    path: path.join(__dirname, ".env")
})


export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'confessions.db',
    logging: false
})


const path_to_models = path.join(__dirname, 'database', 'models');

fs.readdirSync(path_to_models)
    .forEach(modelFile => {
        const model = require(path.join(path_to_models, modelFile));
        model.model(sequelize);
    })



sequelize.sync({alter: true}).then(async sequelize => {
    client.login(process.env._TOKEN);
})


const F = IntentsBitField.Flags;
export const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.GuildMembers, F.MessageContent, F.DirectMessages]
})


client.once('ready', async (client) => {
    console.log("ready");

    message_create_listener(client);
    interaction_create_listener(client);
    
})









