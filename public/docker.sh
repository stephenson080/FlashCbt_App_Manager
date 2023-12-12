# Check if Docker is installed 
if [ -x "$(command -v docker)" ]; then
    echo "Update docker"
    # command
else
    echo "Install docker"
     # Install Docker
    echo "Installing Docker..."
    sudo apt update
    sudo apt install apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
    apt-cache policy docker-ce
    sudo apt install -y docker.io
    sudo apt install docker-ce
fi

# Check if Docker Compose is installed
if [ -x "$(command -v docker compose)" ];
then
    echo "Docker Compose is already installed."
else
    # Install Docker Compose
    echo "Installing Docker Compose..."
    sudo apt update
    sudo apt install -y docker-compose

    # Check if the installation was successful
    if command -v docker-compose &> /dev/null
    then
        echo "Docker Compose has been successfully installed."
    else
        echo "Error: Failed to install Docker Compose."
        exit 1
    fi
fi