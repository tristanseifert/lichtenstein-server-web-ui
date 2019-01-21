var express = require('express');
var router = express.Router();

/**
 * Creates a JSON string containing the default parameters of all routines that
 * were passed in, indexed by id.
 */
var getRoutineDefaultString = function(routines) {
  var defaults = {};

  // iterate over all routines
  for(var i = 0; i < routines.length; i++) {
    const routine = routines[i];

    defaults[Number(routine.id)] = routine.defaults;
  }

  // return stringified version
  return JSON.stringify(defaults);
}

// GET /brightness: Shows interface to change brightness of one or more groups
router.get('/brightness', function(req, res, next) {
  global.lichtenstein.getAllGroups(function(data, err) {
    if(err) {
      return next(err);
    }

    // render template, specifying all groups
    res.render('tool-brightness', {
      groups: data.groups
    });
  });
});
// POST /brightness: Updates brightness.
router.post('/brightness', function(req, res, next) {
  var errors = [];

  // this function will render the template when the time comes
  var renderTemplate = function() {
    global.lichtenstein.getAllGroups(function(data, err) {
      if(err) {
        return next(err);
      }

      // render template, specifying all groups
      res.render('tool-brightness', {
        groups: data.groups,
        errors: errors,
        success: (errors.length == 0)
      });
    });
  };

  // make sure all parameters are specified
  if(!("group" in req.body) || !("brightness" in req.body)) {
    return next(new Error("Missing parameters, you must specify group and brightness."));
  }

  // scale brightness to [0, 1]
  var brightness = Math.max(0, Math.min((Number(req.body.brightness) / 100), 1));

  // do we have multiple groups?
  var groupsToSet = [];
  var groupsAlreadySet = 0;

  if(req.body.group instanceof Array) {
    for (var i = 0; i < req.body.group.length; i++) {
      groupsToSet.push(Number(req.body.group[i]));
    }
  }
  // just a single instance
  else {
    groupsToSet.push(Number(req.body.group));
  }

  // invoke the brightness routine
  for (var i = 0; i < groupsToSet.length; i++) {
    var groupId = groupsToSet[i];

    global.lichtenstein.setGroupBrightness(groupId, brightness, function(response, err) {
      // handle errors
      if(err) {
        return next(err);
      }

      // increment counter. if equal to the number of groups total, render
      groupsAlreadySet++;

      if(groupsAlreadySet == groupsToSet.length) {
        renderTemplate();
      }
    });
  }
});

// GET /routine: Shows interface to change routine of one or more groups
router.get('/routine', function(req, res, next) {
  var templateData = {};

  // this function will render the template once all data is loaded
  var renderTemplateIfDone = function() {
    // is all data there?
    if(templateData.groups && templateData.routines) {
      res.render('tool-routine', templateData);
    }
  }

  // get all groups
  global.lichtenstein.getAllGroups(function(data, err) {
    if(err) {
      return next(err);
    }

    // save the data
    templateData.groups = data.groups;
    renderTemplateIfDone();
  });

  // get all routines
  global.lichtenstein.getAllRoutines(function(data, err) {
    if(err) {
      return next(err);
    }

    // save the data
    templateData.routines = data.routines;
    templateData.defaults = getRoutineDefaultString(data.routines);

    renderTemplateIfDone();
  });
});
// POST /routine: Updates the active routine.
router.post('/routine', function(req, res, next) {
  var errors = [];

  // this function will render the template when the time comes
  var renderTemplate = function() {
    var templateData = {};

    // this function will render the template once all data is loaded
    var renderTemplateIfDone = function() {
      // is all data there?
      if(templateData.groups && templateData.routines) {
        res.render('tool-routine', templateData);
      }
    }

    // get all groups
    global.lichtenstein.getAllGroups(function(data, err) {
      if(err) {
        return next(err);
      }

      // save the data
      templateData.groups = data.groups;
      renderTemplateIfDone();
    });

    // get all routines
    global.lichtenstein.getAllRoutines(function(data, err) {
      if(err) {
        return next(err);
      }

      // save the data
      templateData.routines = data.routines;
      templateData.defaults = getRoutineDefaultString(data.routines);

      renderTemplateIfDone();
    });
  };

  // make sure all parameters are specified
  if(!("group" in req.body) || !("routine" in req.body)) {
    return next(new Error("Missing parameters, you must specify group and routine."));
  }

  // do we have multiple groups?
  var groupsToSet = [];
  var groupsAlreadySet = 0;

  if(req.body.group instanceof Array) {
    for (var i = 0; i < req.body.group.length; i++) {
      groupsToSet.push(Number(req.body.group[i]));
    }
  }
  // just a single instance
  else {
    groupsToSet.push(Number(req.body.group));
  }

  // decode params
  var params = JSON.parse(req.body.params);

  // set the routine
  global.lichtenstein.setRoutine(req.body.routine, params, groupsToSet, function(data, err) {
    // handle errors
    if(err) {
      return next(err);
    }

    // render template
    renderTemplate();
  });
});

module.exports = router;
