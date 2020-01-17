ionic cordova build --prod browser
cp platforms/browser/www ../yadacoin/static/. -r
rm ../yadacoin/static/yadadebate -rf
mv ../yadacoin/static/www ../yadacoin/static/yadadebate
