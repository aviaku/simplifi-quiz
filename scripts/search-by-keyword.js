/**
 * This script displays all the UID's from the datastore
 * created by 'setup-datastore.js' that should be shown
 * an ad based on a keyword.
 */

/**
 * Dependencies.
 */
var sqlite3 = require('sqlite3').verbose();
var path = require('path');

/**
 * Variables.
 */
var LOG_TAG = 'Keyword Search: ';
var DATASTORE = path.resolve(__dirname, '../db/datastore.sqlite');
var KEYWORD = process.argv[2];

/**
 * Attempt to open a connection to the SQLite datastore and run the query.
 */
var db = new sqlite3.Database(DATASTORE, sqlite3.OPEN_READONLY, function (err) {
  if (err) throw err;
  console.log(LOG_TAG + 'successfully opened ' + DATASTORE);
  run();
});

/**
 * If a keyword has been specified, make a SQLite query and for each returned row
 * display the rowid. When all the rows have been processed, display the total number
 * and finish the script.
 */
function run() {
  if( KEYWORD ) {
    console.log(LOG_TAG + 'searching for UIDs that are related to keyword = ' + KEYWORD);
    var query = "SELECT rowid FROM users WHERE keywords MATCH '" + KEYWORD + "'";
    db.each(query, function(err, row) {
      if (err) throw err;

      if (row) {
        console.log('\t' + row.rowid);
      }
    }, 
    function(err, numRows) {
      console.log(LOG_TAG + numRows + ' UIDs found');
      finish();
    });

  } else {
    console.error(LOG_TAG + 'no keyword was specified. Aborting');
    finish();
  }
}

/**
 * Close the database connection.
 */
function finish() {
  db.close();
}
