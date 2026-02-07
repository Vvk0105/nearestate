import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Table, Button, Input, Tag, Card, Row, Col, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';

export default function AdminEventsPage() {
    const { apiClient } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchEvents(pagination.current, pagination.pageSize, search);
    }, []); // Initial load

    const fetchEvents = async (page = 1, limit = 10, query = "") => {
        setLoading(true);
        try {
            // Using the admin endpoint which supports pagination
            const res = await apiClient.get('/exhibitions/admin/exhibitions/', {
                params: { page, limit, search: query }
            });
            // Check if response is paginated (has data/total) or list
            if (res.data.data) {
                setEvents(res.data.data);
                setPagination({ ...pagination, current: page, pageSize: limit, total: res.data.total });
            } else {
                // Fallback if backend not totally updated or returns list
                setEvents(res.data);
                setPagination({ ...pagination, total: res.data.length });
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination) => {
        fetchEvents(newPagination.current, newPagination.pageSize, search);
    };

    const handleSearch = () => {
        fetchEvents(1, pagination.pageSize, search);
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
                <div className="mb-4 flex gap-4">
                    <Input
                        placeholder="Search events..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Button type="primary" onClick={handleSearch}>Search</Button>
                    <Button icon={<ReloadOutlined />} onClick={() => { setSearch(""); fetchEvents(1, 10, ""); }}>Reset</Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={events}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true
                    }}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
}
