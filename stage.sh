#!/usr/bin/bash
# backend deployment
echo "Deploy API Changes? (y/n)"
read api
echo "Deploy App Changes? (y/n)"
read app
if [ "$api" = "y" ] ; then
    echo "Compile server before uploading? (y/n)"
    read compileapi
    if [ "$compileapi" = "y" ] ; then
        echo "Compiling TypeScript to JavaScript..."
        tsc -p ./backend/
    fi
    echo "Copying files to server..."
    ssh killer-whale 'rm -r /var/www/blog_staging/api/build'
    rsync -r ./backend/build killer-whale:/var/www/blog_staging/api
    rsync ./backend/package.json killer-whale:/var/www/blog_staging/api/
    echo "Installing dependencies..."
    ssh killer-whale 'cd /var/www/blog_staging/api && yarn && yarn add pg'
    echo "Please restart the backend service on the server manually."
fi
# frontend deployment
if [ "$app" = "y" ] ; then
    echo "Beginning Frontend deployment."
     echo "Compile app before uploading? (y/n)"
    read compileapp
    if [ "$compileapp" = "y" ] ; then
        cd frontend
        yarn build --mode staging
        cd ..
    fi
    echo "Copying files to server..."
    ssh killer-whale 'rm -r /var/www/blog_staging/app/'
    rsync -r ./frontend/dist/ killer-whale:/var/www/blog_staging/app/
fi
echo "Script complete."