<template>
  <div class="ofa-form">
    <div class="form-header">
      <el-button round type="primary" size="small" @click="submit">
        <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
      </el-button>
      <el-button round size="small" class="ofa-button" @click="cancel">
        <font-awesome-icon fas icon="angle-double-left"></font-awesome-icon>&nbsp;返回
      </el-button>
    </div>
    <div class="form-content">
      <el-divider content-position="left">权限部门组织</el-divider>
      <el-form ref="form" status-icon :model="entity" :rules="validationRules" label-width="80px">
        <el-form-item label="上级" prop="ParentId">
          <department-cascader showRoot :hiddenKey="entity.Id" v-model="entity.ParentId" ref="departmentCascader"
            placeholder="请选择上级分店">
          </department-cascader>
        </el-form-item>
        <el-form-item label="名称" prop="Name">
          <el-input v-model.trim="entity.Name" size="small" placeholder="请输入部门组织架构名称"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="SortNumber">
          <el-input v-model="entity.SortNumber" size="small" placeholder="请输入排序号，按数字由小到大排序"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="Remark">
          <el-input show-word-limit v-model="entity.Remark" type="textarea" maxlength="100" size="small"
            placeholder="请输入备注">
          </el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { DEPARTMENT, DEPARTMENT_FORM } from '../../../router/base-router'
import DepartmentCascader from '../_components/DepartmentCascader'

export default {
  name: DEPARTMENT_FORM.name,
  data () {
    return {
      types: [], // 分类列表
      users: [], // 用户列表
      tree: [], // 树菜单
      entity: {}, // 实体
      validationRules: {
        ParentId: [{ required: true, message: '请先选择上级部门组织架构' }],
        SortNumber: [{ required: true, message: '请填写排序号' }],
        Name: [{ required: true, message: '请先填写组织架构名称' }, { min: 2, max: 20, message: '长度在2~20之间' }]
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      this.entity = {
        ParentId: this.$store.state.guid,
        SortNumber: 0,
        ...this.$route.params
      }
      this.$refs.departmentCascader.init()
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
      const url = this.$root.getApi(API.KEY, API.DEPARTMENT.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) this.cancel()
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.DEPARTMENT.URL)
      this.axios.put(url, this.entity)
    },
    cancel () {
      this.$refs.form.resetFields()
      this.$root.browser.navigate({ ...DEPARTMENT, params: {} })
    }
  },
  mounted () {
    this.init()
  },
  components: { DepartmentCascader }
}
</script>

<style lang="scss" scoped>
/deep/.el-form {

  .el-cascader,
  .el-input,
  .el-input-number,
  .el-date-editor,
  .el-textarea,
  .el-cascader,
  .el-select {
    width: 350px;
  }
}
</style>
