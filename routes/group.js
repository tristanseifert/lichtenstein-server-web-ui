var express = require('express');
var router = express.Router();

// GET /: Shows all groups
router.get('/', function(req, res, next) {
  global.lichtenstein.getAllGroups(function(data, err) {
    if(err) {
      return next(err);
    }

    res.render('group-list', {
      response: data
    });
  });
});

// GET /:groupId: Gets info on a particular group.
router.get('/:groupId', function(req, res, next) {
  var templateData = {
    /* nothing */
  };

  // this function actually renders the template
  var tryRender = function() {
    // make sure we have all data
    if(templateData.group) {
      res.render('group-detail', templateData);
    }
  };

  // get the node (by id)
  global.lichtenstein.getGroup(req.params.groupId, function(data, err) {
    if(err) {
      return next(err);
    }

    templateData.group = data.group;
    tryRender();
  });
});

module.exports = router;
