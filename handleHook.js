const R = require('ramda');
const axios = require('axios');
const buildMessage = require('./messageBuilder')

const enabledEventTypes = [
  'merge_request',
  'tag_push',
  'push',
  'note',
  'issue'
]

const HookHandler = (req, res) => {
  const key = req.params.key;
  const eventType = R.pathOr('', ['object_kind'], req.body);  //事件类型
  const imType = req.query.im || 'wx'
  const resBody = {}
  if (!key) {
    resBody.success=false
    resBody.step=1
    res.send(resBody);
  } else{
    let md = ''; 
    try{
      // 根据event_type类型返回消息
      md = buildMessage[eventType](req, imType) ||''
    }catch(e){
      if(enabledEventTypes.includes(eventType)){
        md = `eventType:${eventType}; err: ${e}`
      }
     console.log(e)
    }
    if (md) {
      resBody.success=true
      resBody.step=2
      resBody.hasMd=true
      resBody.md = md
      if(imType=='wx'){
        axios.post(`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${key}`, {
           "msgtype": "markdown",
           "markdown": {
           "content": md,
          }
        }).catch(function (error) {
          resBody.success=false
          resBody.step=3
          resBody.hasMd=true
          resBody.em=JSON.stringify(error)
          console.log(error);
        });
      }
      else if(imType=='fs'){
        axios.post(`https://open.feishu.cn/open-apis/bot/v2/hook/${key}`, {
           "msg_type": "post",
           "content": {
            "post": {
              "zh-cn":  md
            }
          }
        },{
          headers: {'Content-Type': 'application/json'}
        }).then(res=>{
          axios.post(`https://open.feishu.cn/open-apis/bot/v2/hook/${key}`, {
           "msg_type": "text",
           "content": {
            "text": 'res: ' + JSON.stringify(res)  + '|||'+  JSON.stringify(md)
          }
        },{
          headers: {'Content-Type': 'application/json'}
        })
        }).catch(function (error) {
          axios.post(`https://open.feishu.cn/open-apis/bot/v2/hook/${key}`, {
            "msg_type": "text",
            "content": {
             "text": error
           }
         },{
           headers: {'Content-Type': 'application/json'}
         })
          resBody.success=false
          resBody.step=3
          resBody.hasMd=true
          resBody.em=JSON.stringify(error)
          console.log(error);
        });
      }
    }
    res.send(resBody);
  }
};

module.exports = HookHandler;