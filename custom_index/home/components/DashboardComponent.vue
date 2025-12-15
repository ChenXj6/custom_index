<template>
  <!-- 模板部分：修改动画类的触发条件，增加组件自身的拖拽标记 -->
  <div class="dashboard-container">
    <!-- 上半区：统计数据区（严格1行6列） -->
    <div class="dashboard-section">
      <div class="top-grid-wrapper">
        <div class="dashboard-grid top-grid" ref="topGridRef">
          <div 
            ref="topDragPreviewRef"
            class="drag-preview"
          ></div>
          
          <!-- 核心修改：为每个组件添加唯一的拖拽状态判断 -->
          <div
            v-for="(item, index) in topItems"
            :key="`top-item-${index}_${item.typeKey || index}`"
            class="dashboard-item"
            :class="{
              'component-animate': dragState.isDragging && dragState.index === index && dragState.type === 'top',
              'dragging': dragState.isDragging && dragState.index === index && dragState.type === 'top',
              'drag-ending': dragState.dragEnding && dragState.index === index && dragState.type === 'top'
            }"
            :style="{
              gridColumn: `${item.startCol} / span ${item.colSpan}`,
              gridRow: '1',
              cursor: isEditable ? 'move' : 'default'
            }"
            @mousedown="(e) => handleItemDragStart(e, 'top', index, item)"
          >
            <!-- 原有内容保持不变 -->
            <div v-if="isEditable" class="item-controls">
              <el-button 
                size="small" 
                type="danger" 
                icon="Delete" 
                @click.stop="handleTopDelete(index)"
              ></el-button>
              <div 
                class="col-resize-handle" 
                @mousedown.stop="(e) => handleColResizeStart(e, 'top', item, index)"
              >
                <el-icon><Rank /></el-icon>
              </div>
            </div>
            <div class="statistic_item">
              <div class="statistic_item_title">
                {{ item.typeName }}
              </div>
              <div class="statistic_item_data">
                <span class="data_number">{{ item.value }}</span>
                <span class="data_unit">{{ item.unit }}</span>
              </div>
              <div class="statistic_item_bg">
                <img :src="item.imageUrl" alt="">
              </div>
            </div>
          </div>

          <!-- 空位置渲染 -->
          <div
            v-for="pos in getTopEmptyPositions"
            :key="`top-empty-${pos}`"
            class="empty-slot top-empty-slot"
            @drop="(e) => handleTopDrop(e, pos)"
            @dragover="handleDragOver"
            :style="{
              gridColumn: `${pos}`,
              gridRow: '1'
            }"
          >
            {{ isEditable ? '拖拽组件到此处' : '' }}
            <!-- topItems.length === 0 -->
            <div v-if="!isEditable" v-loading="true" element-loading-text="加载中..." class="loading_div"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 下半区：数据分析区（严格3行3列） -->
    <div class="dashboard-section dashboard-section-bottom">
      <div class="bottom-grid-wrapper">
        <div class="dashboard-grid bottom-grid" ref="bottomGridRef">
          <div 
            ref="bottomDragPreviewRef"
            class="drag-preview"
          ></div>
          
          <!-- 核心修改：为每个组件添加唯一的拖拽状态判断 -->
          <div
            v-for="(item, index) in bottomItems"
            :key="`bottom-item-${index}_${item.moduleKey}`"
            class="dashboard-item"
            :class="{
              'component-animate': dragState.isDragging && dragState.index === index && dragState.type === 'bottom',
              'dragging': dragState.isDragging && dragState.index === index && dragState.type === 'bottom',
              'drag-ending': dragState.dragEnding && dragState.index === index && dragState.type === 'bottom'
            }"
            :style="{
              gridColumn: `${item.startCol} / span ${item.colSpan}`,
              gridRow: `${item.startRow} / span ${item.rowSpan}`,
              cursor: isEditable ? 'move' : 'default'
            }"
            @mousedown="(e) => handleItemDragStart(e, 'bottom', index, item)"
          > 
            <!-- 原有内容保持不变 -->
            <div v-if="isEditable" class="item-controls">
              <el-button 
                size="small" 
                type="danger" 
                icon="Delete" 
                @click.stop="handleBottomDelete(index)"
              ></el-button>
              <div 
                class="resize-handle" 
                @mousedown.stop="(e) => handleResizeStart(e, 'bottom', item, index)"
              ><el-icon><Rank /></el-icon></div>
            </div>
            <component 
              keep-alive
              :is="getCachedAsyncComponent(item.moduleName)"
              :ref="`analysis-comp-${item.moduleKey}`"
              v-bind="$attrs"
            />
          </div>

          <!-- 空位置渲染 -->
          <div
            v-for="pos in getBottomEmptyPositions"
            :key="`bottom-empty-${pos.row}-${pos.col}`"
            class="empty-slot bottom-empty-slot"
            @drop="(e) => handleBottomDrop(e, pos.row, pos.col)"
            @dragover="handleDragOver"
            :style="{
              gridColumn: `${pos.col}`,
              gridRow: `${pos.row}`
            }"
          >
            {{ isEditable ? '拖拽组件到此处' : '' }}
            <div v-if="!isEditable" v-loading="bottomItems.length === 0"  element-loading-text="加载中..." class="loading_div"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted, watch, shallowRef } from 'vue';
import { ElMessage } from 'element-plus';
import { getAsyncComponentById } from './statData/index'
import { getStats } from '@/api/home'
import img from '../components/analyze/1.png'

// 地图组件ID 数组
const chartArr = ['DistributionOfStudentUnits']
// 不可以进行拖动改变其 row 大小的ID数组
const NoCanChangeRowArr = ['BookReadingVolume', 'CourseCompletionRate', 'CourseVisits', 'NumberOfLecturesGivenByTeachers', 'RankingOfCertificateQuantityByUnit', 'UnitActivityRanking', 'UnitPerformanceRanking', 'ScoreDistribution', 'TeacherPopularity']

const props = defineProps({
  isEditable: {
    type: Boolean,
    default: false
  },
  topItems: {
    type: Array,
    default: () => []
  },
  bottomItems: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'add-top-item', 
  'add-bottom-item', 
  'remove-top-item',
  'remove-bottom-item',
  'resize-item',
  'reorder-item',
  'check-empty-positions'
]);

// 异步组件缓存
const asyncComponentCache = shallowRef({});
const getCachedAsyncComponent = (moduleName, type = false) => {
  if (!moduleName) return null;
  if (!asyncComponentCache.value[moduleName] || !!type) {
    asyncComponentCache.value[moduleName] = getAsyncComponentById(moduleName);
    !!currentChangeItem.value && (currentChangeItem.value = null);
  }
  return asyncComponentCache.value[moduleName];
};


// const statisticComponents = ref([]);
// const getStatsList = () => {
//   getStats().then(res => {
//     if(res.code == 200) {
//       statisticComponents.value = res.data.map(v => {
//         return {
//           ...v,
//           moduleType: 'statistic'
//         }
//       })
//       console.log(statisticComponents.value, '统计数据返回数据')
//     }
//   })
// }
// getStatsList()
// const getTopItemComs = (id) => {
//   return statisticComponents.value.filter(v => v.moduleName === id)
// }

// 核心状态
const topGridRef = ref(null);
const bottomGridRef = ref(null);
const topDragPreviewRef = ref(null);
const bottomDragPreviewRef = ref(null);

// 核心修改1：优化拖拽状态结构，增加lastDragInfo记录上一次拖拽信息
const dragState = ref({
  isDragging: false,
  type: '', 
  index: -1,
  item: null,
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0,
  startRect: null,
  gridLines: {
    cols: [],
    rows: []
  },
  currentGridPos: { col: 1, row: 1 },
  originalGridPos: { col: 1, row: 1 },
  isPositionValid: true,
  dragEnding: false,
  // 新增：记录上一次拖拽的组件信息，用于精准重置
  lastDragInfo: {
    type: '',
    index: -1
  }
});

const MAGNET_THRESHOLD = 20;
const gridInfo = ref({
  top: { colWidth: 0 },
  bottom: { colWidth: 0, rowHeight: 0 }
});

const resizeType = ref('');
const resizeIndex = ref(-1);
const resizeStartState = ref({
  startCol: 1,
  startRow: 1,
  colSpan: 1,
  rowSpan: 1,
  startX: 0,
  startY: 0,
  originalStartCol: 1,
  originalStartRow: 1
});
const currentItem = ref(null);

// 原有计算属性保持不变
const getTopOccupiedCols = computed(() => {
  const cols = [];
  props.topItems.forEach(item => {
    for (let c = item.startCol; c < item.startCol + item.colSpan; c++) {
      cols.push(c);
    }
  });
  return cols;
});

const getTopEmptyPositions = computed(() => {
  const emptyCols = [];
  for (let col = 1; col <= 6; col++) {
    if (!getTopOccupiedCols.value.includes(col)) {
      emptyCols.push(col);
    }
  }
  emit('check-empty-positions', {
    topEmptyCount: emptyCols.length,
    bottomEmptyCount: getBottomEmptyPositions.value.length
  });
  return emptyCols;
});

const getBottomOccupiedCells = computed(() => {
  const cells = [];
  props.bottomItems.forEach(item => {
    for (let r = item.startRow; r < item.startRow + item.rowSpan; r++) {
      for (let c = item.startCol; c < item.startCol + item.colSpan; c++) {
        cells.push({ row: r, col: c });
      }
    }
  });
  return cells;
});

const getBottomEmptyPositions = computed(() => {
  const emptyCells = [];
  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 3; col++) {
      const isOccupied = getBottomOccupiedCells.value.some(cell => cell.row === row && cell.col === col);
      if (!isOccupied) {
        emptyCells.push({ row, col });
      }
    }
  }
  return emptyCells;
});

// 原有方法保持不变
const checkBottomHasEnoughSpace = (startRow, startCol, rowSpan, colSpan, excludeIndex = -1) => {
  const endRow = startRow + rowSpan - 1;
  const endCol = startCol + colSpan - 1;
  
  if (startRow < 1 || endRow > 3 || startCol < 1 || endCol > 3) {
    return {
      hasEnoughSpace: false,
      message: '超出网格边界'
    };
  }

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const isOccupied = props.bottomItems.some((item, idx) => {
        if (idx === excludeIndex) return false;
        
        const itemEndRow = item.startRow + item.rowSpan - 1;
        const itemEndCol = item.startCol + item.colSpan - 1;
        
        return (
          r >= item.startRow && 
          r <= itemEndRow && 
          c >= item.startCol && 
          c <= itemEndCol
        );
      });
      
      if (isOccupied) {
        return {
          hasEnoughSpace: false,
          message: `位置(${r}, ${c})已被占用`,
          occupiedCell: { row: r, col: c }
        };
      }
    }
  }

  return {
    hasEnoughSpace: true,
    message: '空间足够'
  };
};

const validateNoEmptyPositions = () => {
  return new Promise((resolve, reject) => {
    const topEmpty = getTopEmptyPositions.value.length;
    const bottomEmpty = getBottomEmptyPositions.value.length;

    // console.log('验证空位：', topEmpty, bottomEmpty);
    
    const result = {
      isValid: topEmpty === 0 && bottomEmpty === 0,
      topEmpty,
      bottomEmpty,
      message: ''
    };
    
    if (topEmpty > 0 && bottomEmpty > 0) {
      result.message = `上方还有${topEmpty}个空位，下方还有${bottomEmpty}个空位，请填满后再保存！`;
    } else if (topEmpty > 0) {
      result.message = `上方还有${topEmpty}个空位，请填满后再保存！`;
    } else if (bottomEmpty > 0) {
      result.message = `下方还有${bottomEmpty}个空位，请填满后再保存！`;
    }
    
    resolve(result);
  })
};

const calculateGridInfo = () => {
  if (topGridRef.value) {
    const rect = topGridRef.value.getBoundingClientRect();
    gridInfo.value.top.colWidth = rect.width / 6;
  }
  if (bottomGridRef.value) {
    const rect = bottomGridRef.value.getBoundingClientRect();
    gridInfo.value.bottom.colWidth = rect.width / 3;
    gridInfo.value.bottom.rowHeight = rect.height / 3;
  }
};

const calculateGridLines = (isTop = false) => {
  const grid = isTop ? topGridRef.value : bottomGridRef.value;
  if (!grid) return { cols: [], rows: [] };
  
  const rect = grid.getBoundingClientRect();
  const cols = [];
  const rows = [];
  const colCount = isTop ? 6 : 3;
  const rowCount = isTop ? 1 : 3;

  for (let i = 0; i <= colCount; i++) {
    cols.push(rect.left + i * (rect.width / colCount));
  }

  if (!isTop) {
    for (let i = 0; i <= rowCount; i++) {
      rows.push(rect.top + i * (rect.height / rowCount));
    }
  }

  return { cols, rows };
};

const checkDragPositionValid = () => {
  const { type, currentGridPos, item, index } = dragState.value;
  
  if (type === 'top') {
    const targetCols = [];
    for (let c = currentGridPos.col; c < currentGridPos.col + item.colSpan; c++) {
      targetCols.push(c);
    }
    
    const isOverlap = props.topItems.some((i, idx) => {
      if (idx === index) return false;
      for (let c = i.startCol; c < i.startCol + i.colSpan; c++) {
        if (targetCols.includes(c)) return true;
      }
      return false;
    });
    
    const isOutOfBound = currentGridPos.col < 1 || 
                         (currentGridPos.col + item.colSpan - 1) > 6;
    
    return !isOverlap && !isOutOfBound;
  } else {
    const spaceCheck = checkBottomHasEnoughSpace(
      currentGridPos.row,
      currentGridPos.col,
      item.rowSpan,
      item.colSpan,
      index
    );
    return spaceCheck.hasEnoughSpace;
  }
};

const magnetAlignToGrid = (x, y, isTop = false) => {
  const grid = isTop ? topGridRef.value : bottomGridRef.value;
  if (!grid) return { col: 1, row: 1 };

  const rect = grid.getBoundingClientRect();
  const colCount = isTop ? 6 : 3;
  const rowCount = isTop ? 1 : 3;

  const colWidth = rect.width / colCount;
  let col = Math.floor((x - rect.left) / colWidth) + 1;
  col = Math.max(1, Math.min(col, colCount));

  let row = 1;
  if (!isTop) {
    const rowHeight = rect.height / rowCount;
    row = Math.floor((y - rect.top) / rowHeight) + 1;
    row = Math.max(1, Math.min(row, rowCount));
  }

  return { col, row };
};

const updateDragPreview = () => {
  if (topDragPreviewRef.value) {
    topDragPreviewRef.value.style.display = 'none';
  }
  if (bottomDragPreviewRef.value) {
    bottomDragPreviewRef.value.style.display = 'none';
  }
  
  if (!dragState.value.isDragging) return;
  
  const { type, currentGridPos, item, isPositionValid } = dragState.value;
  const previewEl = type === 'top' ? topDragPreviewRef.value : bottomDragPreviewRef.value;
  
  if (!previewEl) return;
  
  previewEl.style.display = 'block';
  previewEl.style.gridColumn = `${currentGridPos.col} / span ${item.colSpan}`;
  previewEl.style.zIndex = '99';
  
  if (type === 'top') {
    previewEl.style.gridRow = '1';
  } else {
    previewEl.style.gridRow = `${currentGridPos.row} / span ${item.rowSpan}`;
  }
  
  previewEl.style.backgroundColor = isPositionValid ? 'rgba(64, 158, 255, 0.2)' : 'rgba(255, 73, 73, 0.2)';
  previewEl.style.border = `2px dashed ${isPositionValid ? '#409eff' : '#ff4949'}`;
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
};

// 核心修改2：拖拽开始时重置上一次的拖拽状态
const handleItemDragStart = (e, type, index, item) => {
  if (!props.isEditable) return;
  e.preventDefault();
  
  if (e.target.classList.contains('col-resize-handle') || e.target.classList.contains('resize-handle')) {
    return;
  }

  // 关键：重置上一次的拖拽结束状态，避免干扰新的拖拽
  if (dragState.value.lastDragInfo.type && dragState.value.lastDragInfo.index !== -1) {
    dragState.value.dragEnding = false;
  }

  const target = e.target.closest('.dashboard-item');
  const rect = target.getBoundingClientRect();

  dragState.value = {
    isDragging: true,
    type,
    index,
    item: { ...item },
    startX: e.clientX,
    startY: e.clientY,
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
    startRect: rect,
    gridLines: calculateGridLines(type === 'top'),
    currentGridPos: {
      col: item.startCol,
      row: item.startRow || 1
    },
    originalGridPos: {
      col: item.startCol,
      row: item.startRow || 1
    },
    isPositionValid: true,
    dragEnding: false,
    // 记录当前拖拽的组件信息
    lastDragInfo: {
      type,
      index
    }
  };

  updateDragPreview();

  document.addEventListener('mousemove', handleItemDragMove);
  document.addEventListener('mouseup', handleItemDragEnd);
  document.addEventListener('mouseleave', handleItemDragEnd);

  target.classList.add('dragging');
};

let dragMoveTimer = null;
const handleItemDragMove = (e) => {
  if (!dragState.value.isDragging) return;
  
  if (dragMoveTimer) return;
  dragMoveTimer = setTimeout(() => {
    const { type, offsetX, offsetY } = dragState.value;
    const isTop = type === 'top';

    const targetLeft = e.clientX - offsetX;
    const targetTop = e.clientY - offsetY;

    const newGridPos = magnetAlignToGrid(e.clientX, e.clientY, isTop);
    
    if (newGridPos.col !== dragState.value.currentGridPos.col || 
        newGridPos.row !== dragState.value.currentGridPos.row) {
      dragState.value.currentGridPos = newGridPos;
      dragState.value.item.startCol = newGridPos.col;
      if (!isTop) {
        dragState.value.item.startRow = newGridPos.row;
      }
      
      dragState.value.isPositionValid = checkDragPositionValid();
      
      updateDragPreview();
    }
    
    dragMoveTimer = null;
  }, 16);
};

// 核心修改3：精准控制拖拽结束状态，只影响当前拖拽的组件
const handleItemDragEnd = (e) => {
  if (!dragState.value.isDragging) return;

  if (dragMoveTimer) {
    clearTimeout(dragMoveTimer);
    dragMoveTimer = null;
  }

  const { type, index, item, currentGridPos, originalGridPos, isPositionValid, lastDragInfo } = dragState.value;
  
  updateDragPreview();
  if (topDragPreviewRef.value) topDragPreviewRef.value.style.display = 'none';
  if (bottomDragPreviewRef.value) bottomDragPreviewRef.value.style.display = 'none';
  
  const isPositionChanged = currentGridPos.col !== originalGridPos.col || currentGridPos.row !== originalGridPos.row;
  
  if (!isPositionChanged) {
    const target = document.querySelector('.dragging');
    if (target) {
      target.classList.remove('dragging');
    }
    // 重置状态时保留lastDragInfo用于下次清空
    dragState.value = {
      ...dragState.value,
      isDragging: false,
      dragEnding: false,
      isPositionValid: true
    };
    document.removeEventListener('mousemove', handleItemDragMove);
    document.removeEventListener('mouseup', handleItemDragEnd);
    document.removeEventListener('mouseleave', handleItemDragEnd);
    return;
  }

  if (!isPositionValid) {
    ElMessage.warning('目标位置已被占用或超出边界，无法放置组件');
  } else {
    emit('reorder-item', type, index, {
      startCol: currentGridPos.col,
      startRow: currentGridPos.row || 1,
      colSpan: item.colSpan,
      rowSpan: item.rowSpan || 1
    });
  }

  // 关键：只标记当前拖拽组件的结束状态
  dragState.value.dragEnding = true;
  
  const target = document.querySelector('.dragging');
  if (target) {
    target.classList.remove('dragging');
    // 延迟重置仅当前组件的结束状态
    setTimeout(() => {
      dragState.value.dragEnding = false;
      // 保留lastDragInfo，在下一次拖拽开始时清空
    }, 300);
  }
  
  // 重置拖拽状态但保留lastDragInfo
  dragState.value = {
    ...dragState.value,
    isDragging: false,
    item: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    startRect: null,
    gridLines: { cols: [], rows: [] },
    currentGridPos: { col: 1, row: 1 },
    originalGridPos: { col: 1, row: 1 },
    isPositionValid: true
  };

  document.removeEventListener('mousemove', handleItemDragMove);
  document.removeEventListener('mouseup', handleItemDragEnd);
  document.removeEventListener('mouseleave', handleItemDragEnd);
};

// 原有调整逻辑保持不变
const checkTopColMergeValid = (newStartCol, newColSpan) => {
  const endCol = newStartCol + newColSpan - 1;
  
  if (newStartCol < 1 || endCol > 6) return false;

  const targetItem = props.topItems.find((item, idx) => {
    if (idx === resizeIndex.value) return false;
    const itemEndCol = item.startCol + item.colSpan - 1;
    return !(endCol < item.startCol || newStartCol > itemEndCol);
  });
  
  return !targetItem;
};

const handleColResizeStart = (e, type, item, index) => {
  if (!props.isEditable) return;
  e.preventDefault();
  
  resizeType.value = type;
  resizeIndex.value = index;
  currentItem.value = { ...item };
  
  resizeStartState.value = {
    startCol: item.startCol,
    startRow: 1,
    colSpan: item.colSpan,
    rowSpan: 1,
    startX: e.clientX,
    startY: 0,
    originalStartCol: item.startCol
  };

  document.addEventListener('mousemove', handleColResizeMove);
  document.addEventListener('mouseup', handleResizeEnd);
};

const handleColResizeMove = (e) => {
  if (resizeIndex.value === -1) return;
  
  const dx = e.clientX - resizeStartState.value.startX;
  const colWidth = gridInfo.value.top.colWidth || 50;
  const deltaCols = Math.round(dx / colWidth);

  let newStartCol = resizeStartState.value.originalStartCol;
  let newColSpan = resizeStartState.value.colSpan;

  if (deltaCols !== 0) {
    const originalEndCol = resizeStartState.value.originalStartCol + resizeStartState.value.colSpan - 1;
    const newEndCol = originalEndCol + deltaCols;

    if (deltaCols > 0) {
      newStartCol = resizeStartState.value.originalStartCol;
      newColSpan = newEndCol - newStartCol + 1;
    } else {
      if (newEndCol >= resizeStartState.value.originalStartCol) {
        newStartCol = resizeStartState.value.originalStartCol;
        newColSpan = newEndCol - newStartCol + 1;
      } else {
        newStartCol = newEndCol;
        newColSpan = resizeStartState.value.originalStartCol - newStartCol + resizeStartState.value.colSpan;
      }
    }
  }

  newColSpan = Math.max(1, newColSpan);
  const endCol = newStartCol + newColSpan - 1;
  if (endCol > 6) {
    newColSpan = 6 - newStartCol + 1;
  }
  if (newStartCol < 1) {
    newStartCol = 1;
    newColSpan = Math.min(newColSpan, 6);
  }

  if (checkTopColMergeValid(newStartCol, newColSpan)) {
    currentItem.value.startCol = newStartCol;
    currentItem.value.colSpan = newColSpan;
    emit('resize-item', resizeType.value, resizeIndex.value, newColSpan, 1, newStartCol);
  }
};

const checkBottomResizeValid = (newStartRow, newStartCol, newRowSpan, newColSpan) => {
  const spaceCheck = checkBottomHasEnoughSpace(
    newStartRow,
    newStartCol,
    newRowSpan,
    newColSpan,
    resizeIndex.value
  );
  return spaceCheck.hasEnoughSpace;
};

const currentChangeItem = ref(null);
const handleResizeStart = (e, type, item, index) => {
  if (!props.isEditable) return;
  e.preventDefault();
  
  resizeType.value = type;
  resizeIndex.value = index;
  currentItem.value = { ...item };
  currentChangeItem.value = JSON.parse(JSON.stringify(item));
  
  resizeStartState.value = {
    startCol: item.startCol,
    startRow: item.startRow,
    colSpan: item.colSpan,
    rowSpan: item.rowSpan,
    startX: e.clientX,
    startY: e.clientY,
    originalStartCol: item.startCol,
    originalStartRow: item.startRow
  };

  document.addEventListener('mousemove', handleResizeMove);
  document.addEventListener('mouseup', handleResizeEnd);
};

const handleResizeMove = (e) => {
  if (resizeIndex.value === -1) return;
  
  const dx = e.clientX - resizeStartState.value.startX;
  const dy = e.clientY - resizeStartState.value.startY;
  const colWidth = gridInfo.value.bottom.colWidth || 50;
  const rowHeight = gridInfo.value.bottom.rowHeight || 50;
  const deltaCols = Math.round(dx / colWidth);
  const deltaRows = Math.round(dy / rowHeight);

  let newStartCol = resizeStartState.value.originalStartCol;
  let newColSpan = resizeStartState.value.colSpan;
  let newStartRow = resizeStartState.value.originalStartRow;
  let newRowSpan = resizeStartState.value.rowSpan;

  if (deltaCols !== 0) {
    const originalEndCol = resizeStartState.value.originalStartCol + resizeStartState.value.colSpan - 1;
    const newEndCol = originalEndCol + deltaCols;

    if (deltaCols > 0) {
      newStartCol = resizeStartState.value.originalStartCol;
      newColSpan = newEndCol - newStartCol + 1;
    } else {
      if (newEndCol >= resizeStartState.value.originalStartCol) {
        newStartCol = resizeStartState.value.originalStartCol;
        newColSpan = newEndCol - newStartCol + 1;
      } else {
        newStartCol = newEndCol;
        newColSpan = resizeStartState.value.originalStartCol - newStartCol + resizeStartState.value.colSpan;
      }
    }
  }

  if (deltaRows !== 0) {
    const originalEndRow = resizeStartState.value.originalStartRow + resizeStartState.value.rowSpan - 1;
    const newEndRow = originalEndRow + deltaRows;

    if (deltaRows > 0) {
      newStartRow = resizeStartState.value.originalStartRow;
      newRowSpan = newEndRow - newStartRow + 1;
    } else {
      if (newEndRow >= resizeStartState.value.originalStartRow) {
        newStartRow = resizeStartState.value.originalStartRow;
        newRowSpan = newEndRow - newStartRow + 1;
      } else {
        newStartRow = newEndRow;
        newRowSpan = resizeStartState.value.originalStartRow - newStartRow + resizeStartState.value.rowSpan;
      }
    }
  }
  const isChartComponent = chartArr.includes(currentItem.value.moduleName);
  const noCanChangeRow = NoCanChangeRowArr.includes(currentItem.value.moduleName);

  newColSpan = Math.max(1, newColSpan);
  newRowSpan = isChartComponent ? Math.max(2, newRowSpan) : noCanChangeRow ? 1 :  Math.max(1, newRowSpan);
  const endCol = newStartCol + newColSpan - 1;
  const endRow = newStartRow + newRowSpan - 1;
  if (endCol > 3) newColSpan = 3 - newStartCol + 1;
  if (endRow > 3) newRowSpan = 3 - newStartRow + 1;
  if (newStartCol < 1) newStartCol = 1;
  if (newStartRow < 1) newStartRow = 1;

  if (checkBottomResizeValid(newStartRow, newStartCol, newRowSpan, newColSpan)) {
    currentItem.value.startRow = newStartRow;
    currentItem.value.startCol = newStartCol;
    currentItem.value.rowSpan = newRowSpan;
    currentItem.value.colSpan = newColSpan;
    emit('resize-item', resizeType.value, resizeIndex.value, newColSpan, newRowSpan, newStartCol, newStartRow);
  }
  // console.log(newRowSpan, newColSpan, currentChangeItem.value);
  // 确保组件重新渲染以适应新的跨度
  if(currentChangeItem.value.rowSpan !== newRowSpan || currentChangeItem.value.colSpan !== newColSpan){
    getCachedAsyncComponent(currentChangeItem.value.moduleName, true);
  }
};

const handleResizeEnd = () => {
  resizeType.value = '';
  resizeIndex.value = -1;
  resizeStartState.value = {
    startCol: 1,
    startRow: 1,
    colSpan: 1,
    rowSpan: 1,
    startX: 0,
    startY: 0,
    originalStartCol: 1,
    originalStartRow: 1
  };
  currentItem.value = null;
  
  document.removeEventListener('mousemove', handleColResizeMove);
  document.removeEventListener('mousemove', handleResizeMove);
  document.removeEventListener('mouseup', handleResizeEnd);
};

const handleTopDrop = (e, col) => {
  if (!props.isEditable) return;
  e.preventDefault();

  if (getTopOccupiedCols.value.includes(col)) {
    ElMessage.warning('该位置已被占用，请选择其他位置');
    return;
  }

  const dragData = JSON.parse(e.dataTransfer.getData('text'));
  if (dragData.type !== 'statistic') {
    ElMessage.warning('统计数据区仅允许放入统计数据组件');
    return;
  }

  emit('add-top-item', {
    typeKey: dragData.typeKey,
    typeName: dragData.typeName,
    type: dragData.type,
    value: dragData.value,
    unit: dragData.unit || '个',
    imageUrl: dragData.imageUrl || img,
    startCol: col,
    colSpan: 1
  });
};

const handleTopDelete = (index) => {
  emit('remove-top-item', index);
};

const handleBottomDrop = (e, row, col) => {
  if (!props.isEditable) return;
  e.preventDefault();

  const dragData = JSON.parse(e.dataTransfer.getData('text'));
  const isChartComponent = chartArr.includes(dragData.moduleName);

  // console.log(dragData, 'dragData')
  
  if (dragData.type !== 'analysis') {
    ElMessage.warning('数据分析区仅允许放入数据分析组件');
    return;
  }

  const rowSpan = isChartComponent ? 2 : 1;
  const colSpan = dragData.colSpan || 1;

  const spaceCheck = checkBottomHasEnoughSpace(row, col, rowSpan, colSpan);
  
  if (!spaceCheck.hasEnoughSpace) {
    ElMessage.warning(`无法放置组件`);
    return;
  }

  emit('add-bottom-item', {
    moduleKey: dragData.moduleKey,
    moduleName: dragData.moduleName,
    type: dragData.type,
    component: dragData.component || '',
    startRow: row,
    startCol: col,
    rowSpan: rowSpan,
    colSpan: colSpan
  });
};

const handleBottomDelete = (index) => {
  emit('remove-bottom-item', index);
};

onMounted(() => {
  setTimeout(() => {
    calculateGridInfo();
    calculateGridLines(true);
    calculateGridLines(false);
  }, 100);

  window.addEventListener('resize', calculateGridInfo);
});

watch([() => props.topItems, () => props.bottomItems], () => {
  setTimeout(calculateGridInfo, 50);
});

defineExpose({
  validateNoEmptyPositions
});
</script>

<style scoped>
/* 原有样式保持不变，新增drag-ending的样式控制 */
.dashboard-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 14px;
  padding: 0;
  margin: 0;
}

.dashboard-container > *:last-child {
  margin-bottom: -14px !important;
}

.dashboard-section {
  width: 100%;
  height: auto;
}

.top-grid-wrapper {
  width: 100%;
  height: 100px;
}

.dashboard-section-bottom {
  height: calc(100% - 100px - 14px);
}

.bottom-grid-wrapper {
  width: 100%;
  height: 100%;
}

.dashboard-grid {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 12px;
  box-sizing: border-box;
  position: relative;
}

.top-grid {
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: 100%; 
  gap: 12px;
  border-radius: 4px;
}

.bottom-grid {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 11px;
  background: #fff;
  border-radius: 6px;
}

.dashboard-item {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background: #fff;
  border: 1px solid #e6e8eb;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  transition: all .3s ease;
  user-select: none;
  -webkit-user-drag: none;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* 核心修改：精准控制动画触发，只对当前拖拽/结束的组件生效 */
.component-animate {
  transition: all 0.3s ease;
  z-index: 100;
}

/* 新增：拖拽结束的动画类，仅作用于当前组件 */
.drag-ending {
  transition: all 0.3s ease;
}

.dashboard-item.dragging {
  box-shadow: 0 8px 24px 0 rgba(64, 158, 255, 0.4);
  border-color: #409eff;
  z-index: 100;
  opacity: 0.8;
  transform: scale(0.9);
}

.bottom-grid .dashboard-item {
  border-radius: 6px;
}

.drag-preview {
  display: none;
  background: rgba(64, 158, 255, 0.2);
  border: 2px dashed #409eff;
  border-radius: 6px;
  box-sizing: border-box;
  transition: none !important;
  transform: translateZ(0);
  backface-visibility: hidden;
  pointer-events: none;
}

.item-controls {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  gap: 5px;
  z-index: 20;
}

.col-resize-handle {
  width: 36px;
  height: 24px;
  background: #409eff;
  cursor: ew-resize;
  margin-left: 5px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 30;
}

.resize-handle {
  width: 36px;
  height: 24px;
  background: #409eff;
  border-radius: 3px;
  cursor: move;
  z-index: 30;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-content {
  margin-top: 25px;
  height: calc(100% - 25px);
  overflow: auto;
  box-sizing: border-box;
}

.empty-slot {
  background: #F7F8FB;
  border: 1px dashed #e6e8eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  transition: background 0.2s ease;
  box-sizing: border-box;
}

.empty-slot:hover {
  background: #e8f4f8;
  border-color: #409eff;
}

.top-empty-slot {
  border-radius: 4px;
}

.bottom-empty-slot {
  border-radius: 6px;
}

.dashboard-grid > * {
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
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
    max-width: calc(100% - 40px - 40px);
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

  .loading_div{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-items: center;
  }
</style>