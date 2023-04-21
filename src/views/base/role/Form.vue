<template>
  <div class="ofa-form" style="height:100%;">
    <el-card content-position="left" class="form-header" shadow="never">
      <el-page-header @back="goBack" content="权限角色 Role" size="small"></el-page-header>
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
              <li>1. 创建后对角色分配权限</li>
              <li>2. 再将用户加入到该角色中，用户将会拥有对应的操作权限</li>
            </ul>
          </el-alert>
          <div class="row">
            <el-form-item label="名称" prop="Name">
              <el-input v-model.trim="entity.Name" size="small" placeholder="请输入角色名称"></el-input>
            </el-form-item>
          </div>
          <div class="row">
            <el-form-item label="备注" prop="Remark" class="remark-item">
              <el-input show-word-limit type="textarea" maxlength="100" size="small" placeholder="请输入备注"
                v-model="entity.Remark">
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
import { ROLE, ROLE_FORM } from '../../../router/base-router'

// 角色表单
export default {
  name: ROLE_FORM.name,
  data () {
    return {
      loading: false, // 加载中
      isAdd: false, // 是否添加
      disabled: true, // 允许编辑
      entity: {},
      validationRules: {
        Name: [{ required: true, message: '请先填写角色名称', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2到8个字符', trigger: 'blur' }],
        Permissions: [{ required: true, message: '请选择角色权限', trigger: 'blur' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(ROLE.name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (!this.loading) {
        this.loading = true
        this.isAdd = this.$route.params.isAdd
        this.entity = { ...this.$route.params }
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
        if (valid) {
          if (this.entity.isAdd) {
            this.add()
          } else {
            this.update()
          }
        }
      })
    },
    add () {
      const url = this.$root.getApi(API.KEY, API.ROLE.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) this.goBack()
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.ROLE.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.disabled = true
          }
        })
    },
    goBack () {
      this.$refs.form.resetFields()
      this.$root.navigate({ ...ROLE, params: {} })
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

    .remark-item {
      flex: 1;
      max-width: 560px;
    }
  }
}
</style>
