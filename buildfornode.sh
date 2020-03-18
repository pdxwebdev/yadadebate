#!/bin/bash
cd "$(dirname "$0")"
rm platforms/browser/appvotestatic -rf
sed -i 's/="assets/="\/appvotestatic\/assets/g' src/index.html
sed -i 's/0\.0\.0\.0:5000/3\.225\.228\.97/g' src/app/session.service.ts
sed -i 's/0\.0\.0\.0:5000/3\.225\.228\.97/g' src/app/settings/settings.page.ts
ionic cordova build --prod browser
mv platforms/browser/www platforms/browser/appvotestatic
cp platforms/browser/appvotestatic ../yadacoin/static/. -r
cp platforms/browser/appvotestatic/index.html ../yadacoin/plugins/yadadebate/templates/. -r
sed -i 's/\/appvotestatic\/assets/assets/g' src/index.html
sed -i 's/3\.225\.228\.97/0\.0\.0\.0:5000/g' src/app/session.service.ts
sed -i 's/3\.225\.228\.97/0\.0\.0\.0:5000/g' src/app/settings/settings.page.ts
