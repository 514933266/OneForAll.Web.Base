<template>
  <div class="ofa-container column">
    <el-card shadow="never">
      <div class="ofa-work-box">
        <span>
          <el-button size="mini" v-if="permissions.Add" @click="add"  type="primary">
            <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增
          </el-button>
        </span>
        <span>
        </span>
      </div>
    </el-card>
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" border :data="tree" row-key="Id" size="small"
        class="ofa-table">
        <el-table-column label="名称" prop="Name"></el-table-column>
        <el-table-column label="备注" prop="Remark"></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-tooltip v-if="permissions.Update" content="编辑" placement="top">
              <font-awesome-icon fas icon="edit" class="text-primary" @click="update(scope.row)"></font-awesome-icon>
            </el-tooltip>
            <el-tooltip v-if="permissions.Delete" content="删除" placement="top">
              <font-awesome-icon fas icon="trash" class="text-danger" @click="del(scope.row)">
              </font-awesome-icon>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { ARTICLE_TYPE, ARTICLE_TYPE_FORM } from '../../../router/base-router'

// 文章分类管理
export default {
  name: ARTICLE_TYPE.name,
  data () {
    return {
      loading: false,
      list: [],
      tree: []
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(ARTICLE_TYPE.name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.get())
  },
  methods: {
    init () {
      if (this.loading) return
      this.get()
    },
    get () {
      this.loading = true
      const url = this.$root.getApi(API.KEY, API.ARTICLE_TYPE.URL)
      this.axios.get(url).then(response => {
        this.list = response
        this.setTree()
        this.loading = false
      })
    },
    getChildren (parentId) {
      return this.list.filter(w => { return w.ParentId === parentId })
        .sort((a, b) => { return a.Sort - b.Sort })
    },
    setTree () {
      const tree = []
      const topMenus = this.getChildren(this.$store.state.guid)
      topMenus.forEach(e => { tree.push(this.convertToTree(e)) })
      this.tree = tree
    },
    convertToTree (parent) {
      const children = this.getChildren(parent.Id)
      if (children && children.length > 0) {
        parent = { ...parent, children: [] }
        children.forEach(e => { parent.children.push(this.convertToTree(e)) })
      }
      return parent
    },
    add () {
      this.toFormPage({ isAdd: true })
    },
    update (entity) {
      this.toFormPage(entity)
    },
    del (entity) {
      this.$confirm('确认要删除该分类？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.ARTICLE_TYPE.URL)
        this.axios.delete(`${url}/${entity.Id}`).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    toFormPage (params) {
      const newParams = { ...params, list: this.list }
      this.$root.navigate({ ...ARTICLE_TYPE_FORM, params: newParams })
    }
  },
  created () {
    this.get()
  }
}
</script>

<style lang="scss" scoped>

table tr td:last-child svg {
  cursor: pointer;
  margin-right: .875rem;
}
</style>
