<template>
  <div class="ofa-form">
    <el-card content-position="left" class="form-header">
      <el-page-header @back="goBack" content="子级机构 Tenant" size="small"></el-page-header>
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
        <el-card content-position="left">
          <div slot="header">
            <span class="card-header-label">基本信息</span>
          </div>
          <el-alert show-icon title="操作提示" type="warning" style="margin-bottom:20px;">
            <ul class="tips">
              <li>1. 子机构创建后会自动创建一个默认登录用户，初始用户名为机构名称，密码为机构代码</li>
            </ul>
          </el-alert>
          <div class="row">
            <el-form-item label="是否启用">
              <el-switch v-model="entity.IsEnable" size="small"></el-switch>
            </el-form-item>
          </div>
          <div class="row">
            <el-form-item label="名称" prop="Name">
              <el-input v-model.trim="entity.Name" size="small" placeholder="请输入机构名称"></el-input>
            </el-form-item>
            <el-form-item label="代码" prop="Code">
              <el-input v-model.trim="entity.Code" size="small" placeholder="机构代码，如无可自动生成"></el-input>
            </el-form-item>
            <el-form-item label="管理人" prop="Manager">
              <el-input v-model.trim="entity.Manager" size="small" placeholder="请输入机构管理者名称"></el-input>
            </el-form-item>
            <el-form-item label="联系电话" prop="Phone">
              <el-input v-model.trim="entity.Phone" size="small" placeholder="请输入机构管理者联系方式"></el-input>
            </el-form-item>
          </div>
          <div class="row">
            <el-form-item label="企业地址" prop="Address" class="address-item">
              <el-input show-word-limit type="textarea" class="address-textarea" size="small" placeholder="请输入机构所在地址"
                v-model="entity.Address" maxlength="300">
              </el-input>
            </el-form-item>
          </div>
          <div class="row">
            <el-form-item label="描述" prop="Description" class="description-item">
              <el-input show-word-limit type="textarea" class="description-textarea" size="small" placeholder="请输入机构简要介绍"
                v-model="entity.Description" maxlength="300">
              </el-input>
            </el-form-item>
          </div>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { TENANT, TENANT_FORM } from '../../../router/base-router'

// 子级机构
export default {
  name: TENANT_FORM.name,
  data () {
    return {
      loading: false, // 加载中
      isAdd: false, // 是否添加
      disabled: true, // 允许编辑
      menus: [],
      topMenus: [],
      perms: [],
      tree: [],
      entity: {},
      validationRules: {
        Name: [{ required: true, message: '请先填写机构名称', trigger: 'blur' }, { min: 5, max: 20, message: '长度在5到20个字符', trigger: 'blur' }],
        Manager: [{ max: 20, message: '不能超过20个字符', trigger: 'blur' }],
        Phone: [{ max: 20, message: '不能超过20个字符', trigger: 'blur' }],
        Code: [{ min: 8, max: 20, message: '长度在8 ~ 20个字符', trigger: 'blur' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(TENANT.name)
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
        this.entity = { IsEnable: true, ...this.$route.params }
        if (!this.isAdd) {
          this.disabled = true
        } else {
          this.disabled = false
        }
        this.loading = false
      }
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) this.submitRemote()
      })
    },
    submitRemote () {
      if (this.entity.isAdd) {
        this.add()
      } else {
        this.update()
      }
    },
    add () {
      const url = this.$root.getApi(API.KEY, API.TENANT.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.isAdd = false
            this.disabled = true
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.TENANT.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.disabled = true
          }
        })
    },
    goBack () {
      this.$refs.form.resetFields()
      this.$root.navigate({ ...TENANT, params: {} })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
$label-color:#99a9bf;
$border-color:#EBEEF5;

.ofa-form {
  /deep/ .tips {
    li {
      padding: 3px 0;
      font-size: .75rem;
    }
  }

  /deep/ .form {
    input {
      width: 200px;
    }

    label {
      color: $label-color;
    }

    .address-item,
    .description-item {
      flex: 1;
      max-width: 1120px;

      .address-textarea,
      .description-textarea
      textarea {
        width: 100%;
        height: 100px;
      }
    }
  }
}
</style>
