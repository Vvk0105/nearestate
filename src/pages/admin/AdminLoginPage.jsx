import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

export default function AdminLoginPage() {
    const [loading, setLoading] = useState(false);
    const { login, apiClient } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const res = await apiClient.post('/auth/admin/login/', values);
            const { access, refresh, user, role } = res.data;

            if (role !== 'ADMIN' && !user?.is_superuser) {
                message.error("Access Denied. Admins only.");
                setLoading(false);
                return;
            }

            const userData = { ...user, active_role: role || (user?.is_superuser ? 'ADMIN' : undefined) };
            
            login(access, userData, refresh);
            console.log("LOGIN SUCCESS - REDIRECTING");
            navigate('/admin/dashboard');
            message.success("Welcome Admin!");
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.error || "Admin Login Failed. Check credentials.";
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <Card
                className="max-w-md w-full"
                style={{ borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Portal</h1>
                    <p className="text-slate-500 mt-2">Secure access for administrators</p>
                </div>

                <Form
                    form={form}
                    name="admin_login"
                    onFinish={handleLogin}
                    layout="vertical"
                    size="large"
                    requiredMark={false}
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined className="text-gray-400" />}
                            placeholder="admin@example.com"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                    // rules={[
                    //     { required: true, message: 'Please enter your password' },
                    //     { min: 6, message: 'Password must be at least 6 characters' }
                    // ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="••••••••"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            style={{ height: 48, fontSize: 16, fontWeight: 'bold' }}
                        >
                            {loading ? 'Authenticating...' : 'Login to Dashboard'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
