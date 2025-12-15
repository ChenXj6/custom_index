<template>
  <div class="config-page" :style="{ width: '100%', height: 'calc(100vh - 84px)', display: 'flex', overflow: 'hidden', padding: '7px 4px' }">
    <!-- 左侧拖拽配置栏 -->
    <div class="left-panel" :style="{
      width: '320px',
      height: '100%',
      position: 'relative'
    }">
      <div class="setting_list">
        <div class="setting_item">
          <div class="setting_title" @click="handleChangeShow('statistic')">
            统计数据配置
          </div>
          <div class="setting_comp_list">
            <div v-if="statisticShow" class="component-list" style="margin: 10px 0;background: #fff;">
              <div
                v-for="item in statisticComponents"
                :key="item.typeKey"
                class="component-item"
                draggable="true"
                @dragstart="(e) => handleDragStart(e, item, 'statistic')"
                :style="{
                  background: '#fff',
                  borderRadius: '4px',
                  cursor: 'move'
                }"
              >
                <div class="statistic_item">
                  <div class="statistic_item_title">
                    {{ item.typeName }}
                  </div>
                  <div class="statistic_item_data">
                    <span class="data_number">{{ item.value }}</span>
                    <span class="data_unit">{{ item.unit }}</span>
                  </div>
                  <div class="statistic_item_bg">
                    <img :src="item.imageUrl || img" alt="">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="setting_item">
          <div class="setting_title" @click="handleChangeShow('analysis')">
            数据分析配置
          </div>
          <!-- <div v-if="analysisShow" class="setting_search">
            <el-input 
              v-model="searchQuery" 
              placeholder="组件名称" 
              size="small" 
              clearable
              :style="{ width: '100%', height: '34px' }"
            >
              <template #suffix>
                <el-icon color="#257DFF" size="16px"><Search /></el-icon>
              </template>
            </el-input>
          </div> -->
          <div class="setting_comp_list">
            <div v-if="analysisShow" class="component-list">
              <div
                v-for="comp in analysisComponents" 
                :key="comp.moduleKey" 
                class="component-item comp-wrapper"
                draggable="true"
                @dragstart="(e) => handleDragStart(e, comp, 'analysis')"
              >
                <component 
                  class="comp"
                  :style="comp.moduleKey == 'DistributionOfStudentUnits' ? { height: '242px' } : { height: '' }"
                  :is="comp.component"
                  :ref="`analysis-comp-${comp.moduleKey}`"
                  @loaded="handleComponentLoaded(comp.moduleKey)"
                  v-bind="$attrs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#fff', padding: '10px', position: 'absolute', bottom: '0', left: '0', right: '0', borderRadius: '4px' }">
        <el-button type="primary" v-loading="saveLoading" @click="saveConfig">保存配置</el-button>
        <el-button type="warning" @click="resetConfig">重置配置</el-button>
      </div>
    </div>
    
    <!-- 右侧看板组件 -->
    <div class="right-panel" :style="{
        width: 'calc(100% - 320px)',
      height: '100%',
      padding: '0',
      overflow: 'auto',
      marginLeft: '10px'
    }">
      <div :style="{ height: '100%' }">
        <DashboardComponent
          ref="DashboardComponentRef"
          :is-editable="true"
          :top-items="topItems"
          :bottom-items="bottomItems"
          @add-top-item="addTopItem"
          @add-bottom-item="addBottomItem"
          @remove-top-item="removeTopItem"
          @remove-bottom-item="removeBottomItem"
          @resize-item="resizeItem"
          @reorder-item="reorderItem"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import DashboardComponent from './components/DashboardComponent.vue';
import { getAsyncComponents } from './components/statData/index';
import { getStats, getConfig, saveConfig as saveConfigApi } from '@/api/home'
import img from './components/analyze/1.png'

const { proxy } = getCurrentInstance();

// 响应式数据
const statisticShow = ref(false);
const analysisShow = ref(true);
const handleChangeShow = (type) => {
  if (type == 'statistic') {
    // console.log('点击了统计数据配置标题');
    statisticShow.value = !!statisticShow.value ? false : true;
    analysisShow.value = false;
  } else if (type == 'analysis') {
    // console.log('点击了数据分析配置标题');
    analysisShow.value = !!analysisShow.value ? false : true;
    statisticShow.value = false;
  }
};
const statisticComponents = ref([]);
const analysisComponents = ref([]);
const topItems = ref([]);
const bottomItems = ref([]);

// 生命周期钩子
onMounted(async () => {
  await getStatsList()
  analysisComponents.value = getAsyncComponents()
  getConfigData()
});

const getStatsList = () => {
  return new Promise((resolve, reject) => {
    getStats().then(res => {
      if(res.code == 200) {
        statisticComponents.value = res.data.map(v => {
          return {
            ...v,
            moduleType: 'statistic'
          }
        })
        resolve(true)
      }
    })
  })
}


const saveLoading = ref(false);
const saveConfig = async () => {
  const { isValid, message } = await proxy.$refs.DashboardComponentRef.validateNoEmptyPositions();
  if(isValid){
    saveLoading.value = true;
    // 位置校验通过，保存配置
    // localStorage.setItem('dashboard_top_items', JSON.stringify(topItems.value));
    // localStorage.setItem('dashboard_bottom_items', JSON.stringify(bottomItems.value));
    // console.log('Saved Top Items:', topItems.value);
    // console.log('Saved Bottom Items:', bottomItems.value);
    saveConfigData()
  } else if (!isValid && message) {
    ElMessage.error(message || '配置保存失败，存在位置冲突或空位！');
    return;
  }
  
};

const saveConfigData = () => {
  let topItemsData = [];
  let bottomItemsData = [];
  topItemsData = topItems.value.map(item => {
    return { ...item, moduleType: 0, moduleKey: item.typeKey, moduleName: item.typeKey }
  })
  bottomItemsData = bottomItems.value.map(item => {
    return {
      moduleKey: item.moduleKey,
      moduleName: item.moduleName,
      startCol: item.startCol,
      colSpan: item.colSpan,
      startRow: item.startRow,
      rowSpan: item.rowSpan,
      moduleType: 1,
    }
  })
  const data = [...topItemsData, ...bottomItemsData];
  // console.log(data, 'data');
  saveConfigApi(data).then(res => {
    if(res.code == 200) {
      ElMessage.success('配置已成功保存！');
    } 
  }).finally(() => {
    saveLoading.value = false;
  })
}

const getConfigData = async () => {
  getConfig().then(res => {
    if(res.code == 200) {
      topItems.value = res.data.filter(item => item.moduleType == 0).map(v => {
        return {
          ...v,
          moduleKey: v.moduleKey,
          name: v.moduleName,
          startCol: v.startCol,
          colSpan: v.colSpan,
          type: 'statistic',
          ...statisticComponents.value.find(val => val.typeKey == v.moduleKey)
        }
      });
      bottomItems.value = res.data.filter(item => item.moduleType == 1).map(v => {
        return {
          ...v,
          moduleKey: v.moduleKey,
          moduleName: v.moduleName,
          startCol: v.startCol,
          colSpan: v.colSpan,
          startRow: v.startRow,
          rowSpan: v.rowSpan,
          type: 'analysis'
        }
      });
    }
  })
}


const resetConfig = () => {
  ElMessageBox.confirm(
    '确定要重置所有配置吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    localStorage.removeItem('dashboard_top_items');
    localStorage.removeItem('dashboard_bottom_items');
    topItems.value = [];
    bottomItems.value = [];
    ElMessage.info('配置已重置！');
  }).catch(() => {
    ElMessage.info('已取消重置');
  });
};

const handleDragStart = (e, item, type) => {
  e.dataTransfer.setData('text', JSON.stringify({ ...item, type }));
};

// 上区添加组件
const addTopItem = (item) => {
  // 确保添加的组件无visible字段
  const { visible, ...newItem } = item;
  topItems.value.push(newItem);
};

// 下区添加组件
const addBottomItem = (item) => {
  // 确保添加的组件无visible字段
  const { visible, ...newItem } = item;
  bottomItems.value.push(newItem);
};

// 硬删除上区组件（核心修改）
const removeTopItem = (index) => {
  topItems.value.splice(index, 1);
  ElMessage.success(`上区组件删除成功，剩余${topItems.value.length}个`);
};

// 硬删除下区组件（核心修改）
const removeBottomItem = (index) => {
  bottomItems.value.splice(index, 1);
  ElMessage.success(`下区组件删除成功，剩余${bottomItems.value.length}个`);
};

// 调整组件行列跨度
const resizeItem = (type, index, colSpan, rowSpan, newStartCol, newStartRow) => {
  if (type === 'top') {
    // 上区支持起始列变更（向左扩展）
    if (newStartCol) {
      topItems.value[index].startCol = newStartCol;
    }
    topItems.value[index].colSpan = colSpan;
  } else {
    // 下区支持起始列/行变更（向左/向上扩展）
    if (newStartCol) {
      bottomItems.value[index].startCol = newStartCol;
    }
    if (newStartRow) {
      bottomItems.value[index].startRow = newStartRow;
    }
    bottomItems.value[index].colSpan = colSpan;
    bottomItems.value[index].rowSpan = rowSpan;
  }
};

// 新增：处理组件排序/拖拽移动
const reorderItem = (type, oldIndex, newPos) => {
  if (type === 'top') {
    // 上区组件排序逻辑
    const item = { ...topItems.value[oldIndex], ...newPos };
    const [removedItem] = topItems.value.splice(oldIndex, 1);
    
    // 检查新位置是否被占用
    const isOccupied = topItems.value.some(i => {
      const itemCols = [];
      for (let c = newPos.startCol; c < newPos.startCol + newPos.colSpan; c++) {
        itemCols.push(c);
      }
      for (let c = i.startCol; c < i.startCol + i.colSpan; c++) {
        if (itemCols.includes(c)) {
          return true;
        }
      }
      return false;
    });
    
    if (isOccupied) {
      ElMessage.warning('该位置已被占用，无法移动组件');
      topItems.value.splice(oldIndex, 0, removedItem);
      return;
    }
    
    topItems.value.push(item);
    ElMessage.success('组件位置调整成功！');
  } else {
    // 下区组件排序逻辑
    const item = { ...bottomItems.value[oldIndex], ...newPos };
    const [removedItem] = bottomItems.value.splice(oldIndex, 1);
    
    // 检查新位置是否被占用
    const isOccupied = bottomItems.value.some(i => {
      const targetCells = [];
      for (let r = newPos.startRow; r < newPos.startRow + newPos.rowSpan; r++) {
        for (let c = newPos.startCol; c < newPos.startCol + newPos.colSpan; c++) {
          targetCells.push(`${r}-${c}`);
        }
      }
      for (let r = i.startRow; r < i.startRow + i.rowSpan; r++) {
        for (let c = i.startCol; c < i.startCol + i.colSpan; c++) {
          if (targetCells.includes(`${r}-${c}`)) {
            return true;
          }
        }
      }
      return false;
    });
    
    if (isOccupied) {
      ElMessage.warning('该位置已被占用，无法移动组件');
      bottomItems.value.splice(oldIndex, 0, removedItem);
      return;
    }
    
    bottomItems.value.push(item);
    ElMessage.success('组件位置调整成功！');
  }
};








// 记录加载状态
</script>

<style scoped>
.config-page {
  background: #fff;
}
.component-item {
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.component-item:hover {
  background: #e8f4f8;
  box-shadow: #999 0 0 5px 0;
  /* border: 1px solid #409eff; */
  /* transform: translateY(-2px); */
}
.left-panel {
  background-color: #f9fafc;
}
.right-panel {
  background-color: #fff;
}
h3 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 18px;
}

.comp {
  width: 100%;
  /* height: 121px; */
  border-radius: 8px;
  background: #fff;
  margin-bottom: 10px;
}
.comp:last-child {
  margin-bottom: 0;
}
.setting_comp_list{
  margin-top: 10px;
  width: 100%;
  transition: all 0.3s ease;
}
.component-list{
  max-height: calc(100vh - 84px - 52px - 40px - 20px - 15px - 100px);
  background: #F7F8FB;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
  scrollbar-width: none;
  padding: 10px 0;
}

.setting_list{
  width: 100%;
  height: calc(100vh - 150px);
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* padding: 0 4px; */
}
.setting_item{
  width: 320px;
  padding: 16px 12px;
  background: #F7F8FB;
}
.setting_title{
  width: 100%;
  height: 16px;
  font-family: Source Han Sans CN, Source Han Sans CN;
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  line-height: 19px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  cursor: pointer;
}
.setting_search{
  margin: 20px 0 10px;
}


.statistic_item{
  width: 100%;
  height: 100px;
  background: #F7F8FB;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 21px 28px;
  font-family: Source Han Sans CN, Source Han Sans CN;
  font-weight: 400;
  font-size: 14px;
  color: #666666;
  text-align: left;
  font-style: normal;
  text-transform: none;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  position: relative;
  
}
.statistic_item_title{
    width: 100%;
    margin-bottom: 10px;
  }
  .statistic_item_data{
    width: 100%;
    height: 35px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    gap: 6px;
  }
  .data_number{
    max-width: calc(100% - 40px - 60px);
    font-weight: bold;
    font-size: 30px;
    color: #333333;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .data_unit{
    width: 40px;
    font-size: 14px;
    color: #999999;
    margin-bottom: 5px;
  }
  .statistic_item_bg{
    position: absolute;
    bottom: 0;
    right: 6px;
    width: 60px;
    height: 60px;
    overflow: hidden;
  }
</style>