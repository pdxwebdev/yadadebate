#!/bin/bash
cd "$(dirname "$0")"
rm platforms/browser/www -rf
sed -i 's/0\.0\.0\.0:5000/kintanti\.com/g' src/app/session.service.ts
sed -i 's/0\.0\.0\.0:5000/kintanti\.com/g' src/app/settings/settings.page.ts
sed -i 's/\/appvotestatic\/assets/assets/g' src/index.html
ionic cordova build browser --prod
cd platforms/browser/www
rm assets/svg -rf
rm svg -rf
zip -r appvotestatic.zip .
curl -F file=@appvotestatic.zip http://0.0.0.0:8000/sia-upload-dir?filename=yadadebate
cd ../../..
sed -i 's/kintanti\.com/0\.0\.0\.0:5000/g' src/app/session.service.ts
sed -i 's/kintanti\.com/0\.0\.0\.0:5000/g' src/app/settings/settings.page.ts
