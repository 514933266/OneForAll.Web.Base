<template>
  <div class="ofa-form">
    <el-card content-position="left" class="form-header" shadow="never">
      <el-page-header @back="goBack" content="文章类型 Type" size="mini"></el-page-header>
      <div class="button-box">
        <span v-if="disabled">
          <el-button round v-if="permissions.Update" @click="disabled = false" type="primary" size="mini">
            <font-awesome-icon fas icon="edit"></font-awesome-icon>&nbsp;编辑
          </el-button>
        </span>
        <span v-else>
          <el-button round v-show="permissions.Add || permissions.Update" @click="submit" type="primary" size="mini">
            <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
          </el-button>
          <el-button round v-show="!isAdd" @click="disabled = true" type="warning" size="mini">
            <font-awesome-icon fas icon="reply"></font-awesome-icon>&nbsp;取消
          </el-button>
        </span>
      </div>
    </el-card>
    <div class="form-content">
      <el-form status-icon ref="form" :rules="validationRules" :model="entity" :disabled="disabled" class="form"
        label-width="80px" size="mini">
        <el-card content-position="left" shadow="never">
          <div slot="header">
            <span class="card-header-label">基本信息</span>
          </div>
          <el-form-item label="上级" prop="ParentId">
            <base-article-type-cascader showRoot v-model="entity.ParentId" :hiddenKey="hiddenKey" placeholder="请选择上级分类">
            </base-article-type-cascader>
          </el-form-item>
          <el-form-item label="名称" prop="Name">
            <el-input v-model.trim="entity.Name" placeholder="请输入分类名称"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="Remark">
            <el-input type="textarea" placeholder="请输入分类备注" v-model="entity.Remark" maxlength="100" show-word-limit>
            </el-input>
          </el-form-item>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { ARTICLE_TYPE, ARTICLE_TYPE_FORM } from '../../../router/base-router'
import BaseArticleTypeCascader from '../_components/ArticleTypeCascader'

// 文章类型表单
export default {
  name: ARTICLE_TYPE_FORM.name,
  data () {
    return {
      loading: false, // 加载中
      isAdd: false, // 是否添加
      disabled: true, // 允许编辑
      hiddenKey: '', // 修改状态时，隐藏当前节点和子级
      entity: {},
      validationRules: {
        Name: [{ required: true, message: '请先填写分类名称', trigger: 'blur' }, { min: 2, max: 8, message: '长度在2到8个字符', trigger: 'blur' }],
        Code: [{ required: true, message: '请先填写分类代码（控制器的名称）', trigger: 'blur' }, { min: 0, max: 20, message: '长度不能超过20个字符', trigger: 'blur' }],
        ParentId: [{ required: true, message: '请先选择上级分类', trigger: 'blur' }]
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.init())
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(ARTICLE_TYPE.name)
    }
  },
  methods: {
    init () {
      if (!this.loading) {
        this.loading = true
        this.isAdd = this.$route.params.isAdd
        this.hiddenKey = this.$route.ParentId
        this.entity = { Sort: 0, IsEnable: true, IsBlank: true, ...this.$route.params }
        if (!this.isAdd) {
          this.disabled = true
        } else {
          this.disabled = false
        }
        this.loading = false
      }
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.entity.isAdd) {
            this.add()
          } else {
            this.update()
          }
        }
      })
    },
    add () {
      const url = this.$root.getApi(API.KEY, API.ARTICLE_TYPE.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) this.goBack()
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.ARTICLE_TYPE.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.disabled = true
          }
        })
    },
    goBack () {
      this.$refs.form.resetFields()
      this.$root.navigate({ ...ARTICLE_TYPE, params: {} })
    }
  },
  created () {
    this.init(this.$route.params)
  },
  components: { BaseArticleTypeCascader }
}
</script>

<style lang="scss" scoped>
.box {
  border: 1px solid #ebeef5;

  .box-content {
    padding: 0 20px;
  }

  .header {
    padding: 0.85rem 0;
    font-size: 1.25rem;
    font-weight: bold;
    text-align: left;
    border-bottom: 1px solid #ebeef5;
  }

  .form {
    padding: 20px 0;

    /deep/.el-form {
      margin-top: 50px;

      .el-form-item {
        flex: 1;

        .el-select,
        .el-cascader {
          width: 100%;
        }

        .el-switch {
          margin-right: 20px;
        }

        textarea {
          height: 150px;
        }
      }
    }
  }
}
</style>
