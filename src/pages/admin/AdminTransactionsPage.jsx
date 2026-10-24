import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Table, Tag, Select, Input, Spin } from 'antd';

const STATUS_COLOR = { PAID: 'green', PENDING: 'gold', FAILED: 'red' };

export default function AdminTransactionsPage() {
    const { apiClient } = useAuth();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter(
            (r) =>
                (status === 'ALL' || r.payment_status === status) &&
                (!q ||
                    [r.exhibitor, r.email, r.exhibition, r.booking_ref, r.stripe_id]
                        .filter(Boolean)
                        .some((v) => v.toLowerCase().includes(q)))
        );
    }, [rows, status, search]);

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

            <Table
                rowKey="id"
                columns={columns}
                dataSource={filtered}
                scroll={{ x: true }}
            />
        </div>
    );
}
