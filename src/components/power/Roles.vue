<template>
<div>
  <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
        <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
      <!-- 用户列表区域 -->
      <el-table border stripe :data="rolesList">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop':'','vcenter']"
            v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row :class="[i2===0 ? '': 'bdtop','vcenter']"
                v-for="(item2 ,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" @close="removeRightById(scope.row,item2.id)" closable>{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children"
                     @close="removeRightById(scope.row,item3.id)" :key="item3.id" closable> {{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          <!-- <pre>
            {{scope.row}}
          </pre> -->
        </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
         <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" @click="showEdit(scope.row.id)" size="mini" >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)" size="mini" >删除</el-button>
            <!-- 分配角色权限按钮 -->
            <el-tooltip class="item" effect="dark" content="分配文字" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRight(scope.row)">权限分配</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
     <!-- 添加角色用户的对话框 -->
    <el-dialog
  title="添加角色"
  :visible.sync="addDialogVisible"
  width="50%"
  @close="addDialogClosed">
    <el-form :model="addForm" ref="addFormRef" label-width="100px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="addForm.roleName"></el-input>
      </el-form-item>
      <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="addForm.roleDesc"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="addDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addUser">确 定</el-button>
    </span>
    </el-dialog>
    <!-- 修改用户信息 -->
   <el-dialog
  title="修改角色信息"
  :visible.sync="editDialogVisible"
  width="50%"
 >
    <el-form :model="editForm" ref="editFormRef" label-width="100px">
      <el-form-item label="角色id" prop="roleId">
        <el-input v-model="editForm.roleId" disabled></el-input>
      </el-form-item>
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="editForm.roleName"></el-input>
      </el-form-item>
      <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="editForm.roleDesc"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editRoles()">确 定</el-button>
    </span>
    </el-dialog>
    <!--修改权限的对话框 -->
    <el-dialog
  title="修改权限"
  :visible.sync="rightDialogVisible"
  width="50%"
  >
  <el-tree :data="rightsList" :props="treeProps"
  show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
    <span slot="footer" class="dialog-footer">
      <el-button @click="rightDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addRights">确 定</el-button>
    </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
  title="分配角色"
  :visible.sync="setRoleDialogVisible"
  width="30%"
  >
  <span>这是一段信息</span>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="setRoleDialogVisible = false">确 定</el-button>
  </span>
</el-dialog>
</div>
</template>

<script>
export default {
data(){
  return{
    rolesList:[],
    addDialogVisible:false,
    editDialogVisible:false,
    rightDialogVisible:false,
    setRoleDialogVisible:false,
    addForm:{},
    editForm:{},
    rightsList:[],
    // 树形控件的属性绑定对象
    treeProps:{
      label:'authName',
      children:'children'
    },
    // 默认选中的节点Id数值
    defKeys:[],
    // 当前即将分配权限的角色id
    roleID:''
  }
},
created(){
  this.getRolesList()
},
methods:{
  async getRolesList(){
    const {data :res} = await this.$http.get('roles')
    if(res.meta.status !==200) return this.$message.error('获取角色列表失败')
    this.rolesList = res.data
    console.log(res);
  },
  // 添加用户取消时重置表单
  addDialogClosed(){
    this.$refs.addFormRef.resetFields()
  },
  // 添加用户
  async addUser(){
    addDialogVisible:true
    const {data : res} = await this.$http.post('roles',this.addForm)
    console.log(res);
    if(res.meta.status !==201) return this.$message.error('添加失败')
    this.$message.success('添加成功')
      // 隐藏添加的对话框
    this.addDialogVisible = false
    this.getRolesList()

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

      const { data: res } = await this.$http.delete('roles/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }

      this.$message.success('删除用户成功！')
      this.getRolesList()
  },
  // 编辑角色
  async showEdit(id){
    const {data :res} = await this.$http.get('roles/' + id)
    if(res.meta.status !== 200) return this.$message.error('无法查询到角色信息')
    this.editForm = res.data
    this.editDialogVisible = true
  },
  // 编辑角色信息
  async editRoles(){
    const {data :res }= await this.$http.put('roles/'+this.editForm.roleId,{
      roleName :this.editForm.roleName,
      roleDesc :this.editForm.roleDesc
    })
    if(res.meta.status !==200) return this.$message.error('修改失败')
    this.getRolesList()
    this.editDialogVisible = false
  },
  // 删除用户权限
  async removeRightById(role,rightId){
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

      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！')
      role.children =  res.data
  },
  async showRight(role){

    // 获取权限数据
    const {data: res} = await this.$http.get('rights/tree')
    if(res.meta.status !== 200) return this.$message.error('获取权限数据失败')
    this.roleID = role.id
    this.rightsList = res.data
    this.defKeys = []
    this.getLeafKeys(role,this.defKeys)
  console.log(this.defKeys);
    this.rightDialogVisible = true

  },
  // 通过递归，获取角色下三级权限保存到数组中
  getLeafKeys(node,arr){
    // 如果当前node节点没有children没有子节点就返回三级子节点
    if(!node.children){
      return arr.push(node.id)
    }
    node.children.forEach(item =>{
      this.getLeafKeys(item,arr)
    })
  },
  // 添加权限
  async addRights(){
    const keys = [
      ...this.$refs.treeRef.getCheckedKeys(),
      ...this.$refs.treeRef.getHalfCheckedKeys()
    ]
    const idStr = keys.join(',')
    const {data :res } = await this.$http.post(`roles/${this.roleID}/rights`,{rids : idStr})
    if(res.meta.status !==200) return this.$message.error('添加失败')
    this.$message.success('添加成功')
    this.getRolesList()
    this.rightDialogVisible = false
  }
}
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;
}
.bdtop{
  border-top: 1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
