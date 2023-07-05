copy /Y .\src\settings\config.prod.json .\src\settings\config.json
:call npm run build
call npx vercel --prod
copy /Y .\src\settings\config.dev.json .\src\settings\config.json
