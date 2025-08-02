import {
  API_STATUS,
  TASK_STATUS,
  CONTENT_PARSING_REGEX,
  NOTIFICATION_DURATION
} from './constants';

/**
 * 格式化时间戳为可读时间
 * @param {number} timestamp - Unix时间戳
 * @returns {string} 格式化后的时间字符串
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '未知时间';
  return new Date(timestamp * 1000).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 解析知识图谱内容为树形结构
 * @param {string} content - 原始图谱内容
 * @returns {Array} 解析后的树形结构数据
 */
export const parseGraphContent = (content) => {
  if (!content) return [];

  const lines = content.split('\n').filter(line => line.trim());
  const result = [];
  let currentTopic = null;

  lines.forEach(line => {
    // 检测主主题 (如 "1. 主题")
    const mainTopicMatch = line.match(CONTENT_PARSING_REGEX.MAIN_TOPICS);
    if (mainTopicMatch) {
      currentTopic = {
        title: mainTopicMatch[1],
        key: `${result.length}`,
        children: []
      };
      result.push(currentTopic);
      return;
    }

    // 检测子主题 (如 "  - 子主题")
    const subTopicMatch = line.match(CONTENT_PARSING_REGEX.SUB_TOPICS);
    if (subTopicMatch && currentTopic) {
      currentTopic.children.push({
        title: subTopicMatch[1],
        key: `${currentTopic.key}-${currentTopic.children.length}`
      });
    }
  });

  return result;
};

/**
 * 显示通知消息的包装函数
 * @param {function} notification - 原始通知函数
 * @param {string} type - 消息类型 (success|error|info|warning)
 * @param {string} message - 消息标题
 * @param {string} description - 消息描述
 */
export const showSmartNotification = (notification, type, message, description) => {
  notification[type]({
    message,
    description,
    duration: NOTIFICATION_DURATION[type.toUpperCase()] || 4000
  });
};

/**
 * 处理API错误
 * @param {Error} error - 错误对象
 * @param {function} dispatch - 状态更新函数(可选)
 * @param {string} actionType - 动作类型(可选)
 * @returns {string} 错误消息
 */
export const handleApiError = (error, dispatch = null, actionType = null) => {
  let errorMessage = '请求过程中发生错误';

  if (error.response) {
    // 服务器返回的错误响应
    errorMessage = error.response.data?.message ||
                  error.response.statusText ||
                  `服务器错误 (${error.response.status})`;
  } else if (error.request) {
    // 请求已发出但没有收到响应
    errorMessage = '网络错误，请检查您的连接';
  }

  if (dispatch && actionType) {
    dispatch({
      type: actionType,
      payload: { status: API_STATUS.FAILED, error: errorMessage }
    });
  }

  return errorMessage;
};

/**
 * 防抖函数
 * @param {function} func - 要执行的函数
 * @param {number} delay - 延迟时间(毫秒)
 * @returns {function} 防抖后的函数
 */
export const debounce = (func, delay = 300) => {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * 节流函数
 * @param {function} func - 要执行的函数
 * @param {number} limit - 时间限制(毫秒)
 * @returns {function} 节流后的函数
 */
export const throttle = (func, limit = 300) => {
  let lastFunc;
  let lastRan;
  return function(...args) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9) +
         Date.now().toString(36);
};

/**
 * 验证是否为有效的图谱ID
 * @param {string} id - 要验证的ID
 * @returns {boolean} 是否有效
 */
export const isValidGraphId = (id) => {
  return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id);
};

/**
 * 深度合并对象
 * @param {object} target - 目标对象
 * @param {object} source - 源对象
 * @returns {object} 合并后的对象
 */
export const deepMerge = (target, source) => {
  const output = { ...target };
  if (typeof target !== 'object' || typeof source !== 'object') {
    return source;
  }

  Object.keys(source).forEach(key => {
    if (source[key] instanceof Object && key in target) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });

  return output;
};