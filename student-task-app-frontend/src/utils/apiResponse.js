export const toArray = (value) => (Array.isArray(value) ? value : []);

export const parseTasksPayload = (responseData) => {
    const wrapped = responseData?.data;
    const tasks =
        wrapped?.tasks?.data ??
        wrapped?.tasks ??
        responseData?.tasks?.data ??
        responseData?.tasks ??
        responseData?.data ??
        responseData;

    const stats =
        wrapped?.stats ??
        responseData?.stats ??
        {
            total: 0,
            done: 0,
            progress: 0,
            pending: 0,
        };

    return {
        tasks: toArray(tasks),
        stats,
    };
};

export const parseUserPayload = (responseData) => {
    return responseData?.data?.user ?? responseData?.data ?? responseData?.user ?? responseData ?? null;
};

export const buildAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (/^https?:\/\//i.test(avatarPath)) {
        return avatarPath;
    }

    const defaultBase = typeof window !== 'undefined' ? `${window.location.origin}/storage` : 'https://studentask.web.id/storage';
    const base = (import.meta.env.VITE_STORAGE_URL || defaultBase).replace(/\/$/, '');
    return `${base}/${avatarPath.replace(/^\/+/, '')}`;
};
