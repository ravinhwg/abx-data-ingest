#!/bin/bash
mkdir -p dist/releases
cp .env dist/releases/
cp abx-data.sqlite dist/releases/
cp dist/drug-data-app* dist/releases/
cd dist/releases
zip -r ../drug-data-mac.zip drug-data-app-mac .env abx-data.sqlite
zip -r ../drug-data-win.zip drug-data-app.exe .env abx-data.sqlite
