#!/bin/bash
echo "Starting API server..."
cd /home/runner/workspace && PORT=5000 pnpm --filter @workspace/api-server run dev 2>&1 &
sleep 15
echo "Starting frontend..."
cd /home/runner/workspace/artifacts/soundmap && PORT=3000 BASE_PATH=/ pnpm run dev 2>&1 &
echo "Both servers starting. API on port 5000, Frontend on port 3000"
