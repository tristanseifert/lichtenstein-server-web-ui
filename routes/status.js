var express = require('express');
var router = express.Router();

// GET /: Shows server status
router.get('/', function(req, res, next) {
  global.lichtenstein.getServerStatus(function(data, err) {
    if(err) {
      return next(err);
    }

    res.render('status', {
      response: data,
      helpers: {
        roundLoadAvg: function(avg) {
          return +Number(avg).toFixed(2);
        }
      }
    });
  });
});

module.exports = router;
