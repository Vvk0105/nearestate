import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Input, InputNumber, Select, Button, Upload, Card, message } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

export default function AddPropertyForm() {
    const { apiClient } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [exhibitions, setExhibitions] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchApprovedApps = async () => {
            try {
                const res = await apiClient.get('/exhibitions/exhibitor/my-applications/');
                const approved = res.data.filter(app => app.status === 'APPROVED');
                setExhibitions(approved);
            } catch (error) {
                console.error(error);
            }
        };
        fetchApprovedApps();
    }, [apiClient]);

    const handleSubmit = async (values) => {
        if (!values.exhibition) {
            message.error("Please select an exhibition.");
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('exhibition', values.exhibition);
        data.append('title', values.title);
        data.append('description', values.description);
        data.append('location', values.location);
        data.append('price_from', values.price_from);
        data.append('price_to', values.price_to);

        fileList.forEach((file) => {
            data.append('uploaded_images', file.originFileObj);
        });

        try {
            await apiClient.post(`exhibitions/exhibitor/properties/${values.exhibition}/create/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success("Property listed successfully!");
            navigate('/exhibitor/properties');
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.title?.[0] ||
                error.response?.data?.price?.[0] ||
                "Failed to add property.";
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return Upload.LIST_IGNORE;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Image must be smaller than 5MB!');
                return Upload.LIST_IGNORE;
            }
            return false; // Prevent auto upload
        },
        fileList,
        onChange: ({ fileList: newFileList }) => {
            setFileList(newFileList.slice(0, 3));
        },
        listType: 'picture-card',
        maxCount: 3
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold mb-6">Add New Property</h1>

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    size="large"
                >
                    <Form.Item
                        name="exhibition"
                        label="Select Event"
                        rules={[{ required: true, message: 'Please select an event' }]}
                        help={exhibitions.length === 0 ? "You must have an approved application to add properties" : ""}
                        validateStatus={exhibitions.length === 0 ? "error" : ""}
                    >
                        <Select placeholder="-- Select Approved Event --">
                            {exhibitions.map(app => (
                                <Option key={app.exhibition_id} value={app.exhibition_id}>
                                    {app.exhibition}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="title"
                        label="Property Title"
                        rules={[
                            { required: true, message: 'Please enter property title' },
                            { min: 3, message: 'Title must be at least 3 characters' },
                            { max: 200, message: 'Title cannot exceed 200 characters' }
                        ]}
                    >
                        <Input placeholder="e.g. Luxury 3BHK Apartment in CBD" />
                    </Form.Item>

                    <Form.Item
                        name="location"
                        label="Location"
                        rules={[
                            { required: true, message: 'Please enter location' },
                            { max: 200, message: 'Location cannot exceed 200 characters' }
                        ]}
                    >
                        <Input placeholder="e.g. Downtown, Sydney" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="price_from"
                            label="Price From (₹)"
                            rules={[
                                { required: true, message: 'Please enter starting price' },
                                { type: 'number', min: 0, message: 'Price cannot be negative' }
                            ]}
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                placeholder="e.g. 5000000"
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="price_to"
                            label="Price To (₹)"
                            rules={[
                                { required: true, message: 'Please enter ending price' },
                                { type: 'number', min: 0, message: 'Price cannot be negative' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('price_from') <= value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('End price must be greater than start price'));
                                    },
                                })
                            ]}
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                placeholder="e.g. 8000000"
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            { required: true, message: 'Please enter description' },
                            { max: 2000, message: 'Description cannot exceed 2000 characters' }
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Describe the property features, amenities, etc."
                            showCount
                            maxLength={2000}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Property Images (Max 3)"
                        help="Upload up to 3 images (PNG, JPG up to 5MB each)"
                    >
                        <Upload {...uploadProps}>
                            {fileList.length < 3 && (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <div className="flex gap-3 pt-4">
                        <Button onClick={() => navigate(-1)} size="large" block>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            block
                        >
                            {loading ? 'Saving...' : 'Add Property'}
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
