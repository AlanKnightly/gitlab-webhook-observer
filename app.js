var express = require('express');

const R = require('ramda');
const app = express();
const PORT = 80;
const projHookMap = require("./botWebhooks.json");
var expressWinston = require('express-winston');
var winston = require('winston'); // for transports.Console



app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// express-winston logger makes sense BEFORE the router
app.use(expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: 'gitlab-webhook-record', level: 'info' }),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}));


const resByEventType = (type, body) => {
  const projName = R.pathOr('', ['project', 'name'], req.body); // 项目名称
  const userName = R.pathOr('', ['user_name'], req.body);  //谁
  switch (type) {
    case 'issue':
      const issueUrl = R.pathOr('', ['object_attributes', 'url'], req.body); // issue url
      const issueTitle = R.pathOr('', ['object_attributes', 'title'], req.body); // issue title
      return `[${projName}]\n
        ${userName} 刚刚开了个issue [${issueTitle}](${issueUrl})
        `;
    case 'push':
      const issueUrl = R.pathOr('', ['object_attributes', 'url'], req.body); // issue url
      const issueTitle = R.pathOr('', ['object_attributes', 'title'], req.body); // issue title
      return `[${projName}]\n
        ${userName} 刚刚push了个分支 [${issueTitle}](${issueUrl})
        `;
  }

};

app.post('/gitlab/hook', function (req, res) {
  //check: X-Gitlab-Token

  const eventType = R.pathOr('', ['event_type'], req.body);  //事件类型
  const Params = resByEventType(eventType, req.body);
  // const gitlabEvent = req.get('X-Gitlab-Event'); //事件




  const message = `${userName}刚刚在【${projName}】`;
  const bots = projHookMap[projName];
  // bots.map(n => {
  //   axios.post(n, {
  //     "msgtype": "markdown",
  //     "markdown": {
  //       "content": `【${gitlabEvent}】\n
  //       类型:< font color=\"comment\">用户反馈</font>`
  //     }
  //   })
  //     .then(function (response) {
  //       console.log(response);
  //     })
  //     .catch(function (error) {
  //       console.log(error);
  //     });
  // });
  const payload = JSON.stringify(req.body);
  console.log(payload);
  // res.send(payload);
});

app.listen(PORT, console.log(`listen on Port: ${PORT}`));