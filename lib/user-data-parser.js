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
var Url = require('url');

/**
 * Variables.
 */
var LOG_TAG = 'Data Parser: ';
var DOMAIN_EXTS = ['www', 'ca', 'co', 'com', 'net', 'org', 'tv', 'uk', 'us'];
var FILE_EXTS = ['asp', 'aspx', 'htm', 'html', 'php', 'xhtml'];
var QUERY_PARAMS = ['q', 'query', 'refer', 'referer', 'referrer', 'search_query'];
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
  reader.on("line", function(bufferedLine) {
    var line = unescape(bufferedLine);

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
 * empty before triggering the 'ready' event. Further parse
 * the 'url' and 'ref' properties if they exist and combine
 * them into a 'keyword' property.
 */
function triggerIfReady(data) {
  if( !_.isEmpty(data) ) {
    var keywords = '';
    if( data.url ) {
      keywords = keywords + parseUrl(data.url) + ' ';
      delete data.url;
    }
    if( data.ref ) {
      keywords += parseUrl(data.ref);
      delete data.ref;
    }
    if( keywords != '') {
      data.keywords = keywords.trim();
    }

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

/**
 * Create a URL object from a given url-string and parse the host, 
 * pathname, and query sections for keywords.
 */
function parseUrl(urlString) {
  var keywords = '';
  var url = Url.parse(urlString);

  // Parse keywords from host
  if (url.host) {
    var fragments = url.host.split('.');
    fragments = _.difference(fragments, DOMAIN_EXTS);
    for (var i in fragments) {
      keywords = keywords + ' ' + fragments[i];
    }
    keywords = keywords.trim();
  }

  // Parse keywords from pathname
  if (url.pathname && url.pathname != '/') {
    var fragments = url.pathname.replace(/[\/\-\\.;=_,&\|]/g, ' ').split(' ');
    fragments = _.difference(fragments, DOMAIN_EXTS.concat(FILE_EXTS));
    var pathKeywords = ''
    for (var i in fragments) {
      if (fragments[i].length > 2)
        pathKeywords = pathKeywords + ' ' + fragments[i];
    }

    pathKeywords = pathKeywords.trim();
    if (pathKeywords != '')
      keywords = keywords + ' ' + pathKeywords;
  }

  // Parse query string
  if ( !_.isEmpty(url.query)) {
    for (var i in QUERY_PARAMS) {
      var property = QUERY_PARAMS[i];
      var queryKeywords = ''
      if (url.query[property])
        queryKeywords = queryKeywords + ' ' + parseUrl(url.query[property]) + '\n';
    }
    if (keywords.length > 0)
      keywords = keywords + ' ' + queryKeywords;
  }

  return keywords.trim()
}
