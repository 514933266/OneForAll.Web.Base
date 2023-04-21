<template>
  <div class="ofa-form" style="height:100%;">
    <el-card content-position="left" class="form-header" shadow="never">
      <el-page-header @back="goBack" :content="`${entity.Name}-角色管理 Manage`" size="mini"></el-page-header>
    </el-card>
    <el-card content-position="left" class="form-content" shadow="never">
      <div class="tab-container">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="全部权限" name="permTab">
            <permission :roleId="entity.Id" ref="permission"></permission>
          </el-tab-pane>
          <el-tab-pane label="角色用户" name="userTab">
            <member :roleId="entity.Id" ref="member"></member>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
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
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(ROLE.name)
    }
  },
  methods: {
    init () {
      if (this.loading) return
      this.loading = true
      this.entity = { ...this.$route.params }
      this.tabClick(this.activeTab)
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
.tab-container {
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
