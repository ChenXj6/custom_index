import { defineAsyncComponent } from 'vue'

/**
 * 自动导入当前目录下的所有 Vue 组件
 * 使用 import.meta.glob 批量导入
 */

// 使用 glob 导入当前目录下的所有 vue 文件
const modules = import.meta.glob('./components/*.vue', { eager: true })

// 组件集合
const components = {}

// 遍历所有模块
Object.keys(modules).forEach(filePath => {
  // 获取文件名（不带扩展名）
  const fileName = filePath.replace('./components/', '').replace('.vue', '')
  
  // 跳过 index 文件
  if (fileName === 'index') return
  
  // 转换为 PascalCase 命名
  const componentName = fileName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  
  // 注册组件
  components[componentName] = modules[filePath].default || modules[filePath]
})

// 导出所有组件
export default components

// 也可以导出为命名导出
export const {
  // 这里会自动解构出所有组件
  // 例如：如果有 user-stat.vue，这里就会有 UserStat
  ...allComponents
} = components

// 或者导出具体的组件（如果需要）
// export const UserStat = components.UserStat
// export const DataChart = components.DataChart

/**
 * 获取异步组件列表（用于动态渲染）
 */
export function getAsyncComponents() {
  const asyncModules = import.meta.glob('./components/*.vue')
  
  const componentList = []
  
  Object.entries(asyncModules).forEach(([filePath, importFn]) => {
    const fileName = filePath.replace('./components/', '').replace('.vue', '')
    
    if (fileName === 'index') return
    
    const componentName = fileName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    
    componentList.push({
      moduleKey: componentName,
      moduleName: componentName,
      type: 'analysis', // 补充组件分类，适配拖拽逻辑
      component: defineAsyncComponent(() => 
        importFn().then(module => module.default || module)
      )
    })
  })
  
  return componentList
}

/**
 * 获取所有组件的配置信息（不加载组件本身）
 */
export function getComponentInfos() {
  const modules = import.meta.glob('./components/*.vue')
  
  const infos = []
  
  Object.keys(modules).forEach(filePath => {
    const fileName = filePath.replace('./components/', '').replace('.vue', '')
    
    if (fileName === 'index') return
    
    const componentName = fileName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    
    infos.push({
      id: fileName,
      name: componentName,
      fileName: fileName,
      path: filePath,
      importFn: modules[filePath]
    })
  })
  
  return infos
}

/**
 * 创建可渲染的组件列表
 */
export async function createRenderableComponents() {
  const modules = import.meta.glob('./components/*.vue', { eager: false })
  
  const components = []
  
  for (const [filePath, importFn] of Object.entries(modules)) {
    const fileName = filePath.replace('./components/', '').replace('.vue', '')
    
    if (fileName === 'index') continue
    
    const componentName = fileName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    
    try {
      const module = await importFn()
      
      components.push({
        id: fileName,
        name: componentName,
        component: module.default || module
      })
    } catch (error) {
      console.error(`加载组件 ${componentName} 失败:`, error)
      
      // 创建错误占位符组件
      components.push({
        id: fileName,
        name: componentName,
        component: {
          name: componentName,
          template: `<div class="component-error" style="padding: 20px; color: #f56c6c;">
            <h4>组件加载失败: ${fileName}</h4>
            <p>${error.message}</p>
          </div>`,
          setup() {
            return {}
          }
        }
      })
    }
  }
  
  return components
}
// 在现有代码基础上添加以下方法

/**
 * 【新增】根据组件ID获取异步组件（可直接在<component :is>中使用）
 * @param {string} componentId - 组件ID（文件名，不带.vue扩展名）
 * @returns {Object} Vue异步组件对象，可直接在<component :is>中使用
 */
export function getAsyncComponentById(componentId) {
  // 检查传入的componentId
  if (!componentId) {
    console.error('组件ID不能为空');
    return createErrorComponent(`组件ID为空`);
  }
  
  // 构建文件路径
  const filePath = `./components/${componentId}.vue`;
  
  // 检查文件是否存在
  const modules = import.meta.glob('./components/*.vue');
  
  if (!modules[filePath]) {
    console.error(`组件不存在: ${componentId}`);
    return createErrorComponent(`组件 ${componentId} 不存在`);
  }
  
  const importFn = modules[filePath];
  
  // 创建异步组件
  const asyncComponent = defineAsyncComponent(() => 
    importFn()
      .then(module => module.default || module)
      .catch(error => {
        console.error(`加载组件 ${componentId} 失败:`, error);
        return createErrorComponent(`加载组件 ${componentId} 失败: ${error.message}`);
      })
  );
  
  return asyncComponent;
}

/**
 * 【新增】根据组件ID获取包含组件信息的对象
 * @param {string} componentId - 组件ID（文件名，不带.vue扩展名）
 * @returns {Object} 包含完整信息的组件对象
 */
export function getComponentInfoById(componentId) {
  if (!componentId) return null;
  
  const fileName = componentId;
  const componentName = fileName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  
  return {
    id: fileName,
    name: componentName,
    type: 'analysis',
    component: getAsyncComponentById(componentId)
  };
}

/**
 * 【新增】批量根据组件ID列表获取组件
 * @param {Array<string>} componentIds - 组件ID数组
 * @returns {Array<Object>} 组件对象数组
 */
export function getComponentsByIds(componentIds) {
  if (!Array.isArray(componentIds)) return [];
  
  return componentIds
    .map(id => getComponentInfoById(id))
    .filter(Boolean);
}

/**
 * 【新增】获取所有可用的组件ID列表
 * @returns {Array<string>} 组件ID数组
 */
export function getAllComponentIds() {
  const modules = import.meta.glob('./components/*.vue');
  
  return Object.keys(modules)
    .map(filePath => filePath.replace('./components/', '').replace('.vue', ''))
    .filter(fileName => fileName !== 'index');
}

/**
 * 【新增】创建错误组件
 */
function createErrorComponent(message) {
  return {
    name: 'ErrorComponent',
    template: `
      <div class="component-error" style="
        padding: 20px;
        border: 1px solid #f56c6c;
        border-radius: 4px;
        color: #f56c6c;
        background: #fef0f0;
      ">
        <h4 style="margin: 0 0 8px 0;">组件错误</h4>
        <p style="margin: 0;">${message}</p>
      </div>
    `
  };
}

/**
 * 【新增】快速获取组件（缓存版本，避免重复创建）
 */
const componentCache = new Map();

export function getCachedAsyncComponent(componentId) {
  if (componentCache.has(componentId)) {
    return componentCache.get(componentId);
  }
  
  const component = getAsyncComponentById(componentId);
  componentCache.set(componentId, component);
  
  return component;
}