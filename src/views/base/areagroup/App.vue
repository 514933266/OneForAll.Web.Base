<template>
  <spinner v-if="loading"></spinner>
  <div v-else>
    <div class="ofa-work-box">
      <span>
        <el-button class="ofa-button" size="mini" v-if="permissions.Add" @click="add">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;添加
        </el-button>
        <el-button class="ofa-button" size="mini" v-if="permissions.Update" @click="update">
          <font-awesome-icon fas icon="edit"></font-awesome-icon>&nbsp;修改
        </el-button>
        <el-button class="ofa-button ofa-button-danger" size="mini" v-if="permissions.Delete" @click="del">
          <font-awesome-icon fas icon="trash"></font-awesome-icon>&nbsp;删除
        </el-button>
      </span>
      <span>
        <el-input v-model="searchOptions.key" size="mini" placeholder="请输入要查询的关键字"></el-input>
        <el-button type="primary" class="search-btn" size="mini" @click="search">
          <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
        </el-button>
      </span>
    </div>
    <el-table border :data="list" @selection-change="selectionChange" size="mini" class="areagroup-table">
      <div slot="empty" style="height:400px">
        <nodata></nodata>
      </div>
      <el-table-column width="50">
        <template slot-scope="scope">{{ scope.$index + 1 + (pageIndex - 1) * pageSize }}</template>
      </el-table-column>
      <el-table-column type="selection" width="55" align="center" header-align="center"></el-table-column>
      <el-table-column prop="Name" label="名称"></el-table-column>
      <el-table-column label="成员">
        <template slot-scope="scope">
          <label class="text-primary">({{scope.row.MemberCount}})</label>
        </template>
      </el-table-column>
      <el-table-column prop="Remark" label="备注"></el-table-column>
    </el-table>
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange"
      @current-change="pageIndexChange">
    </el-pagination>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { AREAGROUP, AREAGROUP_FORM } from '../../../router/base-router'

export default {
  name: AREAGROUP.name,
  data () {
    return {
      loading: false, // 加载中
      selectionList: [], // 选中行
      searchOptions: {
        key: '' // 搜索条件（关键字）
      },
      list: [], // 页面的地区组集合
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10 // 页数
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(AREAGROUP.name)
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
      const url = this.$root.getApi(API.KEY, API.AREAGROUP.URL)
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: this.searchOptions
      }).then(response => {
        this.total = response.Total
        this.list = response.Items
        this.loading = false
      })
    },
    pageSizeChange (value) {
      this.pageSize = value
      this.$nextTick(() => { this.get() })
    },
    pageIndexChange (value) {
      this.pageIndex = value
      this.$nextTick(() => { this.get() })
    },
    search (key) {
      this.pageIndex = 1
      this.$nextTick(() => { this.get() })
    },
    selectionChange (rows) {
      this.selectionList = rows
    },
    add () {
      this.toFormPage({ isAdd: true })
    },
    update () {
      if (!this.checkHadSelection()) return false
      const entity = this.selectionList[0]
      this.toFormPage(entity)
    },
    del () {
      if (!this.checkHadSelection()) return false
      this.$confirm('确认要删除该地区组？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const ids = this.selectionList.map(s => s.Id)
        const url = this.$root.getApi(API.KEY, API.AREAGROUP.BATCH_DELETE)
        this.axios.patch(url, ids).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    checkHadSelection () {
      if (this.selectionList.length < 1) {
        this.$message.error('请先选择要操作数据')
        return false
      }
      return true
    },
    toFormPage (params) {
      this.$root.navigate({ ...AREAGROUP_FORM, params: params })
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
