import React, { useState, useEffect } from 'react';
import { List, Card, Tag, Button, Badge, Spin, Empty, Popover, Progress } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { getTaskStatus } from '../services/api';

const MAX_POLLING_ATTEMPTS = 60; // 最大轮询次数（5分钟）
const POLLING_INTERVAL = 5000; // 轮询间隔5秒

const TaskMonitor = ({ tasks, updateTask, showNotification }) => {
  const [loading, setLoading] = useState(false);
  const [pollingCounts, setPollingCounts] = useState({});
  const [pollingInterval, setPollingInterval] = useState(null);

  // 更新轮询计数
  const incrementPollingCount = (taskId) => {
    setPollingCounts(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || 0) + 1
    }));
  };

  // 检查单个任务状态
  const checkSingleTaskStatus = async (task) => {
    if (task.status !== 'processing') return;

    try {
      incrementPollingCount(task.task_id);
      const status = await getTaskStatus(task.task_id);

      if (status.error) {
        updateTask(task.task_id, {
          status: 'failed',
          message: status.error,
          updatedAt: Date.now()
        });
      } else if (status.completed) {
        updateTask(task.task_id, {
          status: 'completed',
          message: status.message || '任务完成',
          result: status.result,
          updatedAt: Date.now()
        });
      }
      // 其他状态保持processing不变
    } catch (error) {
      console.error(`检查任务 ${task.task_id} 状态失败:`, error);
      // 不更新任务状态，等待下次轮询
    }
  };

  // 检查所有任务状态
  const checkTasksStatus = async () => {
    setLoading(true);
    try {
      const processingTasks = tasks.filter(t => t.status === 'processing');
      await Promise.all(processingTasks.map(checkSingleTaskStatus));
    } catch (error) {
      showNotification('error', '状态检查失败', '获取任务状态时出错');
    } finally {
      setLoading(false);
    }
  };

  // 启动/停止轮询
  useEffect(() => {
    const hasProcessingTasks = tasks.some(t => t.status === 'processing');
    const hasExceededLimits = tasks.some(t =>
      t.status === 'processing' && pollingCounts[t.task_id] >= MAX_POLLING_ATTEMPTS
    );

    if (hasProcessingTasks && !hasExceededLimits) {
      const interval = setInterval(checkTasksStatus, POLLING_INTERVAL);
      setPollingInterval(interval);

      // 立即执行一次检查
      checkTasksStatus();

      return () => clearInterval(interval);
    } else if (hasExceededLimits) {
      // 处理超时任务
      tasks.forEach(task => {
        if (pollingCounts[task.task_id] >= MAX_POLLING_ATTEMPTS && task.status === 'processing') {
          updateTask(task.task_id, {
            status: 'failed',
            message: '任务处理超时',
            updatedAt: Date.now()
          });
        }
      });

      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [tasks, pollingCounts]);

  // 状态标签
  const getStatusTag = (status) => {
    switch (status) {
      case 'processing':
        return <Tag icon={<SyncOutlined spin />} color="processing">进行中</Tag>;
      case 'completed':
        return <Tag icon={<CheckCircleOutlined />} color="success">已完成</Tag>;
      case 'failed':
        return <Tag icon={<CloseCircleOutlined />} color="error">失败</Tag>;
      default:
        return <Tag icon={<ClockCircleOutlined />} color="default">等待中</Tag>;
    }
  };

  // 任务持续时间计算
  const getDuration = (task) => {
    if (!task.createdAt) return '';
    const endTime = task.updatedAt || Date.now();
    const duration = Math.floor((endTime - task.createdAt) / 1000);
    return `${duration}秒`;
  };

  return (
    <Card
      title="后台任务监控"
      extra={<Button 
        icon={<SyncOutlined />} 
        onClick={checkTasksStatus}
        className="refresh-button"
      >手动刷新</Button>}
      loading={loading}
      headStyle={{ 
        background: 'linear-gradient(90deg, #1890ff, #096dd9)',
        color: 'white',
        borderRadius: '8px 8px 0 0'
      }}
      bodyStyle={{ padding: '16px 24px' }}
      style={{ 
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease'
      }}
    >
      {tasks.length === 0 ? (
        <Empty description="暂无进行中的任务" imageStyle={{ height: 60 }} />
      ) : (
        <List
          dataSource={tasks}
          renderItem={(task) => (
            <List.Item
              style={{
                padding: '16px',
                margin: '8px 0',
                background: '#fafafa',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                ':hover': { boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)' }
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge
                    status={
                      task.status === 'processing' ? 'processing' :
                      task.status === 'completed' ? 'success' : 'error'
                    }
                  />
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{task.type}: {task.keyword}</span>
                    {task.status === 'processing' && (
                      <Popover content={`已轮询 ${pollingCounts[task.task_id] || 0}次`}>
                        <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
                      </Popover>
                    )}
                  </div>
                }
                description={
                  <>
                    <div>任务ID: {task.task_id}</div>
                    <div>状态: {getStatusTag(task.status)} {task.status === 'processing' && (
                      <Progress 
                        percent={Math.min(100, ((pollingCounts[task.task_id] || 0) / MAX_POLLING_ATTEMPTS * 100))}
                        size="small"
                        status="active"
                        strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                        style={{ width: 200, display: 'inline-block', marginLeft: 10 }}
                      />
                    )}</div>
                    <div>持续时间: {getDuration(task)}</div>
                    {task.message && <div>消息: {task.message}</div>}
                    {task.parent_id && <div>父图谱ID: {task.parent_id}</div>}
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default TaskMonitor;