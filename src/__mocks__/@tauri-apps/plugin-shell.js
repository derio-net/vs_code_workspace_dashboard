// Manual mock for @tauri-apps/plugin-shell
const open = jest.fn().mockResolvedValue(undefined);

const Command = {
  create: jest.fn().mockReturnValue({
    execute: jest.fn().mockResolvedValue({ code: 0, stdout: '', stderr: '' }),
    spawn: jest.fn().mockResolvedValue({ pid: 1234 }),
  }),
};

module.exports = { open, Command };
