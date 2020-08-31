const { fstat } = require("fs-extra");

module.exports = function(grunt) {
  const fs = require('fs');
  const util = require('util');
  const exec = require('child_process').exec;
  const path = require('path');

  const adminFolderPath = 'ADMIN_FOLDER_PATH';
  const projectsFolderPath = 'PROJECTS_FOLDER_PATH';
  const workingDirectoryFolderPath = 'WORKING_FOLDER_PATH';

  const teamRepositories = TEAM_REPOSITORIES;

  const defaultTeamHub = 'NO_DEFAULT_TEAM_HUB';


  function haveDefaultTeamHub() {
    return defaultTeamHub !== 'NO_DEFAULT_TEAM_HUB';
  }

    grunt.registerTask('default', () => {
      let proceed = true;

      showExplanation();
      createFolders();

      if (proceed) copyRelevantFiles();
      if (proceed) makeTsAvailableFromAnywhere();
      if (proceed) makeTsScriptExecutable();
      if (proceed) installNpmPackages();

      function showExplanation() {
        log(
          `
          ******************************************************************
          *                                                                 *
          *            LAPTOP BOOTSTRAPPING (OVERVIEW)                      *
          *                                                                 *
          ******************************************************************

          Welcome to TeamSynch!  (https://github.com/sladestewart/teamsynchteambootstrapper/blob/master/README.md)

          We are now bootstrapPING your laptop.  This process requires no input from you; it will consist of:

          1) CREATE ADMIN, PROJECTS, AND WORKING FOLDER: The TeamSynch system relies on these folders' existence,
          so this process will create them now in the paths specified by the person who earlier performed the
          Team Bootstrapping.

          2) COPY RELEVANT FILES: This Bootstrapping Site that you cloned contains the files necessary for your
          TeamSynch system to operate; so this process will copy those files to the TeamSynch Working Directory.

          3) MAKE TS AVAILABLE FROM ANYWHERE:  This process will enable the ts script to be called from anywhere; so
          that, once it's executable, you will only need to get to a shell and then type 'ts' to begin (you can also
          type commands; for instance, to see the ts help screen, you can type 'ts help')

          4) MAKE TS SCRIPT EXECUTABLE: The TeamSynch system comes with a script file (the ts script)that enables a
          TeamSynch command-line interface.  This process will issue commands to your particular Operating System,
          to make this file executable.

          5) INSTALL NPM PACKAGES: To prepare the Working Folder for use, we'll install all the specified npm packages
          `
        );
      }

      function createFolders() {
        let pathBeingCreated = '';
        const adminFolderExists = fs.existsSync(adminFolderPath);
        const projectsFolderExists = fs.existsSync(projectsFolderPath);

        showExplanation();

        if (adminFolderExists || projectsFolderExists) {
          log(
            `
            ***********ACTION REQUIRED (TERMINATING)**********
            The TeamSynch process requires two new Folders on your laptop,
            ${adminFolderPath}
            and
            ${projectsFolderPath}

            The process creates these Folders new, and must be able to do so i.e. the Folders must
            not already exist on your laptop.

            However, at least one of these Folders already exists on your laptop; so this process is
            now terminating so that you can investigate and correct.  When you are ready, you can
            start this process again ('npm start').

            Admin Folder exists? ${adminFolderExists}
            Projects Folder exists? ${projectsFolderExists}
            `
          );

          proceed = false;
          return;
        }

        try {
          pathBeingCreated = adminFolderPath;
          fs.mkdirSync(adminFolderPath, {recursive: true});
          pathBeingCreated = projectsFolderPath;
          fs.mkdirSync(projectsFolderPath, {recursive: true});
          pathBeingCreated = workingDirectoryFolderPath;
          fs.mkdirSync(workingDirectoryFolderPath);
        }
        catch(exception) {
          log(
            `
            **********ERROR (TERMINATING)***********
            While trying to create path '${pathBeingCreated}', the following error occurred:
            ${util.inspect(exception)}

            This process will now terminate so you can investigate.  When you're ready, start this
            process again ('npm start').
            `
          );

          proceed = false;
        }

        function showExplanation() {
          log(
            `
            ******************************************************************
            *                                                                 *
            *      1. CREATE ADMIN, PROJECTS, AND WORKING FOLDER              *
            *                                                                 *
            ******************************************************************

            This process is now creating the TeamSynch Admin Folder (which will hold certain files and
            folders -including, most importantly, the Working Folder - necessary for Teamsynch to operate);
            and the Projects Folder, which will act as the standard well-known location of projects on
            your laptop.
            `
          );
        }
      }

      function copyRelevantFiles() {
        showExplanation();

        log('2A) Copy AdminGruntFile.js as Gruntfile.js');
        copyFile('AdminGruntFile.js', 'Gruntfile.js');
        log('2B) Copy AdminPackage.json as Package.json');
        copyFile('AdminPackage.json', 'Package.json');

        function copyFile(sourceFile, targetFile) {
          fs.copyFileSync(
            path.join(workingDirectoryFolderPath, sourceFile),
            path.join(workingDirectoryFolderPath, targetFile || sourceFile)
          );
        }

        function showExplanation() {
          log(
            `
            ******************************************************************
            *                                                                 *
            *                 2. COPY RELEVANT FILES                          *
            *                                                                 *
            ******************************************************************

            Now that the necessary Folders have been created, we will copy the necessary
            Files to the Folder(s).
            `
          );
        }
      }

      function makeTsScriptExecutable() {
        showExplanation();
        fs.chmod('/usr/local/bin/ts', 0o555);

        function showExplanation() {
          log(
            `
            ******************************************************************
            *                                                                 *
            *             4. MAKE TS SCRIPT EXECUTABLE                        *
            *                                                                 *
            ******************************************************************

            Now this process will make the ts script executable; so you can begin
            TeamSynch by getting to a shell and typing 'ts'.  You can also use commands;
            for instance, to see the TeamSynch help screen, type 'ts help'.
            `
          );
        }
      }

      function makeTsAvailableFromAnywhere() {
        showExplanation();

        fs.copyFileSync(
          path.join(__dirname, 'ts'),
          path.join('/usr/local/bin', 'ts')
        );

        function showExplanation() {
          log(
            `
            ******************************************************************
            *                                                                 *
            *          3. MAKE TS AVAILABLE FROM ANYWHERE                     *
            *                                                                 *
            ******************************************************************

            The TeamSynch Command-Line Interface works via a bash script named 'ts'.
            This process will now make this ts script available whenever you get to a shell
            and type 'ts'.  A later step will make this script file executable.
            `
          );
        }
      }

      function installNpmPackages() {
        showExplanation();

        exec('npm install', (err) => {
          if (err) {
            log(
              `
              ****************ERROR (TERMINATING)*************
              An error occurred attempting to install npm packages.  This process will now
              terminate so you can investigate and correct.  When you are ready, start this
              process again ('npm start').
              `
            );

            return;
          }

          log(
            `
            *******************COMPLETE*******************
            *******************COMPLETE*******************
            *******************COMPLETE*******************
            This process is complete and TeamSynch is now ready on your laptop.

            Enjoy!
            `
          );
      });

        function showExplanation() {
          log(
            `
            ******************************************************************
            *                                                                 *
            *               5. INSTALL NPM PACKAGES                           *
            *                                                                 *
            ******************************************************************

            In order to finish setting up TeamSynch on this laptop, this process will now
            install all the necessary npm packages.
            `
          );
        }
      }

      function log(toLog) {
        console.log(toLog);
      }
    });
};
