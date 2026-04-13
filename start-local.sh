#!/bin/bash
echo "Starting API server..."
cd ~/Desktop/Global-Sound-Map
DATABASE_URL=postgresql://neondb_owner:npg_gJpYsR0X4kPy@ep-winter-hill-amen1jdh.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require PORT=5000 pnpm --filter @workspace/api-server run dev &
echo "Waiting for API server..."
sleep 15
echo "Starting frontend..."
cd ~/Desktop/Global-Sound-Map/artifacts/soundmap
npx vite --config vite.local.config.ts &
echo ""
echo "App running at http://localhost:3000"
