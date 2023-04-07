copy /Y .\config.prod.json .\config.json
call npm run build
call npx vercel --prod --yes
copy /Y .\config.dev.json .\config.json
