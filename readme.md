# How to Setup


 * Run ```$ npm install``` in the 'api' folder
 * Import the reactions_plus_dump.sql into your MySQL database
 * Create a Facebook APP and don't forget to whitelist ```http://localhost:3000```
 * Change ```api/config.sample.js``` to ```api/config.js```
 * Edit the ```api/config.js``` with your DB connection details, jwt secret and FB app id & client secret
 * Paste the FB app id in ```extension/config/config.js```
 * Run ```node app.js``` inside the 'api' folder, which will start your server
 * Load the extension in your Chrome from the 'extension' folder



### TO-DO

 * Reaction count doesn't show if a Facebook post doesn't have any likes = doesn't have a div for storing the icons
 * Refactor and optimize FBPost module
 * Dynamic update of reactions count on hover over the icons
 * Instant change of icons after a reaction is clicked (and wait for a response, if an error is received rollback the reaction click)
 * Consider using sockets
 * Design interface and write better messages
