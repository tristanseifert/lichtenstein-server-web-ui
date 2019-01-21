/**
 * Defines the v1 API to communicate with the Lichtenstein server.
 *
 * Currently, authentication is done through Basic authorization, the user/pass
 * of which are specified in the config.
 *
 * All non-GET requests should have a JSON object in the body of the request.
 */
var express = require('express');
var router = express.Router();

var config = require('config');

// enforce content type of application/json
const ensureCtype = require('express-ensure-ctype');
const ensureJson = ensureCtype('json');

router.post(ensureJson);

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
    return next(new Error("Parameter `brightness` must be a number"));
  }

  // set the brightness of that single group
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


// POST: /util/brightness: Sets the brightness of one or more groups simultaneously
router.post('/util/brightness', function(req, res, next) {
  // scale brightness
  var brightness = Math.max(0, Math.min((Number(req.body.brightness) / 100), 1));

  if(brightness == null || isNaN(brightness)) {
    return next(new Error("Parameter `brightness` must be a number"));
  }

  // format array of group IDs
  var groups = req.body.groups;
  var groupsAlreadySet = 0;

  if(!Array.isArray(groups)) {
    return next(new Error("Parameter `groups` must be an array"));
  }

  for(var i = 0; i < groups.length; i++) {
    if(isNaN(groups[i])) {
      return next(new Error("Parameter `groups` must be an array of numbers (position " + i + " in array)"));
    }
  }

  // perform request for each
  for(var i = 0; i < groups.length; i++) {
    var groupId = groups[i];

    global.lichtenstein.setGroupBrightness(groupId, brightness, function(response, err) {
      // handle errors
      if(err) {
        return next(err);
      }

      // increment counter. if equal to the number of groups total, render
      groupsAlreadySet++;

      if(groupsAlreadySet == groups.length) {
        // finish request
        res.json({
          groupsSet: groupsAlreadySet
        });
      }
    });
  }
});

// POST: /util/setRoutine: Sets the routine for one or more groups simultaneously
router.post('/util/setRoutine', function(req, res, next) {
  // format array of group IDs
  var groups = req.body.groups;

  if(!Array.isArray(groups)) {
    return next(new Error("Parameter `groups` must be an array"));
  }

  for(var i = 0; i < groups.length; i++) {
    if(isNaN(groups[i])) {
      return next(new Error("Parameter `groups` must be an array of numbers (position " + i + " in array)"));
    }
  }

  // get routine id
  var routineId = req.body.routine;

  if(isNaN(routineId) || !Number.isInteger(routineId)) {
    return next(new Error("Parameter `routine` must be an integer"));
  }

  // get params (may be null)
  var params = req.body.params;

  if(params != null) {
    // make sure it's an object (think "{}")
    if(obj !== Object(obj) || Object.prototype.toString.call(obj) === '[object Array]') {
      return next(new Error("Parameter `params` must be an object"));
    }
  }

  // make the request
  global.lichtenstein.setRoutine(routineId, params, groups, function(data, err) {
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

// API error handler
router.use(function(err, req, res, next) {
  res.status(err.status || 500);

  res.json({
    error: err.message
  })
});

module.exports = router;
