<template>
<div>
   <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert
         title="注意 ： 只允许为第三级分类设置相关参数!"
         type="warning"
         :closable="false"
         show-icon>
      </el-alert>
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            expand-trigger="hover"
            v-model="selectKeys"
            :options="catelist"
            :props="cateProps"
            @change="cateChange"
            size="mini"
            clearable
            >
          </el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-tabs  v-model="activeName" @tab-click="handleClick" >
        <el-tab-pane label="动态参数" name="many" :disabled="!isBtnDisable">
          <el-button type="primary" size="mini" :disabled="!isBtnDisable" @click="addialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTable" border stripe >
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag closable v-for="(item,i) in scope.row.attr_vals"
                :key="item" @close="handClosed(i,scope.row)">{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="mini" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showDia(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only" :disabled="!isBtnDisable">
          <el-button type="primary" size="mini" :disabled="!isBtnDisable" @click="addialogVisible = true">添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTable" border stripe >
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag closable v-for="(item,i) in scope.row.attr_vals"
                :key="item" @close="handClosed(i,scope.row)">{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="mini" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showDia(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
     <!-- 添加参数的对话框 -->
    <el-dialog
  :title="'添加'+titleText"
  :visible.sync="addialogVisible"
  width="50%"
  @close="addDialogClosed">
    <el-form :model="addForm" ref="addFormRef" label-width="100px">
      <el-form-item :label="titleText" prop="attr_name">
        <el-input v-model="addForm.attr_name"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="addialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="add" >确 定</el-button>
    </span>
    </el-dialog>
     <!-- 编辑参数的对话框 -->
    <el-dialog
       :title="'编辑'+titleText"
       :visible.sync="showDialogVisible"
       width="50%"
       @close="showDialogClosed">
    <el-form :model="showForm" ref="showFormRef" label-width="100px">
      <el-form-item :label="titleText" prop="attr_name">
        <el-input v-model="showForm.attr_name"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="edit" >确 定</el-button>
    </span>
    </el-dialog>
</div>
</template>

<script>
export default {
data(){
  return {
    catelist:[],
    // 级联选择框配置对象
    cateProps:{
      value:'cat_id',
      label:'cat_name',
      children:'children'
    },
    // 级联选择框双向绑定完的数据
    selectKeys:[],
    // 被激活标签页的名称
    activeName:'many',
    // 静态属性保存
    onlyTable:[],
    // 动态属性保存
    manyTable:[],
    addialogVisible:false,
    showDialogVisible:false,
    addForm:{},
    showForm:{},
    inputVisible:false,
    inputValue:''
  }
},
computed:{
  isBtnDisable(){
    return this.selectKeys.length > 0
  },
  cateId(){
    if(this.selectKeys.length > 0){
      return this.selectKeys[this.selectKeys.length-1]
    }
  },
  titleText(){
    if(this.activeName === 'many'){
      return '动态参数'
    }
    return '静态参数'
  }
},
created(){
  this.getCateList()
},
methods:{
  async getCateList(){
    const {data :res} = await this.$http.get('categories')
    if(res.meta.status !==200) return this.$message.error('获取分类失败')
    this.catelist = res.data

  },
  // 级联选择框变化时会触发这个函数
  cateChange(){
    this.onlyTable=[]
    this.manyTable=[]
    this.getParams()
  },
  // tab页签点击事件的处理函数
  handleClick(){
    this.getParams()
  },
  async getParams(){
     const {data :res } = await this.$http.get(`categories/${this.cateId}/attributes`,{params :{sel: this.activeName}})
     if(this.cateId>0){
       res.data.forEach(item=>{
       item.attr_vals = item.attr_vals ? item.attr_vals.split(','):[]
      //  控制文本框的显示和隐藏
        item.inputVisible = false
        item.inputValue=''
      })
      if(res.meta.status !==200) return this.$message.error('获取失败')
      if(this.activeName == 'many'){
        this.manyTable = res.data
      }
      if(this.activeName == 'only'){
        this.onlyTable = res.data
      }
     }


  },
  // 监听对话框的关闭属性
  addDialogClosed(){
    this.$refs.addFormRef.resetFields()
  },
  showDialogClosed(){
    this.$refs.showFormRef.resetFields()
  },
  async add(){
    const {data :res } = await this.$http.post(`categories/${this.cateId}/attributes`,{
      attr_name :this.addForm.attr_name,
      attr_sel: this.activeName
    })
    if(res.meta.status !==201)return this.$message.error('添加失败')
    this.getParams()
    this.$message.success('添加成功')
    this.addialogVisible=false

    },
    // 编辑
    async showDia(id){
      const {data :res }= await this.$http.get(`categories/${this.cateId}/attributes/${id}`,{
        params:{attr_sel:this.activeName}
      })
      if(res.meta.status !==200)return this.$message.error('编辑信息获取失败')
      this.showForm = res.data
      this.showDialogVisible=true
    },
    async edit(){
    const {data :res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.showForm.attr_id}`,{
      attr_name :this.showForm.attr_name,
      attr_sel: this.activeName
    })
    console.log(res);
    if(res.meta.status !==200)return this.$message.error('修改失败')
    this.getParams()
    this.$message.success('修改成功')
    this.showDialogVisible=false

    },
    // 删除
    async deleById(id){
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`,{
        params:{attr_sel:this.activeName}
      })
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      this.getParams()
      this.$message.success('删除参数成功！')
    },
    // 文本框失去焦点或者摁下Enter会触发
    handleInputConfirm(row){
      if(row.inputValue.trim().length ===0){
        row.inputValue=''
        row.inputVisible = false
        return
      }
      console.log(row.inputValue);
      console.log(row.attr_vals);
      if(row.attr_vals.indexOf(row.inputValue) !=-1)
      return this.$message.error('有重复的')
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue=''
      row.inputVisible=false
      this.setAttr(row)

    },
    async setAttr(row){

      // 发起请求保存
      const {data :res}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(',')
      })

      if(res.meta.status !==200){
        return this.$message.error('添加失败')
      }

      this.$message.success('添加成功')

    },
    // 点击按钮展示文本输入框
    showInput(row){
      row.inputVisible= true
      // 让文本框自动获得焦点
      // $nextTick方法，当页面上的元素重新渲染之后
      // 才会指定回调函数中的代码
       this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        })
    },
    // 点蓝色叉叉进行删除
    handClosed(i,row){
      row.attr_vals.splice(i,1)
      this.setAttr(row)
    }
},
}
</script>

<style>
.el-alert{
  margin-bottom: 15px;
}
.el-tag{
  margin:5px
}
.input-new-tag{
  width: 150px;
}
</style>
