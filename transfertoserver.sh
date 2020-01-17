#!/bin/bash
cd "$(dirname "$0")"
rm platforms/browser/appvotestatic -rf
sed -i 's/="assets/="\/appvotestatic\/assets/g' src/index.html
sed -i 's/0\.0\.0\.0:5000/3\.225\.228\.97/g' src/app/session.service.ts
sed -i 's/0\.0\.0\.0:5000/3\.225\.228\.97/g' src/app/settings/settings.page.ts
ionic cordova build browser --prod
mv platforms/browser/www platforms/browser/appvotestatic
rsync -avz platforms/browser/appvotestatic ubuntu@3.225.228.97:/home/ubuntu/yadacoin/static/ -e "ssh -i ~/Downloads/ec2free.pem -o StrictHostKeyChecking=no"
rsync -avz platforms/browser/appvotestatic/index.html ubuntu@3.225.228.97:/home/ubuntu/yadacoin/plugins/appvote/templates/. -e "ssh -i ~/Downloads/ec2free.pem -o StrictHostKeyChecking=no"
sed -i 's/\/appvotestatic\/assets/assets/g' src/index.html
sed -i 's/3\.225\.228\.97/0\.0\.0\.0:5000/g' src/app/session.service.ts
sed -i 's/3\.225\.228\.97/0\.0\.0\.0:5000/g' src/app/settings/settings.page.ts
