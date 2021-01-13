var express = require('express');


const app = express();
const PORT = 80;

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const HookHandler = require('./handleHook');

app.post('/gitlab/hook', HookHandler);

app.listen(PORT, console.log(`listen on Port: ${PORT}`));