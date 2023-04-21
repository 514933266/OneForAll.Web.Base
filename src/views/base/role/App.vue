<template>
  <div class="ofa-container column">
    <el-card shadow="never">
      <div class="ofa-work-box">
        <span>
          <el-button size="mini" v-if="permissions.Add" @click="add" type="primary">
            <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增
          </el-button>
        </span>
        <span>
          <el-input v-model="searchOption.key" size="mini" placeholder="请输入要查询的关键字"></el-input>
          <el-button type="primary" class="search-btn" size="mini" @click="search">
            <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
          </el-button>
        </span>
      </div>
    </el-card>
    <el-card shadow="never" class="table-card">
      <el-table border v-loading="loading" :data="list" size="mini" class="ofa-table">
        <el-table-column width="50">
          <template slot-scope="scope">{{ scope.$index + 1 + (pageIndex - 1) * pageSize }}</template>
        </el-table-column>
        <el-table-column prop="Name" label="名称"></el-table-column>
        <el-table-column prop="MemberCount" label="成员人数">
          <template slot-scope="scope">{{ scope.row.MemberCount }}&nbsp;（人）</template>
        </el-table-column>
        <el-table-column prop="Remark" label="备注"></el-table-column>
        <el-table-column label="操作" width="160" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button v-if="permissions.Update" type="text" size="mini" @click="update(scope.row)">修改</el-button>
            <el-button v-if="permissions.Update" type="text" size="mini" @click="toDetailPage(scope.row)">管理
            </el-button>
            <el-button v-if="permissions.Delete" type="text" class="ofa-text-danger" size="mini"
              @click="del(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange"
        @current-change="pageIndexChange">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { ROLE, ROLE_DETAIL, ROLE_FORM, ROLE_MEMBER } from '../../../router/base-router'

// 角色管理
export default {
  name: ROLE.name,
  data () {
    return {
      loading: false,
      searchOption: {
        key: '' // 搜索条件（关键字）
      },
      list: [], // 页面的角色集合
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10 // 页数
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
    add () {
      this.toFormPage({ isAdd: true })
    },
    update (entity) {
      this.toFormPage(entity)
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
    },
    toFormPage (params) {
      this.$root.navigate({ ...ROLE_FORM, params: params })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.ofa-work-box {

  input {
    width: 200px;
    margin-left: 10px;
  }

  .search-btn {
    margin-left: 10px;
  }
}
</style>
