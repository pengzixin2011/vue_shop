<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登入表单 -->
      <el-form ref="loginRef" label-width="0px" class="login" :model="loginForm" :rules="loginRules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
         <el-form-item class="btn">
          <el-button type="primary" @click="login">登入</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
data(){
  return {
    // 这是登入表单的绑定对象
    loginForm:{
      username:'admin',
      password:'123456'
    },
    // 这个是表单的验证规则对象
    loginRules:{
      // 验证用户名
      username:[
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 10, message: '长度在 3 到10 个字符', trigger: 'blur' }

      ],
      // 验证密码
      password:[
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 12, message: '长度在 6 到12 个字符', trigger: 'blur' }

      ]
    }
  }
},
methods:{
  reset(){
    this.$refs.loginRef.resetFields()
  },
  login(){
    this.$refs.loginRef.validate(async valid=>{
      if(!valid) return;
      const {data :res} = await this.$http.post("login",this.loginForm);
      if(res.meta.status !==200) return this.$message.error('登入失败');
      this.$message.success('登入成功');
      window.sessionStorage.setItem("token",res.data.token),
      this.$router.push("/home");
    })
  }
}
}
</script>


<style lang="less" scoped>
.login_container{
  background-color: #2b4b6b;
  height: 100%;
}
.login_box{
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top:50%;
  transform: translate(-50%,-50%);
}
.avatar_box{
  height: 130px;
  width: 130px;
  border:1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  margin: auto;
  transform: translate(0,-50%);
  background-color: #fff;
  img{
    height:100%;
    width:100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.login{
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btn{
  display: flex;
  justify-content:flex-end ;
}
</style>
