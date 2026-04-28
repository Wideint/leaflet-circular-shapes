#!/bin/sh

set -e

mkdir -p dist

node_modules/.bin/rollup -c build/rollup-config.js

cat src/Annulus.js src/AnnulusSector.js src/Disk.js src/DiskSector.js src/Mixins.js \
	| grep -v -e import -e export \
	| sed 's/Circle/L.Circle/g' \
	| sed 's/SVG/L.SVG/g' \
	| sed 's/CRS/L.CRS/g' \
	| sed 's/new Point/L.point/g' \
	| sed 's/^Point/L.Point/g' \
	> dist/leafletv1-circularshapes.js
