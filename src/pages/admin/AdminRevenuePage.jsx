import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, Row, Col, Statistic, Spin, Table, Empty } from 'antd';

const fmt = (symbol, v) => `${symbol}${Number(v || 0).toLocaleString()}`;

export default function AdminRevenuePage() {
    const { apiClient } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiClient.get('/exhibitions/admin/revenue/');
                setData(res.data);
            } catch (error) {
                console.error('Fetch revenue failed', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [apiClient]);

    if (loading) return <div className="flex justify-center p-12"><Spin size="large" /></div>;
    if (!data) return <div className="p-12 text-center text-gray-400">Failed to load revenue data.</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Revenue</h1>
                <p className="text-sm text-slate-500">
                    Exhibitor booth payments collected through Stripe. Only paid bookings count as revenue.
                </p>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={12} md={6}>
                    <Card><Statistic title="Paid Bookings" value={data.total_bookings} /></Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card><Statistic title="Awaiting Payment" value={data.pending_bookings} /></Card>
                </Col>
            </Row>

            {data.currencies.length === 0 && (
                <Card><Empty description="No Stripe payments yet" /></Card>
            )}

            {data.currencies.map((c) => (
                <Card
                    key={c.currency_code}
                    title={`Revenue in ${c.currency_code}`}
                    className="shadow-sm"
                >
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} md={8}>
                            <Statistic
                                title="Total Revenue"
                                value={fmt(c.currency_symbol, c.total_revenue)}
                                valueStyle={{ color: '#16a34a' }}
                            />
                        </Col>
                        <Col xs={12} md={8}>
                            <Statistic title="Pending Amount" value={fmt(c.currency_symbol, c.pending_amount)} />
                        </Col>
                        <Col xs={12} md={8}>
                            <Statistic title="Paid Bookings" value={c.paid_count} />
                        </Col>
                    </Row>

                    <h3 className="font-semibold text-slate-800 mb-2">By Event</h3>
                    <Table
                        size="small"
                        rowKey="exhibition_id"
                        pagination={false}
                        dataSource={c.per_exhibition}
                        scroll={{ x: true }}
                        columns={[
                            { title: 'Event', dataIndex: 'exhibition' },
                            { title: 'Bookings', dataIndex: 'bookings' },
                            {
                                title: 'Revenue',
                                dataIndex: 'revenue',
                                render: (v) => <strong>{fmt(c.currency_symbol, v)}</strong>,
                            },
                        ]}
                    />

                    <h3 className="font-semibold text-slate-800 mt-6 mb-2">By Month</h3>
                    <Table
                        size="small"
                        rowKey="month"
                        pagination={false}
                        dataSource={c.monthly}
                        columns={[
                            { title: 'Month', dataIndex: 'month' },
                            {
                                title: 'Revenue',
                                dataIndex: 'revenue',
                                render: (v) => fmt(c.currency_symbol, v),
                            },
                        ]}
                    />
                </Card>
            ))}
        </div>
    );
}
