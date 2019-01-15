const net = require('net');

/**
 * Provides a high-level interface to the Lichtenstein command socket API.
 */
var state = {
  // last sent transaction
  txn: 0,
  // maps of txn id's to callbacks
  transactions: {}
};

/**
 * Performs a transaction.
 *
 * Callbacks take two arguments: The resultant data (object) and an error.
 */
var doTxn = function(request, callback) {
  // add the txn field (so we can identify it later)
  request.txn = (++state.txn);

  console.log('sending request ', request);

  // store callback
  state.transactions[request.txn] = {
    "cb": callback
    /* TODO: handle timeouts? */
  };

  // stringify and send request
  const str = JSON.stringify(request);

  state.socket.write(str, 'utf8', function() {
    /* data was written - we don't do anything */
  });
};

/**
 * Handles received data. This finds the callback that matches the transaction
 * number and calls it.
 */
var socketDataReceived = function(jsonData) {
  // try to parse it
  var data = JSON.parse(jsonData);

  // find an item with a matching txn
  var txn = data.txn;

  if(state.transactions[txn]) {
    // run the callback
    var info = state.transactions[txn];
    info.cb(data, null);

    // remove it
    delete state.transactions[txn];
  }

  console.log(state.transactions);
};
/**
 * Handles a socket error.
 */
var socketError = function(err) {
  console.log(err);

  // TODO: better handling
  throw(err);
};



/**
 * Gets the server's status.
 */
var getServerStatus = function(callback) {
  doTxn({
    type: 0
  }, callback);
};



/**
 * Connects to the command socket. Options must contain at least the keys "host"
 * and "port."
 */
var connect = function(options) {
  // attempt to create the connection
  state.socket = net.createConnection({
    port: options.port,
    host: options.host
  });

  // ensure its encoding is set to utf8 so we get strings we can parse
  state.socket.setEncoding('utf8');

  // add an event handler for received data
  state.socket.on('data', socketDataReceived);

  // also, handle the socket being closed
  state.socket.on('error', socketError);

  // get server state on connect
  state.socket.on('connect', function() {
    /*getServerStatus(function(data, err) {
      console.log('server state/request error:', data, err);
    });
    console.log('socket connected');*/
  });
};

module.exports = {
  connect: connect,

  getServerStatus: getServerStatus,

  _state: state
};
