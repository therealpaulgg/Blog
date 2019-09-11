# backend deployment
$api = Read-Host "Deploy API Changes? (y/n)"
$app = Read-Host "Deploy App Changes? (y/n)"
If ($api -eq "y") {
    $compileapi = Read-Host "Compile server before uploading? (y/n)" 
    If ($compileapi -eq "y") {
        Write-Host "Compiling TypeScript to JavaScript..."
        tsc -p ./backend/
    }
    Write-Host "Copying files to server..."
    ssh killer-whale 'rm -r /var/www/blog/api/build'
    scp -r ./backend/build ./backend/package.json killer-whale:/var/www/blog_staging/api
    Write-Host "Installing dependencies..."
    ssh killer-whale 'cd /var/www/blog/api && yarn && yarn add pg'
    Write-Host "Please restart the backend service on the server manually."
} 
# frontend deployment
If ($app -eq "y") {
    Write-Host "Beginning Frontend deployment."
    $compileapp = Read-Host "Compile app before uploading? (y/n)"
    if ($compileapp -eq "y") {
        Set-Location frontend
        yarn build --mode staging
        Set-Location ..
    }
    Write-Host "Copying files to server..."
    ssh killer-whale 'rm -r /var/www/blog_staging/app/*'
    scp -r ./frontend/dist/* killer-whale:/var/www/blog_staging/app/
}
Write-Host "Script complete."