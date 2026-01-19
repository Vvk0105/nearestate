import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Table, Tabs, Button, Input, Tag, Drawer, Descriptions,
    Space, Modal, message, Card, Row, Col, Progress, Spin
} from 'antd';
import {
    ArrowLeftOutlined, EyeOutlined, CheckCircleOutlined,
    CloseCircleOutlined, SearchOutlined, ReloadOutlined
} from '@ant-design/icons';
import { ApprovalModal } from './ApprovalModal';

const { TabPane } = Tabs;

export default function AdminEventDetailsPage() {
    const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL;
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const { id } = useParams();
    const { apiClient } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Exhibitor Requests State
    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);

    // Exhibitors State
    const [exhibitors, setExhibitors] = useState([]);
    const [exhibitorsTotal, setExhibitorsTotal] = useState(0);
    const [exhibitorsLoading, setExhibitorsLoading] = useState(false);
    const [exhibitorsPagination, setExhibitorsPagination] = useState({ current: 1, pageSize: 10 });
    const [exhibitorsSearch, setExhibitorsSearch] = useState("");

    // Visitors State
    const [visitors, setVisitors] = useState([]);
    const [visitorsTotal, setVisitorsTotal] = useState(0);
    const [visitorsLoading, setVisitorsLoading] = useState(false);
    const [visitorsPagination, setVisitorsPagination] = useState({ current: 1, pageSize: 10 });
    const [visitorsSearch, setVisitorsSearch] = useState("");

    // Details Drawer State
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [drawerItem, setDrawerItem] = useState(null);
    const [drawerType, setDrawerType] = useState(null); // 'visitor' or 'exhibitor'

    // Approval Modal State
    const [selectedReq, setSelectedReq] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchEventDetails();
        fetchRequests();
    }, [id]);

    useEffect(() => {
        if (event) {
            fetchExhibitors(exhibitorsPagination.current, exhibitorsPagination.pageSize, exhibitorsSearch);
            fetchVisitors(visitorsPagination.current, visitorsPagination.pageSize, visitorsSearch);
        }
    }, [event]); // Fetch lists after event loaded or on pagination/search change (handled by effect on pagination/search? No, called manually or via table change)

    // Actually, typical pattern is to fetch in useEffect dependent on pagination/search state
    useEffect(() => {
        fetchExhibitors(exhibitorsPagination.current, exhibitorsPagination.pageSize, exhibitorsSearch);
    }, [exhibitorsPagination, exhibitorsSearch]);

    useEffect(() => {
        fetchVisitors(visitorsPagination.current, visitorsPagination.pageSize, visitorsSearch);
    }, [visitorsPagination, visitorsSearch]);


    const fetchEventDetails = async () => {
        try {
            const res = await apiClient.get(`/exhibitions/public/exhibitions/${id}/`);
            setEvent(res.data);
        } catch (error) {
            message.error("Failed to load event details");
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        setRequestsLoading(true);
        try {
            const res = await apiClient.get(`/exhibitions/admin/exhibitor-applications/${id}/`);
            setRequests(res.data);
        } catch (error) {
            console.error("Requests fetch error", error);
        } finally {
            setRequestsLoading(false);
        }
    };

    const fetchExhibitors = async (page, limit, search) => {
        setExhibitorsLoading(true);
        try {
            const res = await apiClient.get(`/exhibitions/admin/exhibitions/${id}/exhibitors/`, {
                params: { page, limit, search }
            });
            setExhibitors(res.data.data);
            setExhibitorsTotal(res.data.total);
        } catch (error) {
            console.error("Exhibitors fetch error", error);
        } finally {
            setExhibitorsLoading(false);
        }
    };

    const fetchVisitors = async (page, limit, search) => {
        setVisitorsLoading(true);
        try {
            const res = await apiClient.get(`/exhibitions/admin/exhibitions/${id}/visitors/`, {
                params: { page, limit, search }
            });
            setVisitors(res.data.data);
            setVisitorsTotal(res.data.total);
        } catch (error) {
            console.error("Visitors fetch error", error);
        } finally {
            setVisitorsLoading(false);
        }
    };

    const handleVisitorTableChange = (pagination) => {
        setVisitorsPagination(pagination);
    };

    const handleExhibitorTableChange = (pagination) => {
        setExhibitorsPagination(pagination);
    };

    // Actions
    const handleToggleCheckIn = async (visId, currentStatus) => {
        try {
            const res = await apiClient.post(`exhibitions/admin/visitors/${visId}/toggle-checkin/`);
            message.success(`Visitor ${res.data.is_checked_in ? 'Checked In' : 'Checked Out'}`);
            // Optimistic update or refetch
            setVisitors(visitors.map(v => v.id === visId ? { ...v, is_checked_in: res.data.is_checked_in } : v));
        } catch (error) {
            message.error("Failed to update status");
        }
    };

    const handleReject = (reqId) => {
        Modal.confirm({
            title: 'Reject Application?',
            content: 'Are you sure you want to reject this application?',
            onOk: async () => {
                try {
                    await apiClient.post(`exhibitions/admin/exhibitor-application/${reqId}/`, { action: 'REJECT' });
                    message.success("Application Rejected");
                    fetchRequests();
                } catch (error) {
                    message.error("Failed to reject");
                }
            }
        });
    };

    const handleConfirmApproval = async (reqId, formData) => {
        try {
            await apiClient.post(`exhibitions/admin/exhibitor-application/${reqId}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success("Application Approved");
            fetchRequests();
            // Refresh exhibitors if approved
            fetchExhibitors(1, 10, "");
        } catch (error) {
            message.error(error.response?.data?.error || "Failed to approve");
        }
    };

    const showDetails = (item, type) => {
        setDrawerItem(item);
        setDrawerType(type);
        setDrawerVisible(true);
    };

    // Columns
    const requestColumns = [
        { title: 'Company', dataIndex: 'company', key: 'company', render: text => <strong>{text}</strong> },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Status', dataIndex: 'status', key: 'status', render: status => (
                <Tag color={status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'gold'}>
                    {status}
                </Tag>
            )
        },
        { title: 'Transaction ID', dataIndex: 'transaction_id', key: 'transaction_id' },
        {
            title: 'Payment Screenshot',
            dataIndex: 'payment_screenshot',
            key: 'payment_screenshot',
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => {
                        setPreviewImage(record.payment_screenshot);
                        setPreviewVisible(true);
                    }}
                >
                    Transaction Details
                </Button>
            )
        },
        {
            title: 'Actions', key: 'actions', render: (_, record) => (
                <Space>
                    {record.status === 'PENDING' && (
                        <>
                            <Button type="primary" shape="circle" icon={<CheckCircleOutlined />} onClick={() => { setSelectedReq(record); setShowModal(true); }} />
                            <Button type="primary" danger shape="circle" icon={<CloseCircleOutlined />} onClick={() => handleReject(record.id)} />
                        </>
                    )}
                    {record.status === 'APPROVED' && <span className="text-gray-500">Booth: {record.booth_number}</span>}
                </Space>
            )
        },
    ];

    const exhibitorColumns = [
        { title: 'Company Name', dataIndex: 'company_name', key: 'company_name', render: text => <strong>{text}</strong> },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Booth', dataIndex: 'booth_number', key: 'booth_number' },
        {
            title: 'Action', key: 'action', render: (_, record) => (
                <Button icon={<EyeOutlined />} onClick={() => showDetails(record, 'exhibitor')}>
                    View Details
                </Button>
            )
        }
    ];

    const visitorColumns = [
        { title: 'Name', dataIndex: 'name', key: 'name', render: text => <strong>{text}</strong> },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Status', key: 'status', render: (_, record) => (
                <Tag color={record.is_checked_in ? 'green' : 'orange'}>
                    {record.is_checked_in ? 'Checked In' : 'Registered'}
                </Tag>
            )
        },
        { title: 'QR Code', dataIndex: 'qr_code', key: 'qr_code', render: qr => <span className="text-gray-400">{qr.substring(0, 8)}...</span> },
        {
            title: 'Actions', key: 'actions', render: (_, record) => (
                <Space>
                    <Button
                        type={record.is_checked_in ? 'default' : 'primary'}
                        onClick={() => handleToggleCheckIn(record.id, record.is_checked_in)}
                    >
                        {record.is_checked_in ? 'Check Out' : 'Check In'}
                    </Button>
                    <Button icon={<EyeOutlined />} onClick={() => showDetails(record, 'visitor')}>
                        Details
                    </Button>
                </Space>
            )
        }
    ];

    if (loading) return <div className="p-12 text-center"><Spin size="large" /></div>;
    if (!event) return <div className="p-12 text-center">Event not found</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Link to="/admin/events" className="flex items-center gap-2 text-gray-500 hover:text-black">
                    <ArrowLeftOutlined /> Back to Events
                </Link>
                <Button type="primary">
                    <Link to={`/admin/events/${id}/edit`}>Edit Event</Link>
                </Button>
            </div>

            <Card className="mb-6 shadow-sm">
                <Row gutter={24} align="middle">
                    <Col span={16}>
                        <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
                        <p className="text-gray-500 mb-0">{event.city} • {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}</p>
                    </Col>
                    <Col span={8} className="text-right">
                        <Tag color={event.is_active ? 'green' : 'red'}>{event.is_active ? 'Active' : 'Inactive'}</Tag>
                    </Col>
                </Row>
            </Card>

            <Tabs defaultActiveKey="1" type="card">
                <TabPane tab="Overview" key="1">
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Card title="Booth Availability">
                                <Progress
                                    percent={Math.round((event.available_booths / event.booth_capacity) * 100)}
                                    strokeLinecap="square"
                                    format={() => `${event.available_booths} / ${event.booth_capacity}`}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Visitor Passes">
                                <Progress
                                    percent={Math.round((event.available_visitors / event.visitor_capacity) * 100)}
                                    strokeLinecap="square"
                                    strokeColor="#52c41a"
                                    format={() => `${event.available_visitors} left`}
                                />
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title="Event Description">
                                <p>{event.description}</p>
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane tab={`Requests (${requests.length})`} key="2">
                    <Table
                        columns={requestColumns}
                        dataSource={requests}
                        rowKey="id"
                        loading={requestsLoading}
                        pagination={{ pageSize: 5 }}
                    />
                </TabPane>

                <TabPane tab="Exhibitors" key="3">
                    <div className="mb-4 flex gap-2">
                        <Input
                            placeholder="Search exhibitors..."
                            prefix={<SearchOutlined />}
                            value={exhibitorsSearch}
                            onChange={(e) => setExhibitorsSearch(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Button icon={<ReloadOutlined />} onClick={() => fetchExhibitors(1, 10, "")}>Refresh</Button>
                    </div>
                    <Table
                        columns={exhibitorColumns}
                        dataSource={exhibitors}
                        rowKey="id"
                        loading={exhibitorsLoading}
                        pagination={{
                            current: exhibitorsPagination.current,
                            pageSize: exhibitorsPagination.pageSize,
                            total: exhibitorsTotal,
                        }}
                        onChange={handleExhibitorTableChange}
                    />
                </TabPane>

                <TabPane tab="Visitors" key="4">
                    <div className="mb-4 flex gap-2">
                        <Input
                            placeholder="Search visitors..."
                            prefix={<SearchOutlined />}
                            value={visitorsSearch}
                            onChange={(e) => setVisitorsSearch(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Button icon={<ReloadOutlined />} onClick={() => fetchVisitors(1, 10, "")}>Refresh</Button>
                    </div>
                    <Table
                        columns={visitorColumns}
                        dataSource={visitors}
                        rowKey="id"
                        loading={visitorsLoading}
                        pagination={{
                            current: visitorsPagination.current,
                            pageSize: visitorsPagination.pageSize,
                            total: visitorsTotal,
                        }}
                        onChange={handleVisitorTableChange}
                    />
                </TabPane>
            </Tabs>

            <Drawer
                title={`${drawerType === 'exhibitor' ? 'Exhibitor' : 'Visitor'} Details`}
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={500}
            >
                {drawerItem && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="ID">{drawerItem.id}</Descriptions.Item>
                        <Descriptions.Item label="Name/Company">{drawerItem.name || drawerItem.company_name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{drawerItem.email}</Descriptions.Item>
                        {drawerType === 'exhibitor' && (
                            <>
                                <Descriptions.Item label="Booth">{drawerItem.booth_number}</Descriptions.Item>
                                <Descriptions.Item label="Contact Number">{drawerItem.contact_number || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Business Type">{drawerItem.business_type || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Council Area">{drawerItem.council_area || 'N/A'}</Descriptions.Item>
                                {drawerItem.badge && (
                                    <Descriptions.Item label="Badge">
                                        <a href={drawerItem.badge} target="_blank" rel="noreferrer">View Badge</a>
                                    </Descriptions.Item>
                                )}
                            </>
                        )}
                        {drawerType === 'visitor' && (
                            <>
                                <Descriptions.Item label="Checked In">
                                    <Tag color={drawerItem.is_checked_in ? 'green' : 'orange'}>
                                        {drawerItem.is_checked_in ? 'Yes' : 'No'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="QR Code">{drawerItem.qr_code}</Descriptions.Item>
                                <Descriptions.Item label="Registered At">{drawerItem.registered_at ? new Date(drawerItem.registered_at).toLocaleString() : 'N/A'}</Descriptions.Item>
                            </>
                        )}
                    </Descriptions>
                )}
            </Drawer>

            <ApprovalModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmApproval}
                req={selectedReq}
            />

            <Modal
                open={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width={600}
            >
                <img
                    src={previewImage}
                    alt="Transaction Screenshot"
                    style={{ width: '100%', borderRadius: 8 }}
                />
            </Modal>
        </div>
    );
}
