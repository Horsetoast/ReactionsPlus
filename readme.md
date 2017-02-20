# How to Setup


 * Run ```$ npm install``` in the 'api' folder
 * Import the reactions_plus_dump.sql into your MySQL database
 * Create a Facebook APP and don't forget to whitelist ```http://localhost:3000``` (or the domain your server is running on)
 * Change ```api/.env.example``` variables to your own and rename it to ```api/.env```
 * Change ```extension/config.js``` paths to your server API and FB APP id
 * Paste your FB app id in ```extension/config/config.js```
 * Run ```$ npm start``` inside the 'api' folder
 * Load the extension in your Chrome from the 'extension' folder



### TO-DO

 * Refactor and optimize FBPost module
 * Dynamic update of reactions count on hover over the icons
 * Instant change of icons after a reaction is clicked (and wait for a response, if an error is received rollback the reaction click)
 * Consider using sockets
 * Design a better interface
 * Reaction count doesn't show if a Facebook post doesn't have any likes = doesn't have a div for storing the icons
