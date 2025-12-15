<template>
    <div class="content_box" ref="contentBoxRef">
        <div class="content-title">
            <span>登录人次统计</span>
            <div class="tag_box">
              <div :class="['tag_item', activeKey === '1' ? 'active' : '']" @click="handleChangeActiveKey('1')">近7天</div>
              <div :class="['tag_item', activeKey === '2' ? 'active' : '']" @click="handleChangeActiveKey('2')">本月</div>
              <div :class="['tag_item', activeKey === '3' ? 'active' : '']" @click="handleChangeActiveKey('3')">本年</div>
            </div>
        </div>
        <div class="map_charts" ref="chartRef"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';

// ======================================= map地图图表 =============================== //
const contentBoxRef = ref(null);
const chartRef = ref(null);
let myChart = null;
let resizeObserver = null;
let resizeTimer = null;

const mapData = ref([])
const maxTop = ref(200)

const activeKey = ref('1') // 默认活跃度类型为周活跃度
const handleChangeActiveKey = (key) => {
  activeKey.value = key
}

// 新增：平均值（由你自己设置）
const averageValue = ref(110) // 这里设置为110，你可以根据需要修改

onMounted(() => {
  nextTick(() => {
    initChart();
    
    // 使用ResizeObserver监听尺寸变化（现代浏览器推荐）
    if ('ResizeObserver' in window && chartRef.value) {
      resizeObserver = new ResizeObserver(() => {
        if (myChart) {
          myChart.resize();
        }
      });
      resizeObserver.observe(chartRef.value);
    }
  })
})

function initChart() {
  if (!chartRef.value || !contentBoxRef.value) return;
  
  // 设置图表容器的尺寸
  updateChartContainerSize();
  
  // 初始化echarts实例
  myChart = echarts.init(chartRef.value);
  createChart();
  
  // 初始时触发一次resize，确保图表正确渲染
  setTimeout(() => {
    if (myChart) {
      myChart.resize();
    }
  }, 100);
}

function updateChartContainerSize() {
  if (!chartRef.value || !contentBoxRef.value) return;
  
  const parentRect = contentBoxRef.value.getBoundingClientRect();
  if (parentRect.width > 0 && parentRect.height > 0) {
    chartRef.value.style.width = parentRect.width + 'px';
    chartRef.value.style.height = (parentRect.height - 18) + 'px';
  }
}

function createChart() {
  if (!myChart) return;
  
  // 提前计算数据的实际极值，避免手动设置的偏差
  const dataValues = mapData.value.map(item => item.value);
  
  // 数据
  const data = [80, 140, 150, 80, 70, 110, 110];
  
  // 计算数据的最大值，确保Y轴能完整显示平均值
  const dataMax = Math.max(...data, averageValue.value);
  
  let option = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: {
        color: '#999',
        fontSize: 12,
        margin: 10
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      axisTick: {
        alignWithLabel: true,
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      max: function(value) {
        // 确保Y轴最大值能显示平均值
        return Math.max(value.max, maxTop.value, averageValue.value + 20);
      },
      axisLabel: {
        color: '#999',
        fontSize: 12
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
          show: false,
          lineStyle: {
            type: 'dashed',
            color: '#eee'
          }
        }
    },
    series: [
      {
        name: '登录人次',
        data: data,
        type: 'bar',
        itemStyle: {
          color: '#126DF9', 
          borderRadius: [4, 4, 4, 4],
        },
        barWidth: '8px',
        barGap: '30%',
        barCategoryGap: '20%',
        
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#a6c8f8' },
              { offset: 0.5, color: '#3a8ee0' },
              { offset: 1, color: '#3a8ee0' }
            ]),
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 6,
            shadowOffsetY: 3
          }
        },
        
        select: {
          itemStyle: {
            color: '#f56c6c',
            borderColor: '#f56c6c',
            borderWidth: 2
          }
        },
        
        label: {
          show: false,
        },
        
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.1)',
          borderRadius: [6, 6, 0, 0]
        },
        
        highlight: {
          itemStyle: {
            borderColor: '#000',
            borderWidth: 2
          }
        },
        
        // 新增：在柱状图系列中添加markLine（平均线）
        markLine: {
          silent: true, // 不触发事件
          symbol: 'none', // 不显示箭头
          lineStyle: {
            color: '#FF9900', // 平均线颜色
            width: 1,
            type: 'solid' // 虚线
          },
          data: [
            {
              name: '平均值',
              yAxis: averageValue.value, // 使用你设置的平均值
              label: {
                show: true,
                position: 'insideEndTop', // 显示在中间
                formatter: averageValue.value + '人次',
                color: '#FF9900',
                fontSize: 12,
                fontWeight: '400',
                // 关键修改：将标签放在线条上方
                offset: [0, -5], // y轴向上偏移15px
                distance: 0 // 距离线条的距离为0
              }
            }
          ]
        }
      },
    ],
    grid: {
      left: '3%',
      right: '6%',
      bottom: '10px',
      top: '20px',
      containLabel: true
    },
    
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 12
      },
      formatter: function(params) {
        // 过滤掉平均线系列的tooltip
        const filteredParams = params.filter(param => param.seriesName !== '平均线');
        if (filteredParams.length === 0) return '';
        
        const data = filteredParams[0];
        return `${data.name}<br/>登录人次: ${data.value}<br/>平均值: ${averageValue.value}`;
      }
    },
    
    animation: true,
    animationDuration: 1000,
    animationEasing: 'elasticOut',
    animationDelay: function(idx) {
      return idx * 100;
    }
  };
  
  myChart.setOption(option);
}

function fetchGeoJSON() {
  if (myChart) {
    createChart();
    myChart.hideLoading();
  }
}

// 窗口resize处理（防抖）
const handleResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    updateChartContainerSize();
    if (myChart) {
      myChart.resize();
    }
  }, 200);
};

// 监听窗口resize事件（作为ResizeObserver的备选方案）
window.addEventListener("resize", handleResize);

// 组件卸载时清理资源
onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener("resize", handleResize);
  
  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  
  // 清理定时器
  if (resizeTimer) {
    clearTimeout(resizeTimer);
    resizeTimer = null;
  }
  
  // 销毁echarts实例
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
});
</script>

<style lang="scss" scoped>
.content_box {
  height: 100%;
  min-height: 120px;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  padding: 10px;
  background: #F7F8FB;
}

.content-title {
  width: 100%;
  height: 18px;
  min-height: 18px;
  font-family: Source Han Sans CN, Source Han Sans CN;
  font-weight: 500;
  font-size: 18px;
  color: #333333;
  text-align: left;
  line-height: 18px;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content-title span {
    width: 50%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.tag_box{
    max-width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 14px;
    border-radius: 4px;
    overflow: hidden;
}
.tag_item{
    height: 100%;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border: 1px solid #E5E6EB;
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: 400;
    font-size: 12px;
    color: #999999;
    text-align: center;
    font-style: normal;
    text-transform: none;
    cursor: pointer;
    transition: all 0.2s linear;
    // border-radius: ;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.tag_item.active{
    background: #257DFF;
    color: #fff;
    border: 1px solid #257DFF;
}

.content-title span::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: #246ED2;
  margin-right: 6px;
  border-radius: 2px;
  flex-shrink: 0;
}

.map_charts {
  height: calc(100% - 18px);
  width: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
}
</style>