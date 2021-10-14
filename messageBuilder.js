const R = require('ramda');
const nameMap= require('./nameMap.json')
const FSMessenger = require('./service/FSMessenger')

const buildMessage = {
    'merge_request':function(req,imType){
        const projName = R.pathOr('', ['project', 'name'], req.body); // 项目名称
        const projWebUrl = R.pathOr('', ['project', 'web_url'], req.body); // 项目地址
        const user = R.pathOr('', ['user', 'name'], req.body);
        const username = R.pathOr('', ['user', 'username'], req.body);
        const nickname = nameMap[username] || user
        const srcBranch = R.pathOr('', ['object_attributes', 'source_branch'], req.body);
        const targetBranch = R.pathOr('', ['object_attributes', 'target_branch'], req.body);
        const url = R.pathOr('', ['object_attributes', 'url'], req.body);
        const title = R.pathOr('', ['object_attributes', 'title'], req.body);
        const state = R.pathOr('', ['object_attributes', 'state'], req.body);
        const action = R.pathOr('', ['object_attributes', 'action'], req.body);
        let content = ''
        if(imType == 'wx'){
            if (action == 'open') {
                content =  `<font color="warning">${projName}项目有新的合并请求: </font>请相关同事注意。
                        > 操作人: ${nickname}
                        > 分支名:[${title}](${url})  
                        > 详情: ${title} 到 ${targetBranch}`
              } else if (action == 'merge' && state == "merged") {
                content =  `<font color="warning">${projName}项目有新的合并: </font>请相关同事注意。
                      > 详情: ${nickname}将分支[${srcBranch}]合并到[${targetBranch}]`
              }
            return content
        }else if(imType == 'fs'){
          const fsMessenger = new FSMessenger()
          if (action == 'open') {
            content = fsMessenger.setTitle("合并请求")
            .addLine(`${projName}项目有新的合并请求:`)
            .addLine(`操作人: ${nickname}`)
            .addLine(`分支名: `,[title, url])
            .addLine(`详情: ${title} 到 ${targetBranch}`)
            .post
          } else if (action == 'merge' && state == "merged") {
            content = fsMessenger.setTitle("代码被合并")
            .addLine(`${projName}项目有新的合并,请相关同事注意。`)
            .addLine(`详情: ${nickname}将分支[${srcBranch}]合并到[${targetBranch}]`)
            .post
          }
        }
        return content
    },
    'tag_push':function(req,imType){
        const projName = R.pathOr('', ['project', 'name'], req.body); // 项目名称
        const projWebUrl = R.pathOr('', ['project', 'web_url'], req.body); // 项目地址
        const tagName = R.pathOr('', ['ref'], req.body).split('/').slice(2).join('/');
        const userName = R.pathOr('', ['user_name'], req.body);
        const username = R.pathOr('', ['user_username'], req.body);
        const nickname = nameMap[username] || userName
        const totalCommitsCount = R.pathOr(0, ['total_commits_count'], req.body);
        const commits = R.pathOr([], ['commits'], req.body);
        const url = R.pathOr('', [`${commits.length - 1}`, 'url'], commits);
        const title = R.pathOr('', [`${commits.length - 1}`, 'title'], commits);
        const isCreate = R.pathOr('', ['before'], req.body) == '0000000000000000000000000000000000000000';
        const isDel = R.pathOr('', ['after'], req.body) == '0000000000000000000000000000000000000000';
        if(imType == 'wx'){
          return `项目[${projName}](${projWebUrl})刚刚收到一次tag push提交\n${isCreate ? `标签名：${tagName}\n` : ''}${isDel ? `被删除标签名：${tagName}\n` : ''}提交者：${nickname}\n详情：${totalCommitsCount ? `[${title}](${url})` : `该分支无新commit`}`;
        }else if(imType == 'fs'){
          const fsMessenger = new FSMessenger()
          fsMessenger.setTitle("新的Tag Push提交")
          .addLine('项目',[projName, projWebUrl],'刚刚收到一次tag push提交')

          if(isCreate){
            fsMessenger.addLine(`标签名：${tagName}`)
          }
          if(isDel){
            fsMessenger.addLine(`被删除标签名：${tagName}`)
          }
          fsMessenger.addLine(`提交者：${nickname}`)
          .addLine( `详情：`, totalCommitsCount?[title, url]: '该分支无新commit' )
          return fsMessenger.post
        }
        return ''
    },
    'push':function(req,imType){
        const projName = R.pathOr('', ['project', 'name'], req.body); // 项目名称
        const projWebUrl = R.pathOr('', ['project', 'web_url'], req.body); // 项目地址
        const userName = R.pathOr('', ['user_name'], req.body);
        const username = R.pathOr('', ['user_username'], req.body);
        const nickname = nameMap[username] || userName
        const commits = R.pathOr([], ['commits'], req.body);
        const url = R.pathOr('', [`${commits.length - 1}`, 'url'], commits);
        const title = R.pathOr('', [`${commits.length - 1}`, 'title'], commits);
        const checkoutSha = R.pathOr(null, ['checkout_sha'], req.body);
        const totalCommitsCount = R.pathOr(0, ['total_commits_count'], req.body);
        const refs = R.pathOr('', ['ref'], req.body).split('/').slice(2).join('/');
        const beforeHash =  R.pathOr(null, ['before'], req.body) 
        const isCreate = beforeHash === '0000000000000000000000000000000000000000';
            let content = ''
            if (checkoutSha !== null ) {
                const newAfterHash = checkoutSha.substring(0, 8);
                if (isCreate){
                  const {  timestamp } = commits[0];
                  // commits[0]为undefined表示已经移除改分支，不必为之推送消息
                  if(commits[0] == undefined) return ''
                  const newBeforeHash = beforeHash.substring(0, 8);
                  if(imType == 'wx'){
                    content =  `<font color="warning">${projName}项目有更新变化: </font>请相关同事注意。
                    > 分支名: [${refs}](${projWebUrl})
                    > 操作人: ${nickname}
                    > 描述:${totalCommitsCount ? `[${title}](${url})` : `该分支无新commit`}
                    > 从 <font color="comment">${newBeforeHash}</font> 更新到 <font color="comment">${newAfterHash}</font>
                    > 更新时间: ${timestamp}`
                  }else if (imType == 'fs'){
                    const fsMessenger = new FSMessenger()
                    content =  fsMessenger.setTitle("远程分支推送")
                    .addLine( `${projName}项目有更新变化,请相关同事注意.`)
                    .addLine(`分支名: `, [refs, projWebUrl])
                    .addLine(`操作人: ${nickname}`)
                    .addLine( `描述: `, totalCommitsCount? [title, url]:`该分支无新commit`)
                    .addLine(`从${newBeforeHash}更新到 ${newAfterHash}`)
                    .addLine(`更新时间: ${timestamp}`)
                    .post
                  }
                }else{
                  if(req.query.every_push){
                   const { url , title, timestamp } = commits[0];
                   if(imType == 'wx'){
                    content =  `${nickname}更新了远程分支[${refs}](${projWebUrl})
                    > commit 说明: [${title}](${url}) 
                    > commit 哈希: <font color="comment">${newAfterHash}</font>
                    > 更新时间: ${timestamp}`
                   }else if(imType == 'fs'){
                    const fsMessenger = new FSMessenger()
                    content = fsMessenger.setTitle("远程分支更新")
                    .addLine(`${nickname}更新了远程分支`, [refs, projWebUrl])
                    .addLine(`commit 说明: `, [title, url])
                    .addLine(`commit 哈希: ${newAfterHash}`)
                    .addLine(`更新时间: ${timestamp}`)
                    .post
                   }
                  }
                }
              } else {
                if(imType == 'wx'){
                  content = `${nickname}删除了项目[${projName}](${projWebUrl})的远程分支[${refs}]`;
                }else if(imType == 'fs'){
                  const fsMessenger = new FSMessenger()
                  content = fsMessenger.setTitle("远程分支删除")
                  .addLine(`${nickname}删除了项目`,[projName, projWebUrl],`的远程分支[${refs}]`)
                  .post
                }
              }
              return content
        
    },
    'note':function(req,imType){
        const projName = R.pathOr('', ['project', 'name'], req.body); // 项目名称
        const projWebUrl = R.pathOr('', ['project', 'web_url'], req.body); // 项目地址
        const user = R.pathOr('', ['user', 'name'], req.body);
        const username = R.pathOr('', ['user', 'username'], req.body);
        const nickname = nameMap[username] || user
        const url = R.pathOr('', ['object_attributes', 'url'], req.body);
        const notableType = R.pathOr('', ['object_attributes', 'noteable_type'], req.body);
        const desc = R.pathOr('', ['object_attributes', 'description'], req.body);
        let mentionMembers = desc.match(/(@\S*\s?)/ig)|| []
        mentionMembers= mentionMembers.map(m=>m.trim().slice(1))
        let mentioned = ''
        if (mentionMembers.length){
          // resBody.memtion = mentionMembers
          mentioned = `并提及了${mentionMembers.map(m =>  nameMap[m]? '@' + nameMap[m]:'@' + m ).join('')}`
        }
        const descContent = desc.length>10?String(desc).slice(10)+"..." : desc
        const notableTypeMap = {
          MergeRequest: 'merge请求',
          Commit: 'commit',
          Issue: 'issue'
        }
        let reqTitle = ''
        if (notableType === "MergeRequest") {
          reqTitle = R.pathOr('', ['merge_request', 'title'], req.body);
        } else if (notableType == "Commit") {
          reqTitle = R.pathOr('', ['commit', 'title'], req.body);
        } else if (notableType == "Issue") {
          reqTitle = R.pathOr('', ['issue', 'title'], req.body);
        }
        let content=''
        if(imType == 'wx'){
          content = `**${nickname}**对[${reqTitle}]这个${notableTypeMap[notableType]}进行了[评论](${url})` + mentioned +`\n"${descContent}"`;
        }else if(imType == 'fs'){
          const fsMessenger = new FSMessenger()
          fsMessenger.setTitle("评论")
          content = fsMessenger
          .addLine(`${nickname} 对[${reqTitle}]这个${notableTypeMap[notableType]}进行了`, [`评论`,url], mentioned)
          .addLine(`"${descContent}"`)
          .post
        }
        return content
    },
    'issue':function(req,imType){
        const projName = R.pathOr('', ['project', 'name'], req.body); // 项目名称
        const projWebUrl = R.pathOr('', ['project', 'web_url'], req.body); // 项目地址
        const user = R.pathOr('', ['user', 'name'], req.body);
        const username = R.pathOr('', ['user', 'username'], req.body);
        const nickname = nameMap[username] || user
        const issueUrl = R.pathOr('', ['object_attributes', 'url'], req.body);
        const issueTitle = R.pathOr('', ['object_attributes', 'title'], req.body);
        const state = R.pathOr('', ['object_attributes', 'state'], req.body);
        const action = R.pathOr('', ['object_attributes', 'action'], req.body);
        let actionWord = '操作'
        if (action == "close" && state == "closed") {
          actionWord = '关闭'
        } else if (action == "open" && state == "opened") {
          actionWord = '新建'
        }
        let content = ''
        if(imType == 'wx'){
          content = `**${nickname}**在[${projName}](${projWebUrl})${actionWord}了issue [[${issueTitle}](${issueUrl})]`;
        }else if(imType == 'fs'){
          const fsMessenger = new FSMessenger()
          content = fsMessenger.setTitle("Issue关闭")
          .addLine(`${nickname} 在`, [projName, projWebUrl],`${actionWord}(${action})了issue [`,[issueTitle, issueUrl],`]`)
          .post
        }
        return content
    },
    'build':function(){
      return ''
    }
}


module.exports = buildMessage