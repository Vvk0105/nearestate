import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
    CalendarOutlined, UserOutlined, ShopOutlined,
    RiseOutlined
} from '@ant-design/icons';

export default function AdminDashboard() {
    const { apiClient } = useAuth();
    const [stats, setStats] = useState({
        total_events: 0,
        active_events: 0,
        total_visitors: 0,
        total_exhibitors: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiClient.get('/exhibitions/admin/dashboard/stats/');
                setStats(res.data);
            } catch (error) {
                console.error("Fetch stats failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [apiClient]);

    if (loading) return <div className="flex justify-center p-12"><Spin size="large" /></div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Total Events"
                            value={stats.total_events}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Active Events"
                            value={stats.active_events}
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Exhibitors"
                            value={stats.total_exhibitors}
                            prefix={<ShopOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Visitors"
                            value={stats.total_visitors}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="mt-8">
                <Card title="Analytics" className="shadow-sm">
                    <p className="text-gray-400 text-center py-8">Advanced analytics and charts coming soon.</p>
                </Card>
            </div>
        </div>
    );
}
