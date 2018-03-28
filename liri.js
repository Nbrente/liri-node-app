require("dotenv").config();

var inquirer = require("inquirer");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var keys = require('./keys.js');
var fs = require('fs');
const OmdbApi = require('omdb-api-pt')

// Create a new instance of the module.
const omdb = new OmdbApi({
  apiKey: process.env.OMDB_APIKEY,
  baseUrl: process.env.OMDB_BASE_URL
})

const spotify = new Spotify({
  id: process.env.SPOTIFY_ID,
  secret: process.env.SPOTIFY_SECRET
});

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});;

var params = {
  screen_name: 'nodejs'
};

function logCommand(data) {
  fs.appendFile('log.txt', JSON.stringify(data, null, 2), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

var logTemp;

function getTweets(choice) {
  console.log("opened my tweets.")
  client.get('statuses/user_timeline', {
    q: 'node.js'
  }, function (error, tweets, response) {
    logTemp = tweets;
    logCommand(logTemp);
    console.log("Tweets")
    console.log("---------------");;
    for (let i = 0; i < 20; i++) {
      console.log("My Recent Tweet #" + (i + 1) + " of 20")
      console.log(tweets[i].created_at);
      console.log(tweets[i].text);
      console.log("---------------");
    }
  });
}

function getSpotify(response) {
  spotify.search({
    type: 'track',
    query: response.song,
    limit: 1
  }, function (err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    } else {
      console.log("Song: " + data.tracks.items[0].name);
      console.log("Album: " + data.tracks.items[0].album.name)
      console.log("Artist(s): " + data.tracks.items[0].artists[0].name)
      console.log("Spotify Link: " + data.tracks.items[0].external_urls.spotify)
      logCommand(data);
    }
  });
}

function omdbSearch(response) {
  var isMovie = "movie";
  if (response.type != "A Movie?") {
    isMovie = "series";
  }
  omdb.bySearch({
      search: response.name,
      type: isMovie,
      year: response.yearStart,
      page: 1
    }).then(res => console.log(JSON.stringify(res, null, 2)))
    .catch(err => console.error(err))
}

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
        getTweets()
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
            getSpotify(inquirerResponse)
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
            omdbSearch(inquirerResponse);
          })
        break;


      case `do-what-it-says`:
        fs.readFile('random.txt', "UTF-8", (err, data) => {
          if (err) throw err;
          var command = data.split(',');
          if (command[0] == "my-tweets") {
            getTweets()
          } else if (command[0] == "spotify-this-song") {
            var song = command[1];
            var response = {
              song
            };
            getSpotify(response)

          } else if (command[0] == "movie-this") {
            // in order to mimic my inquirer response, the random.txt format must be: command,movie/series,name,yearStart
            var objectMimic = {
              type: command[1],
              name: command[2],
              yearStart: command[3]
            };

            omdbSearch(objectMimic);

          } else if (command[0] == "do-what-it-says") {
            console.log("This command loop isn't supported by 'do-what-it-says'.")
          } else {
            console.log("No command detected in random.txt")
          }
        });

        break;

      default:
        break;
    }
  })