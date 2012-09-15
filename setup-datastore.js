/**
 * This script is initially run to parse the data from the text-file
 * and create the SQLite datastore.
 */

/**
 * Dependencies.
 */
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var parser = require('./lib/user-data-parser');
var _ = require('underscore');

/**
 * Variables.
 */
var LOG_TAG = 'Setup: ';
var DATA_FILE = 'parsed_data.txt';

/**
 * Delete the old datastore if it exists.
 */
fs.unlink('datastore', function (err) {
  if (err) throw err;
  console.log(LOG_TAG + 'successfully deleted old datastore');
});

/**
 * Attempt to create a new datastore and invoke the user data
 * parsing library once the 'users' table has been created.
 */
var db = new sqlite3.Database('datastore', function (err) {
  if (err) throw err;
  console.log(LOG_TAG + 'successfully created new SQLite datastore');
});
db.run("CREATE TABLE users (ip TEXT, agent TEXT, url TEXT, ref TEXT)", function(db) {
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
    'url': 	'unknown', 
    'ref': 	'unknown' 
  });

  db.run('INSERT INTO users VALUES ($ip, $agent, $url, $ref)', {
    $ip: 	data.ip,
    $agent: 	data.agent,
    $url: 	data.url,
    $ref: 	data.ref
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
