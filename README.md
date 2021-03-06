### 背景
用于实现gitlab上的操作（如发起merge request、开关issue、评论等）推送到指定项目组的企业微信群，方便成员及时了解codebase情况，提高协作效率，也方便code review。

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
### 使用gitlab推送通知
1. 参见gitee的[webhook教程](https://gitee.com/help/articles/4296#article-header0)，创建项目小组自己的群机器人，并复制该机器人的webhook的key。
2. 项目管理者在gitlab项目的Setting->Webhooks 界面顶部的URL表单中输入http://bot-test.sdbattery.net/api/gitlab/hook/key
3. 在界面中勾选想要监听的仓库中发生的操作事件（建议全选）
4. 页面滚动到底部，点击保存即可。
5. 新建一个issue或在某个分支下发表评论，验证消息推送是否正常触发。

### 目前该脚本支持监听的gitlab事件

|  Trigger(事件) | 已支持 |
|  :---- | :----: |
|  Push events | 已支持 |
|  Tag push events | 已支持 |
|  Comments | 已支持 |
|  Confidential Comments | - |
|  Issues events | 已支持 |
|  Confidential Issues events | - |
|  Merge request events | 已支持 |
|  Job events | - |
|  Pipeline events | - |
|  Wiki Page events | - |


#### gitlab与企业微信名称转换
由于开发人员在gitlab与企业微信的名称不同，在gitlab上@其他成员时，可能需要将gitlab名称映射到企业微信名称，企业微信才能正确@到指定成员。目前暂且将名称映射写在nameMap.json文件中：
```
{
  [gitlabName]: weixinName
}
```

### 消息模板
目前推送到企业微信的消息模板写死在 handleHook.js 文件中，如果各小组有差异化需求，后续可将模板抽离到单独的模板函数/文件，根据企业微信机器人的key来映射不同模板。