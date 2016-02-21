# Penguin Network


## Prerequisites started

  1. Create a Bluemix account. [Sign up](http://www.ibm.com/cloud-computing/bluemix) in Bluemix or use an existing account. 
  2. Add the required services to your Bluemix account
       - Dialog Service
  3. Run postinstall script (`install-dialogs.js` in dialogs directory) to upload the Watson dialog XML
  4. Create a Firebase account.   

## Running the application locally
  The application uses [Node.js](http://nodejs.org/) and [npm](https://www.npmjs.com/), so you must download and install them as part of the following steps.

  1. Copy the `username`, `password`, and `url` credentials from your `dialog-service` service in Bluemix to `config\bluemix.json`. 
  2. Install [Node.js](http://nodejs.org/).
  3. Go to the project folder in a terminal and run the `npm install` command.
  4. Start the application by running `node app.js`.
  5. Open `http://localhost:3000` to see the running application.

## License

  This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).
  This sample uses jquery which is licensed under MIT.

## Contributing

  See [CONTRIBUTING](CONTRIBUTING.md).

## Open Source @ IBM
  Find more open source projects on the [IBM Github Page](http://ibm.github.io/)

[blue_mix]: https://apps.admin.ibmcloud.com/manage/trial/bluemix.html?cm_mmc=WatsonDeveloperCloud-_-LandingSiteGetStarted-_-x-_-CreateAnAccountOnBluemixCLI
[service_url]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/dialog/
