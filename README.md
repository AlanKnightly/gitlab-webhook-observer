### 背景
用于实现gitlab上的操作（如发起merge request、开关issue、评论等）转发到各项目组的企业微信群，方便成员及时了解codebase情况，提高协作效率，方便也code review。

### 维护
1. 克隆项目到本地：
```
git clone  https://gitlab.sdbattery.com/shenjiangping/gitlab-webhook-observer.git
```
2. 更新代码后提交commit并发起merge request
3. 相关成员review后合并代码
4. 登录bot-test.sdbattery.net，进入/home/bot/gitlab-webhook-observer,重启服务：
```
npm stop
npm start
```

#### gitlab与企业微信名称转换
由于开发人员在gitlab与企业微信的名称不同，在gitlab上@其他成员时，可能需要将gitlab名称映射到企业微信名称。
暂且将名称映射写在nameMap.json文件中：
```
{
  [gitlabName]: weixinName
}
```
