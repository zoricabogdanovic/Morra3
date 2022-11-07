# Morra3

Reach setup on WSL 2 and Docker Desktop on Windows.


Install Reach:

$ sudo apt install make curl
$ mkdir -p ~/reach && cd ~/reach
$ curl https://docs.reach.sh/reach -o reach ; chmod +x reach
$ ./reach version

Create folder morra3 and pull files:
index.rsh
index.js
index.css
views/render.js
views/AppViews.js
views/DeployerViews.js
views/AttacherViews.js
views/PlayerViews.js

Compile useing ./reach compile

Start program with terminal using ./reach react

Start browser using localhost:3000

