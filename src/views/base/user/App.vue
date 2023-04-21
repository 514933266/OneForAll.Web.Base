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
          <el-input v-model="searchOption.key" size="mini" placeholder="请输入要查询的关键字">
          </el-input>
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
        <el-table-column prop="Name" label="名称" width="200">
          <template slot-scope="scope">
            <div class="user-icon">
              <el-avatar :src="domain + scope.row.IconUrl"></el-avatar>
              <label>{{scope.row.Name}}</label>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="UserName" label="账号" width="150"></el-table-column>
        <el-table-column prop="Menus" label="拥有权限" min-width="300">
          <template slot-scope="scope">
            <div class="user-menu" @click="showUserMenuDrawer(scope.row)">
              <el-tag v-for="item in scope.row.Menus" :key="item.id" size="mini" effect="dark">
                {{item.Name}}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="账号类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.IsDefault === true ? 'danger' : 'info'" size="mini">
              {{scope.row.IsDefault ? '管理员' : '普通账号'}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后登录时间" min-width="150">
          <template slot-scope="scope">{{scope.row.LastLoginTime ? scope.row.LastLoginTime : '未登录' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="scope">
            <label v-if="scope.row.Status === status[0].value" class="text-success">正常</label>
            <label v-else class="text-danger">封禁</label>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button v-if="permissions.Update" type="text" size="mini" @click="update(scope.row)">修改</el-button>
            <el-button v-if="permissions.Update" type="text" size="mini" @click="reset(scope.row)">重置密码
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
    <!-- 抽屉：权限明细 -->
    <el-drawer :visible.sync="drawerVisiable" :modal="false" :show-close="false" direction="rtl" size="360px"
      class="ofa-drawer">
      <div class="title" slot="title">
        <span>{{entity.Name}}</span> <label class="ofa-text-primary">的权限</label>
      </div>
      <div class="body">
        <el-collapse class="menu-box">
          <el-collapse-item v-for="menu in entity.Menus" :key="menu.id" :title="menu.Name" :name="menu.id">
            <template slot="title">
              <div class="menu-name">{{menu.Name}}</div>
            </template>
            <el-tag v-for="perm in menu.Permissions" :key="perm.id" class="item" size="mini" effect="datk">{{perm}}
            </el-tag>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { USER, USER_FORM } from '../../../router/base-router'
import { NOT_ALLOWED, SUCCESS } from '../../../untils/error'

export default {
  name: USER.name,
  data () {
    return {
      loading: false,
      drawerVisiable: false, // 权限抽屉显示
      entity: {},
      searchOption: {
        key: '' // 搜索条件（关键字）
      },
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10, // 页数
      list: [], // 用户列表
      status: [{ value: SUCCESS, label: '正常' }, { value: NOT_ALLOWED, label: '封禁' }] // 状态
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(USER.name)
    },
    domain () {
      return this.$root.getApiDomain(API.KEY)
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
      const url = this.$root.getApi(API.KEY, API.USER.URL)
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: this.searchOption
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
    add () {
      this.toFormPage({ isAdd: true })
    },
    update (entity) {
      this.toFormPage(entity)
    },
    reset (entity) {
      this.$confirm('确认要重置选中用户密码？该操作不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.USER.BATCH_PWD)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    del (entity) {
      this.$confirm('确认要删除选中用户？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.USER.BATCH_DELETE)
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    showUserMenuDrawer (entity) {
      this.entity = entity
      this.drawerVisiable = true
    },
    toFormPage (params) {
      this.$root.navigate({ ...USER_FORM, params: params })
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
    width: 250px;
    margin-right: .75rem;
  }

  .search-btn {
    margin-left: 10px;
  }

}

.user-icon {
  display: flex;
  align-items: center;

  label {
    margin-left: 10px;
  }
}

.user-menu {
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  width: 100%;

  >span {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}

.menu-name {
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item {
  margin: 0 10px 10px 0;
}

.menu-box {
  margin: 10px;
}
</style>
