<template>
<el-container class="home_container">
  <!-- 头部 -->
  <el-header>
    <div>
      <img src="../assets/heima.png" alt="">
      <span>电商后台管理系统</span>
    </div>
    <el-button type="info" @click="logout">退出</el-button>
  </el-header>
  <!-- 页面主体区域 -->
  <el-container>
    <!-- 侧边栏 -->
    <el-aside :width="isShow ? '64px' :'200px'">
      <div class="toggle-button" @click="show">|||</div>
      <!-- 侧边栏菜单 -->
      <el-menu
      background-color="#333744"
      text-color="#fff"
      active-text-color="#409FFF"
      unique-opened :collapse="isShow"
      :collapse-transition="false"
      router
      :default-active="this.$route.path">
      <!-- 一级菜单 -->
      <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
        <!-- 一级菜单的模板 -->
        <template slot="title">
          <i class="el-icon-location"></i>
          <span>{{item.authName}}</span>
        </template>
        <!-- 二级菜单 -->
        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" >
          <template slot="title">
          <i class="el-icon-menu"></i>
          <span>{{subItem.authName}}</span>
        </template>
        </el-menu-item>
      </el-submenu>
    </el-menu>
    </el-aside>
    <!-- 右侧内容主体 -->
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</el-container>
</template>

<script>
export default {
data(){
return {
  // 左侧菜单数据
  menulist:[],
  isShow :false,

}
},
created(){
    this.getMenuList()
},
methods:{
  logout(){
    window.sessionStorage.clear()
    this.$router.push('./login')
  },
  async getMenuList(){
    const {data : res}= await this.$http.get('menus')
    if(res.meta.status !==200) return this.$message.error()
    // console.log(res);
    this.menulist = res.data
    console.log(this.$route.path);
  },
  show(){
    this.isShow = !this.isShow
  }

}
}
</script>

<style scoped lang="less">
.home_container{
  height: 100%;
}
.el-header{
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color:#fff;
  font-size: 20px;
  div{
    display: flex;
    align-items: center;
    span{
      margin-left: 10px;
    }
  }
}
.el-aside{
  background-color: #333744;
  .el-menu{
    border-right: none;
  }
}
.el-main{
  background-color: #eaedf1;
}
.toggle-button{
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
}
</style>
