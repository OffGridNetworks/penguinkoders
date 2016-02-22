# Penguin Network

The application consists of a multi-room community / chat interface that is supported by multiple parallel integrations with one of the most advanced cognitive platforms for natural language processing and machine learning. It may seem odd to give a 7 year old a chat application that runs on an IBM supercomputer (well our younges team member turned 8 during the competition), but the idea is to provide a pluggable framework that is designed from the start to allow advanced cognitive functions to be plugged in, and even shared by the users. The advancement in cognitive algorithm is so profound, its estimated to surpass the cockroach within years, and primates in the lifetime of the younger team members; therefore, rather than build yet another social network, we've created a platform that is a learning platform for algorithms, that start with some useful basics, but will allow both users and machine to evolve together.  

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

