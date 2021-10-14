/*
 * @Author: your name
 * @Date: 2021-07-19 17:35:34
 * @LastEditTime: 2021-07-19 18:03:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /gitlab-webhook-observer/handleHook.js
 */
const FSMessenger = require('./service/FSMessenger')

const fmtDateTime = () => {
  let date = new Date();

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let hour = date.getHours();
  let min = date.getMinutes();

  month = month < 10 ? `0${month}` : month;
  hour = hour < 10 ? `0${hour}` : hour;
  min = min < 10 ? `0${min}` : min;

  return `${year}-${month}-${date.getDate()} ${hour}:${min}`;
};

const R = require('ramda');
const axios = require('axios');
const nameMap = require('./nameMap.json')
const HookHandler = (req, res) => {
  const imType = req.query.im || 'wx'
  const key = req.params.key;
  const { body } = req;

  if (body) {
    resBody.success = true
    resBody.step = 2
    resBody.hasMd = true
    resBody.md = md
    if(imType == 'fs'){
      const message = new FSMessenger()
      const content = message.setTitle(`!!前端项目${body.project_name}发生错误`)
      .addLine(`错误原因: ${body.culprit}`)
      .addLine(`错误时间: ${fmtDateTime()}`)
      .addLine(`错误级别: ${body.level}`)
      .addLine(`错误链接: `,['查看日志', body.url])
      .post

      axios.post(`https://open.feishu.cn/open-apis/bot/v2/hook/${key}`, {
           "msg_type": "post",
           "content": {
            "post": {
              "zh-cn":  content
            }
          }
        },{
          headers: {'Content-Type': 'application/json'}
        }).catch(error=>{
          resBody.success = false
          resBody.step = 3
          resBody.hasMd = true
          resBody.em = JSON.stringify(error)
          console.log(error);
        })
    } else{
      axios.post('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=f7e65a97-031d-4537-9947-492cc4864982', {
        "msgtype": "markdown",
        "markdown": {
          "content": {
            content: `!!!前端项目<font color=\"warning\">${body.project_name}</font>发生错误:
      > 错误原因: <font color=\"info\">${body.culprit}</font>
      > 错误时间: <font color=\"info\">${fmtDateTime()}</font>
      > 错误级别: <font color=\"info\">${body.level}</font>
      > 错误链接: [查看日志](${body.url})`
          },
        }
      })
        .catch(function (error) {
          resBody.success = false
          resBody.step = 3
          resBody.hasMd = true
          resBody.em = JSON.stringify(error)
          console.log(error);
        });
    }
  }
  res.send(resBody);
};

module.exports = HookHandler;
