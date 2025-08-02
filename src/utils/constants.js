// API相关常量
export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed'
};

// 任务状态常量
export const TASK_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PENDING: 'pending'
};

// 知识图谱类型
export const GRAPH_TYPES = {
  LEVEL1: 'level1',
  LEVEL2: 'level2'
};

// 默认分页设置
export const PAGINATION_CONFIG = {
  PAGE_SIZE: 10,
  CURRENT_PAGE: 1
};

// 通知持续时间(毫秒)
export const NOTIFICATION_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 4000,
  WARNING: 4500
};

// 知识图谱内容解析正则
export const CONTENT_PARSING_REGEX = {
  MAIN_TOPICS: /^\d+\.\s(.+)$/gm,       // 匹配"1. 主题"格式
  SUB_TOPICS: /^\s*-\s(.+)$/gm          // 匹配"  - 子主题"格式
};

// 默认空状态文本
export const EMPTY_TEXT = {
  GRAPHS: '暂无知识图谱数据',
  TASKS: '暂无进行中的任务',
  MESSAGES: '暂无对话消息'
};