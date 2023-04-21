<template>
  <div class="areagroup-member-box">
    <el-select multiple filterable remote :remote-method="getUsers" v-model="userIds" class="member-select" size="mini"
      placeholder="在此处搜索要加入地区组的用户">
      <el-option style="height: 60px;line-height: 60px;" v-for="item in users" :key="item.Id" :label="item.Name"
        :value="item.Id">
        <el-image :src="serverUrl + item.IconUrl" style="vertical-align: middle;" class="user-icon">
          <div slot="error" class="image-slot">
            <img src="../../../assets/img/user-icon.png" />
          </div>
        </el-image>&nbsp;{{item.Name}}&nbsp;({{item.UserName}})
      </el-option>
    </el-select>
    <el-table border :data="members" @selection-change="selectionChange" size="mini" class="member-table">
      <el-table-column type="selection" width="55" align="center" header-align="center"></el-table-column>
      <el-table-column prop="Name" label="名称">
        <template slot-scope="scope">
          <el-image :src="serverUrl + scope.row.IconUrl" class="user-icon">
            <div slot="error" class="image-slot">
              <img src="../../../assets/img/user-icon.png" />
            </div>
          </el-image>
          {{scope.row.Name}}
        </template>
      </el-table-column>
      <el-table-column prop="UserName" label="账号"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { AREAGROUP_MEMBER, AREAGROUP } from '../../../router/base-router'

export default {
  name: AREAGROUP_MEMBER.name,
  data () {
    return {
      entity: {}, // 角色
      serverUrl: API.SERVICE_DOMAIN,
      selectionList: [], // 选中行
      users: [], // 成员列表
      members: [], // 已拥有成员
      userIds: [] // 选中的用户名
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
      this.entity = { ...this.$route.params }
      this.get()
    },
    selectionChange (rows) {
      this.selectionList = rows
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.AREAGROUP.MEMBER.replace(/{id}/, this.entity.Id))
      this.axios.get(url).then(response => {
        this.members = response
      })
    },
    getUsers (key) {
      const url = this.$root.getApi(API.KEY, API.AREAGROUP.NOJOIN_MEMBER.replace(/{id}/, this.entity.Id))
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
      const url = this.$root.getApi(API.KEY, API.AREAGROUP.MEMBER.replace(/{id}/, this.entity.Id))
      this.axios.post(url, this.userIds).then(response => {
        if (response.Status) this.get()
      })
    },
    del () {
      if (!this.checkHadSelection()) return false
      const url = this.$root.getApi(API.KEY, API.AREAGROUP.MEMBER.replace(/{id}/, this.entity.Id))
      const ids = this.selectionList.map(s => s.Id)
      this.axios.patch(url, ids).then(response => {
        if (response.Status) this.get()
      })
    },
    checkHadSelection () {
      if (this.selectionList.length < 1) {
        this.$message.error('请先选择要操作数据')
        return false
      }
      return true
    }
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.areagroup-member-box {

  /deep/ .el-image {
    vertical-align: middle;
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  .member-select {
    display: flex;
    justify-self: start;
    margin: 10px 0;

  }

  .member-table {
    max-height: 400px;
    overflow-y: auto;
  }
}
</style>
