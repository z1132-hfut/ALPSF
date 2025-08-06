import React, { useState, useEffect } from 'react';
import { Card, List, Tree, Button, Input, message, Divider, Space, Typography, Spin } from 'antd';
import { listL1Graphs, getL1Graph, getL2Graph } from '../services/api';
import { SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Title, Text } = Typography;

const GraphBrowser = ({ showNotification }) => {
  const [l1Graphs, setL1Graphs] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [l2Graph, setL2Graph] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetchL1Graphs();
  }, []);

  const fetchL1Graphs = async () => {
    setLoading(true);
    try {
      const data = await listL1Graphs();
      setL1Graphs(data);
    } catch (error) {
      showNotification('error', '加载失败', '无法获取L1图谱列表');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    setLoading(true);
    setIsAnimating(true);
    try {
      const data = await getL1Graph(value);
      if (data.hit) {
        setSelectedGraph({
          id: 'search-result',
          name: value,
          content: data.graph
        });
      } else {
        message.info(`未找到与"${value}"相关的图谱`);
      }
    } catch (error) {
      showNotification('error', '搜索失败', '搜索图谱时出错');
    } finally {
      setLoading(false);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleGraphClick = (graph) => {
    setIsAnimating(true);
    setSelectedGraph(graph);
    setL2Graph(null);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleL2ItemClick = async (item) => {
    setLoading(true);
    setIsAnimating(true);
    try {
      const data = await getL2Graph(item);
      if (data.hit) {
        setL2Graph({
          name: item,
          content: data.graph
        });
      } else {
        message.info(`未找到"${item}"的详细图谱`);
      }
    } catch (error) {
      showNotification('error', '加载失败', '获取L2图谱时出错');
    } finally {
      setLoading(false);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const parseGraphContent = (content) => {
    return content.split('\n').filter(item => item.trim());
  };

  const renderTreeNodes = (content) => {
    return parseGraphContent(content).map((item, index) => ({
      title: (
        <div className="tree-node" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 0',
          transition: 'all 0.2s ease'
        }}>
          <Text strong style={{ flex: 1 }}>{item}</Text>
          <Button
            type="text"
            size="small"
            icon={<ArrowRightOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleL2ItemClick(item);
            }}
            className="tree-node-button"
          />
        </div>
      ),
      key: `${index}`,
      isLeaf: false
    }));
  };

  return (
    <div className="graph-browser-container" style={{
      opacity: isAnimating ? 0.7 : 1,
      transition: 'opacity 0.3s ease',
      padding: '24px',
      width: '100%',
      maxWidth: '1600px',
      margin: '0 auto'
    }}>

      <div className="search-section" style={{
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          width: '100%',
          maxWidth: '900px', // 增加了最大宽度
          alignItems: 'center',
          gap: '8px'
        }}>
    <Input
    placeholder="请输入学科或领域名称..."
    allowClear
    size="large"
    style={{
        width: '100%',
        minWidth: '400px', // 扩大最小宽度
        height: '54px', // 增加整体高度
        fontSize: '16px'
    }}
    className="expanded-input"
    />
    <Button
      type="primary"
      onClick={handleSearch}
      style={{
        width: '90px', // 固定宽度
        color: '#ffffff', // 文字颜色
        background: '#60a5fa', // 浅蓝色
        border: 'none',
        borderRadius: '8px', // 圆角矩形
        padding: '0 24px',
        height: '48px',
        fontSize: '16px',
        boxShadow: 'none',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      className="search-button-hover"
    >搜索</Button>
  </div>
</div>

<div className="graph-panels" style={{
  display: 'grid',
  gridTemplateColumns: '1fr 2fr 2fr',
  gap: '24px',
  padding: '0 24px', // 新增：左右对称内边距
  margin: '0 auto',  // 确保居中
  minHeight: '600px'
}}>
        {/* L1 图谱列表面板 */}
        <Card
          className="graph-panel"
          title={<Text strong style={{ fontSize: '16px', color: '#fff' }}>知识领域</Text>}
          loading={loading}
          headStyle={{
            height: '4%',
            background: '#99d5ff',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            padding: '0 16px'
          }}
          bodyStyle={{ padding: '8px 0'}}
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(226, 232, 240, 0.7)',
            overflow: 'hidden'
          }}
        >
          <List
            dataSource={l1Graphs}
            renderItem={(item) => (
              <List.Item
                className="list-item"
                onClick={() => handleGraphClick(item)}
                style={{
                  cursor: 'pointer',
                  background: selectedGraph?.id === item.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease',
                  margin: 0
                }}
              >
                <List.Item.Meta
                  title={<Text strong style={{ color: selectedGraph?.id === item.id ? '#6366f1' : 'inherit' }}>{item.name}</Text>}
                  description={
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      创建于 {new Date(item.created_at * 1000).toLocaleString()}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        {/* L1 图谱详情面板 */}
        <Card
          className="graph-panel"
          title={
            selectedGraph ? (
              <Space>
                <Text strong style={{ fontSize: '16px' }}>知识结构:</Text>
                <Text style={{
                  color: '#6366f1',
                  fontWeight: 500,
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {selectedGraph.name}
                </Text>
              </Space>
            ) : (
              <Text strong style={{ fontSize: '16px' , color: '#fff' }}>知识结构</Text>
            )
          }
          extra={
            selectedGraph && (
              <Button
                type="primary"
                shape="round"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none'
                }}
              >
                开始学习
              </Button>
            )
          }
          loading={loading}
          headStyle={{
            height: '4%',
            background: '#99d5ff',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            padding: '0 16px',
            borderTopLeftRadius: '12px', // 新增
            borderTopRightRadius: '12px' // 新增
          }}
          bodyStyle={{ padding: '16px' }}
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(226, 232, 240, 0.7)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {selectedGraph ? (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <Tree
                treeData={renderTreeNodes(selectedGraph.content)}
                defaultExpandAll
                showLine={{ showLeafIcon: false }}
                style={{
                  padding: '8px 0',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          ) : (
            <div className="empty-state" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'rgba(0, 0, 0, 0.45)',
              textAlign: 'center',
              padding: '40px 20px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(226, 232, 240, 0.5) 0%, rgba(226, 232, 240, 0.3) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <SearchOutlined style={{ fontSize: '24px', color: 'rgba(0, 0, 0, 0.25)' }} />
              </div>
              <Text style={{ marginBottom: '8px' }}>选择左侧知识领域</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>或使用搜索功能查找特定领域</Text>
            </div>
          )}
        </Card>

        {/* L2 图谱详情面板 */}
        <Card
          className="graph-panel"
          title={
            l2Graph ? (
              <Space>
                <Text strong style={{ fontSize: '16px' }}>详细内容:</Text>
                <Text style={{
                  color: '#10b981',
                  fontWeight: 500,
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {l2Graph.name}
                </Text>
              </Space>
            ) : (
              <Text strong style={{ fontSize: '16px' , color: '#fff' }}>知识详情</Text>
            )
          }
          loading={loading}
          headStyle={{
            height: '4%',
            background: '#99d5ff',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            padding: '0 16px',
            borderTopLeftRadius: '12px', // 新增
            borderTopRightRadius: '12px' // 新增
          }}
          bodyStyle={{
            padding: '16px',
            height: '100%'
          }}
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(226, 232, 240, 0.7)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {l2Graph ? (
            <div className="l2-content" style={{
              flex: 1,
              overflow: 'auto',
              background: 'rgba(241, 245, 249, 0.5)',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '14px',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap'
            }}>
              {l2Graph.content}
            </div>
          ) : (
            <div className="empty-state" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'rgba(0, 0, 0, 0.45)',
              textAlign: 'center',
              padding: '40px 20px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(226, 232, 240, 0.5) 0%, rgba(226, 232, 240, 0.3) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <ArrowRightOutlined style={{ fontSize: '24px', color: 'rgba(0, 0, 0, 0.25)' }} />
              </div>
              <Text style={{ marginBottom: '8px' }}>点击知识结构中的项目</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>查看详细知识内容</Text>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default GraphBrowser;