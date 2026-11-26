#!/bin/bash
cd /home/claude/v13
cat src/0*.js src/10_chay.js > goi/app.js
mkdir -p goi/anh; [ -f goi/anh/thanh-dien-hai-nay.jpg ] || python3 -c "
from PIL import Image; im=Image.open('/mnt/user-data/uploads/TranDaNang-1858/phao-trieu-nguyen.jpeg').convert('RGB'); im.save('goi/anh/thanh-dien-hai-nay.jpg',quality=88)"
cp goi/app.js /tmp/_app.mjs; node --check /tmp/_app.mjs 2>&1 | head -5 || true
