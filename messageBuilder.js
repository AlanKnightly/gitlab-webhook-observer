const R = require('ramda');
const nameMap= require('./nameMap.json')
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
          if (action == 'open') {
            content = {
              "title": "合并请求",
                  "content": [
                    [
                      {
                        "tag": "text",
                        "text": `${projName}项目有新的合并请求:`
                      }
                    ],
                    [
                      {
                        "tag": "text",
                        "text": `操作人: ${nickname}`
                      }
                    ],
                    [
                      {
                        "tag": "text",
                        "text": `分支名: `
                      },
                      {
                        "tag": "a",
                        "text": `${title}`,
                        "href": `${url}`
                      }
                    ],
                    [
                      {
                        "tag": "text",
                        "text": `详情: ${title} 到 ${targetBranch}`
                      }
                    ],
                  ]
            }
          } else if (action == 'merge' && state == "merged") {
            content = {
              "title": "代码被合并",
                  "content": [
                    [
                      {
                        "tag": "text",
                        "text": `${projName}项目有新的合并,请相关同事注意。`
                      }
                    ],
                    [
                      {
                        "tag": "text",
                        "text": `详情: ${nickname}将分支[${srcBranch}]合并到[${targetBranch}]`
                      }
                    ]
                  ]
            }
          }
        return content
        }
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
        let msg = ''
        if(imType == 'wx'){
          return `项目[${projName}](${projWebUrl})刚刚收到一次tag push提交\n${isCreate ? `标签名：${tagName}\n` : ''}${isDel ? `被删除标签名：${tagName}\n` : ''}提交者：${nickname}\n详情：${totalCommitsCount ? `[${title}](${url})` : `该分支无新commit`}`;
        }else if(imType == 'fs'){
          msg = {
                "title": "新的Tag Push提交",
                "content": [
                  [
                    {
                      "tag": "text",
                      "text": `项目`
                    },
                    {
                      "tag": "a",
                      "text": `${projName}`,
                      "href": `${projWebUrl}`
                    },
                    {
                      "tag": "text",
                      "text": `刚刚收到一次tag push提交`
                    },
                  ]
                ]
          }
          if(isCreate){
            msg.content.push([
              {
                "tag": "text",
                "text": `标签名：${tagName}`
              },
            ])
          }
          if(isDel){
            msg.content.push([
              {
                "tag": "text",
                "text": `被删除标签名：${tagName}`
              },
            ])
          }
          msg.content.push([
            {
              "tag": "text",
              "text": `提交者：${nickname}`
            },
          ])
          const detail = [
            {
              "tag": "text",
              "text": `详情：`
            },
          ]
          if(totalCommitsCount){
            detail.push({
              "tag":"a",
              "text":`${title}`,
               "href":`${url}`
            })
          }else{
            detail.push({
              "tag":  "text",
              "text": '该分支无新commit'
            })
          }
          msg.content.push(detail)
        }
        return msg
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
                  const newBeforeHash = beforeHash.substring(0, 8);
                  if(imType == 'wx'){
                    content =  `<font color="warning">${projName}项目有更新变化: </font>请相关同事注意。
                    > 分支名: [${refs}](${projWebUrl})
                    > 操作人: ${nickname}
                    > 描述:${totalCommitsCount ? `[${title}](${url})` : `该分支无新commit`}
                    > 从 <font color="comment">${newBeforeHash}</font> 更新到 <font color="comment">${newAfterHash}</font>
                    > 更新时间: ${timestamp}`
                  }else if (imType == 'fs'){
                    content = {
                      "title": "远程分支推送",
                          "content": [
                            [
                              {
                                "tag": "text",
                                "text": `${projName}项目有更新变化,请相关同事注意.`
                              },
                            ],
                            [
                              {
                                "tag": "text",
                                "text": `分支名: `
                              },
                              {
                                "tag": "a",
                                "text": `${refs}`,
                                "href": `${projWebUrl}`
                              }
                            ],
                            [
                              {
                                "tag": "text",
                                "text": `操作人: ${nickname}`
                              }
                            ],
                          ]
                    }
                    const desc = [
                      {
                        "tag": "text",
                        "text": `描述: `
                      }
                    ]
                    if(totalCommitsCount){
                      desc.push({
                        "tag": "a",
                        "text": `${title}`,
                        "href": `${url}`
                      })
                    }else{
                      desc.push({
                        "tag": "text",
                        "text": `该分支无新commit`,
                      })
                    }
                    content.content.push(desc)
                    content.content.push([
                      {
                        "tag": "text",
                        "text": `从${newBeforeHash}更新到 ${newAfterHash}`
                      }
                    ])
                    content.content.push([
                      {
                        "tag": "text",
                        "text": `更新时间: ${timestamp}`
                      }
                    ])
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
                    content = {
                      "title": "远程分支更新",
                          "content": [
                            [
                              {
                                "tag": "text",
                                "text": `${nickname}更新了远程分支`
                              },
                              {
                                "tag": "a",
                                "text": `${refs}`,
                                "href": `${projWebUrl}`
                              }
                            ],
                            [
                              {
                                "tag": "text",
                                "text": `commit 说明: `
                              },
                              {
                                "tag": "a",
                                "text": `${title}`,
                                "href": `${url}`
                              }
                            ],
                            [
                              {
                                "tag": "text",
                                "text": `commit 哈希: ${newAfterHash}`
                              }
                            ],
                            [
                              {
                                "tag": "text",
                                "text": `更新时间: ${timestamp}`
                              }
                            ],
                          ]
                    }
                   }
                  }
                }
              } else {
                if(imType == 'wx'){
                  content = `${nickname}删除了项目[${projName}](${projWebUrl})的远程分支[${refs}]`;
                }else if(imType == 'fs'){
                  content = {
                    "title": "远程分支删除",
                        "content": [
                          [
                            {
                              "tag": "text",
                              "text": `${nickname}删除了项目`
                            },
                            {
                              "tag": "a",
                              "text": `${projName}`,
                              "href": `${projWebUrl}`
                            },
                            {
                              "tag": "text",
                              "text": `的远程分支[${refs}]`
                            },
                          ]
                        ]
                  }
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
        const noteableType = R.pathOr('', ['object_attributes', 'noteable_type'], req.body);
        const desc = R.pathOr('', ['object_attributes', 'description'], req.body);
        let mentionMembers = desc.match(/(@\S*\s?)/ig)|| []
        mentionMembers= mentionMembers.map(m=>m.trim().slice(1))
        let mentioned = ''
        if (mentionMembers.length){
          resBody.memtion = mentionMembers
          mentioned = `并提及了${mentionMembers.map(m =>  nameMap[m]? '@' + nameMap[m]:'@' + m ).join('')}`
        }
        let content=''
        if(imType == 'wx'){
            if (noteableType === "MergeRequest") {
                const reqTitle = R.pathOr('', ['merge_request', 'title'], req.body);
                content = `**${nickname}**对[${reqTitle}]这个merge请求进行了[评论](${url})` + mentioned;
    
              } else if (noteableType == "Commit") {
                const reqTitle = R.pathOr('', ['commit', 'title'], req.body);
                content = `**${nickname}**对[${reqTitle}]这个commit进行了[评论](${url})` + mentioned;
    
              } else if (noteableType == "Issue") {
                const reqTitle = R.pathOr('', ['issue', 'title'], req.body);
                content = `**${nickname}**对[${reqTitle}]这个issue进行了[评论](${url})` + mentioned;
              }
        }else if(imType == 'fs'){
          if (noteableType === "MergeRequest") {
            const reqTitle = R.pathOr('', ['merge_request', 'title'], req.body);
            content = {
              "title": "远程分支推送",
                  "content": [
                    [
                      {
                        "tag": "text",
                        "text": `${nickname} 对[${reqTitle}]这个merge请求进行了`
                      },
                      {
                        "tag": "a",
                        "text": `评论`,
                        "href": `${url}`
                      },
                      {
                        "tag": "text",
                        "text": `${mentioned}`
                      }
                    ],
                  ]
            }
          } else if (noteableType == "Commit") {
            const reqTitle = R.pathOr('', ['commit', 'title'], req.body);
            content = {
              "title": "远程分支推送",
                  "content": [
                    [
                      {
                        "tag": "text",
                        "text": `${nickname} 对[${reqTitle}]这个commit进行了`
                      },
                      {
                        "tag": "a",
                        "text": `评论`,
                        "href": `${url}`
                      },
                      {
                        "tag": "text",
                        "text": `${mentioned}`
                      }
                    ],
                  ]
            }

          } else if (noteableType == "Issue") {
            const reqTitle = R.pathOr('', ['issue', 'title'], req.body);
            content = {
              "title": "远程分支推送",
                  "content": [
                    [
                      {
                        "tag": "text",
                        "text": `${nickname} 对[${reqTitle}]这个issue进行了`
                      },
                      {
                        "tag": "a",
                        "text": `评论`,
                        "href": `${url}`
                      },
                      {
                        "tag": "text",
                        "text": `${mentioned}`
                      }
                    ],
                  ]
            }
          }
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
        let content = ''
        if(imType == 'wx'){
            if (action == "close" && state == "closed") {
                content = `**${nickname}**在[${projName}](${projWebUrl})关闭了issue [[${issueTitle}](${issueUrl})]`;
            } else if (action == "open" && state == "opened") {
                content = `**${nickname}**在[${projName}](${projWebUrl})新建了issue [[${issueTitle}](${issueUrl})]`;
            }
        }else if(imType == 'fs'){
          if (action == "close" && state == "closed") {
            content = {
              "title": "远程分支推送",
                  "content": [
                    [
                      {
                        "tag": "text",
                        "text": `${nickname} 在`
                      },
                      {
                        "tag": "a",
                        "text": `${projName}`,
                        "href": `${projWebUrl}`
                      },
                      {
                        "tag": "text",
                        "text": `关闭了issue [`
                      },
                      {
                        "tag": "a",
                        "text": `${issueTitle}`,
                        "href": `${issueUrl}`
                      },
                      {
                        "tag": "text",
                        "text": `]`
                      },
                    ],
                  ]
            }
        } else if (action == "open" && state == "opened") {
            content = `**${nickname}**在[${projName}](${projWebUrl})新建了issue [[${issueTitle}](${issueUrl})]`;
            content = {
              "title": "远程分支推送",
                  "content": [
                    [
                      {
                        "tag": "text",
                        "text": `${nickname} 在`
                      },
                      {
                        "tag": "a",
                        "text": `${projName}`,
                        "href": `${projWebUrl}`
                      },
                      {
                        "tag": "text",
                        "text": `新建了issue [`
                      },
                      {
                        "tag": "a",
                        "text": `${issueTitle}`,
                        "href": `${issueUrl}`
                      },
                      {
                        "tag": "text",
                        "text": `]`
                      },
                    ],
                  ]
            }
        }
        }
        return content
    },
    'build':function(){
      return ''
    }
}


module.exports = buildMessage