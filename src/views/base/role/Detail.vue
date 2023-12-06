<template>
  <el-container v-loading="loading">
    <!-- <el-header class="header">
      <el-page-header @back="goBack" :content="`${entity.Name}-角色管理`" size="mini"></el-page-header>
    </el-header> -->
    <el-main class="ofa-container column">
      <div class="tab-container">
        <div class="tab-name">{{`${entity.Name}`}}</div>
        <el-tabs v-model="activeTab" @tab-click="tabClick">
          <el-tab-pane label="全部权限" name="permTab">
            <permission :roleId="entity.Id" ref="permission"></permission>
          </el-tab-pane>
          <el-tab-pane label="角色用户" name="userTab">
            <member :roleId="entity.Id" ref="member"></member>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { ROLE, ROLE_DETAIL } from '../../../router/base-router'
import Permission from './Permission'
import Member from './Member'

// 角色明细
export default {
  name: ROLE_DETAIL.name,
  data () {
    return {
      loading: false,
      activeTab: 'permTab',
      entity: {}
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
      if (this.loading) return
      this.loading = true
      this.entity = { ...this.$route.params }
      this.loading = false
    },
    tabClick (tab) {
      switch (tab.name) {
        case 'permTab': this.$refs.permission.init(); break
        case 'userTab': this.$refs.member.init(); break
      }
    },
    goBack () {
      this.$root.navigate({ ...ROLE, params: {} })
    },
  },
  created () {
    this.init()
  },
  components: { Permission, Member }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  background-color: #fff;
  margin-bottom: 20px;
  border-radius: 10px;
}

.tab-container {
  .tab-name {
    font-size: 18px;
    margin-bottom: 10px;
  }
  /deep/ .el-tabs__item {
    font-size: 1rem !important;
    padding: 10px 20px !important;
    font-weight: bold;
    height: auto;
    min-width: 160px;
    text-align: center;
  }
}
</style>
