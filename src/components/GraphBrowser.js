import React, { useState, useEffect } from 'react';
import { Card, List, Tree, Button, Input, message, Divider, Space, Typography } from 'antd';
import { listL1Graphs, getL1Graph, getL2Graph } from '../services/api';
import { SearchOutlined } from '@ant-design/icons';

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
        <div className="tree-node-animation" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ flex: 1 }}>{item}</Text>
          <Button
            type="primary"
            size="small"
            ghost
            onClick={(e) => {
              e.stopPropagation();
              handleL2ItemClick(item);
            }}
          >
            查看详情
          </Button>
        </div>
      ),
      key: `${index}`,
      isLeaf: false
    }));
  };

  return (
    <div className="card-animation" style={{ opacity: isAnimating ? 0.7 : 1 }}>
      <div className="search-container">
        <Title level={4} style={{ marginBottom: 16 }}>知识图谱浏览器</Title>
        <Search
          placeholder="输入学科或领域名称..."
          allowClear
          enterButton={
            <Space>
              <SearchOutlined />
              搜索
            </Space>
          }
          size="large"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={handleSearch}
        />
      </div>

      <div className="graph-container">
        <div className="graph-panel" style={{ flex: 1 }}>
          <Card
            title={<Text strong>L1知识图谱列表</Text>}
            loading={loading}
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
          >
            <List
              dataSource={l1Graphs}
              renderItem={(item) => (
                <List.Item
                  className="list-item-animation"
                  onClick={() => handleGraphClick(item)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedGraph?.id === item.id ? '#f0f9ff' : 'transparent',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'all 0.3s'
                  }}
                >
                  <List.Item.Meta
                    title={<Text strong>{item.name}</Text>}
                    description={`创建于 ${new Date(item.created_at * 1000).toLocaleString()}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>

        <div className="graph-panel" style={{ flex: 2 }}>
          {selectedGraph ? (
            <Card
              title={
                <Space>
                  <Text strong>L1图谱:</Text>
                  <Text type="primary">{selectedGraph.name}</Text>
                </Space>
              }
              extra={
                <Button type="primary" shape="round">
                  以此为主题学习
                </Button>
              }
              loading={loading}
            >
              <Tree
                treeData={renderTreeNodes(selectedGraph.content)}
                defaultExpandAll
                showLine
                style={{ padding: '8px 0' }}
              />
            </Card>
          ) : (
            <Card title="请选择一个L1图谱或进行搜索">
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'rgba(0, 0, 0, 0.45)'
              }}>
                <img
                  src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  alt="empty"
                  style={{ width: 80, marginBottom: 16 }}
                />
                <p>点击左侧图谱或使用上方搜索框</p>
              </div>
            </Card>
          )}
        </div>

        <div className="graph-panel" style={{ flex: 2 }}>
          {l2Graph ? (
            <Card
              title={
                <Space>
                  <Text strong>L2图谱:</Text>
                  <Text type="success">{l2Graph.name}</Text>
                </Space>
              }
              loading={loading}
            >
              <div className="l2-graph-content">
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  margin: 0,
                  lineHeight: 1.6
                }}>
                  {l2Graph.content}
                </pre>
              </div>
            </Card>
          ) : (
            <Card title="L2详细知识图谱">
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'rgba(0, 0, 0, 0.45)'
              }}>
                <img
                  src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  alt="empty"
                  style={{ width: 80, marginBottom: 16 }}
                />
                <p>点击L1图谱中的项目查看详细内容</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphBrowser;