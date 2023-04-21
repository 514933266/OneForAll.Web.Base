<template>
  <div class="job-role-box">
    <el-table border :data="list" size="mini" class="role-table">
      <el-table-column property="Name" label="名称"></el-table-column>
      <el-table-column property="Remark" label="备注"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { DEPARTMENT, DEPARTMENT_ROLE } from '../../../router/base-router'

export default {
  name: DEPARTMENT_ROLE.name,
  props: {
    value: { type: Object, default: null }
  },
  data () {
    return {
      loading: false, // 加载中
      list: [] // 岗位列表
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
      const url = this.$root.getApi(API.KEY, API.DEPARTMENT.ROLE.replace(/{id}/, this.value.Id))
      this.axios.get(url).then(response => {
        this.list = response
        this.loading = false
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>
