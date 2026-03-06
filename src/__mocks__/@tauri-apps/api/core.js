// Manual mock for @tauri-apps/api/core
const invoke = jest.fn().mockResolvedValue(null);

module.exports = { invoke };
