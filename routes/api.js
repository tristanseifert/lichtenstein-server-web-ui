/**
 * Defines the v1 API to communicate with the Lichtenstein server.
 *
 * Currently, authentication is done through Basic authorization, the user/pass
 * of which are specified in the config.
 */
var express = require('express');
var router = express.Router();

var config = require('config');

// set up basic auth
const basicAuth = require('express-basic-auth');

var apiBasicAuth = {};
apiBasicAuth[config.get('api.username')] = config.get('api.password');

router.use(basicAuth({
  users: apiBasicAuth
}));

// GET /node: return all nodes
router.get('/node', function(req, res, next) {
  global.lichtenstein.getAllNodes(function(data, err) {
    // handle errors
    if(err) {
      return next(err);
    }

    // output nodes
    res.json({
      nodes: data.nodes
    });
  });
});
// GET /node/:nodeId: return a single node
router.get('/node/:nodeId', function(req, res, next) {
  global.lichtenstein.getNode(req.params.nodeId, function(data, err) {
    // handle errors
    if(err) {
      return next(err);
    }

    // output node
    res.json({
      node: data.node
    });
  });
});

// GET /group: return all groups
router.get('/group', function(req, res, next) {
  global.lichtenstein.getAllGroups(function(data, err) {
    // handle errors
    if(err) {
      return next(err);
    }

    // output groups
    res.json({
      groups: data.groups
    });
  });
});
// GET /group/:groupId: return a single group
router.get('/group/:groupId', function(req, res, next) {
  global.lichtenstein.getGroup(req.params.groupId, function(data, err) {
    // handle errors
    if(err) {
      return next(err);
    }

    // output group
    res.json({
      group: data.group
    });
  });
});
// POST /group/:groupId/brightness: sets the brightness of a single group
router.post('/group/:groupId/brightness', function(req, res, next) {
  // scale brightness
  var brightness = Math.max(0, Math.min((Number(req.body.brightness) / 100), 1));

  if(brightness == null || isNaN(brightness)) {
    return next(new Error("POST field brightness must be specified as a number"));
  }

  global.lichtenstein.setGroupBrightness(req.params.groupId, brightness, function(response, err) {
    // handle errors
    if(err) {
      return next(err);
    }

    // success
    res.json({
      /* nothing */
    });
  });
});

// GET /routine: return all routines
router.get('/routine', function(req, res, next) {
  global.lichtenstein.getAllRoutines(function(data, err) {
    // handle errors
    if(err) {
      return next(err);
    }

    // output routines
    res.json({
      routines: data.routines
    });
  });
});
// GET /routine/:routineId: return a single routine
router.get('/routine/:routineId', function(req, res, next) {
  global.lichtenstein.getRoutine(req.params.routineId, function(data, err) {
    // handle errors
    if(err) {
      return next(err);
    }

    // output routine
    res.json({
      routine: data.routine
    });
  });
});



// API error handler
router.use(function(err, req, res, next) {
  res.status(err.status || 500);

  res.json({
    error: err.message
  })
});

module.exports = router;
