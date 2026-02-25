# webfuzzer


node.js - The webserver is based on node js thus libraries that are commonly used like
express, path and session has been used 

express - The express library is used to handle the server portion of the website
and handles the communication between the user and the backend.

path - enables easier string manipulation and file pathing.

session - used in the autorization of a user so that you can't bypass the login system through URLs

TODO
1. Find out a way to create an array of multiple workers with different parts of the wordlist and call these using promise.Allsettled. Also let the user choose amount of workers
2. Find a way to save results from the workers into a csv file
3. Implement "stealth mode" with a aleep timer in the fuzz loop to decrease intensity
4. Implement other attack modes
? make it linux compatible
