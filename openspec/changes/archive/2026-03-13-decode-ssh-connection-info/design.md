## Context

VS Code's SSH Remote extension has two URI formats for identifying SSH hosts:

1. **Old format**: Plain hostname directly in URI — `ssh-remote%2Braspi-clawdia-lab`
2. **New format**: Hex-encoded JSON object — `ssh-remote%2B7b22686f73744e616d65223a22...7d`

The hex blob decodes to JSON like `{"hostName":"build-server-01","user":"root"}`. The current `extractSSHHost()` returns this hex string verbatim, making the column unreadable.

The column is currently named "SSH Host" and shows only the hostname. Renaming to "CONNECTION" and showing richer info (user, port) makes better use of the available data.

All changes are frontend-only — the backend passes raw URIs unchanged.

## Goals / Non-Goals

**Goals:**
- Decode hex-encoded JSON host strings into readable connection info
- Rename "SSH Host" → "CONNECTION" across all UI touchpoints
- Format connection details as `user@host:port` (omitting parts that aren't present)
- Show an error indicator when hex decoding fails

**Non-Goals:**
- Changing the backend workspace scanner or API response format
- Resolving SSH config aliases to IP addresses
- Parsing `~/.ssh/config` for additional host metadata
- Changing the PATH column display

## Decisions

### 1. Hex detection heuristic: prefix check `7b22`

Hex-encoded JSON always starts with `7b22` (the hex for `{"`). This is a reliable, zero-false-positive check since no valid SSH hostname starts with `7b22`.

**Alternative considered**: Try JSON.parse on every host string — rejected because it would attempt parsing on every workspace, and plain hostnames would always fail (noisy, wasteful).

### 2. Single function refactor: `extractConnectionInfo()` replaces `extractSSHHost()`

Rename and extend the existing function. It returns an object `{ display, host, user, port, error }` instead of a plain string. This keeps the extraction logic centralized.

**Alternative considered**: Separate `decodeHexHost()` utility called from the existing function — viable but adds an unnecessary layer since the caller always needs the formatted result.

**Migration**: Export both `extractConnectionInfo` and `extractSSHHost` (deprecated alias) to avoid breaking any imports during transition.

### 3. Display format: `user@host:port` with graceful omission

| Available fields | Display |
|---|---|
| hostName only | `build-server-01` |
| hostName + user | `root@build-server-01` |
| hostName + user + port | `root@build-server-01:2222` |
| hostName + port | `build-server-01:2222` |
| Plain hostname (old format) | `raspi-clawdia-lab` |
| Decode error | `⚠ decode error` |

### 4. Error handling: visible error, not silent fallback

When hex decoding or JSON parsing fails, the CONNECTION field shows `⚠ decode error` with the raw hex string in the `title` attribute (tooltip on hover). This makes failures visible without cluttering the UI.

**Alternative considered**: Show the raw hex string (current behavior) — rejected because it's the exact problem we're solving.

### 5. Column rename: `sshHost` → `connection` internally

The column key, CSS class, visibility toggle, sort key, and localStorage key all change from `sshHost` to `connection`. The `AVAILABLE_COLUMNS` definition and default visibility map update accordingly.

## Risks / Trade-offs

- **[Breaking localStorage]** Users with saved column visibility preferences keyed on `sshHost` will lose that setting → Mitigation: One-time migration in the column visibility initializer that maps `sshHost` → `connection`.
- **[Unknown JSON shapes]** The hex JSON may contain fields we haven't seen yet → Mitigation: Only read `hostName`, `user`, `port`; ignore unknown fields. The raw JSON is available in tooltip on hover.
- **[Hex string that isn't JSON]** A future VS Code format could use hex for something else → Mitigation: Catch parse errors and show error indicator; the tooltip shows raw value for debugging.
