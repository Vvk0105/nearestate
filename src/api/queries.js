/**
 * Centralized TanStack Query hooks for all API calls.
 * Provides automatic caching, background revalidation, and deduplication.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicApiClient } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

// ─── Query Key Factory ─────────────────────────────────────────────────────────
// Central place to define all query keys so invalidations are consistent.
export const queryKeys = {
    // Public events list (paginated, filtered, searched)
    publicEvents: (params) => ['publicEvents', params],
    // Banner events (upcoming only, top 5)
    bannerEvents: () => ['bannerEvents'],
    // Single public event detail + exhibitors
    eventDetail: (id) => ['eventDetail', String(id)],
    eventExhibitors: (id) => ['eventExhibitors', String(id)],
    // Visitor registration status for an event
    visitorStatus: (eventId) => ['visitorStatus', String(eventId)],
    // Exhibitor application status
    myApplications: () => ['myApplications'],
    // Admin events list
    adminEvents: (params) => ['adminEvents', params],
    // Admin single event detail
    adminEventDetail: (id) => ['adminEventDetail', String(id)],
    // Exhibitor profile
    exhibitorProfile: () => ['exhibitorProfile'],
    // Admin dashboard stats
    adminStats: () => ['adminStats'],
};

// ─── Public Events List ────────────────────────────────────────────────────────
export function usePublicEvents(params) {
    return useQuery({
        queryKey: queryKeys.publicEvents(params),
        queryFn: async () => {
            const res = await publicApiClient.get('/exhibitions/public/exhibitions/', { params });
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 min — switching filter/tab is instant from cache
        placeholderData: (prev) => prev, // Keep previous data while new page loads (no flash)
    });
}

// ─── Banner Events (Upcoming, top 5) ─────────────────────────────────────────
export function useBannerEvents() {
    return useQuery({
        queryKey: queryKeys.bannerEvents(),
        queryFn: async () => {
            const res = await publicApiClient.get('/exhibitions/public/exhibitions/', {
                params: { page: 1, limit: 5, status: 'upcoming' },
            });
            return res.data.data || [];
        },
        staleTime: 1000 * 60 * 10, // 10 min — banner rarely changes
    });
}

// ─── Single Event Detail ──────────────────────────────────────────────────────
export function useEventDetail(id) {
    return useQuery({
        queryKey: queryKeys.eventDetail(id),
        queryFn: async () => {
            const res = await publicApiClient.get(`/exhibitions/public/exhibitions/${id}/`);
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
    });
}

// ─── Event Exhibitors List ────────────────────────────────────────────────────
export function useEventExhibitors(id) {
    return useQuery({
        queryKey: queryKeys.eventExhibitors(id),
        queryFn: async () => {
            const res = await publicApiClient.get(`/exhibitions/public/exhibitions/${id}/exhibitors/`);
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
    });
}

// ─── Visitor Registration Status ──────────────────────────────────────────────
export function useVisitorStatus(eventId, enabled = false) {
    const { apiClient } = useAuth();
    return useQuery({
        queryKey: queryKeys.visitorStatus(eventId),
        queryFn: async () => {
            const res = await apiClient.get(`/exhibitions/visitor/register/${eventId}/`);
            return res.data;
        },
        staleTime: 1000 * 60 * 2, // 2 min — refresh occasionally
        enabled: !!eventId && enabled,
    });
}

// ─── Exhibitor: My Applications ───────────────────────────────────────────────
export function useMyApplications(enabled = false) {
    const { apiClient } = useAuth();
    return useQuery({
        queryKey: queryKeys.myApplications(),
        queryFn: async () => {
            const res = await apiClient.get('/exhibitions/exhibitor/my-applications/');
            return res.data;
        },
        staleTime: 1000 * 60 * 2,
        enabled,
    });
}

// ─── Admin: Events List ────────────────────────────────────────────────────────
export function useAdminEvents(params) {
    const { apiClient } = useAuth();
    return useQuery({
        queryKey: queryKeys.adminEvents(params),
        queryFn: async () => {
            const res = await apiClient.get('/exhibitions/admin/exhibitions/', { params });
            return res.data;
        },
        staleTime: 1000 * 60 * 2, // 2 min — admin data should feel fresh
        placeholderData: (prev) => prev,
    });
}

// ─── Admin: Single Event Detail ───────────────────────────────────────────────
export function useAdminEventDetail(id) {
    const { apiClient } = useAuth();
    return useQuery({
        queryKey: queryKeys.adminEventDetail(id),
        queryFn: async () => {
            const res = await apiClient.get(`/exhibitions/public/exhibitions/${id}/`);
            return res.data;
        },
        staleTime: 1000 * 60 * 3,
        enabled: !!id,
    });
}

// ─── Exhibitor Profile ────────────────────────────────────────────────────────
export function useExhibitorProfile(enabled = false) {
    const { apiClient } = useAuth();
    return useQuery({
        queryKey: queryKeys.exhibitorProfile(),
        queryFn: async () => {
            const res = await apiClient.get('/exhibitions/exhibitor/profile/');
            return res.data;
        },
        staleTime: 1000 * 60 * 10, // 10 min — profile rarely changes
        enabled,
    });
}

// ─── Admin Dashboard Stats ────────────────────────────────────────────────────
export function useAdminStats() {
    const { apiClient } = useAuth();
    return useQuery({
        queryKey: queryKeys.adminStats(),
        queryFn: async () => {
            const res = await apiClient.get('/exhibitions/admin/dashboard/stats/');
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
    });
}
