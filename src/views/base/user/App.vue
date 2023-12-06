<template>
  <el-container v-loading="loading">
    <el-header class="header">
      <span>
        <search-input enterable v-model="searchOption.key" @click="search" size="small" placeholder="用户账号 / 名称">
        </search-input>
      </span>
      <span>
        <el-button size="small" v-if="permissions.Add" @click="showAddDrawer" type="primary">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增账号
        </el-button>
      </span>
    </el-header>
    <el-main class="ofa-container column">
      <div class="total-box">共计 <label class="ofa-text-primary">{{total}}</label> 条数据</div>
      <el-table :data="list" size="small" class="ofa-table">
        <el-table-column prop="Name" label="名称">
          <template slot-scope="scope">
            <div class="user-icon">
              <el-avatar :src="(domain + scope.row.IconUrl)">
                <font-awesome-icon fas icon="user"></font-awesome-icon>
              </el-avatar>
              <label>{{scope.row.Name}}</label>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="UserName" label="账号">
          <template slot-scope="scope">
            {{scope.row.UserName}}&nbsp;
          </template>
        </el-table-column>
        <el-table-column label="账号类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.IsDefault === true ? 'danger' : 'primary'" size="small">
              {{scope.row.IsDefault ? '管理员' : '普通账号'}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后登录时间" width="180">
          <template slot-scope="scope">{{scope.row.LastLoginTime ? scope.row.LastLoginTime : '未登录' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.Status === status[0].value" effect="dark" type="success" size="small">正常</el-tag>
            <el-tag v-else effect="dark" type="danger" size="small">封禁</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button v-if="permissions.Update" type="text" size="small" @click="showUpdateDrawer(scope.row)">修改
            </el-button>
            <el-button v-if="permissions.Update" type="text" size="small" class="ofa-text-warning" @click="reset(scope.row)">重置密码
            </el-button>
            <el-button v-if="permissions.Delete" type="text" class="ofa-text-danger" size="small" @click="del(scope.row)">
              删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange" @current-change="pageIndexChange">
      </el-pagination>
      <!-- 用户表单 -->
      <el-drawer :visible.sync="userDrawerVisiable" :modal="false" :show-close="false" direction="rtl" size="400px" class="ofa-drawer">
        <div slot="title">
          <span class="title">{{isAdd ? '新增' : '编辑'}}账号</span><label class="title-tips">User</label>
        </div>
        <el-form status-icon ref="form" :rules="validationRules" :model="entity" class="form" label-width="80px" size="small">
          <el-alert show-icon title="操作提示" type="warning" style="margin-bottom:20px;">
            <ul class="tips">
              <li>创建账号时如不填写密码默认与账号相同，请创建后立即登录修改</li>
            </ul>
          </el-alert>
          <div class="row">
            <el-form-item label="账号" prop="UserName">
              <el-input v-model.trim="entity.UserName" :disabled="!isAdd" size="small" placeholder="请输入用户账号">
              </el-input>
            </el-form-item>
          </div>
          <div class="row">
            <el-form-item label="名称" prop="Name">
              <el-input v-model.trim="entity.Name" size="small" placeholder="请输入用户名称"></el-input>
            </el-form-item>
          </div>
          <el-form-item v-if="isAdd" label="密码" prop="new">
            <el-input :type="show.new ? 'text' : 'password'" v-model="entity.Password" placeholder="请输入密码" @change="checkPwdStrength">
              <font-awesome-icon slot="prefix" fas :icon="show.new ? 'eye' : 'eye-slash'" @click="show.new = !show.new">
              </font-awesome-icon>
            </el-input>
            <span class="pwd-strength-box" v-show="entity.strength > 0">
              <el-rate disabled show-text v-model="entity.strength" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :texts="['弱', '中', '强', '很强']" :max="4">
              </el-rate>
            </span>
          </el-form-item>
          <el-form-item v-if="isAdd" label="确认密码" prop="repeat">
            <el-input :type="show.repeat ? 'text' : 'password'" v-model="entity.RePassword" placeholder="请确认密码">
              <font-awesome-icon slot="prefix" fas :icon="show.repeat ? 'eye' : 'eye-slash'" @click="show.repeat = !show.repeat"></font-awesome-icon>
            </el-input>
          </el-form-item>
          <div class="row">
            <el-form-item label="状态" prop="Status">
              <el-select v-model="entity.Status" size="small" placeholder="请选择账号初始状态">
                <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-form>
        <div class="footer">
          <el-button type="primary" @click="submit" size="small">
            <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
          </el-button>
          <el-button type="warning" @click="userDrawerVisiable = false" size="small">
            取消
          </el-button>
        </div>
      </el-drawer>
    </el-main>
  </el-container>
</template>

<script>
import md5 from 'js-md5'
import API from '../../../apis/base-api'
import { USER } from '../../../router/base-router'
import { NOT_ALLOWED, SUCCESS } from '../../../untils/error'

// 用户管理
export default {
  name: USER.name,
  data () {
    const validatePassword = (rule, value, callback) => {
      if (!this.isAdd) return callback()
      if (value !== this.entity.new) {
        callback(new Error('两次输入密码不一致!'))
      } else if (this.entity.strength < 3) {
        callback(new Error('密码强度不足，请确保密码长度6位以上，且包含数字、字母组合!'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      isAdd: false, // 是否添加
      permDrawerVisiable: false, // 权限抽屉显示
      userDrawerVisiable: false, // 用户抽屉显示
      entity: {},
      searchOption: {
        key: '' // 搜索条件（关键字）
      },
      total: 1, // 总数据量
      pageIndex: 1, // 页码
      pageSize: 10, // 页数
      list: [], // 用户列表
      show: {
        old: false,
        new: false,
        repeat: false
      },
      status: [{ value: SUCCESS, label: '正常' }, { value: NOT_ALLOWED, label: '封禁' }], // 状态
      validationRules: {
        Name: [{ required: true, message: '请先填写用户名称', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2到8个字符', trigger: 'blur' }],
        UserName: [{ required: true, message: '请先填写用户登录账号', trigger: 'blur' }, { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }],
        Repassword: [{ validator: validatePassword, trigger: 'blur' }]
      }
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
    checkPwdStrength (value) {
      let level = 0
      if (value.length > 5) { level++ }
      if (/\d/.test(value)) { level++ }
      if (/[a-z]/.test(value)) { level++ }
      if (/[A-Z]/.test(value)) { level++ }
      if (/\W/.test(value)) { level++ }
      this.entity.strength = level
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.entity.Password && this.entity.Password.length > 0) {
            this.entity.Password = md5(this.entity.Password)
            this.entity.RePassword = md5(this.entity.RePassword)
          }
          if (this.isAdd) {
            this.add()
          } else {
            this.update()
          }
        }
      })
    },
    showAddDrawer () {
      this.isAdd = true
      this.entity = { Status: 1 }
      this.userDrawerVisiable = true
    },
    showUpdateDrawer (row) {
      this.isAdd = false
      this.entity = { ...row }
      this.userDrawerVisiable = true
    },
    // submit () {
    //   this.$refs.form.validate((valid) => {
    //     if (valid) {
    //       if (this.isAdd) {
    //         this.add()
    //       } else {
    //         this.update()
    //       }
    //     }
    //   })
    // },
    add () {
      const url = this.$root.getApi(API.KEY, API.USER.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.userDrawerVisiable = false
            this.get()
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.USER.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.userDrawerVisiable = false
            this.get()
          }
        })
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
      this.permDrawerVisiable = true
    }
  },
  created () {
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
  flex-wrap: wrap;
  width: 100%;

  > span {
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
