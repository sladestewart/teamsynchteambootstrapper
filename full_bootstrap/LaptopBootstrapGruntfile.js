module.exports = async function(grunt) {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const homeDir = os.homedir();
  let adminFolderPath = 'ADMINFOLDERPATHTOKEN';
  let projectsFolderPath = 'PROJECTSFOLDERPATHTOKEN';

  grunt.registerTask('default', async function() {
      const done = this.async();

      showExplanation();

      if (anchorLocationExists) {
        log(
          `
          ***************NOTICE************
          This system requires the ability to create a folder '${anchorLocation}'; but a file or folder 
          already exists at that location.  Your options are:
          
          (e)xit and investigate (and restart this process when ready); (
          c)ontinue - IN THIS CASE, THE FOLDER WILL BE DELETED AND RECREATED`
        );

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
                processSystemInfoFile();
                return;
              }

              log('That is an invalid answer.  Please answer either \'e\' to exit, correct, and restart this process; or \'c\' to continue WHICH MEANS THE FOLDER WILL BE DELETED AND RECREATED');
              keepAskingQuestion();
            })
          );
        }
      }

      if (!anchorLocationExists) processSystemInfoFile();

      function showExplanation() {
        console.log(
          `
          ******************************************************************
          *                                                                 *
          *                  EVALUATING ENVIRONMENT                         *
          *                                                                 *
          ******************************************************************
  
          The first step is to examine your TeamSynch environment (which should have been 
          cloned from either our Public Repository - if you're bootstrapping a Team - or your 
          Team's Repository - if the Team has already been bootstrapped and you are bootstrapping 
          your laptop).

          This process will first determine (by examining certain aspects of this environment) 
          which scenario (Team Bootstrapping or Laptop Bootstrapping) is being applied.  Then it will 
          examine the environment for the necessary artifacts for the particular scenario.  
          
          Usually all necessary artifacts are present; however, if not, then on the first missing 
          artifact encountered, this process will inform you of the particular missing artifact, 
          and then terminate so you can correct the situation.  After correcting the situation, you 
          can restart this process.
          `
        );
      }
  });

  grunt.registerTask('managesysteminfo', manageSystemInfo);

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

  function displayManageSystemInfoHelpText() {
    log(
      `
      **************MANAGE SYSTEM INFO*************
      
      Display this Help Screen:
      'npm run managesysteminfo_help'
      or
      'grunt managesysteminfo:help' ('help' can also be expressed 'H', 'h', 'HELP', 'Help', or 'help')
      or even just
      grunt managesysteminfo
      i.e. no parameters

      Generate the SystemInfo file:
      Generate the System Info File from defaults:
      'npm run managesysteminfo_default'
      or
      'grunt managesysteminfo:default'

      This will generate the System Info File with default values; this will result in indicating to use a Parent Directory, 
      that the Parent Directory will be your laptop's Home Directory, that the Admin Folder will be under Parent Directory with 
      a name of \'teamsyncadmin\', and that the Project Directory will be under Parent Directory with a name of 'Projects.
      
      Generate the SystemInfo File interactively:
      'npm run managesysteminfo'
      
      You will be asked in succession for either three or four values:
      
      '1) Do you want a Parent Directory?'  If you indicate you want a Parent Directory (see below), then you will 
      be asked three more questions for a total of four; and you will be indicating to create (or ensure exists) a 
      Parent Directory in the relative path you provide in the answer to Question 2; and to create the Admin Folder 
      and the Projects Folder in the location underneath the Parent Directory that you provide in the answers to Question 
      3 and 4.  If you indicate you do not want a Parent Directory, then you will be asked two more questions for a total 
      of three; and you will be indicating to create the Admin Folder and the Projects Folder in the locations you provide 
      in the answer to Questions 3 and 4.
      
      To indicate that you want a Parent Directory, answer with any of the following:
      'Y', 'y', 'YES', 'Yes', 'yes'
      
      To indicate that you do not want a Parent Directory, answer with any of the folloging:
      'N', 'n', 'NO', 'No', 'no'
      
      '2) What is the location of the Parent Directory?' or 'What is the location of the Admin Folder?'  If you indicated 
      in Step 1 that you want to use a Parent Directory, then Question 2 will ask you the location of that Parent Directory.  
      If you indicated in Step 1 that you do not want to use a Parent Directory, then Question 2 will ask you the location of 
      the Admin Folder.  (Notes about specifying any Directory/Folder appear below.)
      
      3) 'What is the location of the Admin Folder?' or 'What is the location of the Projects Folder?'  If you indicated 
      in Step 1 that you want to use a Parent Directory, then Question 3 will ask you the location of your Admin Folder.  
      If you indicated in Step 1 that you do not want to use a Parent Directory, then Question 3 will ask you the location 
      of the Projects Folder.  (Notes about specifying any Directory/Folder appear below.)
      
      4) 'What is the location of the Projects Folder?'  If you indicated in Step 1 that you want to use a Parent Directory, 
      then Question 4 will ask you the location of your Projects Folder.  If you indicated in Step 1 that you do not want to 
      use a Parent Directory, then there will be no Question 4.
      
      Generate the SystemInfo File via cli parameters:
      
      Generate the SystemInfo File by hand:
      In the folder 'full_bootstrap', create a file named 'SystemInfo' (no extension).  In that file, add one line.  This line 
      is expected to contain your choices (equivalent to the choices/answers you provide the cli), like this:
      
      When you intend to have a Parent Directory:
      [USEPARENTDIRECTORY]|[PARENTDIRECTORYPATH]|[ADMINFOLDERPATHRELATIVETOPARENTDIRECTORY]|[PROJECTFOLDERPATHRELATIVETOPARENTDIRECTORY]
      USEPARENTDIRECTORY: Value will indicate 'yes' ('Y', 'y', 'YES', 'Yes', 'yes'
      [PARENTDIRECTORYPATH] indicates the absolute path of the Parent Directory
      [ADMINFOLDERPATHRELATIVETOPARENTDIRECTORY] indicates the name/path of the Admin Folder relative to the Parent Directory
      [PROJECTFOLDERPATHRELATIVETOPARENTDIRECTORY] indicates the name/path of the Projects Folder relative to the Parent Directory
      
      When you intend not to have a Parent Directory:
      [USEPARENTDIRECTORY]|[PARENTDIRECTORYPATH]|[ADMINFOLDERPATHRELATIVETOPARENTDIRECTORY]|[PROJECTFOLDERPATHRELATIVETOPARENTDIRECTORY]|
      **********NOTE THE FINAL \'PIPE SEPARATOR\'***********
      USEPARENTDIRECTORY: Value will indicate 'no' ('N', 'n', 'NO', 'No', 'no'
      [ADMINFOLDERPATHRELATIVETOPARENTDIRECTORY] indicates the name/path of the Admin Folder relative to the Parent Directory
      [PROJECTFOLDERPATHRELATIVETOPARENTDIRECTORY] indicates the name/path of the Projects Folder relative to the Parent Directory
      
      Examples:
      When you intend to have a Parent Directory
      Y|/Users|teamsyncadmin|projects|
      
      When you intend not to have a Parent Directory
      N\/Users/Library/teamsyncadmin|/Users|
      **********NOTE THE FINAL \'PIPE SEPARATOR\'***********

      *********NOTES:*********
      For any value that is filled with a path ('parentDirectory', 'adminDirectoryValue', or 'projectsDirectoryValue'), you 
      can provide the special value '[HOMEDIR]' to indicate the Home Directory for the laptop.
      
      Also, whether you generate the SystemInfo File interactively, via parameters, or by hand (not using the cli), the values for 
      'adminFolderValue' and 'projectsFolderValue' will not be checked for validity, with one exception (see below).  
      You are responsible for providing values that can result in a folder being created on your particular platform.  
      If you provide a value that doesn't meet this criterion, you will not be notified of this until later, when another 
      task attempts to create the given Folder.
      
      The exception to this is if you provide any combination of values that would result in either the 
      'adminFolderLocation' or the 'projectsFolderLocation' being equivalent to the Home Directory.  This task will 
      not allow that.  If you provide such a combination, this task will notify you of that, then terminate.  If the first 
      parameter ('hasParentDirectory') indicates that there will be a Parent Directory, then the invalid combination of values 
      cannot occur.  If 'hasParentDirectory' indicates that there will be no Parent Directory, then the invalid combination 
      of values will occur if either 'adminFolderValue' or 'projectsFolderValue' indicates Home Directory ('[HOMEDIR]').  
      So in other words, you can never make your laptop's Home Directory into the Admin Folder or the Projects Folder; however, 
      you **can** make it the Parent Directory of those.

      Note that the special value'[HOMEDIR]' (which indicates your laptop's Home Directory) is mainly intended to be 
      used for the Parent Folder.  The value is allowed for 'adminFolderLocation' and/or 'projectsFolderLocation' when 
      specifying a Parent Directory exists, but the effects might not be what you intended.  For instance, if you indicate 'Y' 
      for whether a Parent Directory exists, and '[HOMEDIR] for 'adminFolderLocation', and if your laptop's Home Directory is 
      '/Users', then your Admin Folder will be located at '/Users/Users' i.e. the task will first ensure that a path '/Users' 
      (Home Directory) exists; then it will create a folder underneath that with the value of your Home Directory's path 
      ('/Users').

      As a final note: the Admin Directory is used by the Team Synch System for several admin functions (for example, your team's 
      Project Templates will be stored there).  The Projects Directory is the Directory/Folder where the Team Synch System will 
      look for and place Projects (like JavaScript/Node Projects, etc.) when you use the System to access/create/etc. any Project.`
    );
  }

  function processSystemInfoFile() {
    const systemInfoFilePath = `${__dirname}/SystemInfo`;
    const defaultSystemInfoFilePath = `${__dirname}/DefaultSystemInfo`;
    
    if (systemInfoFileDoesNotExistOrIsInvalid()) {
      log(
        `********NOTICE*********
        This system requires a valid SystemInfo file, but one cannot be found in this folder.  You must create one 
        (by hand or by running 'npm run managesysteminfo') and then launch this routine ('npm finishbootstrapping') again.  
        For more information, run 'npm run help'.`
      );

      return;
    }

    bootstrapTeamOrBootstrapLaptop(systemInfoFilePath);

    function systemInfoFileDoesNotExistOrIsInvalid() {
      return (
        !fs.existsSync(systemInfoFilePath) ||
        !fileIsValidSystemInfoFile(systemInfoFilePath)
      );
    }

    function fileIsValidSystemInfoFile(path) {
      const text = fs.readFileSync(path, 'utf8');
      const result = textIsValidSystemInfoText(text);
      return result;

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
          log(
            `
            ************NOTICE***************
            This system requires the ability to create two Folders as specified by the SystemInfo file; and 
            it must be two separate folders.  The specified folders are in the same location.  This process 
            will now stop so you can investigate and correct SystemInfo file; then you can restart this process.

            `
          );


          if (useParent) {
            log(
              `The specification is to use a parent Folder ('${split[1]}'); and the duplicate child location 
              specified is ${split[2]}`
            )

            return;
          }

          log(
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
          log(
            `
            *********NOTICE*********
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
  }

  function getDirectoryValue(rawDirectoryValue) {
    return rawDirectoryValue === '[HOMEDIR]' 
      ? os.homedir() 
      : rawDirectoryValue;
  }

  function bootstrapTeamOrBootstrapLaptop(systemInfoFilePath) {
    const systemInfoText = fs.readFileSync(systemInfoFilePath, 'utf8').trim();

    if (systemInfoText === 'skip') {
      fs.unlinkSync(systemInfoFilePath);
      bootstrapTeam(systemInfoFilePath);
      return;
    }

    bootstrapLaptop(systemInfoFilePath);
  }

  function bootstrapLaptop(systemInfoFilePath) {
    createFoldersAndCopySystemInfo();



    function createFoldersAndCopySystemInfo() {
      createFolders();
      copySystemInfo(systemInfoFilePath);  
    }

    function createFolders() {
      fs.mkdirSync(anchorLocation);
      const split = systemInfoText.split('|');
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

    function copySystemInfo(path) {
      fs.copyFileSync(path.join(__dirname, 'SystemInfo'), `${anchorLocation}/SystemInfo`);
    }
  }

  function bootstrapTeam(systemInfoFilePath) {
    showExplanation();

    function showExplanation() {
      console.log(
        `
        ******************************************************************
        *                                                                 *
        *                    BOOTSTRAPPING TEAM                           *
        *                                                                 *
        ******************************************************************
  
        It appears that you have cloned the TeamSynch public repository; the next step 
        is to create your Team's TeamSynch repository.

        This process will now ask you a series of questions and, based on your answers, will 
        create artifacts as well as create and set up a repository in the hub you specify (GitHub, etc.).

        
        `
      );
    }
  }

  function manageSystemInfo(
    hasParentDirectory, parentDirectoryPath, adminFolderValue, projectsFolderValue
  ) {
    let hasPDirectory;

    showExplanation();

    if (!hasValidHasParentDirectory()) {
      notifyOfInvalidHasParentDirectory();
      return;

      function notifyOfInvalidHasParentDirectory() {
        log(
          `
          ******NOTICE*******
          You have provided a parameter (first parameter, which can either signify 'help' or 'hasParentDirectory') 
          with an invalid value ('${hasParentDirectory}').  The valid values for this parameter are:
          
          'H' or 'h' or 'HELP' or 'Help' or 'help' to get a help screen for this task (you can also just provide no first parameter, and the Help Screen will display)
          'Y' or 'y' or 'Yes' or 'yes' or 'YES' to indicate that the two folders you will define, will have a common Parent Folder
          'N' or 'n' or 'NO' or 'No' or 'no' to indicate that the two folders you will define, will not have a common Parent Folder
          
          Below is the Help Screen for this task; you can always display it via \'npm run managesysteminfo_help\'
          This process will now terminate.  You can always start it again ('npm run managesysteminfo`
        );

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

    function goDefault() {
      hasParentDirectory = true;
      adminFolderValue = 'teamsyncadmin';
      projectsFolderValue = 'projects';
      createSystemInfoFile();
    }

    function goCli() {
      hasPDirectory = hasParentDirectoryBoolean();
      createSystemInfoFile();
    }

    function goInteractive() {
      console.log(
        `
        ****************Generating File Interactively************
        It has been specified to generate the SystemInfo File by asking you a series of questions, 
        which we will begin now.

        Question 1: Do you wish to just use the default values ('Y|[HOMEDIR]|teamsynchadmin|projects|') 
        to generate the file?  (Note: '[HOMEDIR]' is a special value that equates to the path of your laptop's 
        Home Directory. - see below)

        An answer of 'Y', 'y', 'YES', 'Yes', or 'yes' will indicate you wish to generate based on the default 
        values.  In this case, this process will generate the SystemInfo File, then the overall process will continue.

        As with any of the questions we're explaining here, an answer of 'EXIT' will terminate this process.

        Question 2: Do you wish to have a Parent Directory?  This is a yes-no question.  An answer that is a  
        variant of 'Yes', specifically: 'Y', 'y', 'YES', 'Yes', or 'yes', will indicate to have a Parent Directory;
        any other answers will indicate not to have a Parent Directory.

        NOTE: If you indicate in Question 2 to have a Parent Directory, then the Interactive process will consist of 
        three more questions; if you indicate not to have a Parent Directory, then the Interactive process will 
        consist of two more questions.  When you answer that you want a Parent Directory,  there will be an additional 
        question to give the value of your Parent Directory.

        Question 3: What is the path of your Parent Directory? (if you indicated to have a Parent Directory)  or 
        What is the path of your Admin Folder? (if you indicated not to have a Parent Directory).  Provide the 
        location of your Parent Directory or Admin Folder.

        Question 4: What is the path of your Admin Folder? (if you indicated to have a Parent Directory) or 
        What is the path of your Projects Folder? (if you indicated not to have a Parent Directory).  Provide the 
        path of your Admin Folder or Projects Folder.

        Question 5: What is the path of your Projects Folder? (a fifth question is asked only if you indicated to have 
        a Parent Directory).  Provide the path of your Projects Folder.

        *******NOTES*****
        1) Be very careful of any values you provide for Parent Directory, Admin Folder Path, and Projects Folder Path.  
        There is no validation that they are valid path values; if not, this will only be discovered later when someone 
        attempts to create that path on their laptop.

        2) For Parent Directory, Admin Folder Path, and Projects Folder Path, you can provide a special value '[HOMEDIR]', 
        and this process will substitute in the path of the Home Directory on the laptop on which this process is run.  
        You are allowed, under certain circumstances, to provide it for Admin Folder Path or Projects Folder Path; but 
        it really is intended to be used for Parent Directory.  If you indicate not to have a Parent Directory, you will 
        not be allowed to indicate '[HOMEDIR]' for either Admin Folder Path or Projects Folder Path.  If you indicate to 
        have a Parent Directory and further indicate '[HOMEDIR]' for Admin Folder Path or Projects Folder Path, then 
        the SystemInfo File will be interpreted to place that folder under Parent Directory with a relative path equivalent 
        to the laptop's Home Directory.  For instance, let's say you indicate to have a Parent Directory, give a value of 
        '[HOMEDIR]' for Parent Directory, and also give a value of '[HOMEDIR]' for Admin Folder Path.  And let's say that 
        the process is run with that SystemInfo File, on a laptop whose Home Directory is located at '/Users'.  Then the 
        process, interpreting the SystemInfo File, will use the laptop's Home Directory ('/Users')as the Parent Directory, 
        and will then place the Admin Folder under that Home Directory, and the Admin Folder's path will be '/Users/Users'.
        
        `
      );
    }

    function showExplanation() {
      console.log(
        `
        ******************************************************************
        *                                                                 *
        *                 MANAGING SYSTEMINFO FILE                       *
        *                                                                 *
        ******************************************************************
  
        The SystemInfo File is placed in the Anchor Location and contains the location of 
        the system's TeamSynchAdmin Folder and Projects Folder.  This process will generate 
        that File based on what has been specified:.

        Default (first parameter has value of 'default): the SystemInfo File will be created with 
          default values of 'Y|[HOMEDIR]|teamsynchadmin|projects', which indicates that there is a 
          Directory, that your laptop's Home Directory is the Parent Directory, that the Admin Folder 
          is a Folder under the Parent Directory named 'teamsynchadmin', and that the Projects Folder 
          is a Directory under the Parent Directory named 'projects'.

        Interactive (first parameter has value of 'I'): You will be asked how you want the values in 
          the SystemInfo File to be generated.  The first question will be whether you wish to use defaults;
          if so, then the SystemInfo File will be generated with the defaults as described above.  If not, 
          then you will be asked about the Parent Directory, Admin Folder, Projects Folder, etc.
  
        `
      );
      }

    function createSystemInfoFile() {
      fs.writeFileSync(path.join(anchorLocation, 'SystemInfo'), getSystemInfoText());

      function getSystemInfoText() {
        return `${getHasParentDirectoryValue()}|${getSecondValue()}|${getThirdValue()}|${getFourthValue()}`;

        function getHasParentDirectoryValue() {
          return hasPDirectory ? 'Y' : 'N';
        }

        function getSecondValue() {
          return hasPDirectory ? parentDirectoryPath : adminFolderPath;
        }

        function getThirdValue() {
          return hasPDirectory ? getAdminPathValue() : projectsFolderPath;
        }

        function getFourthValue() {
          return hasPDirectory ? getProjectsPathValue() : '';
        }

        function getAdminPathValue() {
            return path.join(parentDirectoryPath, adminFolderPath);
        }

        function getProjectsPathValue() {
          return `${path.join(parentDirectoryPath, projectsFolderPath)}|`;
        }
      }
    }
  }

  function log(toLog) {
    console.log(toLog);
  }
};