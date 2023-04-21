<template>
  <div class="ofa-form">
    <div class="form-header">
      <span>
        <el-button round v-if="permissions.Add" type="primary" size="small" @click="submit">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
        </el-button>
      </span>
      <el-button round class="ofa-button" size="small" @click="cancel">
        <font-awesome-icon fas icon="angle-double-left"></font-awesome-icon>&nbsp;返回
      </el-button>
    </div>
    <el-divider content-position="left">基本信息</el-divider>
    <div class="form-content">
      <el-alert show-icon title="操作提示" type="warning">
        <ul class="tips">
          <li>1. 地区组权限和操作权限互不冲突</li>
          <li>2. 分配成员到地区组后，可以获得对应的地区数据查询权限</li>
        </ul>
      </el-alert>
      <el-form status-icon ref="form" :rules="validationRules" :model="entity" class="areagroup-form"
        label-width="80px">
        <div class="row">
          <el-form-item label="名称" prop="Name">
            <el-input v-model.trim="entity.Name" size="mini" placeholder="请输入地区组名称"></el-input>
          </el-form-item>
        </div>
        <el-form-item label="备注" prop="Remark" class="remark-item">
          <el-input show-word-limit type="textarea" size="mini" maxlength="100" placeholder="请输入备注"
            v-model="entity.Remark">
          </el-input>
        </el-form-item>
      </el-form>
      <!-- 明细 -->
      <div v-if="!entity.isAdd">
        <el-divider content-position="left">其他信息</el-divider>
        <detail v-model="entity"></detail>
      </div>
    </div>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { AREAGROUP, AREAGROUP_FORM } from '../../../router/base-router'
import Detail from './Detail'

export default {
  name: AREAGROUP_FORM.name,
  data () {
    return {
      entity: {}, //                  模态框实体对象
      validationRules: {
        Name: [
          { required: true, message: '请先填写地区组名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2到8个字符', trigger: 'blur' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(AREAGROUP.name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      this.entity = { ...this.$route.params }
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
      const url = this.$root.getApi(API.KEY, API.AREAGROUP.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) this.cancel()
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.AREAGROUP.URL)
      this.axios.put(url, this.entity)
    },
    cancel () {
      this.$refs.form.resetFields()
      this.$root.navigate({ ...AREAGROUP, params: {} })
    }
  },
  created () {
    this.init()
  },
  components: { Detail }
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

  /deep/ .areagroup-form {
    margin-top: 20px;
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
