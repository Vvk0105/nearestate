import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, Row, Col, Statistic, Spin, Progress, Tag, Tooltip } from 'antd';
import {
    CalendarOutlined, UserOutlined, ShopOutlined,
    RiseOutlined, BarChartOutlined
} from '@ant-design/icons';

// ── Friendly business type labels ─────────────────────────────────────────
const BT_LABELS = {
    DEVELOPER: 'Developer', BROKER: 'Agent / Broker', LOAN: 'Mortgage / Loan',
    PROPERTY_REAL_ESTATE: 'Property & RE', BUILDERS_CONSTRUCTION: 'Builders',
    TRADES_CONTRACTORS: 'Trades', ARCHITECTURE_DESIGN_ENGINEERING: 'Architecture',
    FINANCE_BANKING: 'Finance', LEGAL_COMPLIANCE: 'Legal',
    INSPECTION_CERTIFICATION: 'Inspection', PROPERTY_SERVICES: 'Property Svcs',
    TECHNOLOGY_PROPTECH: 'PropTech', FURNITURE_FITOUT_LIFESTYLE: 'Furniture',
    GOVERNMENT_COMMUNITY: 'Government', EDUCATION_MEDIA: 'Education',
    TELECOM_INFRASTRUCTURE: 'Telecom', RETAIL_MISCELLANEOUS: 'Retail',
    HOSPITALITY_CATERING: 'Hospitality', HEALTH_WELLNESS: 'Health',
    SUSTAINABILITY_ENERGY: 'Sustainability', TRANSPORT_LOGISTICS: 'Transport',
    RECRUITMENT_HR: 'Recruitment', MARKETING_ADVERTISING: 'Marketing',
    EVENTS_ENTERTAINMENT: 'Events', SECURITY_SAFETY: 'Security',
    MANUFACTURING_INDUSTRIAL: 'Manufacturing', INVESTMENT_WEALTH_MANAGEMENT: 'Investment',
    TRAINING_PROFESSIONAL_DEVELOPMENT: 'Training', HOME_LIVING: 'Home & Living',
    OTHER_BUSINESSES: 'Other',
};

const PALETTE = [
    '#6366f1','#8b5cf6','#ec4899','#f97316','#eab308',
    '#22c55e','#14b8a6','#0ea5e9','#f43f5e','#a78bfa',
    '#fb923c','#4ade80','#38bdf8','#f472b6','#fbbf24',
];

export default function AdminDashboard() {
    const { apiClient } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiClient.get('/exhibitions/admin/dashboard/stats/');
                setStats(res.data);
            } catch (error) {
                console.error('Fetch stats failed', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [apiClient]);

    if (loading) return <div className="flex justify-center p-12"><Spin size="large" /></div>;
    if (!stats) return <div className="p-12 text-center text-gray-400">Failed to load dashboard data.</div>;

    const maxMonthly = Math.max(...(stats.monthly_registrations?.map(m => m.count) ?? [1]), 1);
    const maxEventVisitors = Math.max(...(stats.events_breakdown?.map(e => e.visitor_count) ?? [1]), 1);
    const totalBizTypes = stats.business_type_distribution?.reduce((s, b) => s + b.count, 0) || 1;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>

            {/* ── KPI Cards ── */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm h-full">
                        <Statistic title="Total Events" value={stats.total_events}
                            prefix={<CalendarOutlined />} valueStyle={{ color: '#3f8600' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm h-full">
                        <Statistic title="Active Events" value={stats.active_events}
                            prefix={<RiseOutlined />} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm h-full">
                        <Statistic title="Total Exhibitors" value={stats.total_exhibitors}
                            prefix={<ShopOutlined />} valueStyle={{ color: '#1890ff' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm h-full">
                        <Statistic title="Total Visitors" value={stats.total_visitors}
                            prefix={<UserOutlined />} valueStyle={{ color: '#faad14' }} />
                    </Card>
                </Col>
            </Row>

            {/* ── Analytics ── */}
            <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChartOutlined className="text-indigo-500" /> Analytics
                </h2>
                <Row gutter={[16, 16]}>

                    {/* Monthly Visitor Registrations */}
                    <Col xs={24} lg={14}>
                        <Card title="Monthly Visitor Registrations" bordered={false} className="shadow-sm h-full"
                            extra={<span className="text-xs text-gray-400">Last 6 months</span>}>
                            {stats.monthly_registrations?.length > 0 ? (
                                <div className="space-y-3 pt-1">
                                    {stats.monthly_registrations.map((m) => (
                                        <div key={m.month} className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 w-16 shrink-0 text-right">{m.month}</span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${Math.max((m.count / maxMonthly) * 100, m.count > 0 ? 4 : 0)}%`,
                                                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                                    }} />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700 w-8 text-right">{m.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-6">No registration data yet.</p>
                            )}
                        </Card>
                    </Col>

                    {/* Check-in Rate Circle */}
                    <Col xs={24} lg={10}>
                        <Card title="Overall Check-in Rate" bordered={false} className="shadow-sm h-full">
                            <div className="flex flex-col items-center justify-center py-4">
                                <Progress
                                    type="circle"
                                    percent={stats.checkin_rate ?? 0}
                                    size={160}
                                    strokeColor={{ '0%': '#6366f1', '100%': '#22c55e' }}
                                    format={(p) => (
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-gray-800">{p}%</div>
                                            <div className="text-xs text-gray-400 mt-1">checked in</div>
                                        </div>
                                    )}
                                />
                                <div className="mt-4 flex gap-6 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">{stats.total_checked_in ?? 0}</p>
                                        <p className="text-xs text-gray-400">Checked In</p>
                                    </div>
                                    <div className="w-px bg-gray-200" />
                                    <div>
                                        <p className="text-2xl font-bold text-gray-600">{stats.total_visitors ?? 0}</p>
                                        <p className="text-xs text-gray-400">Total Visitors</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Per-Event Breakdown */}
                    <Col xs={24} lg={14}>
                        <Card title="Events — Visitors & Check-ins" bordered={false} className="shadow-sm h-full"
                            extra={<span className="text-xs text-gray-400">Most recent 10</span>}>
                            {stats.events_breakdown?.length > 0 ? (
                                <div className="space-y-4 pt-1">
                                    {stats.events_breakdown.map((ev) => {
                                        const checkinPct = ev.visitor_count > 0
                                            ? Math.round((ev.checked_in_count / ev.visitor_count) * 100) : 0;
                                        return (
                                            <div key={ev.id}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[55%]" title={ev.name}>
                                                        {ev.name}
                                                    </span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Tag color={ev.is_active ? 'green' : 'default'} className="text-xs">
                                                            {ev.is_active ? 'Active' : 'Past'}
                                                        </Tag>
                                                        <span className="text-xs text-gray-400">
                                                            {ev.exhibitor_count}E · {ev.visitor_count}V
                                                        </span>
                                                    </div>
                                                </div>
                                                <Tooltip title={`${ev.checked_in_count} / ${ev.visitor_count} checked in (${checkinPct}%)`}>
                                                    <div className="bg-gray-100 rounded-full h-4 relative overflow-hidden cursor-help">
                                                        <div className="absolute left-0 top-0 h-full rounded-full" style={{
                                                            width: `${Math.max((ev.visitor_count / maxEventVisitors) * 100, ev.visitor_count > 0 ? 2 : 0)}%`,
                                                            background: '#bfdbfe',
                                                        }} />
                                                        <div className="absolute left-0 top-0 h-full rounded-full transition-all" style={{
                                                            width: `${Math.max((ev.checked_in_count / maxEventVisitors) * 100, ev.checked_in_count > 0 ? 2 : 0)}%`,
                                                            background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                                                        }} />
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        );
                                    })}
                                    <div className="flex items-center gap-4 pt-1 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <span className="inline-block w-3 h-3 rounded-sm bg-blue-200" /> Total visitors
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="inline-block w-3 h-3 rounded-sm bg-green-500" /> Checked in
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-6">No events found.</p>
                            )}
                        </Card>
                    </Col>

                    {/* Business Type Distribution */}
                    <Col xs={24} lg={10}>
                        <Card title="Exhibitor Industry Breakdown" bordered={false} className="shadow-sm h-full">
                            {stats.business_type_distribution?.length > 0 ? (
                                <div className="space-y-2 pt-1 max-h-80 overflow-y-auto pr-1">
                                    {stats.business_type_distribution.slice(0, 12).map((b, i) => {
                                        const pct = Math.round((b.count / totalBizTypes) * 100);
                                        return (
                                            <div key={b.type} className="flex items-center gap-2">
                                                <span className="shrink-0 w-2 h-2 rounded-full"
                                                    style={{ background: PALETTE[i % PALETTE.length] }} />
                                                <span className="text-xs text-gray-600 flex-1 truncate" title={BT_LABELS[b.type] || b.type}>
                                                    {BT_LABELS[b.type] || b.type}
                                                </span>
                                                <div className="w-24 bg-gray-100 rounded-full h-3 overflow-hidden">
                                                    <div className="h-full rounded-full" style={{
                                                        width: `${pct}%`,
                                                        background: PALETTE[i % PALETTE.length],
                                                    }} />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-600 w-6 text-right">{b.count}</span>
                                            </div>
                                        );
                                    })}
                                    {stats.business_type_distribution.length > 12 && (
                                        <p className="text-xs text-gray-400 text-center pt-1">
                                            +{stats.business_type_distribution.length - 12} more categories
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-6">No exhibitor data yet.</p>
                            )}
                        </Card>
                    </Col>

                </Row>
            </div>
        </div>
    );
}
