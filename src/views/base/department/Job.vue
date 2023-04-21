<template>
  <div class="job-perms-box">
    <el-table border :data="list" @selection-change="selectionChange" size="small" class="job-table">
      <div slot="empty" style="height:400px">
        <nodata></nodata>
      </div>
      <el-table-column type="selection" width="55" align="center" header-align="center"></el-table-column>
      <el-table-column prop="Name" label="名称">
        <template slot-scope="scope">
          <el-input v-if="scope.row.editable" v-model.trim="scope.row.Name" size="small" placeholder="请输入岗位名称">
          </el-input>
          <label v-else>{{scope.row.Name}}</label>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="80" align="center">
        <template slot-scope="scope">
          <el-popover placement="bottom" title="岗位角色详情" width="680" trigger="click">
            <div class="role-workbox">
              <el-select filterable remote multiple v-model="scope.row.RoleIds" :popper-append-to-body="false"
                :remote-method="getRoleSelections" size="small" placeholder="输入名称查找数据">
                <el-option v-for="item in roleList" :key="item.Id" :value="item.Id" :label="item.Name">
                  <label>{{ item.Name }}</label>
                  <label style="float:right;margin-right:20px;">{{ item.Remark }}</label>
                </el-option>
              </el-select>
              <el-button v-if="permissions.AddJobRole" type="primary" @click="addRoles(scope.row)" size="small">添加
              </el-button>
            </div>
            <el-table border :data="scope.row.Roles" class="role-table" height="300" size="small">
              <el-table-column property="Name" label="名称"></el-table-column>
              <el-table-column property="Remark" label="备注"></el-table-column>
              <el-table-column width="60" align="center" header-align="center">
                <template slot-scope="scope">
                  <el-tooltip content="移除角色" placement="top">
                    <el-button v-if="permissions.AddJobRole" @click="removeRole(scope.row)" type="text">
                      <font-awesome-icon fas icon="minus" class="text-danger">
                      </font-awesome-icon>
                    </el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            <el-button slot="reference" type="text" @click="job = scope.row">
              （{{ scope.row.Roles ? scope.row.Roles.length : 0 }}）
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="成员" width="80" align="center">
        <template slot-scope="scope">
          <el-popover placement="bottom" title="岗位用户详情" width="680" trigger="click">
            <div class="user-workbox">
              <el-select filterable remote multiple v-model="scope.row.UserIds" :popper-append-to-body="false"
                :remote-method="getUserSelections" size="small" placeholder="输入账号或名称查找数据">
                <el-option v-for="item in userList" :key="item.Id" :value="item.Id" :label="item.Name">
                  <el-image :src="domain + item.IconUrl">
                    <div slot="error" class="image-slot">
                      <img src="../../../assets/img/user-icon.png" />
                    </div>
                  </el-image><label>{{item.Name}}</label><label class="text-remark">({{item.UserName}})</label>
                </el-option>
              </el-select>
              <el-button type="primary" @click="addUsers(scope.row)" size="small">添加
              </el-button>
            </div>
            <el-table border :data="scope.row.Users" class="user-table" height="300" size="small">
              <el-table-column property="Name" label="名称">
                <template slot-scope="scope">
                  <el-image :src="scope.row.IconUrl">
                    <div slot="error" class="image-slot">
                      <img :src="userIcon" />
                    </div>
                  </el-image><label>{{scope.row.Name}}</label>
                </template>
              </el-table-column>
              <el-table-column property="UserName" label="账号"></el-table-column>
              <el-table-column width="60" align="center" header-align="center">
                <template slot-scope="scope">
                  <el-tooltip content="移除用户" placement="top">
                    <font-awesome-icon fas icon="minus" class="text-danger" @click="removeUser(scope.row)">
                    </font-awesome-icon>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            <el-button slot="reference" type="text" @click="job = scope.row">
              （{{ scope.row.Users ? scope.row.Users.length : 0 }}）
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="Remark" label="备注">
        <template slot-scope="scope">
          <span class="remark-box">
            <el-input v-if="scope.row.editable" v-model.trim="scope.row.Remark" size="small" placeholder="请输入岗位备注">
            </el-input>
            <label v-else>{{ scope.row.Remark}}</label>
            <el-button v-if="scope.row.editable" @click="submit(scope.row)" type="text" class="text-success"
              size="small">
              <font-awesome-icon fas icon="check"></font-awesome-icon>&nbsp;
            </el-button>
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { DEPARTMENT, DEPARTMENT_JOB } from '../../../router/base-router'

export default {
  name: DEPARTMENT_JOB.name,
  props: {
    value: { type: Object, default: null }
  },
  data () {
    return {
      domain: API.SERVICE_DOMAIN,
      list: [], // 岗位列表
      selectionList: [], // 选中行
      loading: false, // 加载中
      job: {}, // 当前选中的岗位
      roleList: [], // 角色列表
      userList: [] // 用户列表
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(DEPARTMENT.name)
    }
  },
  watch: {
    value (newValue) {
      this.init()
    }
  },
  methods: {
    init () {
      if (!this.loading && this.value.Id) {
        this.loading = true
        this.get()
      }
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.DEPARTMENT.JOB.replace(/{id}/, this.value.Id))
      this.axios.get(url).then(response => {
        this.list = response
        this.loading = false
      })
    },
    selectionChange (rows) {
      this.selectionList = rows
    },
    add () {
      if (!this.value || !this.value.Id) {
        this.$message.error('请先选择一个部门组织')
        return false
      }
      this.list.unshift({
        isAdd: true,
        editable: true,
        Name: '',
        Remark: ''
      })
    },
    update () {
      if (!this.checkHadSelection()) return false
      this.selectionList.forEach(element => {
        const index = this.list.findIndex(w => w.Id === element.Id)
        this.$set(this.list, index, { ...element, isAdd: false, editable: true })
      })
    },
    submit (entity) {
      if (entity.isAdd) {
        this.addJob(entity)
      } else {
        this.updateJob(entity)
      }
    },
    addJob (entity) {
      const url = this.$root.getApi(API.KEY, API.DEPARTMENT.JOB.replace(/{id}/, this.value.Id))
      this.axios.post(url, entity).then(response => {
        if (response.Status) this.get()
      })
    },
    updateJob (entity) {
      const url = this.$root.getApi(API.KEY, API.DEPARTMENT.JOB.replace(/{id}/, this.value.Id))
      this.axios.put(url, entity).then(response => {
        if (response.Status) entity.editable = false
      })
    },
    del () {
      if (!this.checkHadSelection()) return false
      this.$confirm('确认要删除选中岗位？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const ids = this.selectionList.map(s => s.Id)
        const url = this.$root.getApi(API.KEY, API.DEPARTMENT.JOB_BATCH_DELETE.replace(/{id}/, this.value.Id))
        this.axios.patch(url, ids).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    checkHadSelection () {
      if (this.selectionList.length < 1) {
        this.$message.error('请先选择要分配的权限')
        return false
      }
      return true
    },
    getRoleSelections (key) {
      if (!key || key.trim() === '') return false
      const url = API.DEPARTMENT.JOB_ROLE_NOJOIN.replace(/{id}/, this.value.Id).replace(/{jobId}/, this.job.Id)
      this.axios.get(url, {
        params: {
          key: key
        }
      }).then(response => {
        this.roleList = response
      })
    },
    addRoles (entity) {
      const url = API.DEPARTMENT.JOB_ROLE.replace(/{id}/, this.value.Id).replace(/{jobId}/, this.job.Id)
      this.axios.post(`${url}`, entity.RoleIds)
        .then(response => {
          if (response.Status) this.get()
        })
    },
    removeRole (entity) {
      const url = API.DEPARTMENT.JOB_ROLE.replace(/{id}/, this.value.Id).replace(/{jobId}/, this.job.Id)
      this.axios.delete(`${url}/${entity.Id}`)
        .then(response => {
          if (response.Status) this.get()
        })
    },
    getUserSelections (key) {
      if (!key) return false
      const url = API.DEPARTMENT.JOB_USER_NOJOIN.replace(/{id}/, this.value.Id).replace(/{jobId}/, this.job.Id)
      this.axios.get(url, {
        params: {
          key: key
        }
      }).then(response => {
        this.userList = response
      })
    },
    addUsers (entity) {
      const url = API.DEPARTMENT.JOB_USER.replace(/{id}/, this.value.Id).replace(/{jobId}/, this.job.Id)
      this.axios.post(`${url}`, entity.UserIds)
        .then(response => {
          if (response.Status) this.get()
        })
    },
    removeUser (entity) {
      const url = API.DEPARTMENT.JOB_USER.replace(/{id}/, this.value.Id).replace(/{jobId}/, this.job.Id)
      this.axios.delete(`${url}/${entity.Id}`)
        .then(response => {
          if (response.Status) this.get()
        })
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.remark-box {
  display: flex;
  justify-self: start;

  button {
    margin-left: 5px;
  }
}

.role-workbox,
.user-workbox {
  display: flex;
  margin: 10px 0;

  .el-select {
    width: 100%;
    .el-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      vertical-align: middle;
    }
  }

  button {
    margin-left: 5px;
  }
}
</style>
