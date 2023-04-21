<template>
  <div class="job-user-box">
    <el-table border :data="list" size="mini" class="user-table">
      <el-table-column property="Name" label="姓名">
        <template slot-scope="scope">
          <el-image :src="scope.row.IconUrl">
            <div slot="error" class="image-slot">
              <img src="../../../assets/img/user_male.png" />
            </div>
          </el-image>
          <label>{{scope.row.Name}}</label>
        </template>
      </el-table-column>
      <el-table-column property="UserName" label="账号"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { DEPARTMENT, DEPARTMENT_USER } from '../../../router/base-router'

export default {
  name: DEPARTMENT_USER.name,
  props: {
    value: { type: Object, default: null }
  },
  data () {
    return {
      domain: API.SERVICE_DOMAIN,
      loading: false, // 加载中
      list: [] // 岗位列表
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(DEPARTMENT.name)
    },
    domain () {
      return this.$root.getApiDomain(API.KEY)
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
      const url = this.$root.getApi(API.KEY, API.DEPARTMENT.USER.replace(/{id}/, this.value.Id))
      this.axios.get(url).then(response => {
        response.forEach(e => {
          this.list.push({ ...e, IconUrl: this.domain + e.IconUrl })
        })
        this.loading = false
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.job-user-box {
  .el-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    vertical-align: middle;
  }
}
</style>
