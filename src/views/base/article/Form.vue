<template>
  <div class="ofa-form">
    <el-card content-position="left" shadow="never">
      <div slot="header">
        <span class="card-header-label">基本信息</span>
      </div>
      <div class="form-content">
        <el-form status-icon ref="form" :rules="validationRules" :model="entity" :disabled="disabled" class="form" label-width="120px" size="mini">
          <el-form-item label="封面" prop="IconUrl">
            <crop-uploader :aspectRatio="[16, 9]" v-model="entity.IconUrl" @upload="uploadCover"></crop-uploader>
          </el-form-item>
          <el-form-item label="标题" prop="Title">
            <el-input v-model.trim="entity.Title" placeholder="请输入文章标题"></el-input>
          </el-form-item>
          <el-form-item label="分类" prop="TypeId">
            <base-article-type-cascader root v-model="entity.TypeId" placeholder="请选择文章分类"></base-article-type-cascader>
          </el-form-item>
          <el-form-item label="来源" prop="Source">
            <el-input v-model.trim="entity.Source" placeholder="请输入文章来源"></el-input>
          </el-form-item>
          <el-form-item label="内容" prop="Content">
            <tinymce-editor v-if="!loading" :key="entity.Id" v-model="entity.Content" @uploadImage="uploadImage"></tinymce-editor>
          </el-form-item>
        </el-form>
      </div>
      <div class="box-footer">
        <el-button-group v-if="entity.IsPubilsh">
          <el-button type="primary" @click="submit">
            <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;存草稿
          </el-button>
          <el-button type="primary" @click="publish">
            <font-awesome-icon fas icon="share"></font-awesome-icon>&nbsp;发布
          </el-button>
        </el-button-group>
        <el-button v-else type="primary" @click="submit">
          <font-awesome-icon fas icon="save"></font-awesome-icon>&nbsp;保存
        </el-button>
        <!-- <el-button type="warning" @click="cancel">取消</el-button> -->
      </div>
    </el-card>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { ARTICLE, ARTICLE_FORM } from '../../../router/base-router'
import BaseArticleTypeCascader from '../_components/ArticleTypeCascader'

// 文章表单
export default {
  name: ARTICLE_FORM.name,
  data () {
    return {
      loading: false, // 加载中
      isAdd: false, // 是否添加
      disabled: true, // 允许编辑
      entity: {}, // 当前对象
      validationRules: {
        Title: [{ required: true, message: '请先填写文章标题', trigger: 'blur' }, { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }],
        Content: [{ required: true, message: '请先填写文章内容', trigger: 'blur' }],
        TypeId: [{ required: true, message: '请选择文章分类', trigger: 'blur' }]
      }
    }
  },
  computed: {
    uploadHeader () {
      return { authorization: `bearer ${this.$store.getters.access_token}` }
    },
    uploadUrl () {
      return API.ARTICLE.IMAGE.replace(/{id}/, this.entity.Id)
    },
    domain () {
      return this.$root.getApiDomain(API.KEY)
    },
    permissions () {
      return this.$root.getPermissions(ARTICLE.name)
    }
  },
  methods: {
    init () {
      if (!this.loading) {
        this.loading = true
        this.tenants = []
        this.isAdd = this.$route.params.isAdd
        this.entity = { Id: this.$store.state.guid, IconUrl: null, IsPublish: false, ...this.$route.params }
        console.log('this.entity', this.entity)
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
      const url = this.$root.getApi(API.KEY, API.ARTICLE.URL)
      this.axios.post(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.isAdd = false
            this.disabled = true
            this.$root.browser.closeCurrentTab({ ...ARTICLE_FORM, params: {} })
          }
        })
    },
    update () {
      const url = this.$root.getApi(API.KEY, API.ARTICLE.URL)
      this.axios.put(url, this.entity)
        .then(response => {
          if (response.Status) {
            this.disabled = true
            this.$root.browser.closeCurrentTab({ ...ARTICLE_FORM, params: {} })
          }
        })
    },
    publish () {
      this.entity.IsPublish = true
      this.submit()
    },
    uploadSuccess (res, file) {
      if (res.Status) {
        this.entity.IconUrl = this.domain + res.Data.Result.Url
        Object.assign(this.entity, { Id: res.Data.Id })
      }
    },
    uploadCover (upload) {
      const url = this.$root.getApi(API.KEY, API.ARTICLE.COVER.replace(/{id}/, this.entity.Id))
      this.upload(url, upload, (response) => {
        if (response.Status) {
          Object.assign(this.entity, {
            Id: response.Data.Id,
            IconUrl: this.domain + response.Data.Result.Url
          })
        }
      })
    },
    uploadImage (upload) {
      const url = this.$root.getApi(API.KEY, API.ARTICLE.IMAGE.replace(/{id}/, this.entity.Id))
      this.upload(url, upload, (response) => {
        if (response.Status) {
          Object.assign(this.entity, {
            Id: response.Data.Id
          })
          const imgUrl = this.domain + response.Data.Result.Url
          upload.success(imgUrl)
        }
      })
    },
    upload (url, upload, callback) {
      var formData = new FormData()
      formData.append('files', upload.file, upload.filename)
      this.axios.post(url, formData)
        .then(response => {
          callback(response)
        })
    }
  },
  activated () {
    this.init()
  },
  components: { BaseArticleTypeCascader }
}
</script>

<style lang="scss" scoped>
.box {
  border: 1px solid #ebeef5;

  .content {
    padding: 20px;
  }
}

.header {
  padding: 0.75rem 0;
  font-size: 1.25rem;
  font-weight: bold;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

img {
  vertical-align: middle;
}

/deep/.el-form {
  margin-top: 30px;

  .el-select,
  .el-cascader {
    width: 100%;
  }

  .el-radio-group {
    label {
      display: block;
    }

    .tips {
      padding: 0.875rem;
      color: #99a9bf;
    }
  }

  .el-step__icon {
    vertical-align: middle;
  }

  .crop-uploader {
    width: 320px;
    height: 180px;
  }
}

.box-footer {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  border-top: 1px solid #ebeef5;
  text-align: left;

  .alert {
    margin-bottom: 0;
  }
}
</style>
