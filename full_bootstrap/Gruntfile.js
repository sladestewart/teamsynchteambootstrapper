module.exports = async function(grunt) {
  grunt.registerTask('default', async function() {
      const done = this.async();
      const fs = require('fs');
      const os = require('os');
      const path = require('path');
      const homeDir = os.homedir();
      const anchorLocation = `${homeDir}/laptop_bootstrap_anchor_rq14z`;
      const anchorLocationExists = fs.existsSync(anchorLocation);
      let adminFolderPath = '';
      let projectsFolderPath = '';

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
              console.log('This system requires a valid SystemInfo file, but one cannot be found in this folder.  You must create one (by hand or by running \'npm run managesysteminfo\') and then launch this routine (\'npm finishbootstrapping\') again.');
              return;
          }

          fs.renameSync(defaultSystemInfoFilePath, systemInfoFilePath);
        }

        doEverythingElse(systemInfoFilePath);

        function fileIsValidSystemInfoFile(path) {
          return textIsValidSystemInfoText(fs.readFileSync(path, 'utf8'));

          function textIsValidSystemInfoText(text) {
            text = text.trim();
            if (text === 'skip') return true;
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

            if (useParent) {
              return directoriesCanBeCreatedParentDirectoryProvided(
                getDirectoryValue(split[1]), getDirectoryValue(split[2]), getDirectoryValue(split[3])
              );
            }

            return directoriesCanBeCreated(
              getDirectoryValue(split[1]), getDirectoryValue(split[2])
            );
          
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

      function getDirectoryValue(rawDirectoryValue) {
        return rawDirectoryValue === '[HOMEDIR]' 
          ? os.homedir() 
          : rawDirectoryValue;
      }

      function doEverythingElse(systemInfoFilePath) {
        createFolders();
        copySystemInfo();

        function createFolders() {
          const text = fs.readFileSync(systemInfoFilePath, 'utf8');
          createFoldersFromText(text);

          function createFoldersFromText(text) {
            if (text === 'skip') {
              fs.unlinkSync(systemInfoFilePath);
              return;
            }

            const split = text.split('|');
            const useParent = split[0] === 'Y';
            let parentFolderPath = '';
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

        function copySystemInfo() {
          fs.copyFileSync(path.join(__dirname, 'SystemInfo'), `${anchorLocation}/SystemInfo`);
        }
      }
  });

  grunt.registerTask('managesysteminfo', 
    function(
      hasParentDirectory, adminFolderValue, projectsFolderValue
    ) {
      let hasPDirectory;

      if (!hasValidHasParentDirectory()) {
        notifyOfInvalidHasParentDirectory();
        return;

        function notifyOfInvalidHasParentDirectory() {
          console.log('******NOTICE*******');
        
          console.log(
            `You have provided a parameter (first parameter, which can either signify 'help' or 'hasParentDirectory') 
            with an invalid value ('${hasParentDirectory}').  The valid values for this parameter are:`
          );
          console.log('');
  
          console.log(
            `'H' or 'h' or 'HELP' or 'Help' or 'help' to get a help screen for this task (you can also just provide no first parameter, and the Help Screen will display)`
          );
  
          console.log(
            `'Y' or 'y' or 'Yes' or 'yes' or 'YES' to indicate that the two folders you will define, will have a common Parent Folder`
          );
  
          console.log(
            `'N' or 'n' or 'NO' or 'No' or 'no' to indicate that the two folders you will define, will not have a common Parent Folder`
          );

          console.log('');
          
          console.log(
            `This process will now terminate.  You can always start it again ('npm run managesysteminfo').`
          );

          console.log('');
          console.log('Below is the Help Screen for this task; you can always display it via \'npm run managesysteminfo_help\'');

          console.log('');
          console.log('');
          displayManageSystemInfoHelpText();
        }
      }

      if (isAskingForHelp()) {
        displayManageSystemInfoHelpText();
        return;
      }

      if (isAskingForInteractive()) {
        goInteractive();
        return;
      }

      if (isAskingForDefault()) {
        goDefault();
        return;
      }

      goCli();

      function hasValidHasParentDirectory() {
        return !hasParentDirectory || 
          hasParentDirectory === 'Y' || hasParentDirectory === 'N' || 
          hasParentDirectory === 'y' || hasParentDirectory === 'n' || 
          hasParentDirectory === 'Yes' || hasParentDirectory === 'yes' || 
          hasParentDirectory === 'YES' || hasParentDirectory === 'No' || 
          hasParentDirectory === 'no' || hasParentDirectory ==='NO' || 
          hasParentDirectory === 'HELP' || hasParentDirectory === 'help' || 
          hasParentDirectory === 'H' || hasParentDirectory === 'h' || 
          hasParentDirectory === 'Help' || hasParentDirectory === 'I' || 
          hasParentDirectory === 'default';
      }

      function isAskingForHelp() {
        return hasParentDirectory === 'HELP' || hasParentDirectory === 'help' || 
        hasParentDirectory === 'H' || hasParentDirectory === 'h' || 
        hasParentDirectory == 'Help' || !hasParentDirectory;
      }

      function isAskingForInteractive() {
        return hasParentDirectory === 'I';
      }

      function isAskingForDefault() {
        return hasParentDirectory === 'default';
      }

      function hasParentDirectoryBoolean() {
        return hasParentDirectory === 'Y' || hasParentDirectory === 'y' || 
        hasParentDirectory === 'Yes' || hasParentDirectory === 'yes' || 
        hasParentDirectory === 'YES';
      }

      function goInteractive() {
        console.log('*********going interactive*********');
      }

      function goDefault() {
        hasParentDirectory = 'Y';
        adminFolderValue = 'teamsyncadmin';
        projectsFolderValue = 'projects';
        goCli();
      }

      function goCli() {
        hasPDirectory = hasParentDirectoryBoolean();
      }
  });

  grunt.registerTask('help', function() {
    displayOverallHelp();
  });

  function displayOverallHelp() {
    console.log('************HELP*********');

    console.log('');
    console.log('');

    console.log('To display this Overall Help Screen:');
    console.log(`'npm run help'`);

    console.log('');
    console.log('');

    console.log(
      `You `
    )

    console.log('');
    console.log('');
    displayManageSystemInfoHelpText();
  }

  function displayManageSystemInfoHelpText() {
    console.log('**************MANAGE SYSTEM INFO*************');
    console.log('');
    
    console.log('Display this Help Screen:');
    
    console.log('npm run managesysteminfo_help');
    console.log('or');
    console.log('grunt managesysteminfo:help (\'help\' can also be expressed \'H\', \'h\', \'HELP\', \'Help\', or \'help\')');
    console.log('or even just');
    console.log('grunt managesysteminfo');
    console.log('i.e. no parameters');

    console.log('');
    console.log('');

    console.log('Generate the SystemInfo file:');
    console.log('');

    console.log('Generate the System Info File from defaults:');
    console.log('npm run managesysteminfo_default');
    console.log('or');
    console.log('grunt managesysteminfo:default');
    console.log('');

    console.log(
      `This will generate the System Info File with default values; this will result in indicating to use a Parent Directory, 
      that the Parent Directory will be your laptop's Home Directory, that the Admin Folder will be under Parent Directory with 
      a name of \'teamsyncadmin\', and that the Project Directory will be under Parent Directory with a name of \'Projects\'.`
    );

    console.log('');
    console.log('');

    console.log('Generate the SystemInfo File interactively:');
    console.log('npm run managesysteminfo');

    console.log('You will be asked in succession for either three or for values:');

    console.log(
      `'1) Do you want a Parent Directory?'  If you indicate you want a Parent Directory (see below), then you will 
      be asked three more questions for a total of four; and you will be indicating to create (or ensure exists) a 
      Parent Directory in the relative path you provide in the answer to Question 2; and to create the Admin Folder 
      and the Projects Folder in the location underneath the Parent Directory that you provide in the answers to Question 
      3 and 4.  If you indicate you do not want a Parent Directory, then you will be asked two more questions for a total 
      of three; and you will be indicating to create the Admin Folder and the Projects Folder in the locations you provide 
      in the answer to Questions 3 and 4.`
    );

    console.log('');
    
    console.log('To indicate that you want a Parent Directory, answer with any of the following:');
    console.log(`'Y', 'y', 'YES', 'Yes', 'yes`);

    console.log('');

    console.log('To indicate that you do not want a Parent Directory, answer with any of the folloging:');
    console.log(`'N', 'n', 'NO', 'No', 'no'`);

    console.log('')
    console.log('')

    console.log(
      `'2) What is the location of the Parent Directory?' or 'What is the location of the Admin Folder?'  If you indicated 
      in Step 1 that you want to use a Parent Directory, then Question 2 will ask you the location of that Parent Directory.  
      If you indicated in Step 1 that you do not want to use a Parent Directory, then Question 2 will ask you the location of 
      the Admin Folder.  (Notes about specifying any Directory/Folder appear below.)`
    );

    console.log('');
    console.log('');

    console.log(
      `3) 'What is the location of the Admin Folder?' or 'What is the location of the Projects Folder?'  If you indicated 
      in Step 1 that you want to use a Parent Directory, then Question 3 will ask you the location of your Admin Folder.  
      If you indicated in Step 1 that you do not want to use a Parent Directory, then Question 3 will ask you the location 
      of the Projects Folder.  (Notes about specifying any Directory/Folder appear below.)`
    );

    console.log('');
    console.log('');

    console.log(
      `4) 'What is the location of the Projects Folder?'  If you indicated in Step 1 that you want to use a Parent Directory, 
      then Question 4 will ask you the location of your Projects Folder.  If you indicated in Step 1 that you do not want to 
      use a Parent Directory, then there will be no Question 4.`
    );

    console.log('Generate the SystemInfo File via cli parameters:');


    console.log('');
    console.log('');

    console.log('Generate the SystemInfo File by hand:');
    
    console.log(
      `In the folder 'full_bootstrap', create a file named 'SystemInfo' (no extension).  In that file, add one line.  This line 
      is expected to contain your choices (equivalent to the choices/answers you provide the cli), like this:`
    );

    console.log('');

    console.log('When you intend to have a Parent Directory:');

    console.log(
      `[USEPARENTDIRECTORY]|[PARENTDIRECTORYPATH]|[ADMINFOLDERPATHRELATIVETOPARENTDIRECTORY]|[PROJECTFOLDERPATHRELATIVETOPARENTDIRECTORY]`
    );

    console.log('USEPARENTDIRECTORY: Value will indicate \'yes\' (\'Y\', \'y\', \'YES\', \'Yes\', \'yes\'');
    console.log('[PARENTDIRECTORYPATH] indicates the absolute path of the Parent Directory');
    console.log('[ADMINFOLDERPATHRELATIVETOPARENTDIRECTORY] indicates the name/path of the Admin Folder relative to the Parent Directory');
    console.log('[PROJECTFOLDERPATHRELATIVETOPARENTDIRECTORY] indicates the name/path of the Projects Folder relative to the Parent Directory');

    console.log('');
    console.log('');

    console.log('When you intend not to have a Parent Directory:');

    console.log(
      `[USEPARENTDIRECTORY]|[PARENTDIRECTORYPATH]|[ADMINFOLDERPATHRELATIVETOPARENTDIRECTORY]|[PROJECTFOLDERPATHRELATIVETOPARENTDIRECTORY]|`
    );

    console.log('**********NOTE THE FINAL \'PIPE SEPARATOR\'***********');
    console.log('USEPARENTDIRECTORY: Value will indicate \'no\' (\'N\', \'n\', \'NO\', \'No\', \'no\'');
    console.log('[ADMINFOLDERPATHRELATIVETOPARENTDIRECTORY] indicates the name/path of the Admin Folder relative to the Parent Directory');
    console.log('[PROJECTFOLDERPATHRELATIVETOPARENTDIRECTORY] indicates the name/path of the Projects Folder relative to the Parent Directory');


    console.log('');
    console.log('');

    console.log('Examples:');
    console.log('When you intend to have a Parent Directory');
    console.log('Y|/Users|teamsyncadmin|projects|');
    console.log('');
    console.log('When you intend not to have a Parent Directory');
    console.log('N\/Users/Library/teamsyncadmin|/Users|');
    console.log('**********NOTE THE FINAL \'PIPE SEPARATOR\'***********');

    console.log('');
    console.log('');

    console.log('*********NOTES:*********');

    console.log(
      `For any value that is filled with a path ('parentDirectory', 'adminDirectoryValue', or 'projectsDirectoryValue'), you 
      can provide the special value '[HOMEDIR]' to indicate the Home Directory for the laptop.`
    )
    console.log(
      `Also, whether you generate the SystemInfo File interactively, via parameters, or by hand (not using the cli), the values for 
      'adminFolderValue' and 'projectsFolderValue' will not be checked for validity, with one exception (see below).  
      You are responsible for providing values that can result in a folder being created on your particular platform.  
      If you provide a value that doesn't meet this criterion, you will not be notified of this until later, when another 
      task attempts to create the given Folder.`
    );
    console.log('');

    console.log(
      `The exception to this is if you provide any combination of values that would result in either the 
      'adminFolderLocation' or the 'projectsFolderLocation' being equivalent to the Home Directory.  This task will 
      not allow that.  If you provide such a combination, this task will notify you of that, then terminate.  If the first 
      parameter ('hasParentDirectory') indicates that there will be a Parent Directory, then the invalid combination of values 
      cannot occur.  If 'hasParentDirectory' indicates that there will be no Parent Directory, then the invalid combination 
      of values will occur if either 'adminFolderValue' or 'projectsFolderValue' indicates Home Directory ('[HOMEDIR]').  
      So in other words, you can never make your laptop's Home Directory into the Admin Folder or the Projects Folder; however, 
      you **can** make it the Parent Directory of those.`
    );
    console.log('');

    console.log(
      `Note that the special value'[HOMEDIR]' (which indicates your laptop's Home Directory) is mainly intended to be 
      used for the Parent Folder.  The value is allowed for 'adminFolderLocation' and/or 'projectsFolderLocation' when 
      specifying a Parent Directory exists, but the effects might not be what you intended.  For instance, if you indicate 'Y' 
      for whether a Parent Directory exists, and '[HOMEDIR] for 'adminFolderLocation', and if your laptop's Home Directory is 
      '/Users', then your Admin Folder will be located at '/Users/Users' i.e. the task will first ensure that a path '/Users' 
      (Home Directory) exists; then it will create a folder underneath that with the value of your Home Directory's path 
      ('/Users').`
    );

    console.log('');

    console.log(
      `As a final note: the Admin Directory is used by the Team Synch System for several admin functions (for example, your team's 
      Project Templates will be stored there).  The Projects Directory is the Directory/Folder where the Team Synch System will 
      look for and place Projects (like JavaScript/Node Projects, etc.) when you use the System to access/create/etc. any Project.`
    );
  }
};