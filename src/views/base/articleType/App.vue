<template>
  <el-container v-loading="loading" class="ofa-container column">
    <el-header class="header">
      <span>
      </span>
      <span>
        <el-button size="mini" v-if="permissions.Add" @click="showAddDrawer" type="primary">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增分类
        </el-button>
      </span>
    </el-header>
    <el-table v-loading="loading" :data="tree" row-key="Id" size="small" class="ofa-table">
      <el-table-column label="名称" prop="Name"></el-table-column>
      <el-table-column label="备注" prop="Remark"></el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button v-if="permissions.Update" type="text" size="small" @click="edit(scope.row)">修改
          </el-button>
          <el-button v-if="permissions.Delete" type="text" class="ofa-text-danger" size="small" @click="del(scope.row)">
            删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 用户表单 -->
    <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-close="false" direction="rtl" size="400px" class="ofa-drawer" @close="$refs.form.resetFields()">
      <div slot="title">
        <span class="title">{{isAdd ? '新增' : '编辑'}}类型</span><label class="title-tips">Type</label>
      </div>
      <el-form status-icon ref="form" :rules="validationRules" :model="entity" class="form" label-width="80px" size="mini">
        <el-form-item label="上级" prop="ParentId">
          <base-article-type-cascader showRoot v-model="entity.ParentId" :hiddenKey="hiddenKey" placeholder="请选择上级分类">
          </base-article-type-cascader>
        </el-form-item>
        <el-form-item label="名称" prop="Name">
          <el-input v-model.trim="entity.Name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="Remark">
          <el-input type="textarea" placeholder="请输入分类备注" v-model="entity.Remark" maxlength="100" show-word-limit>
          </el-input>
        </el-form-item>
      </el-form>
      <div class="footer">
        <el-button type="primary" @click="submit" size="small">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
        </el-button>
        <el-button type="warning" @click="drawerVisiable = false" size="small">
          取消
        </el-button>
      </div>
    </el-drawer>
  </el-container>
</template>

<script>
import API from '../../../apis/base-api'
import { ARTICLE_TYPE } from '../../../router/base-router'

// 文章分类管理
export default {
  name: ARTICLE_TYPE.name,
  data () {
    return {
      loading: false,
      list: [],
      tree: [],
      // 抽屉
      drawerVisiable: false,
      isAdd: false, // 是否添加
      hiddenKey: '', // 修改状态时，隐藏当前节点和子级
      entity: {},
      validationRules: {
        Name: [{ required: true, message: '请先填写分类名称', trigger: 'blur' }, { min: 2, max: 8, message: '长度在2到8个字符', trigger: 'blur' }],
        Code: [{ required: true, message: '请先填写分类代码（控制器的名称）', trigger: 'blur' }, { min: 0, max: 20, message: '长度不能超过20个字符', trigger: 'blur' }],
        ParentId: [{ required: true, message: '请先选择上级分类', trigger: 'blur' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(ARTICLE_TYPE.name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
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
    showAddDrawer () {
      this.isAdd = true
      this.entity = { Sort: 0, IsEnable: true, IsBlank: true, list: this.list }
      this.drawerVisiable = true
    },
    edit (row) {
      this.isAdd = false
      this.entity = { Sort: 0, IsEnable: true, IsBlank: true, list: this.list, ...row }
      this.drawerVisiable = true
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
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.isAdd) {
            this.add()
          } else {
            this.update()
          }
        }
      })
    },
    add () {
      const url = this.$root.getApi(API.KEY, API.ARTICLE_TYPE.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.init()
            this.drawerVisiable = false
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.ARTICLE_TYPE.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.init()
            this.drawerVisiable = false
          }
        })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
table tr td:last-child svg {
  cursor: pointer;
  margin-right: 0.875rem;
}
</style>
