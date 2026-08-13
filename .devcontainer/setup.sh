#!/bin/bash
set -e

echo "=== 🐍 Setting up Backend (Python) ==="
cd practice1/backend
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip uv
uv pip install -r requirements.txt
cd ../..

echo "=== ⚡ Setting up Frontend (Node/PNPM) ==="
cd practice1/frontend
npm install -g pnpm
pnpm install
cd ../..

echo "=== 🎉 Setup Complete! ==="
