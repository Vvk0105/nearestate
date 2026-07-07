import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Input, DatePicker, TimePicker, InputNumber, Switch, Button, Upload, Card, message, Divider, Select } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, PictureOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function AdminCreateEventPage() {
    const { apiClient } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [galleryFileList, setGalleryFileList] = useState([]);
    const [mapFileList, setMapFileList] = useState([]);
    const [priceTiers, setPriceTiers] = useState([{ name: '', fee: 0, description: '' }]);
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
            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('start_date', startDateStr);
            formData.append('end_date', endDateStr);
            formData.append('schedules', JSON.stringify(formattedSchedules));
            formData.append('venue', values.venue);
            if (values.venue_link) formData.append('venue_link', values.venue_link);
            if (values.location_link) formData.append('location_link', values.location_link);
            formData.append('city', values.city);
            formData.append('state', values.state);
            formData.append('country', values.country);
            formData.append('booth_capacity', values.booth_capacity);
            formData.append('visitor_capacity', values.visitor_capacity);
            if (values.registration_fee !== undefined && values.registration_fee !== null) {
                formData.append('registration_fee', values.registration_fee);
                formData.append('currency_symbol', values.currency_symbol || '₹');
            }
            if (values.payment_details) {
                formData.append('payment_details', values.payment_details);
            }
            formData.append('is_active', values.is_active || false);

            // Price tiers
            const validTiers = priceTiers.filter(t => t.name?.trim() && t.fee >= 0);
            if (validTiers.length > 0) {
                formData.append('price_tiers', JSON.stringify(validTiers));
            }

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
                        <Form.Item
                            label="Currency"
                            name="currency_symbol"
                            initialValue="₹"
                            className="md:col-span-1"
                        >
                            <Select>
                                <Select.Option value="₹">₹ (INR)</Select.Option>
                                <Select.Option value="$">$ (USD)</Select.Option>
                                <Select.Option value="€">€ (EUR)</Select.Option>
                                <Select.Option value="£">£ (GBP)</Select.Option>
                                <Select.Option value="¥">¥ (JPY)</Select.Option>
                                <Select.Option value="A$">A$ (AUD)</Select.Option>
                                <Select.Option value="C$">C$ (CAD)</Select.Option>
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
