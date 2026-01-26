import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Input, Select, Button, Card, message } from 'antd';
import { PhoneOutlined, EnvironmentOutlined, SolutionOutlined } from '@ant-design/icons';
import { BankOutlined } from '@ant-design/icons';


const { Option } = Select;

export default function ExhibitorProfileForm() {
    const { apiClient, setUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await apiClient.post('/exhibitions/exhibitor/profile/', values);

            // Update user state to reflect profile completion
            const userResponse = await apiClient.get('/auth/me/');
            setUser(userResponse.data);

            message.success("Profile setup complete! Welcome aboard.");
            setTimeout(() => {
                navigate('/exhibitor/home');
            }, 1000);
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.company_name?.[0] ||
                error.response?.data?.contact_number?.[0] ||
                "Failed to save profile. Please check your inputs.";
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Card
                className="shadow-xl"
                title={
                    <div className="text-center py-4">
                        <BankOutlined className="text-4xl text-blue-500 mb-2" />
                        <h2 className="text-2xl font-bold">Setup Exhibitor Profile</h2>
                        <p className="text-gray-500 mt-2">Tell us about your business to get started</p>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ business_type: 'DEVELOPER' }}
                    size="large"
                >
                    <Form.Item
                        name="company_name"
                        label={
                            <span className="flex items-center gap-2">
                                <SolutionOutlined /> Company Name
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please enter company name' },
                            { min: 2, message: 'Company name must be at least 2 characters' },
                            { max: 200, message: 'Company name cannot exceed 200 characters' }
                        ]}
                    >
                        <Input placeholder="e.g. Acme Properties Ltd." />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="council_area"
                            label={
                                <span className="flex items-center gap-2">
                                    <EnvironmentOutlined /> Council Area
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Please enter council area' },
                                { max: 100, message: 'Council area cannot exceed 100 characters' }
                            ]}
                        >
                            <Input placeholder="e.g. Sydney CBD" />
                        </Form.Item>

                        <Form.Item
                            name="contact_number"
                            label={
                                <span className="flex items-center gap-2">
                                    <PhoneOutlined /> Contact Number
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Please enter contact number' },
                                {
                                    pattern: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
                                    message: 'Please enter a valid phone number (8-15 digits)'
                                }
                            ]}
                        >
                            <Input placeholder="+61 400 000 000" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="business_type"
                        label={
                            <span className="flex items-center gap-2">
                                <SolutionOutlined /> Business Type
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select business type' }]}
                    >
                        <Select>
                            <Option value="DEVELOPER">Real Estate Developer</Option>
                            <Option value="BROKER">Real Estate Agent / Broker</Option>
                            <Option value="LOAN">Mortgage / Loan Provider</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item className="mt-6">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            className="h-12"
                        >
                            {loading ? 'Processing...' : 'Complete Setup'}
                        </Button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Your information will be securely stored and visible to event organizers.
                        </p>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
