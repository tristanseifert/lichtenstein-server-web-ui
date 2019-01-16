$(document).foundation();

$(document).ready(function() {
  // set defaults for routines
  $('.tool-routine #routine').change(function() {
    // get the selected value
    var selected = $('#routine option:selected').val();

    // get the defaults for it
    const defaults = window.routineDefaults[selected];

    // render it in the table
    var table = $('.tool-routine #routineParams');
    var body = $(table).find('tbody');

    // remove all existing children
    body.empty();

    // add a row for each property
    for(var key in defaults) {
      if(defaults.hasOwnProperty(key)) {
        body.append($('<tr>').data('key', key).append(
          $('<td>').text(key),
          $('<td>').append($('<input type="number" step="0.001">').val(defaults[key]))
        ));
      }
    }
  });

  // on submit handler for routine form
  $('.tool-routine form').submit(function() {
    var params = {};

    // find all rows
    var table = $('.tool-routine #routineParams');
    var body = $(table).find('tbody');

    var rows = $(body).find('tr');

    for(var i = 0; i < rows.length; i++) {
      var row = $(rows[i]);

      var key = row.data('key');
      var val = row.find('input').val();

      params[key] = Number(val);
    }

    // plop it in the params field
    console.log(params)
    $('input[name="params"]').val(JSON.stringify(params));
  });

  $('.tool-routine #routine').change();
});
