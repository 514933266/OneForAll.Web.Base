<template>
  <div>
    <spinner v-if="loading"></spinner>
    <el-card v-else>
      <div class="team-box">
        <div class="tree">
          <div class="header">
            <el-button plain class="ofa-button" size="small" v-if="permissions.Add" @click="add">
              <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;创建部门
            </el-button>
          </div>
          <el-tree highlight-current accordion draggable :data="list"
            :props="{ checkStrictly: true, label: 'Name', children: 'Children', value: 'Id' }" ref="baseDepartmentTree"
            class="filter-tree" node-key="Id" empty-text="请创建部门组织架构" @node-drop="sort" @allow-drop="allowSort"
            @node-click="(data) => entity = data">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>
                <font-awesome-icon fas icon="network-wired"></font-awesome-icon>&nbsp;
                <label>{{ data.Name }}</label>
              </span>
              <span class="work-cell">
                <el-dropdown trigger="click" @command="dropdownCommand">
                  <el-button circle size="small">
                    <font-awesome-icon fas icon="wrench"></font-awesome-icon>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-if="permissions.Update" command="upd">
                      <font-awesome-icon fas icon="edit"></font-awesome-icon>&nbsp;修改
                    </el-dropdown-item>
                    <el-dropdown-item v-if="permissions.Delete" command="del">
                      <font-awesome-icon fas icon="trash"></font-awesome-icon>&nbsp;删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </span>
            </span>
          </el-tree>
        </div>
        <!-- 成员列表 -->
        <div class="member-box">
          <base-department-detail v-model="entity"></base-department-detail>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import BaseDepartmentDetail from './Detail'
import { DEPARTMENT, DEPARTMENT_FORM } from '../../../router/base-router'

// 部门岗位角色管理
export default {
  name: DEPARTMENT.name,
  data () {
    return {
      loading: false, // 加载中
      list: [], // 分店团队列表
      entity: {} // 当前选中的部门节点
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(DEPARTMENT.name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  methods: {
    init () {
      if (!this.loading) {
        this.loading = true
        this.get()
      }
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.DEPARTMENT.URL)
      this.axios.get(url)
        .then(response => {
          this.list = response
          this.loading = false
        })
    },
    allowSort (draggingNode, dropNode, type) {
      return this.permissions.Sort && draggingNode.data.level === dropNode.data.level
    },
    sort (draggingNode, dropNode, type, event) {
      const index = dropNode.parent.childNodes.findIndex(w => w.data.Id === draggingNode.data.Id)
      draggingNode.data.SortNumber = dropNode.parent.childNodes.length - index
      this.requestSort(draggingNode.data)
    },
    requestSort (entity) {
      const url = this.$root.getApi(API.KEY, API.DEPARTMENT.SORT.replace(/{id}/, entity.Id))
      this.axios.patch(url, entity)
        .then(response => {
          this.get()
        })
    },
    dropdownCommand (command) {
      const node = this.$refs.baseDepartmentTree.getCurrentNode()
      switch (command) {
        case 'upd':
          this.update(node)
          break
        case 'del':
          this.del(node)
          break
      }
    },
    add () {
      this.toFormPage({
        isAdd: true
      })
    },
    update (entity) {
      this.toFormPage(entity)
    },
    del (entity) {
      this.$confirm('确认要删除该节点？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.DEPARTMENT.URL)
        this.axios.delete(`${url}/${entity.Id}`).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    toFormPage (params) {
      this.$root.browser.navigate({ ...DEPARTMENT_FORM, params: params })
    }
  },
  created () {
    this.init()
  },
  components: { BaseDepartmentDetail }
}
</script>

<style lang="scss" scoped>
.team-box {
  display: flex;
  justify-content: flex-start;

  .tree {
    max-height: 980px;
    min-height: 650px;
    min-width: 250px;
    border: 1px solid #ebeef5;
    overflow: auto;

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: .75rem;
      border-bottom: 1px solid #ebeef5;
    }

    /deep/.filter-box {
      border-bottom: 1px solid #ebeef5;

      input {
        border-radius: 0;
        border: 0;
      }
    }

    /deep/ .el-tree {
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

        >span {
          text-align: left;
          display: inline-block;
        }

        button {
          width: 30px;
          height: 30px;
          margin-left: .875rem;
        }

        .work-cell {
          display: none;
        }

        &:hover {
          .work-cell {
            display: inline-block;
          }
        }
      }
    }
  }

  /deep/.member-box {
    width: 100%;
    margin-left: 20px;
    position: relative;

    .btn-box {
      position: absolute;
      right: 0;
      top: 0;
      z-index: 1;
      .el-input {
        width: 150px;
        margin-right: 10px;
      }
    }

    .user-icon {
      border-radius: 50%;
      vertical-align:middle;
      margin-right: 10px;
      img {
        width: 40px;
        height: 40px;
      }
    }
  }
}
</style>
