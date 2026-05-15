#!/bin/bash

echo "🚀 Starting backend..."

cd ~/Desktop/PROJEKT/backend
python app.py &

echo "🚀 Starting frontend..."

cd ~/Desktop/PROJEKT/frontend
npm run dev