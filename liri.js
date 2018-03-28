require("dotenv").config();

var inquirer = require("inquirer");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var keys = require('./keys.js');
var fs = require('fs');
const OmdbApi = require('omdb-api-pt')

// Create a new instance of the module.
const omdb = new OmdbApi({
  apiKey: '73bfe6c5',
  baseUrl: 'https://omdbapi.com/'
})



const spotify = new Spotify(keys.spotify);

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});;


var params = {
  screen_name: 'nodejs'
};



inquirer
  .prompt([
    //comment
    {
      type: "rawlist",
      message: "What can TwitBot do for you today?",
      choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
      name: "choice"
    },
  ]).then(function (inquirerResponse) {
    switch (inquirerResponse.choice) {
      case `my-tweets`:
        console.log("opened my tweets.")
        client.get('statuses/user_timeline', {
          q: 'node.js'
        }, function (error, tweets, response) {

          console.log("Tweets")
          console.log("---------------");;
          for (let i = 0; i < 20; i++) {
            console.log("My Recent Tweet #" + (i + 1) + " of 20")
            console.log(tweets[i].created_at);
            console.log(tweets[i].text);
            console.log("---------------");
          }
        });
        break;


      case `spotify-this-song`:
        inquirer
          .prompt([
            //comment
            {
              type: "input",
              message: "What song would you like to know about?",
              name: "song"
            }
          ]).then(function (inquirerResponse) {
            spotify.search({
              type: 'track',
              query: inquirerResponse.song,
              limit: 1
            }, function (err, data) {
              if (err) {
                return console.log('Error occurred: ' + err);
              } else {
                console.log("Song: " + data.tracks.items[0].name);
                console.log("Album: " + data.tracks.items[0].album.name)
                console.log("Artist(s): " + data.tracks.items[0].artists[0].name)
                console.log("Spotify Link: " + data.tracks.items[0].external_urls.spotify)
              }
            });
          })
        break;


      case `movie-this`:
        inquirer
          .prompt([
            //comment
            {
              type: "rawlist",
              message: "Is it",
              choices: ["A Movie?", "Or a Series", ],
              name: "type"
            },
            {
              type: "input",
              message: "Whats the title?",
              name: "name"
            }, {
              type: "input",
              message: "from what year?",
              name: "yearStart"
            }
          ]).then(function (inquirerResponse) {
            var isMovie = "movie";
            if (inquirerResponse.type != "A Movie?") {
              isMovie = "series";
            }
            omdb.bySearch({
                search: inquirerResponse.name,
                type: isMovie,
                year: inquirerResponse.yearStart,
                page: 1
              }).then(res => console.log(JSON.stringify(res, null, 2)))
              .catch(err => console.error(err))
          })
        break;


      case `do-what-it-says`:
        fs.readFile('random.txt', "UTF-8", (err, data) => {
          if (err) throw err;
          data.split(',')
        });

        break;

      default:
        break;
    }
  })