<template>
  <div class="role-member-box">
    <div class="ofa-work-box">
      <el-select multiple filterable remote :popper-append-to-body="false" :remote-method="getUsers" v-model="userIds"
        class="member-select" size="mini" placeholder="在此处搜索要加入角色的用户">
        <el-option v-for="item in users" :key="item.Id" :label="item.Name" :value="item.Id" style="height:60px;">
          <div class="user-icon">
            <el-avatar :src="domain + item.IconUrl"></el-avatar>
            <label>{{item.Name}}({{item.UserName}})</label>
          </div>
        </el-option>
      </el-select>
      <div>
        <el-button size="mini" v-if="permissions.Update" @click="add" type="primary">
          <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;添加
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="members" size="mini" class="member-table">
      <el-table-column prop="Name" label="名称">
        <template slot-scope="scope">
          <div class="user-icon">
            <el-avatar :src="domain + scope.row.IconUrl"></el-avatar>
            <label>{{scope.row.Name}}</label>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="UserName" label="账号"></el-table-column>
      <el-table-column prop="IsDefault" label="账号类型" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.IsDefault === true ? 'danger' : 'info'" size="mini">
            {{scope.row.IsDefault ? '管理员' : '普通账号'}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="LastLoginTime" label="最后登录时间" width="160">
        <template slot-scope="scope">{{scope.row.LastLoginTime ? scope.row.LastLoginTime : '未登录' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center" header-align="center">
        <template slot-scope="scope">
          <el-button v-if="permissions.Delete" type="text" class="ofa-text-danger" size="mini" @click="del(scope.row)">
            移除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { ROLE_MEMBER, ROLE } from '../../../router/base-router'

// 角色成员
export default {
  name: ROLE_MEMBER.name,
  props: {
    roleId: ''
  },
  data () {
    return {
      loading: false, // 加载中
      entity: {}, // 角色
      users: [], // 成员列表
      members: [], // 已拥有成员
      userIds: [] // 选中的用户名
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(ROLE.name)
    },
    domain () {
      return this.$root.getApiDomain(API.KEY)
    }
  },
  methods: {
    init () {
      if (this.loading) return
      this.loading = true
      this.entity = { ...this.$route.params }
      this.get()
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.ROLE.MEMBER.replace(/{id}/, this.roleId))
      this.axios.get(url).then(response => {
        this.members = response
        this.loading = false
      })
    },
    getUsers (key) {
      const url = this.$root.getApi(API.KEY, API.ROLE.NOJOIN_MEMBER.replace(/{id}/, this.roleId))
      return this.axios.get(url, {
        params: {
          key: key
        }
      }).then(response => {
        this.users = response
      })
    },
    add () {
      if (this.userIds.length < 1) return false
      const url = this.$root.getApi(API.KEY, API.ROLE.MEMBER.replace(/{id}/, this.roleId))
      this.axios.post(url, this.userIds).then(response => {
        if (response.Status) this.get()
      })
    },
    del (entity) {
      this.$confirm('确认要删除选中用户？', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.ROLE.MEMBER_BATCH_DELETE.replace(/{id}/, this.roleId))
        this.axios.patch(url, [entity.Id]).then(response => {
          if (response.Status) this.get()
        })
      })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.role-member-box {
  height: 100%;

  .member-select {
    display: flex;
    justify-content: flex-start;
    margin: 10px 0;
    width: 400px;

    .el-input,
    input {
      width: 400px !important;
    }
  }

  .user-icon {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;

    label {
      margin-left: 10px;
    }
  }
}
</style>
