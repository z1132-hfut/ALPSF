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
  Form
} from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import { streamChat } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;
const { Item } = Form;

const LearningChat = ({ showNotification }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextLevel, setContextLevel] = useState('level1');
  const [contextId, setContextId] = useState(null);
  const messagesEndRef = useRef(null);
  const [form] = Form.useForm();

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
      setMessages(prev => [...prev, {
        content: '...',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isStreaming: true
      }]);

      const response = await streamChat(inputValue, contextLevel, contextId);

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
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <Card
        title={<span style={{
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#1890ff',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
        }}>AI学习导师</span>}
        headStyle={{
          height: 35,
          // background: '#92ffe2',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 24px',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}
      ></Card>

      <Card
        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
      >
        <div style={{ height: 500, overflowY: 'auto', marginBottom: 16 }}>
          <List
            dataSource={messages}
            renderItem={(item) => (
              <List.Item style={{
                padding: '8px 0',
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
                      backgroundColor: item.sender === 'user' ? '#2a97ff' : '#00b4b4',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <div style={{
                    maxWidth: '70%',
                    background: item.sender === 'user'
                      ? 'linear-gradient(135deg, #2a97ff, #0066cc)'
                      : 'linear-gradient(135deg, #00b4b4, #008080)',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: item.sender === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s'
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

      </Card>
    </div>
  );
};

export default LearningChat;