/**
 * This script is initially run to parse the data from the text-file
 * and create the SQLite datastore.
 */

/**
 * Dependencies.
 */
var fs = require('fs');
var path = require('path');
var sqlite3 = require('sqlite3').verbose();
var parser = require(path.resolve(__dirname, '../lib/user-data-parser'));
var _ = require('underscore');

/**
 * Variables.
 */
var LOG_TAG = 'Setup: ';
var DATA_FILE = path.resolve(__dirname, '../parsed_data.txt');
var DATASTORE = path.resolve(__dirname, '../db/datastore.sqlite');

/**
 * Delete the old datastore if it exists.
 */
fs.unlink(DATASTORE, function (err) {
  if(err) throw err;
  console.log(LOG_TAG + 'successfully deleted old ' + DATASTORE);
});

/**
 * Attempt to create a new datastore and invoke the user data
 * parsing library once the 'users' table has been created.
 */
var db = new sqlite3.Database(DATASTORE, function (err) {
  if(err) throw err;
  console.log(LOG_TAG + 'successfully created new ' + DATASTORE);
});
db.run("CREATE VIRTUAL TABLE users USING fts4(ip TEXT, agent TEXT, keywords TEXT)", function(db) {
  console.log(LOG_TAG + 'created users table');
  parser.parse(DATA_FILE);
});
 
/**
 * When the 'ready' event is emitted from the parser,
 * save the available data to the database, filling
 * in missing properties with 'unknown'.
 */
parser.emitter.on('ready', function(data) {
  _.defaults(data, { 
    'ip': 	'unknown', 
    'agent':	'unknown', 
    'keywords':	'unknown' 
  });

  db.run('INSERT INTO users VALUES ($ip, $agent, $keywords)', {
    $ip: 	data.ip,
    $agent: 	data.agent,
    $keywords: 	data.keywords
  });
});

/**
 * Close the database connection when the parser emits
 * the 'completed' event.
 */
parser.emitter.on('completed', function() {
  console.log(LOG_TAG + "finished parsing user data from " + DATA_FILE);
  db.close();
});
