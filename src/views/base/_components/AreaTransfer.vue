<template>
  <div class="perm-box">
    <div class="box-content">
      <div class="transfer-filter-box">
        <base-area-cascader @change="setAreaChildren" size="mini" placeholder="请选择地区"></base-area-cascader>
      </div>
        <div class="area-box">
          <!-- 待选列表-->
          <div class="transfer l">
            <div class="transfer-header">
              <el-checkbox @change="checkAll">待选地区</el-checkbox>
              <span>{{leftSelectedCount}} / {{transfers.length}}</span>
            </div>
            <ul>
              <li class="tips-box" v-show="transfers.length < 1">
                <font-awesome-icon fas icon="arrow-circle-up"></font-awesome-icon>&nbsp;请从上方选择地区
              </li>
              <li v-for="item in transfers" :key="item.value">
                <div>
                  <el-checkbox v-model="item.selected"></el-checkbox>
                  {{item.label}}
                </div>
              </li>
            </ul>
          </div>
          <!-- 操作区域 -->
          <div class="move-box">
            <el-button circle @click="confirmSelect" :disabled="leftSelectedCount < 1">
              <font-awesome-icon fas icon="angle-double-right"></font-awesome-icon>
            </el-button>
          </div>
          <!-- 已有地区 -->
          <div class="transfer r">
            <div class="transfer-header">
              <span>已有地区权限</span>
              <span>{{selectedValues.length}}</span>
            </div>
            <ul>
              <li class="tips-box" v-show="selectedValues.length < 1">
                <font-awesome-icon fas icon="ban"></font-awesome-icon>&nbsp;暂无选择的地区
              </li>
              <li v-for="(item, index) in selectedValues" :key="item.Id">
                <span>{{item.Name}}</span>
                <el-tooltip content="移除" placement="bottom">
                  <font-awesome-icon fas icon="minus" class="text-danger remove" @click="remove(index)">
                  </font-awesome-icon>
                </el-tooltip>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import BaseAreaCascader from './AreaCascader'

export default {
  name: 'BaseAreaGroupTransfer',
  props: {
    value: {
      type: String
    }
  },
  data () {
    return {
      transfers: [],
      selectedValues: []
    }
  },
  computed: {
    leftSelectedCount () {
      return this.transfers ? this.transfers.filter(w => { return w.selected }).length : 0
    }
  },
  watch: {
    value (newValue) {
      this.selectedValues = newValue
    },
    selectedValues (newValue) {
      this.$emit('input', newValue)
    }
  },
  methods: {
    setAreaChildren (node) {
      this.transfers = node.children
    },
    confirmSelect () {
      let nodes = this.transfers.filter(w => { return w.selected })
      nodes = nodes.filter(w => { return this.selectedValues.findIndex(s => s.Id === w.data.Id) < 0 })
      nodes.forEach(e => {
        this.selectedValues.push(e.data)
      })
    },
    remove (index) {
      this.selectedValues.splice(index, 1)
    },
    checkAll (newValue) {
      this.transfers.forEach(e => {
        e.selected = newValue
      })
    }
  },
  created () {
    this.selectedValues = this.value
  },
  components: { BaseAreaCascader }
}
</script>

<style lang="scss" scoped>
.perm-box {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  font-size: .75rem;

  .box-content {

    .transfer-filter-box {
      padding: .75rem;
      border-bottom: 1px solid #ebeef5;

      .el-cascader {
        width: 100%;
      }
    }

    .area-box {
      display: flex;
      justify-content: space-between;
      min-height: 100%;

      ul {
        padding: 0;

        li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: .45rem;

          &:hover {
            background: #f5f7fa;
            color: #409EFF;
          }

          .remove {
            cursor: pointer;
          }
        }
      }

      .move-box {
        button {
          margin-top: 150px;
        }
      }

      .tips-box {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-size: 1.25rem;
        color: #ebeef5;
        overflow-y: auto;
      }

      .transfer.l {
        border-right: 1px solid #ebeef5;
      }
      .transfer.r {
        border-left: 1px solid #ebeef5;
      }
      .transfer {
        width: 40%;

        .transfer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 40px;
          background: #f5f7fa;
          margin: 0;
          padding: 0 .45rem;
          border-bottom: 1px solid #ebeef5;
          box-sizing: border-box;
          font-size: .75rem;

          label {
            margin-bottom: 0;
          }
        }

        .el-checkbox {
          padding-right: 6px;
        }

        >ul {
          height: 400px;
          overflow-y: auto;
        }
      }
    }
  }
}
</style>
