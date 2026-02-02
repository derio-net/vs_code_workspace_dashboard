#!/bin/sh
set -e

# Validate that /workspaces mount point is accessible and not empty
MOUNT_POINT="/workspaces"

echo "Validating workspace mount point: $MOUNT_POINT"

if [ ! -d "$MOUNT_POINT" ]; then
  echo "ERROR: Workspace mount point does not exist: $MOUNT_POINT"
  echo "This should not happen - the Dockerfile creates this directory"
  exit 1
fi

if [ ! -r "$MOUNT_POINT" ]; then
  echo "ERROR: Workspace mount point is not readable: $MOUNT_POINT"
  echo "Please check volume mount permissions in docker-compose.yml"
  exit 1
fi

# Check if the mount point has any content
# This helps detect if the volume was mounted correctly
if [ -z "$(ls -A $MOUNT_POINT 2>/dev/null)" ]; then
  echo "WARNING: Workspace mount point is empty: $MOUNT_POINT"
  echo "Please ensure WORKSPACES_MOUNT_POINT in .env points to a valid directory on the host"
  echo "The application will start but no workspaces will be found"
else
  echo "✓ Workspace mount point is valid and contains data"
fi

# Start the application
exec node server/index.js
