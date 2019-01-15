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
    var info = state.transactions[txn];

    // if status is nonzero in response, run error callback
    if(data.status != 0) {
      var err = new Error(data.error);
      err.response = data;

      info.cb(null, err);
    }
    // otherwise, pass data to callback
    else {
      info.cb(data, null);
    }

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
 * The remote end closed the socket. This will terminate the app.
 */
var socketEnded = function() {
  console.log('socket ended, terminating!');

  // TODO: better handling
  process.exit(1);
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
 * Gets info about node(s).
 */
var getNodes = function(nodeId, callback) {
  var request = {
    type: 5
  };

  // if node id is specified, do a request for it
  if(nodeId != null) {
    request.id = Number(nodeId);
  }

  // actually perform request now
  doTxn(request, callback);
}



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
  state.socket.on('end', socketEnded);

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

  getAllNodes: function(callback) { getNodes(null, callback) },
  getNode: getNodes,

  _state: state
};
