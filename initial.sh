#!/bin/bash

mkdir files
mkdir files/tmp
mkdir files/mp3
mkdir files/mp4
sudo chmod -R 777 files/

echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p