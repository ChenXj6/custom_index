<template>
  <div class="content_box" ref="contentBoxRef">
    <div class="content-title">
      <span>单位活跃度排名</span>
      <div class="tag_box">
        <div :class="['tag_item', activeKey === 'activityRate' ? 'active' : '']" @click="handleChangeActiveKey('activityRate')">活跃率</div>
        <div :class="['tag_item', activeKey === 'duration' ? 'active' : '']" @click="handleChangeActiveKey('duration')">人均时长</div>
      </div>
    </div>
    <div class="content-list">
      <div class="content-item" v-for="(item, index) in new Array(3).fill(0)" :key="item">
        <div class="content-item-l">
          <img :src="getImgUrl(index + 1)" alt="" />
        </div>
        <div class="content-item-r">
          <div class="content-item-r-t">
            <span>国家移民局一总队</span>
          </div>
          <div class="content-item-r-b">
            <el-progress :percentage="50" color="#126DF9">
              <span style="color: #126df9; margin-left: 5px; font-size: 14px">{{ (Math.random() * 100).toFixed(0) }}%</span>
            </el-progress>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import one from '@/assets/home/one.png'
import two from '@/assets/home/two.png'
import three from '@/assets/home/three.png'

const getImgUrl = (num) => {
  switch (num) {
    case 1:
      return one
    case 2:
      return two
    case 3:
      return three
    default:
      return ''
  }
}

const activeKey = ref('activityRate') // 默认活跃度类型为周活跃度
const handleChangeActiveKey = (key) => {
  activeKey.value = key
}

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
  gap: 10px;
  background: #f7f8fb;
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
  text-align: left;
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
  background: #246ed2;
  margin-right: 6px;
  border-radius: 2px;
  flex-shrink: 0;
}

.content-list {
  height: calc(100% - 18px - 10px);
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
  height: calc((100% - 20px) / 3);
  box-sizing: border-box;
  display: flex;
  gap: 0.5rem;
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
.content-item-l {
  width: 5%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.content-item-r {
  width: calc(100% - 5% - 0.5rem);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
}
.content-item-r-t {
  width: 100%;
  line-height: 1;
  font-size: 14px;
  overflow-x: hidden;
  overflow-y: visible;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: Source Han Sans CN, Source Han Sans CN;
  font-weight: 500;
  color: #666666;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
.content-item-r-b {
  width: 100%;
}
</style>
