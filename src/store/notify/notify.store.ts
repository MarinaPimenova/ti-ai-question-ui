// src/store/notify/notify.store.ts
import { create } from 'zustand';
import type { NotificationInstance } from 'antd/es/notification/interface';

export interface NotifyState {
    notifyApi: NotificationInstance | null;
    updateNotifyApi: (api: NotificationInstance) => void;
}

export const useNotifyStore = create<NotifyState>((set) => ({
    notifyApi: null,
    updateNotifyApi: (api) => set({ notifyApi: api }),
}));
