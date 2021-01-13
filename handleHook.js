const R = require('ramda');
const projHookMap = require("./botWebhooks.json");
const axios = require('axios');

const HookHandler = (req, res) => {
  const eventType = R.pathOr('', ['object_kind'], req.body);  //事件类型
  const projName = R.pathOr('', ['project', 'name'], req.body); // 项目名称
  const projWebUrl = R.pathOr('', ['project', 'web_url'], req.body); // 项目名称

  const bots = projHookMap[projName];
  let md = '';
  // 根据event_type类型返回消息
  switch (eventType) {
    case 'merge_request': {
      const user = R.pathOr('', ['user', 'name'], req.body);
      const srcBranch = R.pathOr('', ['object_attributes', 'source_branch'], req.body);
      const targetBranch = R.pathOr('', ['object_attributes', 'target_branch'], req.body);
      const url = R.pathOr('', ['object_attributes', 'url'], req.body);
      const title = R.pathOr('', ['object_attributes', 'title'], req.body);
      const state = R.pathOr('', ['object_attributes', 'state'], req.body);
      const action = R.pathOr('', ['object_attributes', 'action'], req.body);
      if (action == 'open') {
        md = `项目[${projName}](${projWebUrl})刚刚收到一个merge request\n请求者：${user}\n源分支：[${srcBranch}]\n目标分支[${targetBranch}]\n详情：[${title}](${url})`; //
      } else if (action == 'merge' && state == "merged") {
        md = `<font color=\"warning\">${user}</font> 刚刚将分支[${srcBranch}]合并到[${targetBranch}]`;
      }
    }
      break;
    case 'push': {
      const userName = R.pathOr('', ['user_name'], req.body);
      const title = R.pathOr('', ['commits', '0', 'title'], req.body);
      const url = R.pathOr('', ['commits', '0', 'url'], req.body);
      const checkoutSha = R.pathOr(null, ['checkout_sha'], req.body);
      const totalCommitsCount = R.pathOr(0, ['total_commits_count'], req.body);
      const refs = R.pathOr('', ['ref'], req.body).split('/').slice(2).join('/');


      if (checkoutSha !== null) {
        md = `项目[${projName}](${projWebUrl})刚刚收到一次push提交\n提交者：${userName}\n分支：${refs}\n详情：[${title}](${url})`;
      } else {
        md = `项目[${projName}](${projWebUrl})刚刚受理一次分支删除\n被删除分支：${refs}\n删除者：${userName}`;
      }
    }
      break;
    case 'note':
      {
        const user = R.pathOr('', ['user', 'name'], req.body);
        const url = R.pathOr('', ['object_attributes', 'url'], req.body);
        const noteableType = R.pathOr('', ['object_attributes', 'noteable_type'], req.body);
        md = `<font color=\"warning\">${user}</font>在 ${noteableType} [${url}](${url}) 留下了评论 `;
      }
      break;
    case 'issue': {
      const user = R.pathOr('', ['user', 'name'], req.body);
      const issueUrl = R.pathOr('', ['object_attributes', 'url'], req.body);
      const issueTitle = R.pathOr('', ['object_attributes', 'title'], req.body);
      md = `<font color=\"warning\">${user}</font>刚刚在 ${projName} 开了个issue [[${issueTitle}](${issueUrl})]`;
    }
      break;
    default:
      break;
  }
  if (md) {
    bots.map(n => {
      axios.post(n, {
        "msgtype": "markdown",
        "markdown": {
          "content": md,
        }
      })
        .catch(function (error) {
          console.log(error);
        });
    });
  }
  res.send({ success: true });
};

module.exports = HookHandler;