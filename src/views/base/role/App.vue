<template>
  <el-container v-loading="loading">
    <el-header class="header">
      <span>
        <search-input enterable v-model="searchOption.key" @click="search" size="small" placeholder="角色名称">
        </search-input>
      </span>
      <span>
        <el-button size="small" v-if="permissions.Add" @click="showAddDrawer" type="primary">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增角色
        </el-button>
      </span>
    </el-header>
    <el-main class="ofa-container column">
      <div class="total-box">共计 <label class="ofa-text-primary">{{total}}</label> 条数据</div>
      <el-table :data="list" size="mini" class="ofa-table">
        <el-table-column prop="Name" label="名称"></el-table-column>
        <el-table-column prop="MemberCount" label="成员人数">
          <template slot-scope="scope">{{ scope.row.MemberCount }}&nbsp;（人）</template>
        </el-table-column>
        <el-table-column prop="Remark" label="备注"></el-table-column>
        <el-table-column label="操作" width="160" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button v-if="permissions.Update" type="text" size="mini" @click="showUpdateDrawer(scope.row)">修改</el-button>
            <el-button v-if="permissions.Update" type="text" size="mini" @click="toDetailPage(scope.row)">管理
            </el-button>
            <el-button v-if="permissions.Delete" type="text" class="ofa-text-danger" size="mini" @click="del(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange" @current-change="pageIndexChange">
      </el-pagination>
    </el-main>
    <!-- 抽屉：表单 -->
    <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-close="false" direction="rtl" size="400px" class="ofa-drawer">
      <div slot="title">
        <span class="title">{{isAdd ? '新增' : '编辑'}}角色</span><label class="title-tips">Role</label>
      </div>
      <el-form status-icon ref="form" :rules="validationRules" :model="entity" class="form" label-width="80px" size="small">
        <el-alert show-icon title="操作提示" type="warning" style="margin-bottom:20px;">
          <ul class="tips">
            <li>1. 创建后对角色分配权限</li>
            <li>2. 再将用户加入到该角色中，用户将会拥有对应的操作权限</li>
          </ul>
        </el-alert>
        <el-form-item label="名称" prop="Name">
          <el-input v-model.trim="entity.Name" size="small" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="Remark" class="remark-item">
          <el-input show-word-limit type="textarea" maxlength="100" size="small" placeholder="请输入备注" v-model="entity.Remark">
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
import { ROLE, ROLE_DETAIL } from '../../../router/base-router'

// 角色管理
export default {
  name: ROLE.name,
  data () {
    return {
      loading: false,
      isAdd: false, // 是否添加
      drawerVisiable: false, // 用户抽屉显示
      searchOption: {
        key: '' // 搜索条件（关键字）
      },
      entity: {}, // 当前实体
      list: [], // 页面的角色集合
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10, // 页数
      validationRules: {
        Name: [{ required: true, message: '请先填写角色名称', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2到8个字符', trigger: 'blur' }],
        Permissions: [{ required: true, message: '请选择角色权限', trigger: 'blur' }]
      }
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(ROLE.name)
    }
  },
  methods: {
    init () {
      if (this.loading) return
      this.get()
    },
    get () {
      this.loading = true
      const url = this.$root.getApi(API.KEY, API.ROLE.URL)
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: {
          key: this.key
        }
      }).then(response => {
        this.total = response.Total
        this.list = response.Items
        this.loading = false
      })
    },
    pageSizeChange (value) {
      this.pageSize = value
      this.$nextTick(() => this.get())
    },
    pageIndexChange (value) {
      this.pageIndex = value
      this.$nextTick(() => this.get())
    },
    search () {
      this.pageIndex = 1
      this.$nextTick(() => this.get())
    },
    selectionChange (rows) {
      this.selectionList = rows
    },
    showAddDrawer () {
      this.isAdd = true
      this.entity = { Status: 1 }
      this.drawerVisiable = true
    },
    showUpdateDrawer (row) {
      this.isAdd = false
      this.entity = { ...row }
      this.drawerVisiable = true
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
      const url = this.$root.getApi(API.KEY, API.ROLE.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.drawerVisiable = false
            this.get()
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.ROLE.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.drawerVisiable = false
            this.get()
          }
        })
    },
    del (entity) {
      this.$confirm('确认要删除选中角色？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.ROLE.BATCH_DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    toDetailPage (params) {
      this.$root.navigate({ ...ROLE_DETAIL, params: params })
    }
  },
  activated () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  background-color: #fff;
  justify-content: space-between;
  margin-bottom: 20px;
  border-radius: 10px;

  input {
    width: 250px;
    margin-right: 0.75rem;
  }

  .search-btn {
    margin-left: 10px;
  }
}

.total-box {
  margin-bottom: 20px;
  font-size: 1.25rem;
  font-weight: 600;
  label {
    font-size: 1.25rem;
    font-weight: 600;
  }
}
</style>
