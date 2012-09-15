/**
 * Library that encapsulates the data parsing logic
 * and creates a JavaScript object structure for the parsed data. 
 * When an object is ready, the "ready" event is triggered.
 */

/**
 * Dependencies.
 */
var EventEmitter = require('events').EventEmitter;
var BufferedReader = require('buffered-reader');
var _ = require('underscore');

/**
 * Variables.
 */
var LOG_TAG = 'Data Parser: ';
var emitter = new EventEmitter();

/**
 * Make the EventEmitter externally available.
 */
exports.emitter = emitter;

/**
 * Set up a new buffered reader to read the specified file and
 * parse each line as its ready. Each time a line of '****' is
 * encountered and the data object is not empty, we trigger the
 * 'ready' event before clearing the structure.
 */
exports.parse = function(file) {
  var data = {};
  var reader = new BufferedReader(file, { encoding: "utf8" });

  // Log reading errors.
  reader.on("error", function(err) {
    console.log(LOG_TAG + err);
  });

  // Whenever a line from the file has been buffered and is ready,
  // analyze its two first characters to determine how the entire
  // line should be parsed. Clear data on '**'.
  reader.on("line", function(line) {
    switch( line.substring(0, 2) ) {
      case '**':
        triggerIfReady(data);
        data = {};
        break;

      case 'IP':
        parseLine("IP: ", line, "ip", data);
        break;

      case 'UA':
        parseLine("UA: ", line, "agent", data);
        break;

      case 'U:':
        parseLine("U: ", line, "url", data);
        break;

      case 'R:':
        parseLine("R: ", line, "ref", data);
        break;

      default:
        break;
    }
  });

  // Event triggered upon file reading completion.
  reader.on("end", function() {
    emitter.emit('completed');
  });

  // Start the reader.
  reader.read();
}

/**
 * Checks to see if the data object for a parsed record is 
 * empty (== 'Missing') before triggering the 'ready' event.
 */
function triggerIfReady(data) {
  if( !_.isEmpty(data) ) {
    emitter.emit('ready', data);
  }
}

/**
 * Given a prefix, parse the remainder of the given line
 * and set the data property with the specified name to 
 * the computed value.
 */
function parseLine(prefix, line, propertyName, data) {
  var result = line.split(prefix);

  // If the prefix was split off and we have a remaining
  // string, add it to the data object.
  if( result[1] && result[1] != '' ) {
    data[propertyName] = result[1];
  }
}
