<template>
    <div class="content_box" ref="contentBoxRef">
        <div class="content-title">
            <span>教师授课数量排名</span>
        </div>
        <div class="content-list">
            <div class="content-item" v-for="(item, index) in new Array(5).fill(0)" :key="item">
                <div class="content-item-l">
                    <img v-if="index <= 2" :src="getImgUrl(index + 1)" alt="">
                    <div v-else class="custom">
                        {{ index + 1 }}
                    </div>
                </div>
                <div class="content-item-r">
                    <div class="content-item-r-l">
                        <span>张钹 - 计算机科学与技术专家</span>
                    </div>
                    <div class="content-item-r-r">
                        <span>{{ Math.floor(Math.random() * 100) }}门</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import one from '@/assets/home/one.png';
import two from '@/assets/home/two.png';
import three from '@/assets/home/three.png';
import four from '@/assets/home/custom.png';

const getImgUrl = (num) => {
    switch (num) {
        case 1:
            return one;
        case 2:
            return two;
        case 3:
            return three;
        default:
            return four;
    }
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

</style>