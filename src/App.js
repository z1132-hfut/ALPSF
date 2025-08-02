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

const { Header, Content, Sider } = Layout;

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
      placement: 'bottomRight'
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header">
        <div className="logo">自适应学习路径规划系统</div>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            style={{ height: '100%', borderRight: 0 }}
            onSelect={({ key }) => setActiveTab(key)}
          >
            <Menu.Item key="browse" icon={<BookOutlined />}>
              浏览知识图谱
            </Menu.Item>
            <Menu.Item key="create" icon={<PlusOutlined />}>
              创建新图谱
            </Menu.Item>
            <Menu.Item key="learn" icon={<MessageOutlined />}>
              学习对话
            </Menu.Item>
            <Menu.Item key="tasks" icon={<DashboardOutlined />}>
              任务监控
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                {activeTab === 'browse' && <GraphBrowser showNotification={showNotification} />}
                {activeTab === 'create' && (
                  <GraphCreator
                    addTask={addTask}
                    showNotification={showNotification}
                  />
                )}
                {activeTab === 'learn' && <LearningChat showNotification={showNotification} />}
                {activeTab === 'tasks' && (
                  <TaskMonitor
                    tasks={tasks}
                    updateTask={updateTask}
                    showNotification={showNotification}
                  />
                )}
              </>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;

