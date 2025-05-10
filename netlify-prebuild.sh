#!/bin/bash

# Create empty source map file for stylis-plugin-rtl to silence warnings
echo "Creating empty source map files for stylis-plugin-rtl..."
mkdir -p themis-client-final/node_modules/stylis-plugin-rtl/src
touch themis-client-final/node_modules/stylis-plugin-rtl/src/stylis-rtl.ts
touch themis-client-final/node_modules/stylis-plugin-rtl/src/stylis-rtl.ts.map

echo "Prebuild setup completed" 