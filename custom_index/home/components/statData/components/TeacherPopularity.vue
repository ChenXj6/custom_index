<template>
    <div class="content_box" ref="contentBoxRef">
        <div class="content-title">
            <span>教师受欢迎度</span>
        </div>
        <div class="content-list">
            <!-- 左右切换容器 -->
            <div class="switch-container">
                <button class="switch-btn left-btn" @click="prevTeacher" :disabled="currentIndex <= 0">
                    <i class="arrow left"></i>
                </button>
                <!-- 教师列表滚动容器 -->
                <div class="teacher-scroll" ref="teacherScrollRef">
                    <div class="teacher-list" :style="{ transform: `translateX(-${currentIndex * scrollStep}px)` }">
                        <!-- 核心：添加动态类名控制元素显示隐藏 -->
                        <div 
                            class="content-item" 
                            v-for="(item, index) in teacherArr" 
                            :key="index"
                            :class="{ 'small-item': isItemSmall }"
                        >
                            <div class="content-item-t">
                                <!-- 头像区域 -->
                                <div class="avatar-wrap">
                                    <img :src="item.avatar" alt="教师头像" class="avatar">
                                </div>
                                <!-- 信息区域 -->
                                <div class="info-wrap">
                                    <h3 class="teacher-name">{{ item.name }}</h3>
                                    <p class="teacher-position">{{ item.a }} {{ item.ass }}</p>
                                </div>
                            </div>
                            <div class="content-item-b">
                                <!-- 星级评分 -->
                                <div class="rating-wrap">
                                    <el-rate v-model="item.rating" size="small" disabled style="max-width: 60%;"/>
                                    <span class="score">{{ item.rating }} ({{ item.num }})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="switch-btn right-btn" @click="nextTeacher" :disabled="currentIndex >= maxScrollIndex">
                    <i class="arrow right"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';

const teacherArr = ref([
    { name: '张老师', avatar: 'https://img2.baidu.com/it/u=3280885062,2707279109&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500', a: '清华大学', ass: '教授', rating: 5.0, num: 128 },
    { name: '王老师', avatar: 'https://img2.baidu.com/it/u=3763202793,1627758777&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500', a: '清华大学', ass: '教授', rating: 4.8, num: 652 },
]);

// 当前显示的教师索引
const currentIndex = ref(0);
// 容器引用
const contentBoxRef = ref(null);
const teacherScrollRef = ref(null);
// 滚动步长（单个item宽度+间距）
const scrollStep = ref(0);
// 最大滚动索引
const maxScrollIndex = ref(0);
// 判断item是否小于150px
const isItemSmall = ref(false);

// 计算item宽度和滚动参数
const calculateLayout = () => {
    if (!teacherScrollRef.value) return;
    
    const scrollRect = teacherScrollRef.value.getBoundingClientRect();
    // 计算单个item宽度（和CSS一致）
    const itemWidth = (scrollRect.width - 12) / 2;
    // 判断是否小于150px
    isItemSmall.value = itemWidth < 150;
    // 滚动步长 = 单个item宽度 + 间距
    scrollStep.value = itemWidth + 12;
    // 最大滚动索引 = 数组长度 - 2（因为一次显示2个）
    maxScrollIndex.value = Math.max(0, teacherArr.value.length - 2);
};

// 上一个教师
const prevTeacher = () => {
    if (currentIndex.value > 0) {
        currentIndex.value--;
    }
};

// 下一个教师
const nextTeacher = () => {
    if (currentIndex.value < maxScrollIndex.value) {
        currentIndex.value++;
    }
};

// 监听窗口大小变化
const handleResize = () => {
    calculateLayout();
};

onMounted(() => {
    nextTick(() => {
        calculateLayout();
        // 监听窗口resize
        window.addEventListener('resize', handleResize);
    });
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});

// 监听教师数组变化，重新计算布局
watch(teacherArr, () => {
    calculateLayout();
}, { deep: true });
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
  min-height: 120px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 左右切换容器 */
.switch-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    position: relative;
}

.switch-btn {
    width: 20px;
    height: 30px;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
    font-size: 16px;
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.arrow {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: solid #666;
    border-width: 2px 2px 0 0;
    &.left {
        transform: rotate(-135deg);
    }
    &.right {
        transform: rotate(45deg);
    }
}

/* 教师列表滚动容器 */
.teacher-scroll {
    flex: 1;
    height: 100%;
    overflow: hidden;
}

.teacher-list {
    display: flex;
    gap: 12px;
    transition: transform 0.3s ease;
    height: 100%;
    padding: 10px 0;
}

/* 教师项样式 */
.content-item {
    width: calc((100% - 12px) / 2);
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    padding: 14px;
    background: #F1F3F9;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transition: all 0.2s ease; /* 过渡动画 */
}

/* 核心：宽度<150px时的样式 */
.content-item.small-item {
    .content-item{
        width: 150px !important;
    }
    /* 隐藏头像和score */
    .avatar-wrap, .score {
        display: none !important;
    }
    
    // /* 调整布局适配 */
    .content-item-t {
        height: 100%;
        justify-content: flex-start;
        gap: 0;
    }
    
    .info-wrap {
        gap: 8px;
        width: 100%;
    }
    
    .teacher-name {
        font-size: 14px;
    }
    
    .teacher-position {
        width: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        text-align: left;
        font-size: 12px;
    }
    
    .content-item-b {
        height: auto;
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 8px;
    }
}

.content-item-t {
    width: 100%;
    height: 70%;
    display: flex;
    align-items: center;
    gap: 15px;
}

.content-item-b {
    width: 100%;
    height: calc(100% - 70% - 18px);
}

.avatar-wrap {
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
}

.avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info-wrap {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.teacher-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.teacher-position {
    font-size: 14px;
    color: #666;
    margin: 0;
}

.rating-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
}

.star {
    color: #FFCC00;
    font-size: 14px;
    text-shadow: 0 0 0 1px #E0E0E0;
}

.score {
    width: calc(100% - 60%);
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: 400;
    font-size: 14px;
    color: #666666;
    line-height: 22px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

/* 兜底：CSS媒体查询确保极端情况生效 */
@media (max-width: 320px) {
    .content-item {
        .avatar-wrap, .score {
            display: none !important;
        }
    }
}
</style>