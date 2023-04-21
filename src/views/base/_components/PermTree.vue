<template>
  <div class="perm-tree">
    <div class="perm-header">
      <span>
        <el-checkbox @change="checkAll">全选</el-checkbox>
      </span>
    </div>
    <el-tree ref="tree" show-checkbox accordion :data="tree" node-key="Id">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>
          <font-awesome-icon fas :icon="data.Icon"></font-awesome-icon>{{ data.Name }}
        </span>
        <span>{{ data.Remark }}</span>
      </span>
    </el-tree>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
export default {
  name: 'BasePermTree',
  props: {
    // 指定机构模式
    tenantMode: {
      type: Boolean,
      default: false
    },
    // 当前机构模式
    myTenantMode: {
      type: Boolean,
      default: false
    },
    // 机构Id 配合 tenantMode 使用
    tenantId: {
      type: String,
      default: ''
    },
    keys: {
      type: Array
    }
  },
  data () {
    return {
      menus: [],
      tree: []
    }
  },
  watch: {
    tenantId (newValue) {
      if (!this.tenantMode) return false
      if (!newValue || newValue.length < 1) return false
      this.initTenantPermTree()
    },
    keys (newValue) {
      this.$refs.tree.setCheckedKeys(newValue)
    }
  },
  methods: {
    getMenus () {
      const url = this.$root.getApi(API.KEY, API.MENU.PERMTREE)
      return this.axios.get(url)
    },
    getTenantMenus () {
      const url = this.$root.getApi(API.KEY, API.TENANT.PERMTREE.replace(/{id}/, this.tenantId))
      return this.axios.get(url)
    },
    getMyTenantPermTree () {
      const url = this.$root.getApi(API.KEY, API.PERSONAL.PERMTREE)
      return this.axios.get(url)
    },
    initTree (methods) {
      this.axios.all(methods).then(this.axios.spread((menus) => {
        this.menus = menus
        this.setMenuPermTree()
        if (this.keys) this.$refs.tree.setCheckedKeys(this.keys)
      }))
    },
    initNormalPermTree () {
      this.initTree([this.getMenus()])
    },
    initTenantPermTree () {
      this.initTree([this.getTenantMenus()])
    },
    initMyTenantPermTree () {
      this.initTree([this.getMyTenantPermTree()])
    },
    setMenuPermTree () {
      var tree = []
      this.menus.forEach(e => {
        var item = this.setMenuTreeNodes(e)
        tree.push(item)
      })
      this.tree = tree
    },
    setMenuTreeNodes (parent) {
      const node = {
        ...parent,
        Icon: parent.Icon ? parent.Icon : 'folder',
        valuable: false,
        children: []
      }
      this.setChildPermNodes(node)
      this.setChildMenuNodes(node)
      return node
    },
    setChildPermNodes (parent) {
      parent.Permissions.forEach(e => {
        parent.children.push({
          ...e,
          Icon: 'key',
          valuable: true
        })
      })
    },
    setChildMenuNodes (parent) {
      if (parent.Children && parent.Children.length > 0) {
        parent.Children.forEach(e => {
          const node = this.setMenuTreeNodes(e)
          parent.children.push(node)
        })
      }
    },
    checkAll (checked) {
      this.menus.filter(w => w.ParentId === this.$store.state.guid).forEach(elemennt => {
        this.$refs.tree.setChecked(elemennt.Id, checked, true)
      })
    },
    getCheckedPermIds () {
      return this.$refs.tree.getCheckedNodes().filter(w => { return w.valuable }).map(w => { return w.Id })
    }
  },
  mounted () {
    if (this.tenantMode && this.tenantId) {
      this.initTenantPermTree()
    } else if (this.myTenantMode) {
      this.initMyTenantPermTree()
    } else {
      this.initNormalPermTree()
    }
  }
}
</script>

<style lang="scss" scoped>
.perm-tree {

  .perm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;

    span {
      display: inline-block;
      padding: .75rem .875rem;

      &:last-child {
        width: 40%;
      }
    }

    .el-checkbox {
      font-weight: 700;
    }

  }

  /deep/ .el-tree {
    height: 400px;
    overflow-y: auto;

    .el-tree-node__content {
      height: 40px;
    }

    .el-checkbox {
      margin-bottom: 0;
    }

    .custom-tree-node {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: .875rem;
      padding-right: 8px;
      width: 100%;

      svg {
        width: .875rem;
        height: .875rem;
        margin-right: 6px;
      }

      span {
        text-align: left;
        display: inline-block;

        &:last-child {
          padding: 0 .875rem;
        }
      }
    }
  }
}
</style>
