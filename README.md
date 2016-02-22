# Penguin Network

Our project appears to be a safe, friendly social community for Under 13s, but in fact is an advanced cognitive processing platform that starts with technology-enriched and -assisted education but guides towards a world in which our younger generation create and share algorithms with each other, and businesses/industries create and disappear on the basis of providing intelligence to "Penguin" the key persona in this app.  Start with "Penguin, Tell me about A Tale of Two Cities" and you'll get the picture. 

## Prerequisites started

  1. Create a Bluemix account. [Sign up](http://www.ibm.com/cloud-computing/bluemix) in Bluemix or use an existing account. 
  2. Add the required services to your Bluemix account
       - Dialog Service
       - Language Service
       - Insight Service
  3. Run postinstall script (`install-dialogs.js` in dialogs directory) to upload the Watson dialog XML
  4. Create a Firebase account.   

## Running the application locally
  The application uses [Node.js](http://nodejs.org/) and [npm](https://www.npmjs.com/), so you must download and install them as part of the following steps.

  1. Copy the `username`, `password`, and `url` credentials from your various services in Bluemix to `config\credentials.json`. 
  2. Install [Node.js](http://nodejs.org/).
  3. Go to the project folder in a terminal and run the `npm install` command.
  4. Start the application by running `node app.js`.
  5. Open `http://localhost:3000` to see the running application.
  

## License

  This code is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).

