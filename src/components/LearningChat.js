import React, { useState, useRef, useEffect } from 'react';
import {
  Input,
  Button,
  Card,
  List,
  Avatar,
  Select,
  Divider,
  Spin,
  message,
  Form // 添加Form导入
} from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import { streamChat } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;
const { Item } = Form; // 获取Form.Item的快捷方式

const LearningChat = ({ showNotification }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextLevel, setContextLevel] = useState('level1');
  const [contextId, setContextId] = useState(null);
  const messagesEndRef = useRef(null);
  const [form] = Form.useForm(); // 初始化表单实例

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      content: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // 添加临时消息占位
      setMessages(prev => [...prev, {
        content: '...',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isStreaming: true
      }]);

      // 这里需要根据实际的streamChat实现调整
      const response = await streamChat(inputValue, contextLevel, contextId);

      // 假设streamChat返回完整响应（实际可能是流式）
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last.isStreaming) {
          return [...prev.slice(0, -1), {
            ...last,
            content: response.content || response,
            isStreaming: false
          }];
        }
        return prev;
      });
    } catch (error) {
      showNotification('error', '发送失败', error.message);
      setMessages(prev => [...prev, {
        content: '抱歉，与AI导师通信时出错',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card
        title="AI学习导师"
        extra={
          <Select
            defaultValue="level1"
            style={{ width: 120 }}
            onChange={setContextLevel}
          >
            <Option value="level1">Level 1 上下文</Option>
            <Option value="level2">Level 2 上下文</Option>
          </Select>
        }
      >
        <div style={{ height: 500, overflowY: 'auto', marginBottom: 16 }}>
          <List
            dataSource={messages}
            renderItem={(item) => (
              <List.Item style={{
                padding: '12px 0',
                justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: item.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 12
                }}>
                  <Avatar
                    icon={item.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      backgroundColor: item.sender === 'user' ? '#a9d2ff' : '#2a97ff'
                    }}
                  />
                  <div style={{
                    maxWidth: '70%',
                    backgroundColor: item.sender === 'user' ? '#e6f7ff' : '#f6ffed',
                    padding: '8px 12px',
                    borderRadius: 4,
                    color: item.isError ? '#000000' : 'inherit'
                  }}>
                    {item.content}
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
          {loading && (
            <div style={{ textAlign: 'center', padding: 12 }}>
              <Spin tip="AI导师正在思考..." />
            </div>
          )}
        </div>

        <Form form={form} layout="vertical">
          <Item label="上下文ID" name="contextId" style={{ marginBottom: 8 }}>
            <Input
              placeholder="输入知识图谱ID (可选)"
              onChange={(e) => setContextId(e.target.value || null)}
            />
          </Item>
          <Item>
            <div style={{ display: 'flex', gap: 8 }}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入您的问题..."
                autoSize={{ minRows: 2, maxRows: 6 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                type="primary"
                onClick={handleSendMessage}
                style={{ height: 'auto' }}
                loading={loading}
                disabled={loading}
              >
                发送
              </Button>
            </div>
          </Item>
        </Form>

        <Divider />
        <div>
          <h4>示例问题:</h4>
          <p>- "请解释Python中的列表和元组的区别"</p>
          <p>- "机器学习中的监督学习和无监督学习有什么不同?"</p>
          <p>- "世界历史中的工业革命有哪些重要影响?"</p>
        </div>
      </Card>
    </div>
  );
};

export default LearningChat;