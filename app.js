var express = require('express');
const app = express();
const PORT = 8090;

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded



// respond with "hello world" when a GET request is made to the homepage
app.get('/gitlab/hook', function (req, res) {
  //check: X-Gitlab-Token

  const payload = JSON.stringify(req.body);
  res.send(payload);
});

app.listen(PORT, console.log(`listen on Port: ${PORT}`));