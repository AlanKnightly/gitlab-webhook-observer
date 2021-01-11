var express = require('express');

const R = require('ramda');
const app = express();
const PORT = 80;
const projHookMap = require("./botWebhooks.json");
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/gitlab/hook', function (req, res) {
  //check: X-Gitlab-Token
  const gitlabEvent = req.get('X-Gitlab-Event'); //事件
  const projName = R.pathOr('', ['project', 'name'], req.body); // 项目名称
  const userName = R.pathOr('', ['user_name'], req.body);  //谁

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