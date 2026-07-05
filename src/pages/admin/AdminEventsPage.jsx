import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Table, Button, Input, Tag, Card, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { LayoutGrid, Zap, CalendarDays, Clock } from 'lucide-react';

// ── Status classifier (mirrors EventsHomePage logic) ─────────────────────────
const FILTERS = [
    { key: 'all',      label: 'All',      icon: LayoutGrid,   activeBg: 'bg-slate-900 text-white',  dot: 'bg-slate-400' },
    { key: 'ongoing',  label: 'Ongoing',  icon: Zap,          activeBg: 'bg-green-600 text-white',  dot: 'bg-green-500'  },
    { key: 'upcoming', label: 'Upcoming', icon: CalendarDays, activeBg: 'bg-blue-600 text-white',   dot: 'bg-blue-500'   },
    { key: 'past',     label: 'Past',     icon: Clock,        activeBg: 'bg-slate-500 text-white',  dot: 'bg-slate-400'  },
];

function classifyEvent(event) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(event.start_date);
    const end   = new Date(event.end_date);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (end < today)                    return 'past';
    if (start <= today && end >= today) return 'ongoing';
    return 'upcoming';
}

export default function AdminEventsPage() {
    const { apiClient } = useAuth();
    const [allEvents, setAllEvents]   = useState([]);   // full fetched list
    const [loading, setLoading]       = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [search, setSearch]         = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        fetchEvents(pagination.current, pagination.pageSize, search);
    }, []); // Initial load

    const fetchEvents = async (page = 1, limit = 10, query = '') => {
        setLoading(true);
        try {
            const res = await apiClient.get('/exhibitions/admin/exhibitions/', {
                params: { page, limit, search: query }
            });
            if (res.data.data) {
                setAllEvents(res.data.data);
                setPagination(prev => ({ ...prev, current: page, pageSize: limit, total: res.data.total }));
            } else {
                setAllEvents(res.data);
                setPagination(prev => ({ ...prev, total: res.data.length }));
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination) => {
        fetchEvents(newPagination.current, newPagination.pageSize, search);
    };

    const handleSearch = () => {
        setActiveFilter('all');
        fetchEvents(1, pagination.pageSize, search);
    };

    const handleReset = () => {
        setSearch('');
        setActiveFilter('all');
        fetchEvents(1, 10, '');
    };

    const handleDelete = (event) => {
        Modal.confirm({
            title: 'Delete Event',
            content: `Are you sure you want to delete "${event.name}"? This action cannot be undone.`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await apiClient.delete(`/exhibitions/admin/exhibitions/${event.id}/delete/`);
                    message.success('Event deleted successfully');
                    fetchEvents(pagination.current, pagination.pageSize, search);
                } catch (error) {
                    message.error(error.response?.data?.message || 'Failed to delete event');
                }
            }
        });
    };

    // ── Classified events with counts ────────────────────────────────────────
    const classified = allEvents.map(e => ({ ...e, _status: classifyEvent(e) }));
    const filtered   = activeFilter === 'all' ? classified : classified.filter(e => e._status === activeFilter);
    const counts     = {
        all:      classified.length,
        ongoing:  classified.filter(e => e._status === 'ongoing').length,
        upcoming: classified.filter(e => e._status === 'upcoming').length,
        past:     classified.filter(e => e._status === 'past').length,
    };

    // ── Status tag colours ────────────────────────────────────────────────────
    const statusTagColor = { ongoing: 'green', upcoming: 'blue', past: 'default' };
    const statusLabel    = { ongoing: 'Ongoing', upcoming: 'Upcoming', past: 'Past' };

    const columns = [
        {
            title: 'Event Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-400">ID: {record.id}</div>
                </div>
            )
        },
        {
            title: 'Date',
            key: 'date',
            render: (_, record) => (
                <>
                    <div>{new Date(record.start_date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">to {new Date(record.end_date).toLocaleDateString()}</div>
                </>
            )
        },
        {
            title: 'Location',
            dataIndex: 'city',
            key: 'city',
        },
        {
            title: 'Timeline',
            key: 'timeline',
            render: (_, record) => {
                const status = record._status || classifyEvent(record);
                return (
                    <Tag color={statusTagColor[status]}>
                        {statusLabel[status]}
                    </Tag>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'Active' : 'Inactive'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Link to={`/admin/events/${record.id}`}>
                        <Button type="link" icon={<EyeOutlined />}>View Details</Button>
                    </Link>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDelete(record)}
                    >
                        Delete
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Events Management</h1>
                <Link to="/admin/events/new">
                    <Button type="primary" icon={<PlusOutlined />} size="large">
                        Create Event
                    </Button>
                </Link>
            </div>

            <Card className="shadow-sm">
                {/* ── Search bar ── */}
                <div className="mb-4 flex gap-4 flex-wrap">
                    <Input
                        placeholder="Search events..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Button type="primary" onClick={handleSearch}>Search</Button>
                    <Button icon={<ReloadOutlined />} onClick={handleReset}>Reset</Button>
                </div>

                {/* ── Filter Pills ── */}
                <div className="flex flex-wrap gap-2 mb-5">
                    {FILTERS.map(({ key, label, icon: Icon, activeBg, dot }) => {
                        const isActive = activeFilter === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveFilter(key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 shadow-sm ${
                                    isActive
                                        ? `${activeBg} border-transparent shadow-md`
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow'
                                }`}
                            >
                                {!isActive && <span className={`w-2 h-2 rounded-full ${dot}`} />}
                                <Icon size={14} />
                                {label}
                                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {counts[key]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ── Events Table ── */}
                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="id"
                    loading={loading}
                    pagination={
                        activeFilter === 'all'
                            ? {
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                                showSizeChanger: true,
                            }
                            : {
                                pageSize: 10,
                                showSizeChanger: true,
                            }
                    }
                    onChange={activeFilter === 'all' ? handleTableChange : undefined}
                />
            </Card>
        </div>
    );
}
