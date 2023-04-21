<template>
  <div class="ofa-container column">
    <el-card shadow="never">
      <div class="ofa-work-box">
        <span>
          <el-button size="mini" v-if="permissions.Add" @click="add" type="primary">
            <font-awesome-icon fas icon="plus"></font-awesome-icon>&nbsp;新增
          </el-button>
        </span>
        <span>
          <base-article-type-cascader root rootName="全部" placeholder="选择文章分类查询" @change="changeType" size="mini">
          </base-article-type-cascader>
          <el-input v-model="searchOption.key" size="mini" placeholder="请输入要查询的关键字">
          </el-input>
          <el-button type="primary" class="search-btn" size="mini" @click="search">
            <font-awesome-icon fas icon="search"></font-awesome-icon>&nbsp;查询
          </el-button>
        </span>
      </div>
    </el-card>
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" border :data="list" @selection-change="selectionChange" @row-dblclick="toFormPage"
        size="mini" class="ofa-table">
        <el-table-column width="50" label="#">
          <template slot-scope="scope">{{ scope.$index + 1 + (pageIndex - 1) * pageSize }}</template>
        </el-table-column>
        <el-table-column prop="Title" label="内容">
          <template slot-scope="scope">
            <div class="article-box">
              <el-image fit="cover" :src="scope.row.IconUrl">
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
              <div class="article-info">
                <div>
                  <label class="title">{{scope.row.Title}}</label>
                  &nbsp;
                  <el-tag v-if="!scope.row.IsPublish" type="danger">未发布</el-tag>
                </div>
                <div class="info">
                  <span><label>时间：</label>{{scope.row.CreateTime}}</span>
                  <span>{{scope.row.TypeName}}</span>
                  <span><label>阅读：</label>{{scope.row.ReadNumber}}</span>
                  <span><label>来源：</label>{{scope.row.Source ? scope.row.Source : '原创'}}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-tooltip v-if="permissions.Update" content="编辑" placement="top">
              <font-awesome-icon fas icon="edit" class="text-primary" @click="update(scope.row)"></font-awesome-icon>
            </el-tooltip>
            <el-tooltip v-if="permissions.Publish && !scope.row.IsPublish" content="发布" placement="top">
              <font-awesome-icon fas icon="play" class="text-warning" @click="publish(scope.row)"></font-awesome-icon>
            </el-tooltip>
            <el-tooltip v-if="permissions.Delete" content="删除" placement="top">
              <font-awesome-icon fas icon="trash" class="text-danger" @click="del(scope.row)"></font-awesome-icon>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="total" @size-change="pageSizeChange"
        @current-change="pageIndexChange">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import API from '../../../apis/base-api'
import { ARTICLE, ARTICLE_FORM } from '../../../router/base-router'
import BaseArticleTypeCascader from '../_components/ArticleTypeCascader'

// 文章管理
export default {
  name: ARTICLE.name,
  data () {
    return {
      key: '',
      typeId: this.$store.state.guid,
      searchOption: {
        key: '' // 搜索条件（关键字）
      },
      total: 1,
      pageIndex: 1,
      pageSize: 10,
      list: []
    }
  },
  computed: {
    permissions () {
      return this.$root.getPermissions(ARTICLE.name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.get())
  },
  methods: {
    get () {
      const url = this.$root.getApi(API.KEY, API.ARTICLE_TYPE.ARTICLE.replace(/{id}/, this.typeId))
      this.axios.get(`${url}/${this.pageIndex}/${this.pageSize}`, {
        params: {
          key: this.key
        }
      }).then(response => {
        if (response) {
          this.total = response.Total
          this.list = response.Items
        }
      })
    },
    pageSizeChange (value) {
      this.pageSize = value
      this.$nextTick(() => this.get())
    },
    pageIndexChange (value) {
      this.pageIndex = value
      this.$nextTick(() => this.get())
    },
    search () {
      this.pageIndex = 1
      this.$nextTick(() => this.get())
    },
    add () {
      this.toFormPage({ isAdd: true })
    },
    update (entity) {
      this.toFormPage(entity)
    },
    del (entity) {
      this.$confirm('确认要删除该文章？删除后不可恢复，请谨慎操作！', '温馨提示', {
        type: 'warning',
        cancelButtonText: '放弃操作'
      }).then(() => {
        const url = this.$root.getApi(API.KEY, API.ARTICLE.URL)
        this.axios.delete(`${url}/${entity.Id}`).then(response => {
          if (response.Status) this.get()
        })
      })
    },
    publish (entity) {
      const url = this.$root.getApi(API.KEY, API.ARTICLE.PUBLISH.replace(/{id}/, entity.Id))
      this.axios.patch(url).then(response => {
        if (response.Status) this.get()
      })
    },
    changeType (node) {
      this.typeId = node.value
      this.get()
    },
    toFormPage (params) {
      this.$root.navigate({ ...ARTICLE_FORM, params: params })
    }
  },
  created () {
    this.get()
  },
  components: { BaseArticleTypeCascader }
}
</script>

<style lang="scss" scoped>
.ofa-work-box {
  display: flex;
  justify-content: space-between;

  .el-input {
    width: 250px;
    margin-right: 10px;
  }

  .el-cascader {
    width: 250px;
    margin-right: 10px;
  }
}

/deep/.el-table {
  margin-bottom: 25px;

  .article-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 90px;

    .article-info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }

    .title {
      font-size: 18px;
      cursor: pointer;
    }

    .info {
      span {
        padding: 0 10px;
      }
      label {
        color: #99a9bf;
      }
    }
  }

  .el-image {
    margin: 0 .75rem;
    width: 160px;
    height: 90px;
    background: #f5f7fa;

    .image-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  }
}

table tr td:last-child svg {
  cursor: pointer;
  margin-right: .875rem;
}

</style>
