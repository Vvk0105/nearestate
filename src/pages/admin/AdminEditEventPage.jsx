import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Input, DatePicker, TimePicker, InputNumber, Switch, Button, Upload, Card, message, Divider, Spin, Image, Select } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, PictureOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { compressImage, compressImages } from '../../utils/compressImage';

const { TextArea } = Input;

export default function AdminEditEventPage() {
    const { id } = useParams();
    const { apiClient } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [compressing, setCompressing] = useState(false);

    // Existing Data
    const [existingImages, setExistingImages] = useState([]);
    const [existingMapImage, setExistingMapImage] = useState(null);
    const [removedImageIds, setRemovedImageIds] = useState([]);
    const [removeMapImage, setRemoveMapImage] = useState(false);

    // New Data
    const [newGalleryFiles, setNewGalleryFiles] = useState([]);
    const [newMapFile, setNewMapFile] = useState(null);

    // Price Tiers
    const [priceTiers, setPriceTiers] = useState([{ name: '', fee: 0, description: '' }]);

    // Schedules
    const [schedules, setSchedules] = useState([{ date: null, start_time: null, end_time: null }]);

    const addScheduleRow = () => {
        setSchedules(prev => [...prev, { date: null, start_time: null, end_time: null }]);
    };

    const updateScheduleRow = (index, field, value) => {
        setSchedules(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
    };

    const removeScheduleRow = (index) => {
        setSchedules(prev => prev.filter((_, idx) => idx !== index));
    };

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
                venue_link: data.venue_link || '',
                location_link: data.location_link || '',
                city: data.city,
                state: data.state,
                country: data.country,
                booth_capacity: data.booth_capacity,
                visitor_capacity: data.visitor_capacity,
                registration_fee: data.registration_fee,
                // Set standard currency code for the dropdown
                currency_code: data.currency_code || 'INR',
                is_active: data.is_active
            });

            setExistingImages(data.images || []);
            setExistingMapImage(data.map_image);
            // Load existing price tiers (or default to 1 blank row)
            if (data.price_tiers && data.price_tiers.length > 0) {
                setPriceTiers(data.price_tiers.map(t => ({ name: t.name, fee: t.fee, description: t.description || '' })));
            }

            // Load existing schedules (or fallback to start_date / end_date as default schedule if no schedules yet)
            if (data.schedules && data.schedules.length > 0) {
                setSchedules(data.schedules.map(s => ({
                    date: s.date ? dayjs(s.date) : null,
                    start_time: s.start_time ? dayjs(`2000-01-01T${s.start_time}`) : null,
                    end_time: s.end_time ? dayjs(`2000-01-01T${s.end_time}`) : null
                })));
            } else if (data.start_date) {
                setSchedules([
                    {
                        date: dayjs(data.start_date),
                        start_time: dayjs('09:00:00', 'HH:mm:ss'),
                        end_time: dayjs('17:00:00', 'HH:mm:ss')
                    }
                ]);
            }
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
            // Validate schedules
            if (!schedules || schedules.length === 0) {
                message.error('Please configure at least one date for the event');
                setSaving(false);
                return;
            }

            for (let i = 0; i < schedules.length; i++) {
                const s = schedules[i];
                if (!s.date || !s.start_time || !s.end_time) {
                    message.error(`Please fill out all fields (Date, Start Time, End Time) for day ${i + 1}`);
                    setSaving(false);
                    return;
                }
                if (s.end_time.isBefore(s.start_time)) {
                    message.error(`End time must be after start time for day ${i + 1}`);
                    setSaving(false);
                    return;
                }
            }

            // Sort schedules by date
            const sortedSchedules = [...schedules].sort((a, b) => a.date.diff(b.date));
            const formattedSchedules = sortedSchedules.map(s => ({
                date: s.date.format('YYYY-MM-DD'),
                start_time: s.start_time.format('HH:mm:ss'),
                end_time: s.end_time.format('HH:mm:ss')
            }));

            const startDateStr = sortedSchedules[0].date.format('YYYY-MM-DD');
            const endDateStr = sortedSchedules[sortedSchedules.length - 1].date.format('YYYY-MM-DD');

            const formData = new FormData();

            // Basic fields
            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('start_date', startDateStr);
            formData.append('end_date', endDateStr);
            formData.append('schedules', JSON.stringify(formattedSchedules));
            formData.append('venue', values.venue);
            // Always send venue_link / location_link so clearing them is respected server-side
            formData.append('venue_link', values.venue_link || '');
            formData.append('location_link', values.location_link || '');
            formData.append('city', values.city);
            formData.append('state', values.state);
            formData.append('country', values.country);
            formData.append('booth_capacity', values.booth_capacity);
            formData.append('visitor_capacity', values.visitor_capacity);
            if (values.registration_fee !== undefined && values.registration_fee !== null) {
                formData.append('registration_fee', values.registration_fee);
            }
            // Currency: mapped from standard currency_code
            const CURRENCY_MAP = {
                'INR': '₹', 'AUD': 'A$', 'USD': '$', 'EUR': '€', 
                'GBP': '£', 'JPY': '¥', 'CAD': 'C$',
            };
            const currencyCode = values.currency_code || 'INR';
            const currencySymbol = CURRENCY_MAP[currencyCode] || '₹';
            formData.append('currency_symbol', currencySymbol);
            formData.append('currency_code',   currencyCode);

            formData.append('is_active', values.is_active);

            // Price tiers
            const validTiers = priceTiers.filter(t => t.name?.trim());
            formData.append('price_tiers', JSON.stringify(validTiers));

            // Map image — compress before upload
            if (newMapFile) {
                setCompressing(true);
                const compressedMap = await compressImage(newMapFile, 'gallery');
                setCompressing(false);
                formData.append('map_image', compressedMap);
            }
            if (removeMapImage) {
                formData.append('remove_map_image', 'true');
            }

            // Gallery images — compress all concurrently
            if (newGalleryFiles.length > 0) {
                setCompressing(true);
                const compressedFiles = await compressImages(newGalleryFiles, 'gallery');
                setCompressing(false);
                compressedFiles.forEach(file => formData.append('images', file));
            }

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

                    {/* Dynamic Event Schedules & Timings */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Event Dates & Timings *</h4>
                        <div className="space-y-3">
                            {schedules.map((sched, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-4">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            value={sched.date}
                                            onChange={(val) => updateScheduleRow(idx, 'date', val)}
                                            placeholder="Select Date"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Start Time</label>
                                        <TimePicker
                                            style={{ width: '100%' }}
                                            use12Hours
                                            format="hh:mm A"
                                            value={sched.start_time}
                                            onChange={(val) => updateScheduleRow(idx, 'start_time', val)}
                                            placeholder="Start"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">End Time</label>
                                        <TimePicker
                                            style={{ width: '100%' }}
                                            use12Hours
                                            format="hh:mm A"
                                            value={sched.end_time}
                                            onChange={(val) => updateScheduleRow(idx, 'end_time', val)}
                                            placeholder="End"
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-end pt-5 justify-center">
                                        {schedules.length > 1 && (
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeScheduleRow(idx)}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            type="dashed"
                            onClick={addScheduleRow}
                            icon={<PlusOutlined />}
                            block
                            className="mt-3"
                        >
                            Add Event Day / Timing
                        </Button>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label="Venue Link (optional)"
                            name="venue_link"
                            tooltip="Link to the venue website or event registration page"
                            rules={[{ type: 'url', message: 'Please enter a valid URL (include https://)' }]}
                        >
                            <Input placeholder="https://venuename.com" />
                        </Form.Item>

                        <Form.Item
                            label="Location Link (optional)"
                            name="location_link"
                            tooltip="Google Maps or any map link for the venue location"
                            rules={[{ type: 'url', message: 'Please enter a valid URL (include https://)' }]}
                        >
                            <Input placeholder="https://maps.google.com/..." />
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

                    <Divider orientation="left">Pricing Tiers</Divider>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-2">
                        <Form.Item label="Currency" name="currency_code" className="md:col-span-1">
                            <Select>
                                <Select.Option value="INR">₹ INR (Indian Rupee)</Select.Option>
                                <Select.Option value="AUD">A$ AUD (Australian Dollar)</Select.Option>
                                <Select.Option value="USD">$ USD (US Dollar)</Select.Option>
                                <Select.Option value="EUR">€ EUR (Euro)</Select.Option>
                                <Select.Option value="GBP">£ GBP (British Pound)</Select.Option>
                                <Select.Option value="JPY">¥ JPY (Japanese Yen)</Select.Option>
                                <Select.Option value="CAD">C$ CAD (Canadian Dollar)</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    {/* Dynamic Price Tier Rows */}
                    <div className="space-y-3 mb-4">
                        {priceTiers.map((tier, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 items-start bg-slate-50 border border-slate-200 p-3 rounded-lg">
                                <div className="col-span-4">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Tier Name *</label>
                                    <Input
                                        placeholder="e.g. Standard, Premium"
                                        value={tier.name}
                                        onChange={e => setPriceTiers(tiers => tiers.map((t, idx) => idx === i ? { ...t, name: e.target.value } : t))}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Fee *</label>
                                    <InputNumber
                                        min={0} style={{ width: '100%' }}
                                        placeholder="0"
                                        value={tier.fee}
                                        onChange={val => setPriceTiers(tiers => tiers.map((t, idx) => idx === i ? { ...t, fee: val || 0 } : t))}
                                    />
                                </div>
                                <div className="col-span-4">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Description (optional)</label>
                                    <Input
                                        placeholder="e.g. 3x3m booth"
                                        value={tier.description}
                                        onChange={e => setPriceTiers(tiers => tiers.map((t, idx) => idx === i ? { ...t, description: e.target.value } : t))}
                                    />
                                </div>
                                <div className="col-span-1 flex items-end pb-0.5">
                                    {priceTiers.length > 1 && (
                                        <Button
                                            danger icon={<DeleteOutlined />}
                                            onClick={() => setPriceTiers(tiers => tiers.filter((_, idx) => idx !== i))}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button
                        icon={<PlusOutlined />} dashed block
                        onClick={() => setPriceTiers(t => [...t, { name: '', fee: 0, description: '' }])}
                    >
                        Add Price Tier
                    </Button>



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
                            loading={saving || compressing}
                            icon={<SaveOutlined />}
                            size="large"
                            block
                        >
                            {compressing ? 'Compressing images...' : 'Save Changes'}
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
