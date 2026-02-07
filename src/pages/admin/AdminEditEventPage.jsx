import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Input, DatePicker, InputNumber, Switch, Button, Upload, Card, message, Divider, Spin, Image } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, PictureOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function AdminEditEventPage() {
    const { id } = useParams();
    const { apiClient } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Existing Data
    const [existingImages, setExistingImages] = useState([]);
    const [existingMapImage, setExistingMapImage] = useState(null);
    const [removedImageIds, setRemovedImageIds] = useState([]);
    const [removeMapImage, setRemoveMapImage] = useState(false);

    // New Data
    const [newGalleryFiles, setNewGalleryFiles] = useState([]);
    const [newMapFile, setNewMapFile] = useState(null);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await apiClient.get(`/exhibitions/public/exhibitions/${id}/`);
            const data = res.data;

            form.setFieldsValue({
                name: data.name,
                description: data.description,
                start_date: data.start_date ? dayjs(data.start_date) : null,
                end_date: data.end_date ? dayjs(data.end_date) : null,
                venue: data.venue,
                city: data.city,
                state: data.state,
                country: data.country,
                booth_capacity: data.booth_capacity,
                visitor_capacity: data.visitor_capacity,
                registration_fee: data.registration_fee,
                is_active: data.is_active
            });

            setExistingImages(data.images || []);
            setExistingMapImage(data.map_image);
        } catch (error) {
            console.error("Failed to load event", error);
            message.error("Failed to load event");
            navigate('/admin/events');
        } finally {
            setLoading(false);
        }
    };

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
            formData.append('is_active', values.is_active);

            // Map image
            if (newMapFile) {
                formData.append('map_image', newMapFile);
            }
            if (removeMapImage) {
                formData.append('remove_map_image', 'true');
            }

            // Gallery images
            newGalleryFiles.forEach(file => {
                formData.append('images', file);
            });

            if (removedImageIds.length > 0) {
                formData.append('remove_image_ids', removedImageIds.join(','));
            }

            await apiClient.put(
                `/exhibitions/admin/exhibitions/${id}/update/`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            message.success('Event updated successfully!');
            navigate(`/admin/events/${id}`);
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Failed to update event');
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
                return Upload.LIST_IGNORE;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Image must be smaller than 5MB!');
                return Upload.LIST_IGNORE;
            }
            return false; // Prevent auto upload
        }
    };

    const handleRemoveExistingImage = (imgId) => {
        setExistingImages(existingImages.filter(img => img.id !== imgId));
        setRemovedImageIds([...removedImageIds, imgId]);
    };

    const handleRemoveMapImage = () => {
        setExistingMapImage(null);
        setRemoveMapImage(true);
        setNewMapFile(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <Link to={`/admin/events/${id}`}>
                    <Button icon={<ArrowLeftOutlined />}>
                        Back to Event Details
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Edit Event</h1>
                <div style={{ width: 150 }} />
            </div>

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
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

                    <Divider orientation="left">Images</Divider>

                    {/* Map/Banner Image */}
                    <div className="mb-6">
                        <label className="block mb-2 font-medium">Map/Banner Image</label>

                        {existingMapImage && !removeMapImage && !newMapFile ? (
                            <div className="relative inline-block">
                                <Image
                                    src={existingMapImage.startsWith('http') ? existingMapImage : `${import.meta.env.VITE_MEDIA_BASE_URL}${existingMapImage}`}
                                    alt="Map"
                                    style={{ maxWidth: 300, maxHeight: 200, objectFit: 'cover' }}
                                />
                                <Button
                                    danger
                                    type="primary"
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    onClick={handleRemoveMapImage}
                                    style={{ position: 'absolute', top: 8, right: 8 }}
                                >
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <Upload
                                {...uploadProps}
                                listType="picture-card"
                                maxCount={1}
                                onChange={({ fileList }) => {
                                    if (fileList.length > 0) {
                                        setNewMapFile(fileList[0].originFileObj);
                                        setRemoveMapImage(false);
                                    } else {
                                        setNewMapFile(null);
                                    }
                                }}
                            >
                                <div>
                                    <PictureOutlined />
                                    <div style={{ marginTop: 8 }}>Upload New Banner</div>
                                </div>
                            </Upload>
                        )}
                        {removeMapImage && !newMapFile && (
                            <p className="text-red-500 text-sm mt-2">Map image will be removed</p>
                        )}
                    </div>

                    {/* Existing Gallery Images */}
                    {existingImages.length > 0 && (
                        <div className="mb-6">
                            <label className="block mb-2 font-medium">Current Gallery Images</label>
                            <div className="flex flex-wrap gap-4">
                                {existingImages.map((img) => (
                                    <div key={img.id} className="relative">
                                        <Image
                                            src={img.image?.startsWith('http') ? img.image : `${import.meta.env.VITE_MEDIA_BASE_URL}${img.image || ''}`}
                                            alt="Gallery"
                                            style={{ width: 100, height: 100, objectFit: 'cover' }}
                                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                                        />
                                        <Button
                                            danger
                                            type="primary"
                                            icon={<DeleteOutlined />}
                                            size="small"
                                            onClick={() => handleRemoveExistingImage(img.id)}
                                            style={{ position: 'absolute', top: 4, right: 4 }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Gallery Images */}
                    <Form.Item label="Add New Gallery Images">
                        <Upload
                            {...uploadProps}
                            listType="picture-card"
                            multiple
                            onChange={({ fileList }) => {
                                setNewGalleryFiles(fileList.map(f => f.originFileObj));
                            }}
                            maxCount={10}
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Active Status" name="is_active" valuePropName="checked">
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>

                    <Divider />

                    <div className="flex gap-4">
                        <Button onClick={() => navigate(`/admin/events/${id}`)} size="large" block>
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
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
