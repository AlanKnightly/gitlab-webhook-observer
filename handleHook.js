const R = require('ramda');
const axios = require('axios');
const nameMap= require('./nameMap.json')
const HookHandler = (req, res) => {
  const key = req.params.key;
  const eventType = R.pathOr('', ['object_kind'], req.body);  //事件类型
  const projName = R.pathOr('', ['project', 'name'], req.body); // 项目名称
  const projWebUrl = R.pathOr('', ['project', 'web_url'], req.body); // 项目名称
  const resBody = {}
  if (!key) {
    resBody.success=false
    resBody.step=1
    res.send(resBody);
  } {
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
          md =  `<font color="warning">${projName}项目有新的合并请求: </font>请相关同事注意。
                  > 操作人: ${user}
                  > 分支名:[${title}](${url})  
                  > 详情: ${title} 到 ${targetBranch}`
        } else if (action == 'merge' && state == "merged") {
          md = `${user}将分支[${srcBranch}]合并到[${targetBranch}]`;
          md =  `<font color="warning">${projName}项目有新的合并: </font>请相关同事注意。
                > 详情: ${user}将分支[${srcBranch}]合并到[${targetBranch}]`
        }
      }
        break;
      case 'tag_push': {
        const tagName = R.pathOr('', ['ref'], req.body).split('/').slice(2).join('/');
        const userName = R.pathOr('', ['user_name'], req.body);
        const totalCommitsCount = R.pathOr(0, ['total_commits_count'], req.body);
        const commits = R.pathOr([], ['commits'], req.body);
        const url = R.pathOr('', [`${commits.length - 1}`, 'url'], commits);
        const title = R.pathOr('', [`${commits.length - 1}`, 'title'], commits);
        const isCreate = R.pathOr('', ['before'], req.body) == '0000000000000000000000000000000000000000';
        const isDel = R.pathOr('', ['after'], req.body) == '0000000000000000000000000000000000000000';
        md = `项目[${projName}](${projWebUrl})刚刚收到一次tag push提交\n${isCreate ? `标签名：${tagName}\n` : ''}${isDel ? `被删除标签名：${tagName}\n` : ''}提交者：${userName}\n详情：${totalCommitsCount ? `[${title}](${url})` : `该分支无新commit`}`;
      }
        break;
      case 'push': {
        const userName = R.pathOr('', ['user_name'], req.body);
        const commits = R.pathOr([], ['commits'], req.body);
        const url = R.pathOr('', [`${commits.length - 1}`, 'url'], commits);
        const title = R.pathOr('', [`${commits.length - 1}`, 'title'], commits);
        const checkoutSha = R.pathOr(null, ['checkout_sha'], req.body);
        const totalCommitsCount = R.pathOr(0, ['total_commits_count'], req.body);
        const refs = R.pathOr('', ['ref'], req.body).split('/').slice(2).join('/');
        const {  timestamp } = commits[0];
        const beforeHash =  R.pathOr('', ['before'], req.body) 
        const afterHash =  R.pathOr('', ['after'], req.body) 
        const newBeforeHash = beforeHash.substring(beforeHash.length - 8);
        const newAfterHash = afterHash.substring(afterHash.length - 8);
        const isCreate = beforeHash == '0000000000000000000000000000000000000000';
        if (checkoutSha !== null ) {
          if (isCreate){
            md =  `<font color="warning">${projName}项目有更新变化: </font>请相关同事注意。
            > 分支名: [${refs}](${projWebUrl})
            > 操作人: ${userName}
            > 描述:${totalCommitsCount ? `[${title}](${url})` : `该分支无新commit`}
            > 从 <font color="comment">${newBeforeHash}</font> 更新到 <font color="comment">${newAfterHash}</font>
            > 更新时间: ${timestamp}`
          }
        } else {
          md = `${userName}删除了项目[${projName}](${projWebUrl})的远程分支[${refs}]`;
        }
      }
        break;
      case 'note':
        {
          const user = R.pathOr('', ['user', 'name'], req.body);
          const url = R.pathOr('', ['object_attributes', 'url'], req.body);
          const noteableType = R.pathOr('', ['object_attributes', 'noteable_type'], req.body);
          const desc = R.pathOr('', ['object_attributes', 'description'], req.body);
          const mentionMembers = desc.match(/(@\S*\s)/ig)|| []
          mentionMembers.map(m=>m.trim().slice(1))
          let mentioned = ''
          if (mentionMembers.length){
            mentioned = `并提及了${mentionMembers.map(m => '@' + nameMap[m]).join('')}`
          }
          if (noteableType === "MergeRequest") {
            const reqTitle = R.pathOr('', ['merge_request', 'title'], req.body);
            md = `**${user}**对[${reqTitle}]这个merge请求进行了[评论](${url})` + mentioned;

          } else if (noteableType == "Commit") {
            const reqTitle = R.pathOr('', ['commit', 'title'], req.body);
            md = `**${user}**对[${reqTitle}]这个commit进行了[评论](${url})` + mentioned;

          } else if (noteableType == "Issue") {
            const reqTitle = R.pathOr('', ['issue', 'title'], req.body);
            md = `**${user}**对[${reqTitle}]这个issue进行了[评论](${url})` + mentioned;
          }
        }
        break;
      case 'issue': {
        const user = R.pathOr('', ['user', 'name'], req.body);
        const issueUrl = R.pathOr('', ['object_attributes', 'url'], req.body);
        const issueTitle = R.pathOr('', ['object_attributes', 'title'], req.body);
        const state = R.pathOr('', ['object_attributes', 'state'], req.body);
        const action = R.pathOr('', ['object_attributes', 'action'], req.body);
        if (action == "close" && state == "closed") {
          md = `**${user}**在[${projName}](${projWebUrl})关闭了issue [[${issueTitle}](${issueUrl})]`;
        } else if (action == "open" && state == "opened") {
          md = `**${user}**在[${projName}](${projWebUrl})新建了issue [[${issueTitle}](${issueUrl})]`;
        }
        // md = `<font color=\"warning\">${user}</font>刚刚在 ${projName} 开了个issue [[${issueTitle}](${issueUrl})]`;
      }
        break;
      default:
        break;
    }
    if (md) {
      resBody.success=true
      resBody.step=2
      resBody.hasMd=true
      axios.post(`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${key}`, {
                //https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=e852f98c-d928-43b6-991e-0e8faef8e68b
        "msgtype": "markdown",
        "markdown": {
          "content": md,
        }
      })
        .catch(function (error) {
          resBody.success=false
          resBody.step=3
          resBody.hasMd=true
          resBody.em=JSON.stringify(error)
          console.log(error);
        });
    }
    res.send(resBody);
  }
};

module.exports = HookHandler;