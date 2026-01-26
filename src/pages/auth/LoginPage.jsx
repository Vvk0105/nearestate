import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Input, Button, Card, Divider, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

export default function LoginPage() {
    const [step, setStep] = useState('email');
    const [loading, setLoading] = useState(false);
    const [emailValue, setEmailValue] = useState('');
    const { login, apiClient } = useAuth();
    const navigate = useNavigate();
    const [emailForm] = Form.useForm();
    const [otpForm] = Form.useForm();

    const handleSendOTP = async (values) => {
        setLoading(true);
        try {
            await apiClient.post('/auth/email-otp/send/', { email: values.email });
            setEmailValue(values.email);
            setStep('otp');
            message.success('OTP sent to your email!');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to send OTP. Please try again.';
            message.error(errorMessage);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (values) => {
        setLoading(true);
        try {
            const res = await apiClient.post('/auth/email-otp/verify/', {
                email: emailValue,
                otp: values.otp
            });
            const { access, refresh, user } = res.data;
            login(access, user, refresh);
            message.success('Login successful!');
            navigateUser(user);
        } catch (error) {
            console.error("Login verification failed:", error);
            const errorMessage = error.response?.data?.error || 'Invalid OTP or Login Failed. Please try again.';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!window.google) return;

        window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: async (response) => {
                try {
                    const res = await apiClient.post("/auth/google/login/", {
                        token: response.credential,
                    });

                    const { access, refresh, user } = res.data;

                    login(access, user, refresh);
                    message.success("Google login successful");

                    navigateUser(user);
                } catch (err) {
                    console.error(err);
                    const errorMessage = err.response?.data?.error || "Google login failed";
                    message.error(errorMessage);
                }
            },
        });

        window.google.accounts.id.renderButton(
            document.getElementById("google-btn"),
            {
                theme: "outline",
                size: "large",
                width: "100%",
            }
        );
    }, []);

    const navigateUser = (user) => {
        let role = user?.role;
        if (user?.active_role) role = user.active_role;
        else if (Array.isArray(role)) role = role[0];

        if (!role) {
            navigate('/auth/select-role');
        } else if (role === 'VISITOR') {
            navigate('/visitor/home');
        } else if (role === 'EXHIBITOR') {
            // Check if profile is completed
            if (user?.profile_completed) {
                navigate('/exhibitor/home');
            } else {
                navigate('/exhibitor/profile');
            }
        } else {
            navigate('/auth/select-role');
        }
    };

    return (
        <>
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-extrabold text-slate-900">
                    Sign in
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    Access your NearEstate account
                </p>
            </div>

            <div className="space-y-6">
                {step === 'email' ? (
                    <Form
                        form={emailForm}
                        onFinish={handleSendOTP}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            label="Email address"
                            rules={[
                                { required: true, message: 'Please enter your email' },
                                { type: 'email', message: 'Please enter a valid email address' }
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined className="text-gray-400" />}
                                placeholder="you@example.com"
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </Button>
                        </Form.Item>
                    </Form>
                ) : (
                    <Form
                        form={otpForm}
                        onFinish={handleVerifyOTP}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="otp"
                            label="Enter OTP"
                            rules={[
                                { required: true, message: 'Please enter the OTP' },
                                { len: 6, message: 'OTP must be 6 digits' },
                                { pattern: /^\d+$/, message: 'OTP must contain only numbers' }
                            ]}
                        >
                            <Input
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="123456"
                                maxLength={6}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </Button>
                        </Form.Item>
                        <Button
                            type="link"
                            block
                            onClick={() => setStep('email')}
                        >
                            Change Email
                        </Button>
                    </Form>
                )}

                <Divider>Or continue with</Divider>

                <div>
                    <div
                        id="google-btn"
                        className="flex justify-center"
                    />
                </div>
            </div>
        </>
    );
}
