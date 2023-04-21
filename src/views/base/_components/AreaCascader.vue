<template>
  <el-cascader ref="tree" v-model="treePath" :options="tree" :placeholder="placeholder" @change="changeSelectedNode"
    :size="size"
    :props="{ children: 'Children', value: 'Code', label: 'Name', checkStrictly: true, lazy: true, lazyLoad: getChildren }">
    <template slot-scope="{ node, data }">
      <span>{{ data.Name }}</span><label v-if="data.ShortName">（{{data.ShortName}}）</label>
    </template>
  </el-cascader>
</template>

<script>
import API from '../../../apis/base-api'

export default {
  name: 'BaseAreaCascader',
  props: {
    placeholder: {
      type: String,
      default: '请选择地区'
    },
    value: {
      type: String
    },
    size: {
      type: String,
      default: 'mini'
    }
  },
  data () {
    return {
      tree: [], // 地区树
      treePath: [''] // 选中的地区路径(代码)
    }
  },
  watch: {
    value (newValue) {
      this.treePath = newValue
    },
    treePath (newValue) {
      this.$emit('input', newValue)
    }
  },
  methods: {
    init () {
      this.getProvinces()
    },
    getProvinces () {
      const url = this.$root.getApi(API.KEY, API.AREA.PROVINCE)
      this.axios.get(url)
        .then(response => {
          this.tree = response
        })
    },
    getChildren (node, resolve) {
      if (node && node.data) {
        const nodes = []
        const url = this.$root.getApi(API.KEY, API.AREA.CHILDREN.replace(/{id}/, node.data.Id))
        this.axios.get(url).then(response => {
          response.forEach(e => {
            nodes.push(e)
          })
          resolve(nodes)
        })
      }
    },
    changeSelectedNode () {
      const nodes = this.$refs.tree.getCheckedNodes()
      this.$emit('change', nodes[0])
    },
    getSelectedNodes () {
      return this.$refs.tree.getCheckedNodes()
    }
  },
  created () {
    this.treePath = this.value
    this.init()
  }
}
</script>
