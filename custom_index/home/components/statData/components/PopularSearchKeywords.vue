<template>
    <div class="content_box" ref="contentBoxRef">
        <div class="content-title">
            <span>热门搜索关键词</span>
        </div>
        <div class="content-list">
            <VueWordCloud 
                :words="hotKeywords"
                :font-style="getFontSize"
                style="width: 100%; height: 100%;min-height: 150px;"
                >
                <template #default="{ text, weight }">
                    <div 
                      class="keyword-tag" 
                      :style="{ 
                          padding: getPadding(weight), 
                          borderRadius: '18px',
                          cursor: 'pointer',
                          fontSize: getFontSize(weight),
                          backgroundColor: getBg(weight),
                          color: getKeywordColor(weight),
                          height: getHeight(weight)
                      }"
                      @click="handleKeywordClick(text)"
                      >
                      {{ text }}
                    </div>
                </template>
            </VueWordCloud>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import VueWordCloud from 'vuewordcloud';


// 模拟热门关键词数据（text=关键词，weight=权重，权重越高越突出）
const hotKeywords = ref([
  { text: '社会主义', weight: 10 },
  { text: '党史国史国情', weight: 20 },
  { text: '党的二十大精神', weight: 8 },
  { text: '深化学习教育', weight: 15 },
  // 重复关键词（模拟高频出现）
  { text: '社会主义', weight: 12 },
  { text: '社会主义', weight: 9 },
  { text: '党的二十大精神', weight: 7 },
  { text: '社会主义', weight: 30 },
  { text: '社会主义', weight: 10 },
  { text: '党史国史国情', weight: 20 },
  { text: '党的二十大精神', weight: 8 },
  { text: '深化学习教育', weight: 15 },
  // 重复关键词（模拟高频出现）
  { text: '社会主义', weight: 12 },
  { text: '社会主义', weight: 9 },
  { text: '党的二十大精神', weight: 7 },
  { text: '社会主义', weight: 30 },
]);

// 根据权重设置颜色（权重越高，颜色越深/越蓝）
const getKeywordColor = (weight) => {
  if (weight >= 20) return '#fff'; // 深蓝色（高权重）
  if (weight >= 15) return '#666'; // 深蓝色（高权重）
  return '#999';                   // 浅蓝灰色
};

// 根据权重设置字体大小
const getFontSize = (weight) => {
  if (weight >= 12) return '12px'; // 深蓝色（高权重）
  return '10px';   
};

const getBg = (weight) => {
  if (weight >= 20) return '#257DFF'; // 深蓝色（高权重）
  if (weight >= 15) return '#e4efff'; // 深蓝色（高权重）
  return '#E1EEFF';   
};

const getPadding = (weight) => {
  if (weight >= 20) return '5px 12px'; // 深蓝色（高权重）
  return '3px 10px';   
};

const getHeight = (weight) => {
  if (weight >= 20) return '24px'; // 深蓝色（高权重）
  if (weight >= 15) return '16px'; // 深蓝色（高权重）
  return '14px';   
};

// 关键词点击事件
const handleKeywordClick = (keyword) => {
  console.log('点击了关键词：', keyword);
};




</script>

<style lang="scss" scoped>
.content_box {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  padding: 10px;
  gap: 15px;
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

.content-list {
    height: calc(100% - 18px - 15px);
  width: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
}
.content-item {
    width: 100%;
    height: calc((100% - 40px) / 5);
    box-sizing: border-box;
    display: flex;
    gap: .5rem;
    align-items: center;
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: 500;
    font-size: 14px;
    color: #666666;
    line-height: 9px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    margin-bottom: 10px;
}

.content-list > *:last-child {
  margin-bottom: 0 !important;
}
.content-item-l{
    width: 5%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    img{
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .custom{
        width: 100%;
        height: 100%;
        min-height: 15px;
        background-image: url('@/assets/home/custom.png');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-bottom: 10%;
        font-family: HarmonyOS Sans SC, HarmonyOS Sans SC;
        font-weight: 400;
        font-size: 11px;
        color: #FFFFFF;
        line-height: 9px;
        text-align: left;
        font-style: normal;
        text-transform: none;
    }
}

.content-item-r{
    width: calc(100% - 5% - 0.5rem);
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}
.content-item-r-l{
    width: 85%;
    line-height: 1;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: 500;
    color: #666666;
    text-align: left;
    font-style: normal;
    text-transform: none;
}
.content-item-r-r{
    width: calc(100% - 85% - .5rem);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: 400;
    font-size: 12px;
    color: #257DFF;
    line-height: 1;
    text-align: left;
    font-style: normal;
    text-transform: none;
    span{
        width: 100%;
        text-align: end;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
}




.hot-search-container {
  padding: 16px;
  background: #F7F8FB;
  border-radius: 8px;
}
.title {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
}
.title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: #246ED2;
  margin-right: 6px;
  border-radius: 2px;
}
.keyword-tag {
  display: inline-block;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.keyword-tag:hover {
  transform: scale(1.05);
}

</style>