module.exports = async function(grunt) {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const homeDir = os.homedir();
  let adminFolderPath = 'ADMINFOLDERPATHTOKEN';
  let projectsFolderPath = 'PROJECTSFOLDERPATHTOKEN';

  grunt.registerTask('default', async function() {
      showExplanation();

      function showExplanation() {
        log(
          `
          ******************************************************************
          *                                                                 *
          *                  EVALUATING ENVIRONMENT                         *
          *                                                                 *
          ******************************************************************
  
          The first step is to examine your TeamSynch environment to ensure all necessary 
          artifacts are present before proceeding.
          
          Usually all necessary artifacts are present; however, if not, then on the first missing 
          artifact encountered, this process will inform you of the particular missing artifact, 
          and then terminate so you can correct the situation.  After correcting the situation, you 
          can restart this process.
          `
        );
      }
  });

  grunt.registerTask('help', function() {
    displayOverallHelp();
  });

  function displayOverallHelp() {
    log(
      `
      ************HELP*********
      
      To display this Overall Help Screen:
      npm run help
      
      You `
    );


    displayManageSystemInfoHelpText();
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
      log(
        `
        ***********NOTICE*********
        This system requires creating Folders at locations specified by the SystemInfo file.  
        A specified value (see below) resulted in an error on the attempt to create a Folder there.  
        This process will stop until you can provide a valid value; then you can start the process again.
        
        Invalid Path (${folderName} - ${folderPath})`
      );
  }

  function notifyOfExistingFolders(
    adp, pdp, adpExists, pdpExists
  ) {
    log(
      `
      ***********NOTICE**************
      This system requires creating two folders - Admin Folder and Projects Folder - at a location specified 
      in the provided SystemInfo file.  The specified locations for these were:
      Admin Folder: ${adp}
      Projects Folder: ${pdp}
      The system must be able to create these folders fresh; however, at least one of these folders 
      already exist (see below).  This process will stop while you investigate; when you have been able to 
      remove or rename the folder(s), you can start this process again.
      
      Admin Folder exists? ${adpExists}
      Projects Folder exists? ${pdpExists}`
    );
  }

  function bootstrapLaptop(systemInfoFilePath) {
    createFoldersAndCopySystemInfo();



    function createFoldersAndCopySystemInfo() {
      createFolders();
      copySystemInfo(systemInfoFilePath);  
    }

    function createFolders() {
      fs.mkdirSync(projectsFolderPath);
      fs.mkdirSync(adminFolderPath);
    }
  }

  function log(toLog) {
    console.log(toLog);
  }
};