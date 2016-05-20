# README #

Chat room with socket.io implementation. Supports private rooms too.

### Installation ###


```
#!bash
git clone https://IuliaJalba@bitbucket.org/IuliaJalba/socket.io-chat.git
cd socket.io-chat/
npm install

```

### Running ###


```
#!bash

node index
```

In another terminal tab
```
#!bash

node socket-server
```

Open a browser and type localhost:9999.

### Using browser application ###

Log in by typing a username. All logged users are displayed in the right list.

To create a private chat room select users from the "Users chatting now" list. If a user is already in a private chat room his name will be displayed in a different color and he can not be added in a new private chat room until he leaves the current room. 

To leave a private chat room click in the background of the private chat modal.



### Who do I talk to? ###

* Iulia Jalba <jalbapunctiulia@gmail.com>