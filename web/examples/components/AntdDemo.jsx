import { Button, Tag, Alert, Space } from 'antd'

export default function AntdDemo() {
  return (
    <div style={{ padding: '16px', background: '#21252b', borderRadius: '8px' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Alert message="成功" description="AntD Alert 跑在 XuNay 上" type="success" showIcon />
        <Space>
          <Button type="primary">主要按钮</Button>
          <Button>默认</Button>
          <Button type="dashed">虚线</Button>
          <Button danger>危险</Button>
        </Space>
        <Space>
          <Tag color="magenta">magenta</Tag>
          <Tag color="red">red</Tag>
          <Tag color="volcano">volcano</Tag>
          <Tag color="orange">orange</Tag>
          <Tag color="gold">gold</Tag>
          <Tag color="lime">lime</Tag>
          <Tag color="green">green</Tag>
          <Tag color="cyan">cyan</Tag>
          <Tag color="blue">blue</Tag>
          <Tag color="geekblue">geekblue</Tag>
          <Tag color="purple">purple</Tag>
        </Space>
      </Space>
    </div>
  )
}
