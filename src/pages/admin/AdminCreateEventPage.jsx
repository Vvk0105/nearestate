import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Input, DatePicker, InputNumber, Switch, Button, Upload, Card, message, Divider } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function AdminCreateEventPage() {
    const { apiClient } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [galleryFileList, setGalleryFileList] = useState([]);
    const [mapFileList, setMapFileList] = useState([]);

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            const formData = new FormData();

            // Basic fields
            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('start_date', values.start_date.format('YYYY-MM-DD'));
            formData.append('end_date', values.end_date.format('YYYY-MM-DD'));
            formData.append('venue', values.venue);
            formData.append('city', values.city);
            formData.append('state', values.state);
            formData.append('country', values.country);
            formData.append('booth_capacity', values.booth_capacity);
            formData.append('visitor_capacity', values.visitor_capacity);
            if (values.registration_fee !== undefined && values.registration_fee !== null) {
                formData.append('registration_fee', values.registration_fee);
            }
            if (values.payment_details) {
                formData.append('payment_details', values.payment_details);
            }
            formData.append('is_active', values.is_active || false);

            // Map image
            if (mapFileList.length > 0) {
                formData.append('map_image', mapFileList[0].originFileObj);
            }

            // Gallery images
            galleryFileList.forEach(file => {
                formData.append('images', file.originFileObj);
            });

            await apiClient.post('/exhibitions/admin/exhibitions/create/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            message.success('Event created successfully!');
            navigate('/admin/events');
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Failed to create event');
        } finally {
            setSaving(false);
        }
    };

    const validateDates = (_, value) => {
        const startDate = form.getFieldValue('start_date');
        const endDate = form.getFieldValue('end_date');

        if (startDate && endDate && endDate.isBefore(startDate)) {
            return Promise.reject(new Error('End date must be after start date'));
        }
        return Promise.resolve();
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Image must be smaller than 5MB!');
            }
            return false; // Prevent auto upload
        },
        maxCount: 10
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin/events')}
                >
                    Back to Events
                </Button>
                <h1 className="text-2xl font-bold">Create New Event</h1>
                <div style={{ width: 100 }} />
            </div>

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ is_active: true }}
                >
                    <Divider orientation="left">Basic Details</Divider>

                    <Form.Item
                        label="Event Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Please enter event name' },
                            { max: 200, message: 'Name cannot exceed 200 characters' }
                        ]}
                    >
                        <Input placeholder="Enter event name" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[
                            { required: true, message: 'Please enter description' },
                            { max: 1000, message: 'Description cannot exceed 1000 characters' }
                        ]}
                    >
                        <TextArea rows={4} placeholder="Enter event description" />
                    </Form.Item>

                    <Divider orientation="left">Date & Location</Divider>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label="Start Date"
                            name="start_date"
                            rules={[
                                { required: true, message: 'Please select start date' },
                                { validator: validateDates }
                            ]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label="End Date"
                            name="end_date"
                            rules={[
                                { required: true, message: 'Please select end date' },
                                { validator: validateDates }
                            ]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label="Venue"
                            name="venue"
                            rules={[
                                { required: true, message: 'Please enter venue' },
                                { max: 200, message: 'Venue cannot exceed 200 characters' }
                            ]}
                        >
                            <Input placeholder="Enter venue" />
                        </Form.Item>

                        <Form.Item
                            label="City"
                            name="city"
                            rules={[
                                { required: true, message: 'Please enter city' },
                                { max: 100, message: 'City cannot exceed 100 characters' }
                            ]}
                        >
                            <Input placeholder="Enter city" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label="State"
                            name="state"
                            rules={[
                                { required: true, message: 'Please enter state' },
                                { max: 100, message: 'State cannot exceed 100 characters' }
                            ]}
                        >
                            <Input placeholder="Enter state" />
                        </Form.Item>

                        <Form.Item
                            label="Country"
                            name="country"
                            rules={[
                                { required: true, message: 'Please enter country' },
                                { max: 100, message: 'Country cannot exceed 100 characters' }
                            ]}
                        >
                            <Input placeholder="Enter country" />
                        </Form.Item>
                    </div>

                    <Divider orientation="left">Capacity</Divider>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label="Booth Capacity"
                            name="booth_capacity"
                            rules={[
                                { required: true, message: 'Please enter booth capacity' },
                                { type: 'number', min: 1, message: 'Must be at least 1' }
                            ]}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter booth capacity" />
                        </Form.Item>

                        <Form.Item
                            label="Visitor Capacity"
                            name="visitor_capacity"
                            rules={[
                                { required: true, message: 'Please enter visitor capacity' },
                                { type: 'number', min: 1, message: 'Must be at least 1' }
                            ]}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter visitor capacity" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="Registration Fee"
                        name="registration_fee"
                        rules={[
                            { type: 'number', min: 0, message: 'Fee must be 0 or greater' }
                        ]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="Enter registration fee (optional)"
                            prefix="₹"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Payment Details"
                        name="payment_details"
                        tooltip="Free-text payment instructions for exhibitors (e.g. Account No, IFSC, IBAN, SWIFT). Leave blank if not required."
                    >
                        <TextArea
                            rows={4}
                            placeholder="e.g. Account No: 1234567890, Bank: State Bank, IFSC: SBIN0001234, SWIFT: SBININBB&#10;Or: IBAN: GB29NWBK60161331926819, Routing No: 021000021"
                        />
                    </Form.Item>

                    <Divider orientation="left">Images</Divider>

                    <Form.Item label="Map/Banner Image">
                        <Upload
                            {...uploadProps}
                            listType="picture-card"
                            fileList={mapFileList}
                            onChange={({ fileList }) => setMapFileList(fileList)}
                            maxCount={1}
                        >
                            {mapFileList.length < 1 && (
                                <div>
                                    <PictureOutlined />
                                    <div style={{ marginTop: 8 }}>Upload Banner</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Gallery Images">
                        <Upload
                            {...uploadProps}
                            listType="picture-card"
                            fileList={galleryFileList}
                            onChange={({ fileList }) => setGalleryFileList(fileList)}
                        >
                            {galleryFileList.length < 10 && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Active Status" name="is_active" valuePropName="checked">
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>

                    <Divider />

                    <div className="flex gap-4">
                        <Button onClick={() => navigate('/admin/events')} size="large" block>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={saving}
                            icon={<SaveOutlined />}
                            size="large"
                            block
                        >
                            Create Event
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
