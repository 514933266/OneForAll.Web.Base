<template>
  <div class="ofa-form">
    <el-card content-position="left" class="form-header" shadow="never">
      <el-page-header @back="goBack" content="用户账号 User" size="small"></el-page-header>
      <div class="button-box">
        <span v-if="disabled">
          <el-button round v-if="permissions.Update" @click="disabled = false" type="primary" size="small">
            <font-awesome-icon fas icon="edit"></font-awesome-icon>&nbsp;编辑
          </el-button>
        </span>
        <span v-else>
          <el-button round v-show="permissions.Add || permissions.Update" @click="submit" type="primary" size="small">
            <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
          </el-button>
          <el-button round v-show="!isAdd" @click="disabled = true" type="warning" size="small">
            <font-awesome-icon fas icon="reply"></font-awesome-icon>&nbsp;取消
          </el-button>
        </span>
      </div>
    </el-card>
    <div class="form-content">
      <el-form status-icon ref="form" :rules="validationRules" :model="entity" :disabled="disabled" class="form"
        label-width="80px" size="small">
        <el-card content-position="left" shadow="never">
          <div slot="header">
            <span class="card-header-label">基本信息</span>
          </div>
          <el-alert show-icon title="操作提示" type="warning" style="margin-bottom:20px;">
            <ul class="tips">
              <li>创建账号时如不填写密码默认与账号相同，请创建后立即登录修改</li>
            </ul>
          </el-alert>
          <div class="row">
            <el-form-item label="账号" prop="UserName">
              <el-input v-model.trim="entity.UserName" :disabled="!entity.isAdd" size="small" placeholder="请输入用户账号">
              </el-input>
            </el-form-item>
          </div>
          <div class="row">
            <el-form-item label="名称" prop="Name">
              <el-input v-model.trim="entity.Name" size="small" placeholder="请输入用户名称"></el-input>
            </el-form-item>
          </div>
          <el-form-item v-if="isAdd" label="密码" prop="new">
            <el-input :type="show.new ? 'text' : 'password'" v-model="entity.Password" placeholder="请输入密码"
              @change="checkPwdStrength">
              <font-awesome-icon slot="prefix" fas :icon="show.new ? 'eye' : 'eye-slash'" @click="show.new = !show.new">
              </font-awesome-icon>
            </el-input>
            <span class="pwd-strength-box" v-show="entity.strength > 0">
              <el-rate disabled show-text v-model="entity.strength" :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                :texts="['弱', '中', '强', '很强']" :max="4">
              </el-rate>
            </span>
          </el-form-item>
          <el-form-item v-if="isAdd" label="确认密码" prop="repeat">
            <el-input :type="show.repeat ? 'text' : 'password'" v-model="entity.RePassword" placeholder="请确认密码">
              <font-awesome-icon slot="prefix" fas :icon="show.repeat ? 'eye' : 'eye-slash'"
                @click="show.repeat = !show.repeat"></font-awesome-icon>
            </el-input>
          </el-form-item>
          <div class="row">
            <el-form-item label="状态" prop="Status">
              <el-select v-model="entity.Status" size="small" placeholder="请选择账号初始状态">
                <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script>
import md5 from 'js-md5'
import API from '../../../apis/base-api'
import { USER, USER_FORM } from '../../../router/base-router'
import { NOT_ALLOWED, SUCCESS } from '../../../untils/error'

export default {
  name: USER_FORM.name,
  data () {
    const validatePassword = (rule, value, callback) => {
      if (!this.isAdd) return callback()
      if (value !== this.entity.new) {
        callback(new Error('两次输入密码不一致!'))
      } else if (this.entity.strength < 3) {
        callback(new Error('密码强度不足，请确保密码长度6位以上，且包含数字、字母组合!'))
      } else {
        callback()
      }
    }
    return {
      loading: false, // 加载中
      isAdd: false, // 是否添加
      disabled: true, // 允许编辑
      entity: {},
      show: {
        old: false,
        new: false,
        repeat: false
      },
      status: [{ value: SUCCESS, label: '正常' }, { value: NOT_ALLOWED, label: '封禁' }],
      validationRules: {
        Name: [{ required: true, message: '请先填写用户名称', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2到8个字符', trigger: 'blur' }],
        UserName: [{ required: true, message: '请先填写用户登录账号', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }],
        Repassword: [{ validator: validatePassword, trigger: 'blur' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(USER.name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (!this.loading) {
        this.loading = true
        this.tenants = []
        this.isAdd = this.$route.params.isAdd
        this.entity = { Status: 1, ...this.$route.params }
        if (!this.isAdd) {
          this.disabled = true
        } else {
          this.disabled = false
        }
        this.loading = false
      }
    },
    checkPwdStrength (value) {
      let level = 0
      if (value.length > 5) { level++ }
      if (/\d/.test(value)) { level++ }
      if (/[a-z]/.test(value)) { level++ }
      if (/[A-Z]/.test(value)) { level++ }
      if (/\W/.test(value)) { level++ }
      this.entity.strength = level
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.entity.Password && this.entity.Password.length > 0) {
            this.entity.Password = md5(this.entity.Password)
            this.entity.RePassword = md5(this.entity.RePassword)
          }
          if (this.isAdd) {
            this.add()
          } else {
            this.update()
          }
        }
      })
    },
    add () {
      const url = this.$root.getApi(API.KEY, API.USER.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.isAdd = false
            this.disabled = true
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.USER.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.disabled = true
          }
        })
    },
    goBack () {
      this.$refs.form.resetFields()
      this.$root.navigate({ ...USER, params: {} })
    }
  },
  created () {
    this.init()
  }
}
</script>
