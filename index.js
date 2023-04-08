/*
 Simple AI Discord Bot Made By TFC Mahmoud 
 https://github.com/tfcmahmoud
 Discord: TFC ! Mahmoud#1149
*/

const Discord = require('discord.js')

//Defining The Client (Must Have All Intents Enabled In The Discord Developer Portal Page)

const client = new Discord.Client({ intents: 3276799,
    partials: [
      Discord.Partials.Channel,
      Discord.Partials.Message,
      Discord.Partials.GuildMember,
      Discord.Partials.GuildScheduledEvent,
      Discord.Partials.Reaction,
      Discord.Partials.ThreadMember,
      Discord.Partials.User
    ] })

const config = require('./config.json')

const { Configuration, OpenAIApi } = require("openai");

let status = 'https://github.com/tfcmahmoud'

//Configuring The Open Ai Library

const configuration = new Configuration({
    apiKey: config.apiKey
})

const openai = new OpenAIApi(configuration)

// Setting Up The Status And Checking If Bot Is Online

client.on('ready', async () => {
    console.log(`Logged In As ${client.user.tag} (${client.user.id}) \n Invite Link: https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=1099511627775`)
    client.user.setActivity({
        name: status,
        type: Discord.ActivityType.Playing
    })
})

//Give The Bot Information About Who He Is


client.on('messageCreate', async msg => {

    let info = `You're A Friendly Discord Chatbot, And Your Name Is ${client.user.username}`

    //Dm's Chatbot

    if (msg.channel.type === 1) {
        try { 
            if (msg.author.bot) return
            let convLog = [{ role: 'system', content: info}]
        
            await msg.channel.sendTyping()

            //Fetches The Last 15 Messages
            let history = await msg.channel.messages.fetch({ limit: 15 })
            history.reverse()

            history.forEach(async message => {
                if (message.author.bot) { 
                    convLog.push({
                        role: 'assistant',
                        content: message.content
                    })
                } else {
                    convLog.push({
                        role: 'user',
                        content: message.content
                    })
                }
            
            })

            // Sending A Request With The Model And Last 15 Messages

            const results = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: convLog
            })

            msg.reply(`${results.data.choices[0].message.content}`)

        } catch {
            try {
                await msg.reply('**⚠️ Uh Ooh! Sorry For The Inconvenience, But An Error Occured. This May Be Cause Because Of Overload. So You Can Try After A Few Minutes! ⚠️**') 
            } catch {
                console.log('Error!')
            }
        }
    }

    //Certain Channel Chatbot

    if (msg.channel.type === 0) {
        try { 

            if (msg.author.bot) return
            if (msg.channel.id !== config.channelId) return

            let convLog = [{ role: 'system', content: info}]
        
            await msg.channel.sendTyping()

            let history = await msg.channel.messages.fetch({ limit: 15 })
            history.reverse()

            history.forEach(async message => {
                if (message.author.bot && message.author.id === client.user.id) { 
                    convLog.push({
                        role: 'assistant',
                        content: message.content
                    })
                } else if (msg.author.id === message.author.id) {
                    convLog.push({
                        role: 'user',
                        content: message.content
                    })
                } else {
                    return;
                }
            
            })

            const results = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: convLog
            })

            msg.reply(`${results.data.choices[0].message.content}`)
        } catch {
            try {
                await msg.reply('**⚠️ Uh Ooh! Sorry For The Inconvenience, But An Error Occured. This May Be Cause Because Of Overload. So You Can Try After A Few Minutes! ⚠️**') 
            } catch {
                console.log('Error!')
            }
        }
    }
})

//Logs In To The Token

client.login(config.token)