<template>
    <div class="content_box">
        <div class="content-title">
            <span>学员单位分布</span>
        </div>
        <div class="map_charts" ref="chartRef"></div>
    </div>
</template>
<script setup>
import * as echarts from 'echarts';

import SD from '../JSON/SD.json'

// ======================================= map地图图表 =============================== //
const chartRef = ref(null);
let myChart = ref(null);
const mapData = ref([])

const maxTop = ref(20)

onMounted(() => {
  nextTick(() => {
    myChart.value = echarts.init(chartRef.value)
    fetchGeoJSON();
  })
})


function createChart() {
  // 提前计算数据的实际极值，避免手动设置的偏差
  const dataValues = mapData.value.map(item => item.value);
  const minValue = Math.min(...dataValues, 0);
  const maxValue = Math.max(...dataValues, maxTop.value);

  let option = {
    geo: {
      map: 'SD',
      label: {
        show: true,
        color: '#333'
      },
      zoom: 1,
      roam: false,
      itemStyle: {
        normal: {
          areaColor: '#246ED2',
          borderColor: '#fff',
          borderWidth: 1,
        },
        emphasis: {
          borderWidth: 1,
        }
      }
    },
    tooltip: {
      show: true,
      formatter: '{b}<br/>学员数: {c}',
      formatter: function(params) {
        const data = params.data
        return `
          <div style="font-size: 14px;color:#333;font-weight:500;">${params.name}</div>
          <div style="font-size:12px;color:#999;">学员数量<span style="margin: 0 6px;color: #246ED2;font-size: 14px;font-weight:500;">${data?.acceptedCaseCount || 0}</span></div>
        `
      },
    },
    visualMap: [
      {
        type: 'continuous', // 连续型（渐变）| 如需离散匹配可改为 piecewise
        orient: 'vertical',
        calculable: false,
        realtime: false,
        right: 10, // 调整位置避免遮挡
        bottom: 10,
        seriesIndex: 0,
        min: minValue, // 实际数据最小值
        max: maxValue, // 实际数据最大值
        label: {
          show: true,
          color: '#333' // 标签文字颜色，提升可读性
        },
        // 核心修复：将颜色配置移到 inRange 中
        inRange: {
          color: [ '#4385F5', '#0EF7FF', '#76EE3B', '#FBFB21', '#FF8010', '#E22929']
        },
        // 可选：添加边界值的颜色强制匹配
        align: 'right',
        itemWidth: 20,
        itemHeight: 100
      },
    ],
    series: [
      {
        type: 'map',
        map: 'SD',
        geoIndex: 0,
        itemStyle: {
          normal: { label: { show: true } },
          emphasis: { label: { show: true } }
        },
        data: mapData.value,
        encode: {
          value: 'value'
        },
      }
    ]
  };
  myChart.value.setOption(option);

  nextTick(() => {
    myChart.value?.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: 0
    });
  })
}
function fetchGeoJSON() {
//   getMapJson({ areaName: '山东省' }).then(res => {
    echarts.registerMap('SD', SD);
    createChart();
    myChart.value.hideLoading();
//   })

}

// 窗口 resize 处理
const handleResize = () => {
  myChart.value && myChart.value.resize();
  nextTick(() => {
    myChart.value?.dispatchAction({
        type: 'showTip',
        seriesIndex: 0, // 系列索引（第0个系列）
        dataIndex: 0    // 数据索引（展示第0个数据，即北京）
    });
  })
};

window.addEventListener("resize", handleResize);
</script>
<style lang="scss" scoped>
  .content_box{
    height: 100%;
    padding: 10px;
    background-image: url('@/assets/home/map_bg.png');
    background-repeat: round;
    background-size: cover;
  }
  .content-title{
    width: 100%;
    height: 18px;
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: 500;
    font-size: 18px;
    color: #333333;
    text-align: left;
    font-style: normal;
    text-transform: none;
    line-height: 18px;
    display: flex;
    align-items: center;
  }
  .content-title span {
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
  .content-title span::before{
      content: '';
      display: inline-block;
      width: 4px;
      height: 16px;
      background: #246ED2;
      margin-right: 6px;
      border-radius: 2px;
  }
    .map_charts{
      width: 100%;
      height: calc(100% - 18px);
    }
</style>