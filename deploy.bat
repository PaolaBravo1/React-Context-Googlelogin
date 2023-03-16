copy /Y .\config.prod.json .\config.json
start /wait npx vercel --prod --yes
copy /Y .\config.dev.json .\config.json
