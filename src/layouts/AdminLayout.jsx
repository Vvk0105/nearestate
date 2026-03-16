import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd';
import {
    DashboardOutlined,
    CalendarOutlined,
    LogoutOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user || user.active_role !== 'ADMIN') {
                navigate('/admin/login');
            }
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user || user.active_role !== 'ADMIN') {
        return null;
    }


    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/admin/dashboard')
        },
        {
            key: '/admin/events',
            icon: <CalendarOutlined />,
            label: 'Events',
            onClick: () => navigate('/admin/events')
        }
    ];

    const userMenuItems = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: () => {
                logout();
                navigate('/admin/login');
            }
        }
    ];

    const selectedKey = menuItems.find(item =>
        location.pathname.startsWith(item.key)
    )?.key || '/admin/dashboard';

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                breakpoint="lg"
                theme="dark"
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div className="p-4 text-center border-b border-gray-700">
                    <h1 className="text-white font-bold text-lg">
                        {collapsed ? 'NE' : 'NearEstate Admin'}
                    </h1>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    items={menuItems}
                    style={{ marginTop: 16 }}
                />
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
                <Header style={{
                    padding: '0 24px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,21,41,.08)'
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />

                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="text-sm text-gray-600">{user?.email}</span>
                            <Avatar icon={<UserOutlined />} />
                        </div>
                    </Dropdown>
                </Header>

                <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
                    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 112px)' }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
