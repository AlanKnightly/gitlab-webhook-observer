class FSMessenger {
    constructor() {
      // 提交给飞书机器人的内容
      this.content = {
        title:'',
        post:[]
      }
      // 但前内容行索引
      this.curLineIndex = 0
    }
    setTitle(title) {
      this.content.title=title
      return this
    }
    // 添加单个tag
    add(el){
     if(this.content.post.length==0) this.content.post = [[]]
     console.log(this)
      const lineIndex =  this.curLineIndex
     if(typeof el ==='string'){
      this.content.post[lineIndex].push({
          "tag": "text",
          "text": el
      })
     }else if (Array.isArray(el)){
      this.content.post[lineIndex].push({
        "tag": "a",
        "text": el[0],
        "href": el[1]
      })
     }
     return this 
    }
    // 添加新行并插入n单个tag（n>=0）
    addLine(...elements){
      this.content.post.push([])
      this.curLineIndex = this.content.post.length - 1
      elements.forEach(el=>{
        this.add(el)
      })
      return this
    }
    reset(){
      this.content = {
        title:'',
        content:''
      }
      this.curLineIndex = 0
      return 0
    }
  }

  module.exports = FSMessenger