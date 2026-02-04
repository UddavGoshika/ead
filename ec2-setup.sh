#!/bin/bash

# Update and Install Dependencies
sudo apt update
sudo apt install -y nodejs npm git nginx

# Install PM2 globally
sudo npm install -g pm2

# Clone/Pull Repository
if [ -d "Eadvocate" ]; then
    cd Eadvocate
    git pull
else
    git clone https://github.com/Pavansai0427/Eadvocate.git
    cd Eadvocate
fi

# Setup Frontend
cd frontend
npm install
npm run build
cd ..

# Setup Backend
cd server
npm install
# Create .env file if not exists (User needs to edit this manually usually)
if [ ! -f .env ]; then
    echo "PORT=5000" > .env
    echo "MONGO_URI=your_mongodb_uri" >> .env
    echo "JWT_SECRET=your_jwt_secret" >> .env
fi

# Start Application with PM2
pm2 start index.js --name "eadvocate"

# Setup Nginx Reverse Proxy (Optional but recommended)
# sudo nano /etc/nginx/sites-available/default
# location / {
#     proxy_pass http://localhost:5000;
#     proxy_http_version 1.1;
#     proxy_set_header Upgrade $http_upgrade;
#     proxy_set_header Connection 'upgrade';
#     proxy_set_header Host $host;
#     proxy_cache_bypass $http_upgrade;
# }
# sudo systemctl restart nginx
