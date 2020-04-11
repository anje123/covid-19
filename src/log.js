const fs = require('fs');

function log(req, res) {
  res.format({
    'text/plain': function () {
      fs.readFile('access.log', 'utf8', (err, data) => {
        if (err) throw err;
        res.send(data);
      });
    }
  });
}

export default log;
