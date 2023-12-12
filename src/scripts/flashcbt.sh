#download docker-compose file
#download url to the docker-compose file
compose_url="http://192.169.152.77/home/DownloadComposeFile"
filename=docker-compose.yml
# Destination path to save the Docker Compose file
compose_file_path="./Desktop"
#delete file if already exist in the current path

if [ -f "$filename" ] ; then
    rm "$filename"
    echo "Deleted existing Docker-File in current path"
fi
#delete file if already exist in the Destination path
destinationfile=$compose_file/$filename

if [ -f "$destinationfile" ] ; then
    rm "$destinationfile"
    echo "Deleted existing Docker-File in destination path"
fi
echo "Downloading docker-compose file"
curl $compose_url -o $filename
# Check if the download was successful
if [ $? -eq 0 ]; then
    echo "Docker Compose file downloaded successfully."
  # copy the file to specific directory
	echo "Copying downloaded file"
	cp  $filename $compose_file_path
	echo "Copy was successful"
    # Change to the directory where the Docker Compose file is located
    cd $(dirname $compose_file_path)
#add currentuser to group
    sudo usermod -aG docker $USER
    #restart docker
    sudo systemctl restart docker
    # Run Docker Compose
    # starting docker daemon
    #syetemctl start docker
    sudo docker compose up -d
else
    echo "Failed to download Docker Compose file."
fi

#run the docker-compose file
#enable the service to cbt service to run on startup of the computer