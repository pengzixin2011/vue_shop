<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->

      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
          <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible =true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table border stripe :data="userslist">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- vue 2.6以前的写法 -->
          <!-- <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state">
            </el-switch>
          </template> -->
          <!-- 2.6以后 -->
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作"  width="300px">
          <template v-slot="scope">
             <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" @click="showEdit(scope.row.id)" size="mini" >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)" size="mini" >删除</el-button>
            <!-- 分配角色权限按钮 -->
            <el-tooltip class="item" effect="dark" content="分配文字" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting"  size="mini" @click="setRole(scope.row)">权限分配</el-button>
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>
      <!-- 分页区域 -->
       <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
  title="添加用户"
  :visible.sync="addDialogVisible"
  width="50%"
  @close="addDialogClosed">
    <el-form :model="addForm" :rules="editFormRules" ref="addFormRef" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="addForm.username"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="addForm.email"></el-input>
      </el-form-item>
      <el-form-item label="电话" prop="mobile">
        <el-input v-model="addForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="addDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addUser">确 定</el-button>
    </span>
    </el-dialog>
    <!-- 修改用户信息 -->
    <el-dialog
  title="修改用户信息"
  :visible.sync="editDialogVisible"
  width="50%"
 >
    <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
      <el-form-item label="用户名">
        <el-input v-model="editForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.email"></el-input>
      </el-form-item>
      <el-form-item label="电话" prop="mobile">
        <el-input v-model="editForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editUser()">确 定</el-button>
    </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
  title="分配角色"
  :visible.sync="setRoleDialogVisible"
  width="30%"
  >
  <div>
    <p>当前的用户 :{{userinfo.username}}</p>
    <p>当前的角色 :{{userinfo.role_name}}</p>
    <p>分配新的角色 :
      <el-select v-model="select" placeholder="请选择">
    <el-option
      v-for="item in roleslist"
      :key="item.id"
      :label="item.roleName"
      :value="item.id">
    </el-option>
  </el-select>
    </p>
  </div>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setClosed">取 消</el-button>
    <el-button type="primary" @click="saveRole">确 定</el-button>
  </span>
</el-dialog>
  </div>

</template>

<script>
export default {
data(){
  // 验证邮箱的规则
  var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
    const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
    if (regEmail.test(value)) {
    // 合法的邮箱
    return cb()
  }

  cb(new Error('请输入合法的邮箱'))
}
  // 验证手机号的规则
  var checkMobile = (rule, value, cb) => {
  // 验证手机号的正则表达式
    const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

    if (regMobile.test(value)) {
     return cb()
    }

    cb(new Error('请输入合法的手机号'))
  }
  return {
    // 获取用户列表的参数对象
    queryInfo:{
      query:'',
      pagenum:1,
      pagesize:2,

    },
    userslist:[],
    total:0,
    // 控制添加用户对话框的隐藏
    addDialogVisible:false,
    editDialogVisible:false,
    setRoleDialogVisible:false,
    userinfo:{},
    roleslist:[],
    // 已选择的权限
    select:'',
    // 添加用户的表单数据
    addForm:{
      username:'',
      password:'',
      email:'',
      mobile:''
    },
    // 添加表单的规则对象
    addFormRules:{
       username:[
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 10, message: '长度在 3 到10 个字符', trigger: 'blur' }

      ],
      password:[
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 12, message: '长度在 6 到12 个字符', trigger: 'blur' }

      ],
      email:[
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { validator:checkEmail, trigger: 'blur' }

      ],
      mobile:[
        { required: true, message: '请输入电话号码', trigger: 'blur' },
        {  validator:checkMobile, trigger: 'blur' }

      ]
    },
    // 修改用户的规则
    editFormRules:{
      username:[
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 10, message: '长度在 3 到10 个字符', trigger: 'blur' }
      ],
      email:[
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { validator:checkEmail, trigger: 'blur' }

      ],
      mobile:[
        { required: true, message: '请输入电话号码', trigger: 'blur' },
        {  validator:checkMobile, trigger: 'blur' }

      ]
    },
    editForm:{},
  }

},
created(){
  this.getUserList()

},
methods:{
  async getUserList(){
    const {data:res} = await this.$http.get('users',{ params :this.queryInfo})
    if(res.meta.status != 200){
      return this.$message.error('获取失败')
    }
    this.userslist = res.data.users
    this.total = res.data.total
    console.log(res);
  },
  // 监听pagesize改变
  handleSizeChange(newSize){
    this.queryInfo.pagesize = newSize
    this.getUserList()

  },
  // 监听pagenum
  handleCurrentChange(newPage){
    this.queryInfo.pagenum = newPage
    this.getUserList()

  },
  // 监听switch开关的改变
  async userStateChange(userinfo){
    const {data : res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
    if(res.meta.status !== 200){
      userinfo.mg_state = !userinfo.mg_state
      return this.$message.error('shibai')
    }
    this.$message.success('更新成功')
  },
  // 添加用户取消时重置表单
  addDialogClosed(){
    this.$refs.addFormRef.resetFields()
  },
  // 添加新用户
  addUser(){
    this.$refs.addFormRef.validate(async valid =>{
      if(!valid) return
      // 添加用户的网络请求
      const {data : res} = await this.$http.post('users',this.addForm)
      console.log(res);
      if(res.meta.status !== 201) return this.$message.error('添加失败')
      this.$message.success('添加成功')
      // 隐藏添加的对话框
      this.addDialogVisible = false
      this.getUserList()
    })
  },
  async showEdit(id){
    const  {data: res}=await this.$http.get('users/' + id)
    if(res.meta.status !==200){
      return this.$message.error('查询用户信息失败')
    }
    this.editForm = res.data
    this.editDialogVisible = true
  },
   editUser(){
    this.$refs.editFormRef.validate(async valid =>{
      if(!valid) return
      // 添加用户的网络请求
      const {data : res} = await this.$http.put('users/'+this.editForm.id,{email :this.editForm.email,mobile:this.editForm.mobile})
      console.log(res);
      if(res.meta.status !== 200) return this.$message.error('修改失败')

      // 隐藏添加的对话框
      this.editDialogVisible = false
      this.getUserList()
      this.$message.success('更新成功')
    })
  },
 // 根据Id删除对应的用户信息
    async removeUserById(id) {
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

      const { data: res } = await this.$http.delete('users/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }

      this.$message.success('删除用户成功！')
      this.getUserList()
    },
    // 分配角色
    async setRole(set){
      const {data :res } = await this.$http.get('roles')
      if(res.meta.status !==200) return this.$message.error('获取角色列表失败')
      this.roleslist = res.data
      console.log(this.roleslist);
      this.setRoleDialogVisible = true
      this.userinfo = set

    },
    // 保存用户新的权限
    async saveRole(){
      if(!this.select) return this.$message.error('请选择要分配到角色')

      const {data :res } =await this.$http.put(`users/${this.userinfo.id}/role`,{
        rid :this.select
      })
      console.log(res);
      if(res.meta.status !==200) return this.$message.error('分配失败')
      this.$message.success('分配成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 关闭分配角色的对话框
    setClosed(){
      this.select = ''
      this.userinfo = {}
      this.setRoleDialogVisible = false
    }

}
}
</script>

<style>

</style>
