# deploy.sh
#!/bin/bash

# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Python and pip
sudo apt-get install python3-pip python3-venv nginx -y

# Create a Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install Gunicorn
pip install gunicorn

# Create systemd service file for Flask app
sudo tee /etc/systemd/system/altitude-api.service << EOF
[Unit]
Description=Altitude Flask API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/altitude/api
Environment="PATH=/home/ubuntu/altitude/api/venv/bin"
ExecStart=/home/ubuntu/altitude/api/venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 generate_api:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/altitude << EOF
server {
    listen 80;
    server_name your_domain.com;  # Replace with your domain

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;  # Next.js app
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Enable the Nginx site
sudo ln -s /etc/nginx/sites-available/altitude /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Start services
sudo systemctl daemon-reload
sudo systemctl start altitude-api
sudo systemctl enable altitude-api
sudo systemctl restart nginx

# Test Nginx config
sudo nginx -t