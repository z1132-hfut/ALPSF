import React, { useState } from 'react';
import { Layout, Menu, Spin, notification } from 'antd';
import {
  BookOutlined,
  PlusOutlined,
  MessageOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import GraphBrowser from './components/GraphBrowser';
import GraphCreator from './components/GraphCreator';
import LearningChat from './components/LearningChat';
import TaskMonitor from './components/TaskMonitor';
import './index.css';

const { Header, Content } = Layout;

function App() {
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);

  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  const updateTask = (taskId, updates) => {
    setTasks(tasks.map(task =>
      task.task_id === taskId ? { ...task, ...updates } : task
    ));
  };

  const showNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: 'bottomRight',
      className: 'modern-notification'
    });
  };

  // 平滑切换标签页
  const handleTabChange = (key) => {
    setLoading(true);
    setTimeout(() => {
      setActiveTab(key);
      setLoading(false);
    }, 300);
  };

  return (
    <Layout className="modern-layout" style={{
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#e7f1fd'
    }}>
      <Header className="modern-header" style={{
        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        padding: '0 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        height: '72px',
        zIndex: 10
      }}>
        <div className="logo" style={{
          color: '#fff',
          fontSize: '22px',
          fontWeight: '700',
          marginRight: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div className="logo-icon" style={{
            width: '36px',
            height: '36px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}>
            <BookOutlined style={{ fontSize: '18px', color: 'white' }} />
          </div>
          <span style={{
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(90deg, #fff, #e0e7ff)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            自适应学习路径规划
          </span>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[activeTab]}
          style={{
            flex: 1,
            background: 'transparent',
            borderBottom: 'none',
            fontSize: '15px',
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '8px'
          }}
          onSelect={({ key }) => handleTabChange(key)}
        >
          <Menu.Item
            key="browse"
            icon={<BookOutlined style={{ fontSize: '18px' }} />}
            className="modern-menu-item"
          >
            知识图谱
          </Menu.Item>
          <Menu.Item
            key="create"
            icon={<PlusOutlined style={{ fontSize: '18px' }} />}
            className="modern-menu-item"
          >
            创建图谱
          </Menu.Item>
          <Menu.Item
            key="learn"
            icon={<MessageOutlined style={{ fontSize: '18px' }} />}
            className="modern-menu-item"
          >
            智能对话
          </Menu.Item>
          <Menu.Item
            key="tasks"
            icon={<DashboardOutlined style={{ fontSize: '18px'}} />}
            className="modern-menu-item"
          >
            任务中心
          </Menu.Item>
        </Menu>
      </Header>
      <Layout style={{
        background: 'transparent',
        marginTop: '24px',
        padding: '0 24px'
      }}>
        <Content
          className="modern-content"
          style={{
            padding: '24px',
            margin: 0,
            minHeight: 'calc(100vh - 96px)',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(226, 232, 240, 0.7)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* 装饰性元素 */}
          <div className="content-decoration" style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
            zIndex: 0
          }}></div>

          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Spin
                size="large"
                indicator={
                  <div className="modern-spinner" style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid #e2e8f0',
                    borderTop: '4px solid #6366f1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                }
              />
              <p style={{
                marginTop: '16px',
                color: '#64748b',
                fontWeight: '500'
              }}>加载中...</p>
            </div>
          ) : (
            <div className="content-wrapper" style={{
              position: 'relative',
              zIndex: 1,
              opacity: loading ? 0 : 1,
              transform: loading ? 'translateY(10px)' : 'translateY(0)',
              transition: 'all 0.3s ease'
            }}>
              {activeTab === 'browse' && <GraphBrowser showNotification={showNotification} />}
              {activeTab === 'create' && (
                <GraphCreator
                  addTask={addTask}
                  showNotification={showNotification}
                />
              )}
              {activeTab === 'learn' && (
                <div style={{ height: '70vh' }}>
                  <LearningChat showNotification={showNotification} />
                </div>
              )}
              {activeTab === 'tasks' && (
                <TaskMonitor
                  tasks={tasks}
                  updateTask={updateTask}
                  showNotification={showNotification}
                />
              )}
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;