<template>
<div>
   <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
     <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
        <el-button type="primary" @click="showAddCate">添加分类</el-button>
      <!-- 用户列表区域 -->
      <!-- 表格 -->
     <tree-table :data="cateList" :columns="columns"
     :selection-type="false"
     :expand-type="false"
     show-index
     index-text="#" border
     :show-row-hover="false"
     class="tree_table">
      <template v-slot:isok="scope">
        <i class="el-icon-success"
        v-if="scope.row.cat_deleted === false"
        style="color : lightgreen"></i>
        <i class="el-icon-error" v-else style="color : red"></i>
      </template>
      <template v-slot:sort="scope">
        <el-tag v-if="scope.row.cat_level=='0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.cat_level=='1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
      </template>
      <template v-slot:operate="scope">
          <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit"
             size="mini" @click="editCatebtn(scope.row)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete"
             size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
      </template>
     </tree-table>
      <!-- 分页区域 -->
       <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
     <!-- 添加分类的对话框 -->
    <el-dialog
  title="添加分类"
  :visible.sync="addCateDialogVisible"
  width="50%"
  @close="addCateDialogClosed">
    <el-form :model="cateForm" ref="cateFormRef" label-width="100px">
      <el-form-item label="分类名称:" prop="cat_name">
        <el-input v-model="cateForm.cat_name"></el-input>
      </el-form-item>
      <el-form-item label="父级分类:">
        <span class="demonstration"></span>
         <el-cascader
          expand-trigger="hover"
          v-model="selectKeys"
          :options="cateParent"
          :props="cascaderProps"
          @change="cateChange"
          size="mini"
          clearable></el-cascader>
         </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="addCateDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addCate">确 定</el-button>
    </span>
    </el-dialog>
     <!-- 编辑分类的对话框 -->
    <el-dialog
  title="修改分类"
  :visible.sync="editCateDialogVisible"
  width="50%"
  @close="editCateDialogClosed">
    <el-form :model="editForm" ref="editCateFormRef" label-width="100px">
      <el-form-item label="分类名称:" prop="cat_name">
        <el-input v-model="editForm.cat_name"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="editCateDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editCate">确 定</el-button>
    </span>
    </el-dialog>
</div>
</template>

<script>
export default {
data(){
  return{
    querInfo:{
      type:3,
      pagenum:1,
      pagesize:5
    },
    // 商品分类数据列表
    cateList:[],
    // 总数居
    total :0,
    columns:[
      {
        label:'分类名称',
        prop:'cat_name'
      },
      {
        label:'是否有效',
        // 表示当前列变为模板列
        type:'template',
        // 表示当前这一列使用模板的名称
        template:'isok'
      },{
        label:'排序',
        type:'template',
        template:'sort'
      },{
        label:'操作',
        type:'template',
        template:'operate'
      }
    ],
    addCateDialogVisible:false,
    editCateDialogVisible:false,
    cateForm:{
      cat_name:'',
      cat_pid:0,
      cat_level: 0
    },
    cateFormRules:{
      cat_name:[
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 3, max: 10, message: '长度在 3 到10 个字符', trigger: 'blur' }
      ]
    },
    cateParent:[],
    cascaderProps:{
      value:'cat_id',
      label:'cat_name',
      children:'children'
    },
    // 选择的父级分类的ID数组
    selectKeys:[],
    // 编辑数据表单
    editForm:{}

  }
},
created(){
  this.getCateList()
},
methods:{
  async getCateList(){
    const {data :res } = await this.$http.get('categories',{ params :this.querInfo})
    if(res.meta.status !== 200) return this.$message.error('获取分类列表失败')
    this.cateList = res.data.result
    this.total = res.data.total
  },
  // 监听pagesize
  handleSizeChange(newSize){
    this.querInfo.pagesize = newSize
    this.getCateList()
  },
  // 监听pagenum
  handleCurrentChange(newNum){
    this.querInfo.pagenum = newNum
    this.getCateList()
  },
  // 添加分类
  showAddCate(){
    this.getParentCateList()
    this.addCateDialogVisible = true
  },
  // 获取父级分类数据列表
  async getParentCateList(){
    const { data :res } = await this.$http.get('categories', {
      params : {type : 2}
    })
    if(res.meta.status !== 200) return this.$message.error('获取父级列表失败')
    this.cateParent = res.data
  },
  cateChange(){
    if(this.selectKeys.length > 0){
      // 父级分类的id
      this.cateForm.cat_pid = this.selectKeys[this.selectKeys.length -1]
      this.cateForm.cat_level = this.selectKeys.length

      return
    } else{
       // 父级分类的Id
        this.cateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.cateForm.cat_level = 0
    }
  },
  addCateDialogClosed(){
    this.$refs.cateFormRef.resetFields()
    this.selectKeys = []
    this.cateForm.cat_level = 0
    this.cateForm.cat_pid = 0
  },
  addCate(){
     this.$refs.cateFormRef.validate(async valid=>{
       if(!valid) return
       const {data:res} = await this.$http.post('categories',this.cateForm)
       if(res.meta.status !== 201) return this.$message.error('添加分类失败')
      this.$message.success('添加成功')
      console.log(this.cateForm);
      this.getCateList()
      this.addCateDialogVisible = false
     })
  },
  // 编辑分类
  editCatebtn(ne){
    this.editForm = ne
    this.editCateDialogVisible = true
  },
  editCateDialogClosed(){
    this.$refs.editCateFormRef.resetFields()
  },
  async editCate(){
    const { data :res } = await this.$http.put('categories/'+ this.editForm.cat_id, {
      cat_name : this.editForm.cat_name
    })
    if(res.meta.status !== 200) return this.$message.error('修改分类名字失败')
    this.getCateList()
    this.editCateDialogVisible = false
  },
   // 根据Id删除对应的分类信息
    async removeCateById(id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
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

      const { data: res } = await this.$http.delete('categories/'+ id)
      console.log(this.editForm);
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.getCateList()
      this.$message.success('删除用户成功！')

    },
}
}
</script>

<style lang="less" scoped>
.tree_table{
  margin-top: 15px;
  margin-bottom: 15px;
}

</style>
