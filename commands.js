//Sleep module constant
const sleep = require('sleep');

//File system modules
const file = require('fs');

//Steam module constants
var SteamApi = require('steam-api');
const key = '7241A5AB2A7FD2367B7EE558F139A93A';

//Clears the chat logs
module.exports.clearChannel = function(message)
{
  //Gets all messages in the bot-commands channel
  message.channel.fetchMessages().then(function(messages)
  {
    //Bulk deletes all the messages
    message.channel.bulkDelete(messages);
  });

  //Sends a message
  message.channel.send("Chat log has been cleared!").then(function(thisMessage)
  {
    //After the message it sent, it waits three seconds and deletes itself
    sleep.sleep(3);
    thisMessage.delete();
  });
}

module.exports.linkSubreddit = function(message)
{
  //String of the message
  var messageStr = message.toString();

  //Gets starting index of the subreddit
  var subCutoff = messageStr.substring(messageStr.indexOf('r/'), messageStr.length);

  //Check for a space to just get the raw subreddit
  var endingIndex = (subCutoff.indexOf(' ') > -1) ? subCutoff.indexOf(' ') : subCutoff.length;

  //Substring for the actual subreddit
  var subredditStr = subCutoff.substring(0, endingIndex);

  message.channel.send(`${message.author} OwO, what's this? I see a mention of a subreddit! Here's a link: http://reddit.com/${subredditStr}`);
}

module.exports.getCommandChannels = function(client)
{
  //Variable of all channels the bot is connected to
  var activeChannels = client.channels.array();

  //Variable for command command channels
  var commandChannels = [];

  //Loops through all channels
  for(var i = 0; i < activeChannels.length; i++)
  {
    if(activeChannels[i].name == "bot-commands")
    {
      commandChannels.push(activeChannels[i].id);
    }
  }

  return commandChannels;
}

module.exports.getAnnouncementChannels = function(client)
{
  //Variable of all channels the bot is connected to
  var activeChannels = client.channels.array();

  //Variable for command command channels
  var announcementChannels = [];

  //Loops through all channels
  for(var i = 0; i < activeChannels.length; i++)
  {
    if(activeChannels[i].name == "announcements")
    {
      announcementChannels.push(activeChannels[i]);
    }
  }

  return announcementChannels;
}

module.exports.checkSteamSales = function(announcementChannels)
{
  file.readFile('steamGames.txt', 'utf8', function(err, contents)
  {
    //Steam app module
    var app = new SteamApi.App(key);

    //Splits file string into seperate IDs
    steamIDs = contents.split(' ');

    //Removes any spaces of new line characters
    for(var i = 0; i < steamIDs.length; i++)
    {
      steamIDs[i] = steamIDs[i].replace("\n", '');
      steamIDs[i] = steamIDs[i].replace(" ", '');
    }

    //Checks if the games are on sale, if they are it announces it to the server
    for(var i = 0; i < steamIDs.length; i++)
    {
      //Okay so the code scheduling here sucks a lot, let me explain
      //For some reason, the api (which is the only working one I can find) takes an adnormal amount of time to run
      //So what I did, was call a function that's referenced in the for loop, because storing the onsale IDs on some array
      //Isn't all that possible, thanks to the awful timing, yes it's gross, but it works
      app.appDetails(steamIDs[i]).done(function(data)
      {
        //If there's a discount, then announce it
        if(data.price.discount_percent > 0)
        {
          //Announces game
          announceGame(data.id, data.name)
        }
      });

      //Function for announcing the games sale to the server
      function announceGame(id, name)
      {
        //Announces it on all announcement channels
        for(var i = 0; i < announcementChannels.length; i++)
        {
          announcementChannels[i].send(`@everyone ${name} is on sale! https://store.steampowered.com/app/${id}`);
        }
      }
    }
  });
}
