/**
 * This script accepts a UID from the datastore generated by
 * 'setup-data-store.js' and returns all the associated data.
 */

/**
 * Dependencies.
 */
var sqlite3 = require('sqlite3').verbose();
var path = require('path');

/**
 * Variables.
 */
var LOG_TAG = 'UID Search: ';
var DATASTORE = path.resolve(__dirname, '../db/datastore.sqlite');
var UID = process.argv[2];

/**
 * Start the timer and attempt to open a connection to the SQLite datastore.
 * If successful, run the query.
 */
console.time(LOG_TAG + 'completed in');
var db = new sqlite3.Database(DATASTORE, sqlite3.OPEN_READONLY, function (err) {
  if (err) throw err;
  console.log(LOG_TAG + 'successfully opened ' + DATASTORE);
  run();
});

/**
 * If a UID has been specified, make a SQLite query for the
 * desired row and display the results.
 */
function run() {
  if( UID ) {
    console.log(LOG_TAG + 'searching for UID = ' + UID);
    db.get('SELECT * FROM users WHERE rowid = ?', UID, function(err, row) {
      if (err) throw err;

      if (row) {
        console.log(row);
      } else {
        console.log(LOG_TAG + UID + ' was not a valid UID, no record found.');
      }
      finish();
    });

  } else {
    console.error(LOG_TAG + 'no UID was specified. Aborting');
    finish();
  }
}

/**
 * Close the database connection and end timer.
 */
function finish() {
  db.close();
  console.timeEnd(LOG_TAG + 'completed in');
}
