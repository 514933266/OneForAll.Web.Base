<template>
  <div class="perm-container">
    <el-alert show-icon title="操作提示" type="warning">
      <ul class="tips">
        <li>对角色进行权限分配</li>
        <li>将用户加入角色，即可拥有对应系统权限</li>
        <li>勾选子权限默认拥有父级的查看权限</li>
      </ul>
    </el-alert>
    <div class="button-box">
      <el-button @click="bindPermission" type="primary" size="small">保存权限</el-button>
    </div>
    <menu-perm-table ref="permTable" v-model="selectionList"></menu-perm-table>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import MenuPermTable from '../_components/TenantPermissionTable.vue'

// 角色权限
export default {
  name: 'SysTenantRolePermission',
  props: {
    roleId: ''
  },
  data () {
    return {
      loading: false, // 加载中
      selectionList: [], // 选中的权限
    }
  },
  methods: {
    init () {
      if (this.loading) return
      this.loading = true
      this.get()
    },
    get () {
      let url = this.$root.getApi(API.KEY, API.ROLE.PERMISSION)
      url = url.replace(/{id}/, this.roleId)
      this.axios.get(url).then(response => {
        this.selectionList = [...response]
        this.loading = false
      })
    },
    bindPermission () {
      let url = this.$root.getApi(API.KEY, API.ROLE.PERMISSION)
      url = url.replace(/{id}/, this.roleId)
      this.axios.post(url, this.selectionList)
    }
  },
  created () {
    this.init()
  },
  components: { MenuPermTable }
}
</script>

<style lang="scss" scoped>
.perm-container {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    align-items: flex-start;

    .button-box {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 10px 0;
        width: 100%;
    }
}
</style>
