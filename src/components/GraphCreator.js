import React, { useState } from 'react';
import { Tabs, Form, Input, Button, Select, message, Alert, Spin, Card, Space, Typography } from 'antd';
import { createL1Graph, createL2Graph, pollTaskStatus } from '../services/api';
import { RocketOutlined, BookOutlined, PlusOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

const GraphCreator = ({ addTask, showNotification }) => {
  const [activeTab, setActiveTab] = useState('l1');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleL1Submit = async (values) => {
    setIsSubmitting(true);
    setLoading(true);
    try {
      const response = await createL1Graph(values.keyword);
      if (response.success) {
        const task = {
          task_id: response.task_id,
          type: 'L1图谱创建',
          keyword: values.keyword,
          status: 'processing'
        };
        addTask(task);

        const finalStatus = await pollTaskStatus(response.task_id);
        updateTask(response.task_id, {
          status: finalStatus.error ? 'failed' : 'completed',
          message: finalStatus.error || '任务完成',
          result: finalStatus.result
        });

        message.success({
          content: 'L1图谱创建完成!',
          icon: <RocketOutlined style={{ color: '#52c41a' }} />,
        });
        form.resetFields();
      }
    } catch (error) {
      showNotification('error', '创建失败', '创建L1图谱时出错');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleL2Submit = async (values) => {
    setIsSubmitting(true);
    setLoading(true);
    try {
      const response = await createL2Graph(values.keyword, values.parentId);
      if (response.success) {
        addTask({
          task_id: response.task_id,
          type: 'L2图谱创建',
          keyword: values.keyword,
          parent_id: values.parentId,
          status: 'processing'
        });
        message.success({
          content: 'L2图谱创建任务已启动!',
          icon: <RocketOutlined style={{ color: '#52c41a' }} />,
        });
        form.resetFields();
      } else {
        showNotification('warning', '创建失败', response.message);
      }
    } catch (error) {
      showNotification('error', '创建失败', '创建L2图谱时出错');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <PlusOutlined style={{ color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>知识图谱创建</Title>
        </Space>
      }
      bordered={false}
      style={{
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarStyle={{ marginBottom: 24 }}
        animated={{ inkBar: true, tabPane: true }}
      >
        <TabPane
          tab={
            <span>
              <BookOutlined />
              <span style={{ marginLeft: 8 }}>创建L1图谱</span>
            </span>
          }
          key="l1"
        >
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleL1Submit}
            >
              <Form.Item
                label={<Text strong>学科/领域名称</Text>}
                name="keyword"
                rules={[{ required: true, message: '请输入学科或领域名称' }]}
              >
                <Input
                  placeholder="例如: Python编程, 机器学习"
                  size="large"
                  allowClear
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  size="large"
                  style={{ width: '100%' }}
                  icon={<RocketOutlined />}
                >
                  {isSubmitting ? '创建中...' : '创建L1图谱'}
                </Button>
              </Form.Item>
            </Form>

            <Alert
              message={<Text strong>L1图谱创建说明</Text>}
              description="L1图谱代表一个完整的学科或知识领域的学习大纲。创建过程可能需要一些时间，请耐心等待。"
              type="info"
              showIcon
              style={{
                marginTop: 24,
                borderRadius: 6
              }}
            />
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BookOutlined />
              <span style={{ marginLeft: 8 }}>创建L2图谱</span>
            </span>
          }
          key="l2"
        >
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleL2Submit}
            >
              <Form.Item
                label={<Text strong>所属L1图谱ID</Text>}
                name="parentId"
                rules={[{ required: true, message: '请输入父级L1图谱ID' }]}
              >
                <Input
                  placeholder="例如: e8a3b1c4-..."
                  size="large"
                  allowClear
                />
              </Form.Item>

              <Form.Item
                label={<Text strong>具体知识点</Text>}
                name="keyword"
                rules={[{ required: true, message: '请输入要展开的具体知识点' }]}
              >
                <Input
                  placeholder="例如: Python数据结构, 神经网络"
                  size="large"
                  allowClear
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  size="large"
                  style={{ width: '100%' }}
                  icon={<RocketOutlined />}
                >
                  {isSubmitting ? '创建中...' : '创建L2图谱'}
                </Button>
              </Form.Item>
            </Form>

            <Alert
              message={<Text strong>L2图谱创建说明</Text>}
              description="L2图谱是L1中某个具体知识点的详细展开。请确保输入的L1图谱ID存在，且知识点属于该L1图谱的内容。"
              type="info"
              showIcon
              style={{
                marginTop: 24,
                borderRadius: 6
              }}
            />
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default GraphCreator;