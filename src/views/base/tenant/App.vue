<template>
  <spinner v-if="loading"></spinner>
  <el-card v-else>
    <div class="ofa-work-box">
      <span>
        <el-button class="ofa-button" size="small" v-if="permissions.Add" @click="add">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;添加
        </el-button>
        <el-button class="ofa-button" size="small" v-if="permissions.Update" @click="update">
          <font-awesome-icon fas icon="edit"></font-awesome-icon>&nbsp;修改
        </el-button>
        <el-button class="ofa-button ofa-button-danger" size="small" v-if="permissions.Delete" @click="del">
          <font-awesome-icon fas icon="trash"></font-awesome-icon>&nbsp;删除
        </el-button>
      </span>
      <span>
        <el-button type="primary" @click="searchVisiable = true" size="small">
          <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
        </el-button>
      </span>
    </div>
    <el-table border :data="list" @selection-change="selectionChange" @row-dblclick="toFormPage" size="small" class="tenant-table">
      <div slot="empty" style="height:400px">
        <nodata></nodata>
      </div>
      <el-table-column type="expand">
        <template slot-scope="props">
          <ul class="tenant-detail-box">
            <li><label>代码</label><span>{{ props.row.Code ? props.row.Code : '未填写' }}</span></li>
            <li><label>联系人</label><span>{{ props.row.Manager ? props.row.Manager : '未填写' }}</span></li>
            <li><label>联系方式</label><span>{{ props.row.Phone ? props.row.Phone : '未填写' }}</span></li>
            <li><label>企业地址</label><span>{{ props.row.Address ? props.row.Address : '未填写' }}</span></li>
            <li><label>描述</label><span>{{ props.row.Description ? props.row.Description : '未填写' }}</span></li>
          </ul>
        </template>
      </el-table-column>
      <el-table-column width="50" align="center">
        <template slot-scope="scope">{{ scope.$index + 1 + (pageIndex - 1) * pageSize }}</template>
      </el-table-column>
      <el-table-column type="selection" width="55" align="center" header-align="center"></el-table-column>
      <el-table-column prop="Name" label="企业名称" min-width="250px"></el-table-column>
      <el-table-column prop="Code" label="机构代码" min-width="200px"></el-table-column>
      <el-table-column prop="Manager" label="联系人"></el-table-column>
      <el-table-column prop="Phone" label="联系方式"></el-table-column>
      <el-table-column label="注册日期" width="150" align="center">
        <template slot-scope="scope">{{ new Date(scope.row.CreateTime).toString('yyyy年MM月dd日') }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <label :class="scope.row.IsEnable?'text-success': 'text-danger'">{{scope.row.IsEnable ? '正常' : '已注销'}}</label>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange"
      @current-change="pageIndexChange" size="small">
    </el-pagination>
    <!-- 查询条件 -->
    <el-drawer :visible.sync="searchVisiable" :modal="false" :show-close="false" direction="rtl" size="300px"
      class="tenant-drawer">
      <div class="title" slot="title">
        <span>搜索条件</span> <label class="text-primary">Search</label>
      </div>
      <div class="body">
        <el-form label-width="60px" class="form">
          <el-form-item label="合作状态" prop="IsEnabled">
            <el-select v-model="searchOptions.isEnabled" size="small">
              <el-option :value="true" label="合作中"></el-option>
              <el-option :value="false" label="未合作"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="关键字" prop="Type">
            <el-input v-model="searchOptions.key" size="small" placeholder="请根据选择的类型输入关键字">
            </el-input>
          </el-form-item>
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker v-model="searchOptions.startDate" @change="get" type="date" class="date-picker" size="small"
              placeholder="请选择注册开始日期" format="yyyy年MM月dd日" value-format="yyyy-MM-dd">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker v-model="searchOptions.endDate" @change="get" type="date" class="date-picker" size="small"
              placeholder="请选择注册结束日期" format="yyyy年MM月dd日" value-format="yyyy-MM-dd">
            </el-date-picker>
          </el-form-item>
        </el-form>
        <div class="footer">
          <el-button type="primary" @click="search">
            <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
          </el-button>
        </div>
      </div>
    </el-drawer>
  </el-card>
</template>

<script>
import API from '../../../apis/base-api'
import { TENANT, TENANT_FORM } from '../../../router/base-router'

export default {
  name: TENANT.name,
  data () {
    return {
      loading: false, // 加载中
      selectionList: [], // 选中行
      searchVisiable: false, // 查询弹窗显示
      searchOptions: {
        isEnabled: true, // 合作状态
        key: '', // 关键字
        startDate: '', // 注册日期（开始）
        endDate: '' // 注册日期（结束）
      },
      total: 1,
      pageIndex: 1,
      pageSize: 10,
      list: []
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(TENANT.name)
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
      const url = this.$root.getApi(API.KEY, API.TENANT.URL)
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: this.searchOptions
      }).then(response => {
        this.total = response.Total
        this.list = response.Items
        this.$nextTick(() => { this.loading = false })
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
    update () {
      if (!this.checkHadSelection()) return false
      const entity = this.selectionList[0]
      this.toFormPage(entity)
    },
    del () {
      if (!this.checkHadSelection()) return false
      this.$confirm('确认要删除选中机构？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const ids = this.selectionList.map(s => s.Id)
        const url = this.$root.getApi(API.KEY, API.TENANT.BATCH_DELETE)
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
      this.$root.navigate({ ...TENANT_FORM, params: params })
    }
  },
  created () {
    this.get()
  }
}
</script>

<style lang="scss" scoped>
$label-color:#99a9bf;
$border-color:#EBEEF5;

.ofa-work-box {
  border: none;
  padding: 0 0 15px 0;

  input {
    width: 250px;
    margin-right: .75rem;
  }

}

.tenant-table {
  margin-bottom: 25px;
  border-bottom: 0;
}

.tenant-detail-box {
  li {
    padding: 5px 0;

    label {
      display: inline-block;
      width: 80px;
      color: #99a9bf;
    }
  }
}

/deep/ .tenant-drawer {
  .title {
    padding: 20px;
    font-weight: bold;

    span {
      font-size: 1.45rem;
    }

    label {
      margin-left: 10px;
      font-size: 1rem;
    }
  }

  .body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .form {
      height: 100%;
      padding: 0 20px;

      .date-picker,
      input {
        width: 100%;
      }

      label {
        color: $label-color !important;
      }
    }

    .footer {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80px;
      padding: 20px;
      border-top: 1px solid $border-color;

      button {
        width: 100%;
        border-radius: 0;
      }
    }
  }
}
</style>
