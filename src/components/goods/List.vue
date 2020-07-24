<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->

      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="querInfo.query" clearable @clear="getGoodsList">
          <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="Add">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table border stripe :data="goodsList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template v-slot="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作"  width="300px">
          <template v-slot="scope">
             <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit"  size="mini" >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" @click="deleById(scope.row.goods_id)" size="mini" >删除</el-button>
          </template>
        </el-table-column>

      </el-table>
      <!-- 分页区域 -->
       <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
data(){
  return{
    // 查询参数对象
    querInfo:{
      query:'',
      pagenum:1,
      pagesize:10
    },
    // 商品列表
    goodsList:[],
    // 总数居条
    total:0
  }
},
created(){
  this.getGoodsList()
},
methods:{
  async getGoodsList(){
    const {data :res } = await this.$http.get('goods',{ params : this.querInfo})
    if(res.meta.status !==200) return this.$message.error('获取商品列表失败')
    this.goodsList = res.data.goods
    this.total = res.data.total
    this.$message.success('获取商品列表成功')

  },
  // 监听pagesize
  handleSizeChange(newSize){
    this.querInfo.pagesize = newSize
    this.getGoodsList()
  },
  // 监听pagenum
  handleCurrentChange(newNum){
    this.querInfo.pagenum = newNum
    this.getGoodsList()
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

      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败！')
      }
      this.getGoodsList()
      this.$message.success('删除商品成功！')
    },
    // 添加商品
    Add(){
      this.$router.push('goods/add')
    }
}
}
</script>

<style lang="less" scoped>

</style>
