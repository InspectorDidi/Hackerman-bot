//Constants for discord client
const Discord = require('discord.js');
const client = new Discord.Client();

//Constant for scheduler
const schedule = require('node-schedule');

//Constant for commands file
const Commands = require('./commands.js');

//Channels arrays
var commandChannels = [];
var announcementChannels = [];

//On ready, output logged in message
client.on('ready', () =>
{
  console.log(`Logged in as ${client.user.tag}`);

  //Gets command channels where you put bot commands in
  commandChannels = Commands.getCommandChannels(client);
  announcementChannels = Commands.getAnnouncementChannels(client);
});

//Runs at 1800 hours (6:00 PM)
var steamUpdate = schedule.scheduleJob('0 0 18 * * *', function()
{
  checkSteamSales(announcementChannels);
})

//On a message, run this function
client.on('message', message =>
{
  //If the message sent isn't sent by the bot
  var correctAuthor = message.author != client.user;

  //If the message is in a bot command channel
  var correctChannel = commandChannels.indexOf(message.channel.id) > -1;

  //String to hold message content
  var messageStr = message.toString();

  //If both of those cases meet
  if(correctAuthor && correctChannel)
  {
    //If the first character is '!' implying it's a command
    if(messageStr[0] == '!')
    {
      //Check for a space to just get the raw command
      var endingIndex = (messageStr.indexOf(' ') > -1) ? messageStr.indexOf(' ') : messageStr.length;

      //String to hold commands, uses index of 1 to get rid of the '!'
      var command = messageStr.substring(1, endingIndex);

      //If it's the clear command, run the clear command funciton
      if(command == "clear")
      {
        Commands.clearChannel(message);
      }
      else if(command == "steam")
      {
        //Gets post command str, uses + 1 to get first letter after the space
        var postCommandStr = messageStr.substring((endingIndex + 1), messageStr.length);

        //Gets subcommand ending index
        var subcommandEndIndex = (postCommandStr.indexOf(' ') > -1) ? postCommandStr.indexOf(' ') : postCommandStr.length;

        //Gets subcommand substring
        var subCommand = postCommandStr.substring(0, subcommandEndIndex);

        if(subCommand == 'add')
        {
          //Adds game to watch list, adds original ending index with the subcommand index, then adds 2 to remove space
          Commands.addGameToWatch(message, (endingIndex + subcommandEndIndex + 2));
        }
        else if(subCommand == 'remove')
        {
          //Removes game from watch list, adds original ending index with the subcommand index, then adds 2 to remove space
          Commands.removeGameFromWatch(message, (endingIndex + subcommandEndIndex + 2));
        }
        else if(subCommand == 'check')
        {
          Commands.checkSteamSales(announcementChannels);
        }
        else //If subcommand is not recognized
        {
          //Tells message sender that they need s subcommand
          message.channel.send(`${message.author} You need to specify a valid subcommand`);
        }
      }
      else
      {
        message.channel.send(`${command} is not a recognized command!`);
      }
    }
  }

  //Just if correct author
  if(correctAuthor)
  {
    if(messageStr.indexOf('r/') > -1)
    {
      Commands.linkSubreddit(message);
    }
  }
});

//Login command with bot token
client.login('NDE4ODQzNzU2NDE1MDI1MTUy.DXneNg.qBxt2AQKrkJ36bKU8sDJyJVIZSU');
