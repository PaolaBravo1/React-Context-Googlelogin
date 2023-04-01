copy /Y .\config.prod.json .\config.json
pause
start /wait npm run build
pause
start /wait npx vercel --prod --yes
copy /Y .\config.dev.json .\config.json
