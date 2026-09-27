import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Menu, Dropdown, Avatar, Button, Drawer } from 'antd';
import {
    DashboardOutlined,
    CalendarOutlined,
    LogoutOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    QrcodeOutlined,
} from '@ant-design/icons';
import FullPageLoader from '../components/FullPageLoader';

const { Header, Sider, Content } = Layout;

// ── Breakpoint hook ───────────────────────────────────────────────────────────
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
}

export default function AdminLayout() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();

    // Desktop: sidebar collapse. Mobile: drawer open/close.
    const [collapsed, setCollapsed] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user || user.active_role !== 'ADMIN') {
                navigate('/admin/login');
            }
        }
    }, [user, loading, navigate]);

    // Close drawer on route change (mobile)
    useEffect(() => {
        setDrawerOpen(false);
    }, [location.pathname]);

    if (loading) return <FullPageLoader message="Loading admin panel..." />;
    if (!user || user.active_role !== 'ADMIN') return null;

    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/admin/dashboard'),
        },
        {
            key: '/admin/events',
            icon: <CalendarOutlined />,
            label: 'Events',
            onClick: () => navigate('/admin/events'),
        },
    ];

    const userMenuItems = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: () => {
                logout();
                navigate('/admin/login');
            },
        },
    ];

    const selectedKey =
        menuItems.find(item => location.pathname.startsWith(item.key))?.key ||
        '/admin/dashboard';

    // ── Shared sidebar content ──────────────────────────────────────────────
    const SidebarContent = ({ forDrawer = false }) => (
        <>
            <div
                className="p-4 text-center border-b border-gray-700"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
                <h1 className="text-white font-bold text-base leading-tight">
                    {forDrawer || !collapsed ? 'NearEstate Admin' : 'NE'}
                </h1>
            </div>
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[selectedKey]}
                items={menuItems}
                style={{ marginTop: 16, border: 'none' }}
            />
        </>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>

            {/* ── Desktop Sider (hidden on mobile) ───────────────────────── */}
            {!isMobile && (
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    theme="dark"
                    style={{
                        overflow: 'auto',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: 100,
                    }}
                >
                    <SidebarContent />
                </Sider>
            )}

            {/* ── Mobile Drawer ───────────────────────────────────────────── */}
            {isMobile && (
                <Drawer
                    placement="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    width={220}
                    styles={{
                        body: { padding: 0, background: '#001529' },
                        header: { display: 'none' },
                    }}
                >
                    <SidebarContent forDrawer />
                </Drawer>
            )}

            {/* ── Main layout ─────────────────────────────────────────────── */}
            <Layout
                style={{
                    marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
                    transition: 'margin-left 0.2s',
                }}
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <Header
                    style={{
                        padding: '0 16px',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 99,
                    }}
                >
                    {/* Hamburger / collapse toggle */}
                    <Button
                        type="text"
                        icon={
                            isMobile
                                ? <MenuUnfoldOutlined />
                                : collapsed
                                    ? <MenuUnfoldOutlined />
                                    : <MenuFoldOutlined />
                        }
                        onClick={() =>
                            isMobile ? setDrawerOpen(true) : setCollapsed(c => !c)
                        }
                        style={{ fontSize: '16px', width: 48, height: 48 }}
                    />

                    {/* Mobile: center logo */}
                    {isMobile && (
                        <span className="font-bold text-slate-800 text-sm absolute left-1/2 -translate-x-1/2">
                            NearEstate Admin
                        </span>
                    )}

                    {/* Right side: QR scan button + user avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* QR Scan quick-launch */}
                        <Button
                            type="primary"
                            icon={<QrcodeOutlined />}
                            onClick={() => window.open('/admin/scan', '_blank')}
                            size="middle"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none',
                                borderRadius: 10,
                                fontWeight: 600,
                                boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                            }}
                        >
                            {!isMobile && 'QR Scan'}
                        </Button>

                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                {!isMobile && (
                                    <span className="text-sm text-gray-600 hidden md:block">{user?.email}</span>
                                )}
                                <Avatar icon={<UserOutlined />} />
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* ── Page content ───────────────────────────────────────── */}
                <Content style={{ margin: isMobile ? '12px 8px' : '24px 16px', overflow: 'initial' }}>
                    <div
                        style={{
                            padding: isMobile ? 12 : 24,
                            background: '#f0f2f5',
                            minHeight: 'calc(100vh - 112px)',
                            borderRadius: 8,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
