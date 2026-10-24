import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Table, Tag, Select, Input, Spin, Statistic, Card } from 'antd';

const STATUS_COLOR = { PAID: 'green', PENDING: 'gold', FAILED: 'red' };

export default function AdminTransactionsPage() {
    const { apiClient } = useAuth();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const eventId = searchParams.get('event') || 'ALL';
    const [status, setStatus] = useState('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiClient.get('/exhibitions/admin/transactions/');
                setRows(res.data);
            } catch (error) {
                console.error('Fetch transactions failed', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [apiClient]);

    const events = useMemo(() => {
        const map = new Map();
        rows.forEach((r) => map.set(String(r.exhibition_id), r.exhibition));
        return [...map.entries()].map(([value, label]) => ({ value, label }));
    }, [rows]);

    const setEventId = (v) => {
        const next = new URLSearchParams(searchParams);
        if (v === 'ALL') next.delete('event');
        else next.set('event', v);
        setSearchParams(next, { replace: true });
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter(
            (r) =>
                (eventId === 'ALL' || String(r.exhibition_id) === eventId) &&
                (status === 'ALL' || r.payment_status === status) &&
                (!q ||
                    [r.exhibitor, r.email, r.exhibition, r.booking_ref, r.stripe_id]
                        .filter(Boolean)
                        .some((v) => v.toLowerCase().includes(q)))
        );
    }, [rows, status, search, eventId]);

    // Paid totals for whatever is currently shown, per currency
    const paidTotals = useMemo(() => {
        const t = {};
        filtered.filter((r) => r.payment_status === 'PAID').forEach((r) => {
            t[r.currency_symbol] = (t[r.currency_symbol] || 0) + r.amount;
        });
        return Object.entries(t);
    }, [filtered]);

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            render: (v) => new Date(v).toLocaleString(),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
            defaultSortOrder: 'descend',
        },
        { title: 'Booking Ref', dataIndex: 'booking_ref', render: (v) => v || '—' },
        { title: 'Exhibitor', dataIndex: 'exhibitor' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Event', dataIndex: 'exhibition' },
        { title: 'Tier', dataIndex: 'tier', render: (v) => v || '—' },
        {
            title: 'Amount',
            dataIndex: 'amount',
            render: (v, r) => `${r.currency_symbol}${Number(v).toLocaleString()} ${r.currency_code}`,
            sorter: (a, b) => a.amount - b.amount,
        },
        { title: 'Channel', dataIndex: 'channel' },
        {
            title: 'Status',
            dataIndex: 'payment_status',
            render: (v) => <Tag color={STATUS_COLOR[v]}>{v}</Tag>,
        },
    ];

    if (loading) return <div className="flex justify-center p-12"><Spin size="large" /></div>;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
                <p className="text-sm text-slate-500">All Stripe booking payments from exhibitors.</p>
            </div>

            <div className="flex flex-wrap gap-3">
                <Select
                    value={eventId}
                    onChange={setEventId}
                    style={{ width: 240 }}
                    showSearch
                    optionFilterProp="label"
                    options={[{ value: 'ALL', label: 'All events' }, ...events]}
                />
                <Input.Search
                    placeholder="Search exhibitor, email, event, booking ref"
                    allowClear
                    style={{ maxWidth: 340 }}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                    value={status}
                    onChange={setStatus}
                    style={{ width: 160 }}
                    options={[
                        { value: 'ALL', label: 'All statuses' },
                        { value: 'PAID', label: 'Paid' },
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'FAILED', label: 'Failed' },
                    ]}
                />
            </div>

            <Card size="small">
                <div className="flex flex-wrap gap-8">
                    <Statistic title="Transactions" value={filtered.length} />
                    <Statistic
                        title="Paid Revenue"
                        value={paidTotals.length ? paidTotals.map(([sym, v]) => `${sym}${v.toLocaleString()}`).join(' + ') : '0'}
                        valueStyle={{ color: '#16a34a' }}
                    />
                </div>
            </Card>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={filtered}
                scroll={{ x: true }}
            />
        </div>
    );
}
