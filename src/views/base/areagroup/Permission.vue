<template>
  <div class="areagroup-perms-box">
    <area-transfer ref="areaTransfer" v-if="!loading" v-model="list"></area-transfer>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { AREAGROUP, AREAGROUP_PERMISSION } from '../../../router/base-router'
import AreaTransfer from '../_components/AreaTransfer'

export default {
  name: AREAGROUP_PERMISSION.name,
  props: {
    value: { type: Object, default: null }
  },
  data () {
    return {
      list: [], // 选择的权限
      loading: false // 加载中
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(AREAGROUP.name)
    }
  },
  watch: {
    value (newValue) {
      this.init()
    }
  },
  methods: {
    init () {
      if (!this.loading && this.value) {
        this.loading = true
        this.get()
      }
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.AREAGROUP.PERMISSION.replace(/{id}/, this.value.Id))
      this.axios.get(url).then(response => {
        this.list = response
        this.loading = false
      })
    },
    add () {
      if (!this.checkHadPermSelection()) return false
      const url = this.$root.getApi(API.KEY, API.AREAGROUP.PERMISSION.replace(/{id}/, this.value.Id))
      const ids = this.list.map(s => { return s.Code })
      this.axios.post(url, ids).then(response => {
        if (response.Status) this.get()
      })
    },
    checkHadPermSelection () {
      if (this.list.length < 1) {
        this.$message.error('请先选择要分配的权限')
        return false
      }
      return true
    }
  },
  mounted () {
    this.init()
  },
  components: { AreaTransfer }
}
</script>
