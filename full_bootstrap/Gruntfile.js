module.exports = async function(grunt) {
  grunt.registerTask('default', async function() {
      const done = this.async();
      const fs = require('fs');
      const os = require('os');
      const homeDir = os.homedir();
      const libraryLocation = `${homeDir}/Library`;
      const anchorLocation = `${libraryLocation}/laptop_bootstrap_anchor_rq14z`;
      const anchorLocationExists = fs.existsSync(anchorLocation);

      if (anchorLocationExists) {
        console.log('***************NOTICE************');
        console.log(`This system requires the ability to create a folder '${anchorLocation}'; but a file or folder already exists at that location.  Your options are?`);
        console.log('(e)xit and investigate (and restart this process when ready); (c)ontinue - IN THIS CASE, THE FOLDER WILL BE DELETED AND RECREATED');

        const readline = require('readline');

        const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
        });

        keepAskingQuestion();


        function keepAskingQuestion() {
          rl.question(
            'What do you want to do?', 

            (answer => {
              if (answer == 'e') {
                rl.close();
                return;
              }

              if (answer === 'c') {
                const rimraf = require('rimraf');
                rimraf.sync(anchorLocation);
                rl.close();
                doStepOne();
                return;
              }

              console.log('That is an invalid answer.  Please answer either \'e\' to exit, correct, and restart this process; or \'c\' to continue WHICH MEANS THE FOLDER WILL BE DELETED AND RECREATED');
              keepAskingQuestion();
            })
          );
        }
      }

      if (!anchorLocationExists) doStepOne();

      function doStepOne() {
        fs.mkdirSync(anchorLocation);
       const systemInfoFilePath = `${__dirname}/SystemInfo`;
        const defaultSystemInfoFilePath = `${__dirname}/DefaultSystemInfo`;
        if (fs.existsSync(systemInfoFilePath) && !fileIsValidSystemInfoFile(systemInfoFilePath)) fs.unlinkSync(systemInfoFilePath);

        if (!fs.existsSync(systemInfoFilePath)) {
          if (fs.existsSync(defaultSystemInfoFilePath) && !fileIsValidSystemInfoFile(defaultSystemInfoFilePath)) fs.unlinkSync(defaultSystemInfoFilePath);

          if (!fs.existsSync(defaultSystemInfoFilePath)) {
              console.log('********NOTICE*********');
              console.log('This system requires a valid SystemInfo file, but one cannot be found in this folder.  You must create one (by hand or by running \'npm managesysteminfo\') and then launch this routine (\'npm finishbootstrapping\') again.');
              return;
          }

          fs.renameSync(defaultSystemInfoFilePath, systemInfoFilePath);
        }

        doEverythingElse(systemInfoFilePath);

        function fileIsValidSystemInfoFile(path) {
          return textIsValidSystemInfoText(fs.readFileSync(path, 'utf8'));

          function textIsValidSystemInfoText(text) {
            text = text.trim();
            if (text.length === 0) return false;

            const split = text.split('|');
            if (split[0] !== 'Y' && split[0] !== 'N') return false;
            if (split.length < 3) return false;
            if (split[0] === 'Y' && split.length < 4) return false;
            
            const useParent = split[0] === 'Y';

            if (useParent && (split[2] === split[3])) {
              notifyValuesAreTheSame(split[2], split[3]);
              return false;
            }

            if (!useParent && (split[1] === split[2])) {
              notifyValuesAreTheSame(split[1]);
              return false;
            }

            if (useParent) return directoriesCanBeCreatedParentDirectoryProvided(split[1], split[2], split[3]);
            return directoriesCanBeCreated(split[1], split[2]);
          
            function notifyValuesAreTheSame(duplicateValue) {
              console.log('************NOTICE***************');
              
              console.log(
                `This system requires the ability to create two Folders as specified by the SystemInfo file; and 
                it must be two separate folders.  The specified folders are in the same location.  This process 
                will now stop so you can investigate and correct SystemInfo file; then you can restart this process.`
              );

              console.log('');

              if (useParent) {
                console.log(
                  `The specification is to use a parent Folder ('${split[1]}'); and the duplicate child location 
                  specified is ${split[2]}`
                )

                return;
              }

              console.log(
                `The duplicate location is ${split[1]}`
              );
            }
          }
        }

        function directoriesCanBeCreatedParentDirectoryProvided(
            parentDirectoryPath, adminDirectoryPathValue, projectsDirectoryPathValue
        ) {
          const path = require('path');
          const adminDirectoryPath = path.join(parentDirectoryPath, adminDirectoryPathValue);
          const projectsDirectoryPath = path.join(parentDirectoryPath, projectsDirectoryPathValue);
          const parentDirectoryExisted = fs.existsSync(parentDirectoryPath);

          if (!parentDirectoryExisted) {
              try {
                  fs.mkdirSync(parentDirectoryPath);
              }
              catch {
                  notifyOfInabilityToCreateParentFolder();
                  return false;
              }
          }

          const result = directoriesCanBeCreated(adminDirectoryPath, projectsDirectoryPath);

          if (!parentDirectoryExisted) removeDirectory(parentDirectoryPath);

          return result;

          function notifyOfInabilityToCreateParentFolder() {
              console.log('*********NOTICE*********');
              
              console.log(`
                  This system requires creation of folders at locations specified by the provided SystemInfo file.  
                  The provided file specifies creation of a Parent Folder at location ${parentDirectoryPath}.  The 
                  attempt to create a Parent Folder there failed.  This process will stop while you investigate.  
                  Once you are able to specify a valid Parent Folder Path, you can restart this process.`
              );
          }
        }

        function removeDirectory(path) {
          const rimraf = require('rimraf');
          rimraf.sync(path);
        }

        function directoriesCanBeCreated(adminDirectoryPath, projectsDirectoryPath) {
          const adminDirectoryPathExists = fs.existsSync(adminDirectoryPath);
          const projectsDirectoryPathExists = fs.existsSync(projectsDirectoryPath);

          if (adminDirectoryPathExists || projectsDirectoryPathExists) {     
            notifyOfExistingFolders(
              adminDirectoryPath, projectsDirectoryPath, adminDirectoryPathExists, 
              projectsDirectoryPathExists
            );
            
            return false;
          }

          try {
              fs.mkdirSync(adminDirectoryPath);
              removeDirectory(adminDirectoryPath);
          }
          catch {
              notifyOfInabilityToCreateFolder('ADMIN', adminDirectoryPath)
              return false;
          }

          try {
              fs.mkdirSync(projectsDirectoryPath);
              removeDirectory(projectsDirectoryPath);
          }
          catch {
              notifyOfInabilityToCreateFolder('PROJECTS', projectsDirectoryPath);
              return false;
          }

          return true;
        }

        function notifyOfInabilityToCreateFolder(folderName, folderPath) {
            console.log('***********NOTICE*********');
            
            console.log(
                `This system requires creating Folders at locations specified by the SystemInfo file.  
              A specified value (see below) resulted in an error on the attempt to create a Folder there.  
              This process will stop until you can provide a valid value; then you can start the process again.
              
              Invalid Path (${folderName} - ${folderPath})`
          );
        }

        function notifyOfExistingFolders(
          adp, pdp, adpExists, pdpExists
        ) {
          console.log('***********NOTICE**************');

          console.log(
            `This system requires creating two folders - Admin Folder and Projects Folder - at a location specified 
            in the provided SystemInfo file.  The specified locations for these were:`
          );

          console.log(`Admin Folder: ${adp}`);
          console.log(`Projects Folder: ${pdp}`);

          console.log(
            `The system must be able to create these folders fresh; however, at least one of these folders 
            already exist (see below).  This process will stop while you investigate; when you have been able to 
            remove or rename the folder(s), you can start this process again.`
          );

          console.log('');

          console.log(`Admin Folder exists? ${adpExists}`);
          console.log(`Projects Folder exists? ${pdpExists}`);
        }
      }

      function doEverythingElse(systemInfoFilePath) {
        createFolders();

        function createFolders() {
          createFoldersFromText(fs.readFileSync(systemInfoFilePath, 'utf8'));

          function createFoldersFromText(text) {
            const path = require('path');
            const split = text.split('|');

            const useParent = split[0] === 'Y';
            let parentFolderPath = '';
            let adminFolderPath = '';
            let projectsFolderPath = '';
            setFolderPaths();

            if (useParent && !fs.existsSync(parentFolderPath)) fs.mkdirSync(parentFolderPath);
            fs.mkdirSync(projectsFolderPath);
            fs.mkdirSync(adminFolderPath);


            function setFolderPaths() {
              if (useParent) {
                parentFolderPath = split[1];
                adminFolderPath = path.join(parentFolderPath, split[2]);
                projectsFolderPath = path.join(parentFolderPath, split[3]);
                return;
              }

              adminFolderPath = split[1];
              projectsFolderPath = split[2];
            }
          }
        }
      }
  });
};