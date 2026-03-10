// Manual mock for @tauri-apps/api/event
export const emit = jest.fn().mockResolvedValue(undefined);
export const listen = jest.fn().mockResolvedValue(jest.fn());
