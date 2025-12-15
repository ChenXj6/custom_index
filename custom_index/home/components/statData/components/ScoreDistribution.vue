<template>
    <div class="content_box" ref="contentBoxRef">
        <div class="content-title">
            <span>成绩分布</span>
        </div>
        <div class="content-main">
            <div class="map_charts" ref="chartRef"></div>
            <div class="content-main-r">
              <div class="content-main-r-t">
                <div class="content-main-r-t-l">
                  <div class="content-main-r-t-l-l">
                    <img src="@/assets/home/percent.png" alt="">
                    <span>及格率</span>
                  </div>
                  <div class="content-main-r-t-l-r">
                    <span>98%</span>
                  </div>
                </div>
                <div class="content-main-r-t-r">
                  <div class="content-main-r-t-l-l">
                    <img src="@/assets/home/percent.png" alt="">
                    <span>优秀率</span>
                  </div>
                  <div class="content-main-r-t-l-r">
                    <span>50%</span>
                  </div>
                </div>
              </div>
              <div class="content-main-r-b">
                <div class="content-main-r-b-l">
                  <div class="content-main-r-b-l-item">
                    <div class="content-main-r-t-l-l">
                      <div class="color_tag" :style="{ borderColor: colorMap[0]  }"></div>
                      <span style="color: #999;">90分以上</span>
                    </div>
                    <div class="content-main-r-t-l-r">
                      <span>145</span>
                    </div>
                  </div>
                  <div class="content-main-r-b-l-item">
                    <div class="content-main-r-t-l-l">
                      <div class="color_tag" :style="{ borderColor: colorMap[1]  }"></div>
                      <span style="color: #999;">80-90分</span>
                    </div>
                    <div class="content-main-r-t-l-r">
                      <span>78</span>
                    </div>
                  </div>
                  <div class="content-main-r-b-l-item">
                    <div class="content-main-r-t-l-l">
                      <div class="color_tag" :style="{ borderColor: colorMap[2]  }"></div>
                      <span style="color: #999;">70-80分</span>
                    </div>
                    <div class="content-main-r-t-l-r">
                      <span>69</span>
                    </div>
                  </div>
                </div>
                <div class="content-main-r-b-r">
                  <div class="content-main-r-b-l-item">
                    <div class="content-main-r-t-l-l">
                      <div class="color_tag" :style="{ borderColor: colorMap[3]  }"></div>
                      <span style="color: #999;">60-70分</span>
                    </div>
                    <div class="content-main-r-t-l-r">
                      <span>109</span>
                    </div>
                  </div>
                  <div class="content-main-r-b-l-item">
                    <div class="content-main-r-t-l-l">
                      <div class="color_tag" :style="{ borderColor: colorMap[4]  }"></div>
                      <span style="color: #999;">60分以下</span>
                    </div>
                    <div class="content-main-r-t-l-r">
                      <span>16</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
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
const maxTop = ref(100)
const colorMap = ref([
  '#03D683',
  '#126DF9',
  '#7612F9',
  '#FC8E3F',
  '#E82E2E'
])

// 新增：平均值（由你自己设置）
const averageValue = ref(84) // 这里设置为110，你可以根据需要修改

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
    chartRef.value.style.width = parentRect.width / 100 * 30 + 'px';
    chartRef.value.style.height = (parentRect.height - 18) + 'px';
  }
}

function createChart() {
  if (!myChart) return;
  
  // 提前计算数据的实际极值，避免手动设置的偏差
  const dataValues = mapData.value.map(item => item.value);
  
  // 数据
  const data = [
    { value: 145, name: '90分以上', itemStyle: { color: colorMap.value[0] } },
    { value: 78, name: '80-90分', itemStyle: { color: colorMap.value[1] } },
    { value: 69, name: '70-80分', itemStyle: { color: colorMap.value[2] } },
    { value: 109, name: '60-70分', itemStyle: { color: colorMap.value[3] } },
    { value: 16, name: '60分以下', itemStyle: { color: colorMap.value[4] } }
  ];

  const total = averageValue.value;
  
  let option = {
    tooltip: {
      show: false
    },
    legend: {
        show: false,
    },
    series: [
        {
            name: '成绩分布',
            type: 'pie',
            radius: ['45%', '80%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 0,
                borderColor: '#fff',
                borderWidth: 3
            },
            // 默认显示在环形中间
            label: {
                show: true,
                position: 'center',
                formatter: `{a|${total}}\n{b|平均分}`,
                fontSize: 14,
                fontWeight: 'normal',
                color: '#333',
                lineHeight: 14,
                rich: {
                  a: {
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#000',
                    lineHeight: 20,
                    padding: [0, 0, 2, 0]
                  },
                  b: {
                    fontSize: 14,
                    color: '#666',
                    lineHeight: 20
                  }
                }
            },
            // emphasis: {
            //     scale: false,
            //     focus: 'self',
            //     label: {
            //       show: true,
            //       position: 'center',
            //       formatter: function(params) {
            //         return `{a|${params.value}人}\n{b|${params.name}}`;
            //       },
            //       fontSize: 14,
            //       lineHeight: 14,
            //       rich: {
            //         a: {
            //           fontSize: 14,
            //           fontWeight: 'bold',
            //           color: '#333',
            //           lineHeight: 20,
            //           padding: [0, 0, 2, 0]
            //         },
            //         b: {
            //           fontSize: 14,
            //           color: '#666',
            //           lineHeight: 14
            //         }
            //       }
            //     }
            // },
            labelLine: {
                show: false
            },
            data: data
        },
      ]
    };
  
  myChart.setOption(option);
  
  // 添加鼠标事件处理
  myChart.on('mouseover', function(params) {
    if (params.seriesIndex === 0) {
      // 高亮当前扇形
      myChart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: params.dataIndex
      });
    }
  });
  
  myChart.on('mouseout', function(params) {
    if (params.seriesIndex === 0) {
      // 取消高亮
      setTimeout(() => {
        myChart.dispatchAction({
          type: 'downplay',
          seriesIndex: 0
        });
      }, 100);
    }
  });
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
  // overflow: hidden;
  padding: 10px;
  gap: 10px;
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
}

.content-title span {
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
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

.content-main{
  width: 100%;
  height: calc(100% - 18px);
  min-height: 120px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 2%;
}

.map_charts {
  width: 30%;
  height: 100%;
  overflow: hidden;
}

.content-main-r{
  width: calc(100% - 30% - 2%);
  height: 100%;
  min-height: 112px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 0 10px 0 0;
  // background: red;
}

.content-main-r-t{
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-family: SourceHanSansCN-Regular, SourceHanSansCN-Regular;
  font-weight: normal;
  font-size: 16px;
  color: #666666;
  line-height: 1;
  text-align: left;
  font-style: normal;
  text-transform: none;
  gap: 10%;
  border-bottom: 1px solid #E8E8E8;
}
.content-main-r-t-l,.content-main-r-t-r{
  width: 45%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.content-main-r-t-l-l{
  width: 70%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10%;
}
.content-main-r-t-l-l img{
  width: 14px;
  height: 14px;
}
.content-main-r-t-l-l span{
  width: calc(100% - 14px - 10px);
  height: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.content-main-r-t-l-r{
  width: 30%;
  height: 100%;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.content-main-r-b{
  width: 100%;
  height: calc(100% - 50px);
  overflow: hidden;
  padding-top: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10%;
}

.content-main-r-b-l,.content-main-r-b-r{
  width: 45%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
}
.color_tag{
  width: 14px;
  height: 14px;
  background: #fff;
  border: 3px solid #03D683;
  border-radius: 50%;
}

.content-main-r-b-l-item{
  width: 100%;
  height: 16px;
  font-family: HarmonyOS_Sans_SC_Medium, HarmonyOS_Sans_SC_Medium;
  font-weight: normal;
  font-size: 16px;
  color: #666666;
  line-height: 1;
  text-align: left;
  font-style: normal;
  text-transform: none;
  display: flex;
}

</style>