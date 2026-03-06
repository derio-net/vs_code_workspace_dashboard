// Manual mock for @tauri-apps/plugin-dialog
const ask = jest.fn().mockResolvedValue(true);
const confirm = jest.fn().mockResolvedValue(true);
const message = jest.fn().mockResolvedValue(undefined);
const open = jest.fn().mockResolvedValue(null);
const save = jest.fn().mockResolvedValue(null);

module.exports = { ask, confirm, message, open, save };
