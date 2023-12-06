<template>
  <el-cascader ref="tree" :props="{ checkStrictly: checkStrictly }" v-model="treePath" :options="tree" :placeholder="placeholder" @change="changeSelectedNode" :size="size"></el-cascader>
</template>

<script>
import API from '../../../apis/base-api'

export default {
  name: 'BaseArticleTypeCascader',
  props: {
    size: {
      type: String,
      default: 'small'
    },
    value: {
      type: String
    },
    placeholder: {
      type: String,
      default: '请选择文章分类'
    },
    hiddenKey: {
      type: String,
      default: ''
    },
    showRoot: {
      type: Boolean,
      default: false
    },
    rootName: {
      type: String,
      default: '根节点'
    },
    checkStrictly: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      types: [],
      tree: [],
      treePath: [],
      rootItem: {
        Id: this.$store.state.guid,
        value: this.$store.state.guid,
        label: this.rootName
      }
    }
  },
  watch: {
    value (newValue) {
      this.setTreePath()
    },
    treePath (newValue) {
      const index = this.treePath.length - 1
      this.$emit('input', this.treePath[index])
    }
  },
  methods: {
    init () {
      this.get()
    },
    get () {
      const url = this.$root.getApi(API.KEY, API.ARTICLE_TYPE.URL)
      console.log(url)
      this.axios.get(url).then(response => {
        this.types = response
        this.setTree()
        this.setTreePath()
      })
    },
    setTree () {
      const tree = []
      const topTypes = this.getChildren(this.$store.state.guid)
      topTypes.forEach(e => { tree.push(this.convertToTree(e)) })
      if (this.showRoot) {
        tree.unshift(this.rootItem)
      }
      this.tree = tree
    },
    getChildren (parentId) {
      const children = []
      this.types.forEach(e => {
        if (e.ParentId === this.hiddenKey) return false // 隐藏当前节点及以下选择
        if (e.ParentId === parentId) children.push({ ...e, value: e.Id, label: e.Name })
      })
      return children
    },
    convertToTree (parent) {
      const children = this.getChildren(parent.Id)
      if (children && children.length > 0) {
        parent = { ...parent, children: [] }
        children.forEach(e => { parent.children.push(this.convertToTree(e)) })
      }
      return parent
    },
    findOption (entity) {
      let path = [entity.ParentId]
      const parent = this.types.find(w => w.Id === entity.ParentId)
      if (parent && parent.ParentId !== this.$store.state.guid) {
        path = this.findOption(parent).concat(path)
      }
      return path
    },
    setTreePath () {
      this.treePath = this.findOption({ ParentId: this.value })
    },
    changeSelectedNode () {
      const node = this.$refs.tree.getCheckedNodes()
      this.code = node[0].value
      this.$emit('change', node[0])
    }
  },
  created () {
    this.init()
  }
}
</script>
