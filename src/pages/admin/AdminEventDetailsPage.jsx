import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Table, Tabs, Button, Input, Tag, Drawer, Descriptions,
    Space, Modal, message, Card, Row, Col, Progress, Spin,
    Form, Select, Upload, Steps, Divider
} from 'antd';
import {
    ArrowLeftOutlined, EyeOutlined, CheckCircleOutlined,
    CloseCircleOutlined, SearchOutlined, ReloadOutlined,
    UserAddOutlined, ShopOutlined, UploadOutlined, CheckOutlined, LinkOutlined, EnvironmentOutlined
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
    
    // Debounced search terms
    const [debouncedExhibitorsSearch, setDebouncedExhibitorsSearch] = useState("");
    const [debouncedVisitorsSearch, setDebouncedVisitorsSearch] = useState("");

    // Details Drawer State
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [drawerItem, setDrawerItem] = useState(null);
    const [drawerType, setDrawerType] = useState(null); // 'visitor' or 'exhibitor'

    // Approval Modal State
    const [selectedReq, setSelectedReq] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // ── Add Exhibitor 3-step Modal State ──
    const [showAddExhibitorModal, setShowAddExhibitorModal] = useState(false);
    const [exhibitorStep, setExhibitorStep] = useState(0); // 0=email, 1=company/confirm, 2=booth+badge
    const [exhibitorEmailForm] = Form.useForm();
    const [exhibitorCompanyForm] = Form.useForm();
    const [exhibitorFinalForm] = Form.useForm();
    const [exhibitorLookup, setExhibitorLookup] = useState(null); // result from check endpoint
    const [exhibitorEmail, setExhibitorEmail] = useState('');
    const [exhibitorLookupLoading, setExhibitorLookupLoading] = useState(false);
    const [addExhibitorLoading, setAddExhibitorLoading] = useState(false);
    const [badgeFile, setBadgeFile] = useState(null);
    const [savedCompanyDetails, setSavedCompanyDetails] = useState(null); // saved from step 1 form

    // Add Visitor Modal State
    const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
    const [addVisitorLoading, setAddVisitorLoading] = useState(false);
    const [addVisitorForm] = Form.useForm();

    useEffect(() => {
        fetchEventDetails();
        fetchRequests();
    }, [id]);

    // Debounce effects
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedExhibitorsSearch(exhibitorsSearch), 500);
        return () => clearTimeout(timer);
    }, [exhibitorsSearch]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedVisitorsSearch(visitorsSearch), 500);
        return () => clearTimeout(timer);
    }, [visitorsSearch]);

    // Fetch exhibitors when pagination or debounced search changes
    useEffect(() => {
        if (event) {
            fetchExhibitors(exhibitorsPagination.current, exhibitorsPagination.pageSize, debouncedExhibitorsSearch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exhibitorsPagination, debouncedExhibitorsSearch, event]);

    // Fetch visitors when pagination or debounced search changes
    useEffect(() => {
        if (event) {
            fetchVisitors(visitorsPagination.current, visitorsPagination.pageSize, debouncedVisitorsSearch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visitorsPagination, debouncedVisitorsSearch, event]);


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

    // ── Step 1: look up the email ──
    const handleExhibitorLookup = async (values) => {
        setExhibitorLookupLoading(true);
        try {
            const res = await apiClient.get(
                `/exhibitions/admin/exhibitions/${id}/check-exhibitor/`,
                { params: { email: values.email } }
            );
            if (res.data.already_registered) {
                message.error('This person is already registered as an exhibitor for this event.');
                return;
            }
            setExhibitorEmail(values.email);
            setExhibitorLookup(res.data);
            setExhibitorStep(1);
        } catch (err) {
            message.error(err.response?.data?.error || 'Lookup failed');
        } finally {
            setExhibitorLookupLoading(false);
        }
    };

    // ── Step 2: company details confirmed — save values to state then go to step 3 ──
    const handleExhibitorCompanyNext = () => {
        const vals = exhibitorCompanyForm.getFieldsValue();
        setSavedCompanyDetails(vals);
        setExhibitorStep(2);
    };

    // ── Step 3: final submit ──
    const handleAddExhibitorFinal = async (values) => {
        setAddExhibitorLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', exhibitorEmail);
            formData.append('booth_number', values.booth_number);
            if (badgeFile) formData.append('badge', badgeFile);

            // Include company details from step 2 if user was new
            if (!exhibitorLookup?.profile_exists) {
                const companyVals = savedCompanyDetails || exhibitorCompanyForm.getFieldsValue();
                if (companyVals.company_name) formData.append('company_name', companyVals.company_name);
                if (companyVals.business_type) formData.append('business_type', companyVals.business_type);
                if (companyVals.council_area) formData.append('council_area', companyVals.council_area);
                if (companyVals.contact_number) formData.append('contact_number', companyVals.contact_number);
            }

            await apiClient.post(
                `/exhibitions/admin/exhibitions/${id}/add-exhibitor/`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            message.success('Exhibitor added and approved! Confirmation email sent.');
            closeAddExhibitorModal();
            fetchExhibitors(1, exhibitorsPagination.pageSize, debouncedExhibitorsSearch);
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to add exhibitor');
        } finally {
            setAddExhibitorLoading(false);
        }
    };

    const closeAddExhibitorModal = () => {
        setShowAddExhibitorModal(false);
        setExhibitorStep(0);
        setExhibitorLookup(null);
        setExhibitorEmail('');
        setBadgeFile(null);
        setSavedCompanyDetails(null);
        exhibitorEmailForm.resetFields();
        exhibitorCompanyForm.resetFields();
        exhibitorFinalForm.resetFields();
    };

    const handleAddVisitor = async (values) => {
        setAddVisitorLoading(true);
        try {
            await apiClient.post(`/exhibitions/admin/exhibitions/${id}/add-visitor/`, values);
            message.success('Visitor registered successfully! A QR pass has been emailed to them.');
            setShowAddVisitorModal(false);
            addVisitorForm.resetFields();
            fetchVisitors(1, visitorsPagination.pageSize, debouncedVisitorsSearch);
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to add visitor');
        } finally {
            setAddVisitorLoading(false);
        }
    };


    const requestColumns = [
        { title: 'Company', dataIndex: ['exhibitor_profile', 'company_name'], key: 'company_name', render: text => <strong>{text}</strong> },
        { title: 'Email', dataIndex: ['user', 'email'], key: 'email' },
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
                        <Col span={24}>
                            <Card title="Assigned Booth Numbers">
                                {exhibitors.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {exhibitors.map((exhibitor) => (
                                            <Tag key={exhibitor.id} color="blue" className="text-base px-3 py-1">
                                                Booth #{exhibitor.booth_number} - {exhibitor.company_name}
                                            </Tag>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">No booths assigned yet</p>
                                )}
                            </Card>
                        </Col>
                        {event.registration_fee && (
                            <Col span={24}>
                                <Card title="Registration Fee">
                                    <p className="text-lg font-semibold">{event.currency_symbol || '₹'}{event.registration_fee}</p>
                                </Card>
                            </Col>
                        )}
                        <Col span={24}>
                            <Card title="Event Links">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <LinkOutlined className="text-blue-500" />
                                        <span className="font-medium text-gray-600">Venue Link:</span>
                                        {event.venue_link ? (
                                            <a href={event.venue_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                                                {event.venue_link}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 italic">Nil</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <EnvironmentOutlined className="text-green-500" />
                                        <span className="font-medium text-gray-600">Location Link:</span>
                                        {event.location_link ? (
                                            <a href={event.location_link} target="_blank" rel="noreferrer" className="text-green-600 hover:underline break-all">
                                                {event.location_link}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 italic">Nil</span>
                                        )}
                                    </div>
                                </div>
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
                    <div className="mb-4 flex gap-2 flex-wrap">
                        <Input
                            placeholder="Search exhibitors..."
                            prefix={<SearchOutlined />}
                            value={exhibitorsSearch}
                            onChange={(e) => setExhibitorsSearch(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Button icon={<ReloadOutlined />} onClick={() => fetchExhibitors(1, 10, "")}>Refresh</Button>
                        <Button
                            type="primary"
                            icon={<ShopOutlined />}
                            onClick={() => setShowAddExhibitorModal(true)}
                            style={{ marginLeft: 'auto' }}
                        >
                            Add Exhibitor
                        </Button>
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
                    <div className="mb-4 flex gap-2 flex-wrap">
                        <Input
                            placeholder="Search visitors..."
                            prefix={<SearchOutlined />}
                            value={visitorsSearch}
                            onChange={(e) => setVisitorsSearch(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Button icon={<ReloadOutlined />} onClick={() => fetchVisitors(1, 10, "")}>Refresh</Button>
                        <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={() => setShowAddVisitorModal(true)}
                            style={{ marginLeft: 'auto' }}
                        >
                            Add Visitor
                        </Button>
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

            {/* ── Add Exhibitor Modal (3-step) ── */}
            <Modal
                title={
                    <Space>
                        <ShopOutlined style={{ color: '#1677ff' }} />
                        <span>Add Exhibitor to Event</span>
                    </Space>
                }
                open={showAddExhibitorModal}
                onCancel={closeAddExhibitorModal}
                footer={null}
                width={520}
                destroyOnClose
            >
                <Steps
                    current={exhibitorStep}
                    size="small"
                    className="mb-6"
                    items={[
                        { title: 'Email' },
                        { title: exhibitorLookup?.profile_exists ? 'Profile' : 'Company Details' },
                        { title: 'Booth & Badge' },
                    ]}
                />

                {/* ─ Step 0: Email lookup ─ */}
                {exhibitorStep === 0 && (
                    <Form form={exhibitorEmailForm} layout="vertical" onFinish={handleExhibitorLookup}>
                        <Form.Item
                            label="Exhibitor Email"
                            name="email"
                            rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                        >
                            <Input placeholder="exhibitor@company.com" size="large" autoFocus />
                        </Form.Item>
                        <div className="flex justify-end gap-2 mt-1">
                            <Button onClick={closeAddExhibitorModal}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={exhibitorLookupLoading}>
                                Look Up →
                            </Button>
                        </div>
                    </Form>
                )}

                {/* ─ Step 1: Company details (new user) OR read-only profile (existing) ─ */}
                {exhibitorStep === 1 && exhibitorLookup && (
                    <>
                        {exhibitorLookup.profile_exists ? (
                            /* Existing profile — show as read-only card */
                            <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-xs text-blue-500 font-semibold uppercase mb-2">Existing Profile Found</p>
                                    <p className="text-sm mb-1"><strong>Company:</strong> {exhibitorLookup.profile.company_name}</p>
                                    <p className="text-sm mb-1"><strong>Business Type:</strong> {exhibitorLookup.profile.business_type}</p>
                                    <p className="text-sm mb-1"><strong>Council Area:</strong> {exhibitorLookup.profile.council_area}</p>
                                    <p className="text-sm mb-0"><strong>Contact:</strong> {exhibitorLookup.profile.contact_number}</p>
                                </div>
                                <p className="text-gray-500 text-sm mb-4">
                                    These existing company details will be used. Click <strong>Next</strong> to assign a booth.
                                </p>
                                <div className="flex justify-end gap-2">
                                    <Button onClick={() => setExhibitorStep(0)}>← Back</Button>
                                    <Button type="primary" onClick={handleExhibitorCompanyNext}>Next →</Button>
                                </div>
                            </>
                        ) : (
                            /* New user — fill in company details */
                            <>
                                <p className="text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                                    ⚠️ No existing profile found for <strong>{exhibitorEmail}</strong>. Please enter company details below.
                                </p>
                                <Form form={exhibitorCompanyForm} layout="vertical" onFinish={handleExhibitorCompanyNext}>
                                    <Form.Item
                                        label="Company Name"
                                        name="company_name"
                                        rules={[{ required: true, message: 'Company name is required' }]}
                                    >
                                        <Input placeholder="Acme Properties" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Business Type"
                                        name="business_type"
                                        rules={[{ required: true, message: 'Please select a business type' }]}
                                    >
                                        <Select placeholder="Select business type" showSearch optionFilterProp="children">
                                            {[
                                                ['DEVELOPER', 'Real Estate Developer'],
                                                ['BROKER', 'Real Estate Agent / Broker'],
                                                ['LOAN', 'Mortgage / Loan Provider'],
                                                ['PROPERTY_REAL_ESTATE', 'Property & Real Estate'],
                                                ['BUILDERS_CONSTRUCTION', 'Builders & Construction'],
                                                ['TRADES_CONTRACTORS', 'Trades & Contractors'],
                                                ['ARCHITECTURE_DESIGN_ENGINEERING', 'Architecture, Design & Engineering'],
                                                ['FINANCE_BANKING', 'Finance & Banking'],
                                                ['LEGAL_COMPLIANCE', 'Legal & Compliance'],
                                                ['INSPECTION_CERTIFICATION', 'Inspection & Certification'],
                                                ['PROPERTY_SERVICES', 'Property Services'],
                                                ['TECHNOLOGY_PROPTECH', 'Technology & PropTech'],
                                                ['FURNITURE_FITOUT_LIFESTYLE', 'Furniture, Fitout & Lifestyle'],
                                                ['GOVERNMENT_COMMUNITY', 'Government & Community'],
                                                ['EDUCATION_MEDIA', 'Education & Media'],
                                                ['TELECOM_INFRASTRUCTURE', 'Telecom & Infrastructure'],
                                                ['RETAIL_MISCELLANEOUS', 'Retail & Miscellaneous'],
                                                ['HOSPITALITY_CATERING', 'Hospitality & Catering'],
                                                ['HEALTH_WELLNESS', 'Health & Wellness'],
                                                ['SUSTAINABILITY_ENERGY', 'Sustainability & Energy'],
                                                ['TRANSPORT_LOGISTICS', 'Transport & Logistics'],
                                                ['RECRUITMENT_HR', 'Recruitment & HR'],
                                                ['MARKETING_ADVERTISING', 'Marketing & Advertising'],
                                                ['EVENTS_ENTERTAINMENT', 'Events & Entertainment'],
                                                ['SECURITY_SAFETY', 'Security & Safety'],
                                                ['MANUFACTURING_INDUSTRIAL', 'Manufacturing & Industrial'],
                                                ['INVESTMENT_WEALTH_MANAGEMENT', 'Investment & Wealth Management'],
                                                ['TRAINING_PROFESSIONAL_DEVELOPMENT', 'Training & Professional Development'],
                                                ['HOME_LIVING', 'Home & Living'],
                                                ['OTHER_BUSINESSES', 'Other Businesses'],
                                            ].map(([v, l]) => <Select.Option key={v} value={v}>{l}</Select.Option>)}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Council / Local Area" name="council_area"
                                        rules={[{ required: true, message: 'Council area is required' }]}>
                                        <Input placeholder="e.g. City Centre" />
                                    </Form.Item>
                                    <Form.Item label="Contact Number" name="contact_number"
                                        rules={[{ required: true, message: 'Contact number is required' }]}>
                                        <Input placeholder="+61400000000" />
                                    </Form.Item>
                                    <div className="flex justify-end gap-2 mt-1">
                                        <Button onClick={() => setExhibitorStep(0)}>← Back</Button>
                                        <Button type="primary" htmlType="submit">Next →</Button>
                                    </div>
                                </Form>
                            </>
                        )}
                    </>
                )}

                {/* ─ Step 2: Booth number + badge upload ─ */}
                {exhibitorStep === 2 && (
                    <Form form={exhibitorFinalForm} layout="vertical" onFinish={handleAddExhibitorFinal}>
                        <div className="bg-gray-50 border rounded-lg p-3 mb-4 text-sm text-gray-600">
                            Adding <strong>{exhibitorEmail}</strong> as exhibitor
                            {exhibitorLookup?.profile?.company_name && (
                                <> — <strong>{exhibitorLookup.profile.company_name}</strong></>
                            )}
                        </div>
                        <Form.Item
                            label="Booth Number"
                            name="booth_number"
                            rules={[{ required: true, message: 'Booth number is required' }]}
                        >
                            <Input type="number" min={1} placeholder="e.g. 12" size="large" />
                        </Form.Item>

                        <Form.Item label="Badge (optional — PDF or image)">
                            <Upload
                                beforeUpload={(file) => { setBadgeFile(file); return false; }}
                                onRemove={() => setBadgeFile(null)}
                                maxCount={1}
                                accept=".pdf,image/*"
                            >
                                <Button icon={<UploadOutlined />}>Upload Badge</Button>
                            </Upload>
                            {badgeFile && (
                                <p className="text-green-600 text-xs mt-1">✓ {badgeFile.name}</p>
                            )}
                        </Form.Item>

                        <div className="flex justify-end gap-2 mt-1">
                            <Button onClick={() => setExhibitorStep(1)}>← Back</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={addExhibitorLoading}
                                icon={<CheckOutlined />}
                            >
                                Add & Approve
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal>


            {/* ── Add Visitor Modal ── */}
            <Modal
                title={
                    <Space>
                        <UserAddOutlined style={{ color: '#52c41a' }} />
                        <span>Add Visitor to Event</span>
                    </Space>
                }
                open={showAddVisitorModal}
                onCancel={() => { setShowAddVisitorModal(false); addVisitorForm.resetFields(); }}
                footer={null}
                width={440}
                destroyOnClose
            >
                <p className="text-gray-500 text-sm mb-4">
                    The visitor will be registered and will receive a QR code entry pass by email.
                    If the user already has an account, it will be reused.
                </p>
                <Form
                    form={addVisitorForm}
                    layout="vertical"
                    onFinish={handleAddVisitor}
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                    >
                        <Input placeholder="visitor@example.com" />
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-2">
                        <Button onClick={() => { setShowAddVisitorModal(false); addVisitorForm.resetFields(); }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={addVisitorLoading} icon={<UserAddOutlined />}
                            style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        >
                            Register Visitor
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
