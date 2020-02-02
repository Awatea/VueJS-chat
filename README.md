# VueJS-chat

> Google Firebase

> **Backend**: Node.js + Express.js

> **Frontend**: Vue CLI (Babel, Eslint: AirBnb) + ElementUI

 - Adaptive layout
 - SSE-connection
 - Offline messages sending with message current state
 - Randomized bot's answers for every user's message with random answer time (1-5 sec)
 - Scroll to the last message on sending
 - Infinite scroll for messages history
 - RESTful API

![Desktop](images/desktop.jpg?raw=true "Desktop") 
![Mobile - History](images/mobile_history.jpg?raw=true "Mobile - History") ![Mobile - Offline messages](images/mobile_offline.jpg?raw=true "Mobile - Offline messages")


## Build Setup

``` bash
# start backend server at localhost:8888
cd backend
node index.js

# start frontend server: serve with hot reload at localhost:8080
cd frontend
npm run serve

# build for production with minification
cd frontend
npm run build

# Lints and fixes frontend files
cd frontend
npm run lint
```
