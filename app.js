var express = require('express');
const app = express();
const PORT = 8000;

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const HookHandler = require('./handleHook');

app.post('/api/gitlab/hook/:key', HookHandler);

app.listen(PORT, console.log(`listen on Port: ${PORT}`));