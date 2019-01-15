var express = require('express');
var router = express.Router();

// GET /: Shows all nodes
router.get('/', function(req, res, next) {
  global.lichtenstein.getAllNodes(function(data, err) {
    if(err) {
      return next(err);
    }

    res.render('node-list', {
      response: data
    });
  });
});

// GET /:nodeId: Gets info on a particular node.
router.get('/:nodeId', function(req, res, next) {
  var templateData = {
    channels: []
  };

  // this function actually renders the template
  var tryRender = function() {
    // make sure we have all data
    if(templateData.node && templateData.channels) {
      res.render('node-detail', templateData);
    }
  };

  // get the node (by id)
  global.lichtenstein.getNode(req.params.nodeId, function(data, err) {
    if(err) {
      return next(err);
    }

    templateData.node = data.node;
    tryRender();
  });

  // find all channels belonging to this node
  // TODO: ^ this
});

module.exports = router;
