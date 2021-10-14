class FSMessenger {
    constructor() {
      // 提交给飞书机器人的内容
      this.post = {
        title:'',
        content:[]
      }
      // 但前内容行索引
      this.curLineIndex = 0
    }
    setTitle(title) {
      this.post.title=title
      return this
    }
    // 添加单个tag
    add(el){
     if(this.post.content.length==0) this.post.content = [[]]
     console.log(this)
      const lineIndex =  this.curLineIndex
     if(typeof el ==='string'){
      this.post.content[lineIndex].push({
          "tag": "text",
          "text": el
      })
     }else if (Array.isArray(el)){
      this.post.content[lineIndex].push({
        "tag": "a",
        "text": el[0],
        "href": el[1]
      })
     }
     return this 
    }
    // 添加新行并插入n单个tag（n>=0）
    addLine(...elements){
      this.post.content.push([])
      this.curLineIndex = this.post.content.length - 1
      elements.forEach(el=>{
        this.add(el)
      })
      return this
    }
    reset(){
      this.post = {
        title:'',
        content:''
      }
      this.curLineIndex = 0
      return 0
    }
  }

  module.exports = FSMessenger