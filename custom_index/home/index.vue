<template>
  <div class="dashboard-page" :style="{ width: '100%', height: 'calc(100vh - 84px)', padding: '20px', boxSizing: 'border-box', overflow: 'auto' }">
    <div :style="{ height: '100%' }">
      <DashboardComponent
        :is-editable="false"
        :top-items="topItems"
        :bottom-items="bottomItems"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getConfig, getStats } from '@/api/home'
import DashboardComponent from './components/DashboardComponent.vue';

// 响应式数据
const topItemComs = ref([])
const topItems = ref([]);
const bottomItems = ref([]);

// 生命周期钩子
onMounted(async () => {
  await getStatsList();
  loadConfig();
});

const getStatsList = () => {
  return new Promise((resolve, reject) => {
    getStats().then(res => {
      if(res.code == 200) {
        topItemComs.value = res.data
        resolve(true)
      }
    })
  })
}

// 方法定义
const loadConfig = () => {
  getConfig().then(res => {
    if(res.code == 200) {
      topItems.value = res.data.filter(item => item.moduleType == 0).map(v => {
        return {
          id: v.moduleKey,
          name: v.moduleName,
          startCol: v.startCol,
          colSpan: v.colSpan,
          type: 'statistic',
          ...topItemComs.value.find(val => val.typeKey == v.moduleKey)
        }
      });
      bottomItems.value = res.data.filter(item => item.moduleType == 1).map(v => {
        return {
          ...v,
          id: v.moduleKey,
          name: v.moduleName,
          startCol: v.startCol,
          colSpan: v.colSpan,
          startRow: v.startRow,
          rowSpan: v.rowSpan,
          type: 'analysis'
        }
      });
    }
  })
};
</script>

<style scoped>
.dashboard-page {
  background: #fff;
}
</style>