var express = require('express');
var router = express.Router();

// GET /: Shows all routines
router.get('/', function(req, res, next) {
  global.lichtenstein.getAllRoutines(function(data, err) {
    if(err) {
      return next(err);
    }

    res.render('routine-list', {
      response: data
    });
  });
});

// GET /:routineId: Gets info on a particular routines.
router.get('/:routineId', function(req, res, next) {
  var templateData = {
    /* nothing */
  };

  // this function actually renders the template
  var tryRender = function() {
    // make sure we have all data
    if(templateData.routine) {
      res.render('routine-detail', templateData);
    }
  };

  // get the routine (by id)
  global.lichtenstein.getRoutine(req.params.routineId, function(data, err) {
    if(err) {
      return next(err);
    }

    templateData.routine = data.routine;
    tryRender();
  });
});

module.exports = router;
