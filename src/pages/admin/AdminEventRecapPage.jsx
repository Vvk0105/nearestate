import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Card, Button, Upload, message, Divider, Spin, Image, Input, Form, Space
} from 'antd';
import {
    ArrowLeftOutlined, SaveOutlined, UploadOutlined, DeleteOutlined,
    PlusOutlined, YoutubeOutlined, LinkOutlined
} from '@ant-design/icons';
import { compressImages } from '../../utils/compressImage';

export default function AdminEventRecapPage() {
    const { id } = useParams();
    const { apiClient } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [compressing, setCompressing] = useState(false);

    // Existing data from API
    const [existingImages, setExistingImages] = useState([]);
    const [existingVideos, setExistingVideos] = useState([]);
    const [existingSocialLinks, setExistingSocialLinks] = useState([]);

    // IDs to remove
    const [removeImageIds, setRemoveImageIds] = useState([]);
    const [removeVideoIds, setRemoveVideoIds] = useState([]);
    const [removeSocialIds, setRemoveSocialIds] = useState([]);

    // New entries (unsaved)
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [newVideos, setNewVideos] = useState([]); // [{youtube_url, title}]
    const [newSocialLinks, setNewSocialLinks] = useState([]); // [{title, url}]

    // Event info
    const [eventName, setEventName] = useState('');

    useEffect(() => {
        fetchRecap();
    }, [id]);

    const fetchRecap = async () => {
        try {
            // Get event name
            const evRes = await apiClient.get(`/exhibitions/public/exhibitions/${id}/`);
            setEventName(evRes.data.name);

            // Try to get existing recap
            try {
                const recapRes = await apiClient.get(`/exhibitions/admin/exhibitions/${id}/recap/`);
                const recap = recapRes.data;
                setExistingImages(recap.images || []);
                setExistingVideos(recap.videos || []);
                setExistingSocialLinks(recap.social_links || []);
            } catch {
                // No recap yet — that's fine
            }
        } catch {
            message.error('Failed to load event');
            navigate(`/admin/events/${id}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();

            // Images to remove
            if (removeImageIds.length > 0) {
                formData.append('remove_image_ids', removeImageIds.join(','));
            }
            // New images — compress before upload
            if (newImageFiles.length > 0) {
                setCompressing(true);
                const rawFiles = newImageFiles.map(f => f.originFileObj);
                const compressedFiles = await compressImages(rawFiles, 'gallery');
                setCompressing(false);
                compressedFiles.forEach(f => formData.append('recap_images', f));
            }

            // Videos to remove
            if (removeVideoIds.length > 0) {
                formData.append('remove_video_ids', removeVideoIds.join(','));
            }
            // New videos
            const validNewVideos = newVideos.filter(v => v.youtube_url?.trim());
            if (validNewVideos.length > 0) {
                formData.append('new_videos', JSON.stringify(validNewVideos));
            }

            // Social links to remove
            if (removeSocialIds.length > 0) {
                formData.append('remove_social_ids', removeSocialIds.join(','));
            }
            // New social links
            const validNewSocials = newSocialLinks.filter(s => s.title?.trim() && s.url?.trim());
            if (validNewSocials.length > 0) {
                formData.append('new_social_links', JSON.stringify(validNewSocials));
            }

            await apiClient.put(`/exhibitions/admin/exhibitions/${id}/recap/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            message.success('Event recap saved!');
            // Reset new items and re-fetch
            setNewImageFiles([]);
            setNewVideos([]);
            setNewSocialLinks([]);
            setRemoveImageIds([]);
            setRemoveVideoIds([]);
            setRemoveSocialIds([]);
            fetchRecap();
        } catch (err) {
            message.error(err.response?.data?.detail || 'Failed to save recap');
        } finally {
            setSaving(false);
        }
    };

    const addNewVideo = () => setNewVideos(v => [...v, { youtube_url: '', title: '' }]);
    const updateNewVideo = (idx, field, val) => {
        setNewVideos(v => v.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    };
    const removeNewVideo = (idx) => setNewVideos(v => v.filter((_, i) => i !== idx));

    const addNewSocial = () => setNewSocialLinks(s => [...s, { title: '', url: '' }]);
    const updateNewSocial = (idx, field, val) => {
        setNewSocialLinks(s => s.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    };
    const removeNewSocial = (idx) => setNewSocialLinks(s => s.filter((_, i) => i !== idx));

    const uploadProps = {
        beforeUpload: (file) => {
            if (!file.type.startsWith('image/')) {
                message.error('Only image files are allowed!');
                return Upload.LIST_IGNORE;
            }
            if (file.size / 1024 / 1024 > 10) {
                message.error('Image must be smaller than 10MB!');
                return Upload.LIST_IGNORE;
            }
            return false;
        }
    };

    if (loading) return <div className="flex justify-center items-center p-12"><Spin size="large" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-4">
                <Link to={`/admin/events/${id}`}>
                    <Button icon={<ArrowLeftOutlined />}>Back to Event</Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-center">Event Recap</h1>
                    <p className="text-slate-500 text-sm text-center">{eventName}</p>
                </div>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSave}
                    size="large"
                >
                    Save Recap
                </Button>
            </div>

            {/* ── Images ── */}
            <Card title="📷 Recap Images" className="shadow-sm">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-2 font-medium">Current Images</p>
                        <div className="flex flex-wrap gap-3">
                            {existingImages.map(img => (
                                <div key={img.id} className="relative group">
                                    <Image
                                        src={img.image}
                                        alt="Recap"
                                        style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
                                        className={removeImageIds.includes(img.id) ? 'opacity-40' : ''}
                                    />
                                    {!removeImageIds.includes(img.id) ? (
                                        <Button
                                            danger type="primary" size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => setRemoveImageIds(ids => [...ids, img.id])}
                                            style={{ position: 'absolute', top: 4, right: 4 }}
                                        />
                                    ) : (
                                        <Button
                                            size="small"
                                            onClick={() => setRemoveImageIds(ids => ids.filter(i => i !== img.id))}
                                            style={{ position: 'absolute', top: 4, right: 4, fontSize: 10 }}
                                        >
                                            Undo
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Divider dashed orientation="left"><span className="text-xs text-slate-400">Add New Images</span></Divider>
                <Upload
                    {...uploadProps}
                    listType="picture-card"
                    multiple
                    fileList={newImageFiles}
                    onChange={({ fileList }) => setNewImageFiles(fileList)}
                >
                    {newImageFiles.length < 20 && (
                        <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                    )}
                </Upload>
            </Card>

            {/* ── Videos ── */}
            <Card title="▶️ Recap Videos (YouTube)" className="shadow-sm">
                {/* Existing Videos */}
                {existingVideos.length > 0 && (
                    <div className="mb-4 space-y-2">
                        <p className="text-sm text-slate-500 font-medium">Current Videos</p>
                        {existingVideos.map(v => (
                            <div key={v.id} className={`flex items-center justify-between p-3 bg-slate-50 rounded-lg border ${removeVideoIds.includes(v.id) ? 'opacity-40 line-through' : ''}`}>
                                <div className="flex items-center gap-2 min-w-0">
                                    <YoutubeOutlined style={{ color: '#ff0000', fontSize: 20 }} />
                                    <div className="min-w-0">
                                        {v.title && <p className="font-semibold text-sm truncate">{v.title}</p>}
                                        <p className="text-xs text-slate-500 truncate">{v.youtube_url}</p>
                                    </div>
                                </div>
                                {!removeVideoIds.includes(v.id) ? (
                                    <Button danger size="small" icon={<DeleteOutlined />}
                                        onClick={() => setRemoveVideoIds(ids => [...ids, v.id])} />
                                ) : (
                                    <Button size="small"
                                        onClick={() => setRemoveVideoIds(ids => ids.filter(i => i !== v.id))}>
                                        Undo
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <Divider dashed orientation="left"><span className="text-xs text-slate-400">Add New Videos</span></Divider>
                <div className="space-y-3">
                    {newVideos.map((v, i) => (
                        <div key={i} className="flex gap-2 items-start bg-red-50 border border-red-200 p-3 rounded-lg">
                            <YoutubeOutlined style={{ color: '#ff0000', fontSize: 22, marginTop: 8 }} />
                            <div className="flex-1 space-y-2">
                                <Input
                                    placeholder="YouTube URL (e.g. https://youtu.be/abc123)"
                                    value={v.youtube_url}
                                    onChange={e => updateNewVideo(i, 'youtube_url', e.target.value)}
                                    prefix={<LinkOutlined className="text-slate-400" />}
                                />
                                <Input
                                    placeholder="Video title (optional)"
                                    value={v.title}
                                    onChange={e => updateNewVideo(i, 'title', e.target.value)}
                                />
                            </div>
                            <Button danger icon={<DeleteOutlined />} onClick={() => removeNewVideo(i)} />
                        </div>
                    ))}
                    <Button icon={<PlusOutlined />} onClick={addNewVideo} dashed block>
                        Add YouTube Video
                    </Button>
                </div>
            </Card>

            {/* ── Social Links ── */}
            <Card title="🔗 Social Media Links" className="shadow-sm">
                {/* Existing Social Links */}
                {existingSocialLinks.length > 0 && (
                    <div className="mb-4 space-y-2">
                        <p className="text-sm text-slate-500 font-medium">Current Links</p>
                        {existingSocialLinks.map(s => (
                            <div key={s.id} className={`flex items-center justify-between p-3 bg-slate-50 rounded-lg border ${removeSocialIds.includes(s.id) ? 'opacity-40 line-through' : ''}`}>
                                <div className="flex items-center gap-2 min-w-0">
                                    <LinkOutlined className="text-blue-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm">{s.title}</p>
                                        <a href={s.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                                            {s.url}
                                        </a>
                                    </div>
                                </div>
                                {!removeSocialIds.includes(s.id) ? (
                                    <Button danger size="small" icon={<DeleteOutlined />}
                                        onClick={() => setRemoveSocialIds(ids => [...ids, s.id])} />
                                ) : (
                                    <Button size="small"
                                        onClick={() => setRemoveSocialIds(ids => ids.filter(i => i !== s.id))}>
                                        Undo
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <Divider dashed orientation="left"><span className="text-xs text-slate-400">Add New Links</span></Divider>
                <div className="space-y-3">
                    {newSocialLinks.map((s, i) => (
                        <div key={i} className="flex gap-2 items-start bg-blue-50 border border-blue-200 p-3 rounded-lg">
                            <LinkOutlined className="text-blue-500 mt-2.5 flex-shrink-0" />
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Input
                                    placeholder="Platform name (e.g. Instagram)"
                                    value={s.title}
                                    onChange={e => updateNewSocial(i, 'title', e.target.value)}
                                />
                                <Input
                                    placeholder="https://instagram.com/..."
                                    value={s.url}
                                    onChange={e => updateNewSocial(i, 'url', e.target.value)}
                                />
                            </div>
                            <Button danger icon={<DeleteOutlined />} onClick={() => removeNewSocial(i)} />
                        </div>
                    ))}
                    <Button icon={<PlusOutlined />} onClick={addNewSocial} dashed block>
                        Add Social Link
                    </Button>
                </div>
            </Card>

            {/* Bottom Save */}
            <div className="flex gap-4 pb-8">
                <Button size="large" block onClick={() => navigate(`/admin/events/${id}`)}>Cancel</Button>
                <Button type="primary" size="large" block loading={saving} icon={<SaveOutlined />} onClick={handleSave}>
                    Save Recap
                </Button>
            </div>
        </div>
    );
}
