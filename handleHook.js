const R = require('ramda');
const axios = require('axios');
const buildMessage = require('./messageBuilder')

const listenedType = [
  'merge_request',
  'tag_push',
  'push',
  'note',
  'issue'
]

const HookHandler = (req, res) => {
  const key = req.params.key;
  const eventType = R.pathOr('', ['object_kind'], req.body);  //事件类型
  const imType = req.params.im || 'wx'
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
      if(listenedType.includes(eventType)){
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
              "zh-cn": md
            }
          }
        },{
          headers: {'Content-Type': 'application/json'}
        }).then((res)=>{
          axios.post(`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=40ab1ae0-bf95-4db5-b7ee-3d9550a9b30e`, {
            "msgtype": "markdown",
            "markdown": {
            "content": res.msg,
           }
         }).catch(function (error) {
           resBody.success=false
           resBody.step=3
           resBody.hasMd=true
           resBody.em=JSON.stringify(error)
           console.log(error);
         });
        }).catch(function (error) {
          axios.post(`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=40ab1ae0-bf95-4db5-b7ee-3d9550a9b30e`, {
            "msgtype": "markdown",
            "markdown": {
            "content": JSON.stringify(error),
           }
         }).catch(function (error) {
           resBody.success=false
           resBody.step=3
           resBody.hasMd=true
           resBody.em=JSON.stringify(error)
           console.log(error);
         });


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