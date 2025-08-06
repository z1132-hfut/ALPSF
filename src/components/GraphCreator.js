import React, { useState } from 'react';
import { Row, Col, Form, Input, Button, message, Alert, Spin, Card, Space, Typography, Divider } from 'antd';
import { createL1Graph, createL2Graph, pollTaskStatus } from '../services/api';
import { RocketOutlined, BookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const GraphCreator = ({ addTask, showNotification }) => {
  const [l1Form] = Form.useForm();
  const [l2Form] = Form.useForm();
  const [l1Loading, setL1Loading] = useState(false);
  const [l2Loading, setL2Loading] = useState(false);

  const handleL1Submit = async (values) => {
    setL1Loading(true);
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
        l1Form.resetFields();
      }
    } catch (error) {
      showNotification('error', '创建失败', '创建L1图谱时出错');
    } finally {
      setL1Loading(false);
    }
  };

  const handleL2Submit = async (values) => {
    setL2Loading(true);
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
        l2Form.resetFields();
      } else {
        showNotification('warning', '创建失败', response.message);
      }
    } catch (error) {
      showNotification('error', '创建失败', '创建L2图谱时出错');
    } finally {
      setL2Loading(false);
    }
  };

  return (
    <Card
      // title={
      //   <Space>
      //     <BookOutlined style={{ color: 'white' }} />
      //     <Title level={4} style={{ margin: 0, color: 'white' }}>知识图谱创建</Title>
      //   </Space>
      // }
      // headStyle={{
      //   background: 'linear-gradient(90deg, #60a5fa, #36cffa)',
      //   borderTopLeftRadius: 12,
      //   borderTopRightRadius: 12
      // }}
      // style={{
      //   borderRadius: 12,
      //   boxShadow: '0 8px 32px rgba(24, 144, 255, 0.1)',
      //   border: 'none',
      // }}
      bodyStyle={{
        padding: 24,
      }}
    >
      <Row gutter={[24, 0]} style={{ margin: '-12px' }}>
        {/* L1 图谱创建 */}
        <Col
          xs={24}
          md={12}
          style={{
            padding: '12px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Card
            title={
              <Space>
                <Text strong style={{ fontSize: '16px', color: '#ffffff' }}>创建L1图谱</Text>
              </Space>
            }
            bordered={false}
            style={{
              flex: 1,
              borderRadius: '12px',
              boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)',
              border: '1px solid #f0f0f0'
            }}
            headStyle={{
              height: 20,
              background: '#92daff',
              borderBottom: '1px solid #f0f0f0',
              padding: '16px 24px',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12
            }}
            bodyStyle={{
              padding: '24px'
            }}
          >
            <Form form={l1Form} layout="vertical" onFinish={handleL1Submit}>
              <Form.Item
                label={<Text style={{ color: '#595959', fontWeight: 500 }}>学科/领域名称</Text>}
                name="keyword"
                rules={[{ required: true, message: '请输入学科或领域名称' }]}
              >
                <Input
                  placeholder="例如: Python编程, 机器学习"
                  size="large"
                  allowClear
                  style={{
                    borderRadius: '6px',
                    padding: '10px 12px'
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: '32px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={l1Loading}
                  size="large"
                  style={{
                    width: '40%',
                    borderRadius: '6px',
                    height: '44px',
                    fontWeight: 500,
                    background: 'linear-gradient(90deg, #1890ff, #36cffa)',
                    border: 'none',
                    boxShadow: 'none',
                    color: '#ffffff'
                  }}
                >
                  {l1Loading ? '创建中...' : '创建L1图谱'}
                </Button>
              </Form.Item>
            </Form>

            <Alert
              message={<Text style={{ fontWeight: 500 }}>L1图谱创建说明</Text>}
              description="L1图谱代表一个完整的学科或知识领域的学习大纲。创建过程可能需要一些时间，请耐心等待。"
              type="info"
              showIcon
              style={{
                marginTop: '24px',
                borderRadius: '6px',
                border: '1px solid #e6f7ff',
                backgroundColor: '#f6fbff'
              }}
            />
          </Card>
        </Col>

        {/* L2 图谱创建 */}
        <Col
          xs={24}
          md={12}
          style={{
            padding: '12px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Card
            title={
              <Space>
                <Text strong style={{ fontSize: '16px', color: '#ffffff' }}>创建L2图谱</Text>
              </Space>
            }
            bordered={false}
            style={{
              height: 20,
              flex: 1,
              borderRadius: '12px',
              boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)',
              border: '1px solid #f0f0f0'
            }}
            headStyle={{
              background: '#92c5ff',
              borderBottom: '1px solid #f0f0f0',
              padding: '16px 24px',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12
            }}
            bodyStyle={{
              padding: '24px'
            }}
          >
            <Form form={l2Form} layout="vertical" onFinish={handleL2Submit}>
              <Form.Item
                label={<Text style={{ color: '#595959', fontWeight: 500 }}>所属L1图谱ID</Text>}
                name="parentId"
                rules={[{ required: true, message: '请输入父级L1图谱ID' }]}
              >
                <Input
                  placeholder="例如: e8a3b1c4-..."
                  size="large"
                  allowClear
                  style={{
                    borderRadius: '6px',
                    padding: '10px 12px'
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<Text style={{ color: '#595959', fontWeight: 500 }}>具体知识点</Text>}
                name="keyword"
                rules={[{ required: true, message: '请输入要展开的具体知识点' }]}
              >
                <Input
                  placeholder="例如: Python数据结构, 神经网络"
                  size="large"
                  allowClear
                  style={{
                    borderRadius: '6px',
                    padding: '10px 12px'
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: '32px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={l2Loading}
                  size="large"
                  style={{
                    width: '40%',
                    borderRadius: '6px',
                    height: '44px',
                    fontWeight: 500,
                    background: 'linear-gradient(90deg, #1890ff, #36cffa)',
                    border: 'none',
                    boxShadow: 'none',
                    color: '#ffffff'
                  }}
                >
                  {l2Loading ? '创建中...' : '创建L2图谱'}
                </Button>
              </Form.Item>
            </Form>

            <Alert
              message={<Text style={{ fontWeight: 500 }}>L2图谱创建说明</Text>}
              description="L2图谱是L1中某个具体知识点的详细展开。请确保输入的L1图谱ID存在，且知识点属于该L1图谱的内容。"
              type="info"
              showIcon
              style={{
                marginTop: '24px',
                borderRadius: '6px',
                border: '1px solid #e6f7ff',
                backgroundColor: '#f6fbff'
              }}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default GraphCreator;