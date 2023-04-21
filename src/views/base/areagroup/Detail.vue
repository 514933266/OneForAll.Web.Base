<template>
  <div class="areagroup-detail-box">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="权限" name="first">
        <permission v-if="activeTab === 'first'" ref="permission" v-model="value"></permission>
      </el-tab-pane>
      <el-tab-pane label="成员" name="second">
        <member v-if="activeTab === 'second'" ref="member" v-model="value"></member>
      </el-tab-pane>
    </el-tabs>
    <span class="btn-box">
      <!-- 权限 -->
      <span v-show="activeTab === 'first'">
        <el-button v-if="permissions.Update" @click="addPermission" size="mini" class="ofa-button">
          <font-awesome-icon fas icon="check"></font-awesome-icon>&nbsp;设置
        </el-button>
      </span>
      <!-- 成员 -->
      <span v-show="activeTab === 'second'">
        <el-button v-if="permissions.Update" @click="addMember" size="mini" class="ofa-button">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;添加
        </el-button>
        <el-button v-if="permissions.Update" @click="delMember" size="mini" class="ofa-button ofa-button-danger">
          <font-awesome-icon fas icon="minus"></font-awesome-icon>&nbsp;移除
        </el-button>
      </span>
    </span>
  </div>
</template>

<script>
import { AREAGROUP, AREAGROUP_DETAIL } from '../../../router/base-router'
import Permission from './Permission'
import Member from './Member'

export default {
  name: AREAGROUP_DETAIL.name,
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
      return this.$root.getPermissions(AREAGROUP.name)
    }
  },
  methods: {
    addPermission () {
      this.$refs.permission.add()
    },
    addMember () {
      this.$refs.member.add()
    },
    delMember () {
      this.$refs.member.del()
    }
  },
  components: { Permission, Member }
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
