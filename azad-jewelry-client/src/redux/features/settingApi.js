import { apiSlice } from "../api/apiSlice";

const SETTINGS_CACHE_KEY = "globalSettingsCache";

export const getCachedGlobalSettings = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SETTINGS_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const setCachedGlobalSettings = (settings) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings ?? null));
  } catch {
    // do nothing
  }
};

export const settingApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getGlobalSettings: builder.query({
      query: () => "/api/settings",
      providesTags: ['Settings'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          setCachedGlobalSettings(data);
        } catch {
          // do nothing
        }
      },
    }),
    updateGlobalSettings: builder.mutation({
      query: (data) => ({
        url: "/api/settings",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    // Backup
    downloadBackup: builder.mutation({
      query: () => ({
        url: "/api/backup/download",
        method: "GET",
        responseHandler: (response) => response.blob(), // Important for file download
      }),
    }),
    restoreBackup: builder.mutation({
      query: (data) => ({
        url: "/api/backup/restore",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetGlobalSettingsQuery,
  useUpdateGlobalSettingsMutation,
  useDownloadBackupMutation,
  useRestoreBackupMutation,
} = settingApi;
