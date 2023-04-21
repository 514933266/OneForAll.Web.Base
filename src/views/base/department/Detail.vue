<template>
  <div class="areagroup-detail-box">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="岗位" name="first">
        <base-department-job v-if="activeTab === 'first'" ref="job" v-model="value"></base-department-job>
      </el-tab-pane>
      <el-tab-pane label="角色" name="second">
        <base-department-role v-if="activeTab === 'second'" ref="role" v-model="value"></base-department-role>
      </el-tab-pane>
      <el-tab-pane label="成员" name="third">
        <base-department-user v-if="activeTab === 'third'" ref="user" v-model="value"></base-department-user>
      </el-tab-pane>
    </el-tabs>
    <span class="btn-box">
      <span v-show="activeTab === 'first'">
        <el-button v-if="permissions.AddJob" @click="addJob" size="small" class="ofa-button">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;添加
        </el-button>
        <el-button v-if="permissions.UpdateJob" @click="updateJob" size="small" class="ofa-button">
          <font-awesome-icon fas icon="edit"></font-awesome-icon>&nbsp;修改
        </el-button>
        <el-button v-if="permissions.DeleteJob" @click="delJob" size="small" class="ofa-button">
          <font-awesome-icon fas icon="trash"></font-awesome-icon>&nbsp;删除
        </el-button>
      </span>
    </span>
  </div>
</template>

<script>
import BaseDepartmentJob from './Job'
import BaseDepartmentRole from './Role'
import BaseDepartmentUser from './User'
import { DEPARTMENT, DEPARTMENT_DETAIL } from '../../../router/base-router'

export default {
  name: DEPARTMENT_DETAIL.name,
  props: {
    // 绑定值
    value: {}
  },
  data () {
    return {
      activeTab: 'first'
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(DEPARTMENT.name)
    }
  },
  methods: {
    addJob () {
      this.$refs.job.add()
    },
    updateJob () {
      this.$refs.job.update()
    },
    delJob () {
      this.$refs.job.del()
    }
  },
  components: { BaseDepartmentJob, BaseDepartmentRole, BaseDepartmentUser }
}
</script>

<style lang="scss" scoped>
.areagroup-detail-box {
  position: relative;

  .btn-box {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
  }
}
</style>
