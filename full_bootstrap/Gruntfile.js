const { REPL_MODE_SLOPPY } = require('repl');

module.exports = function(grunt) {
    const fs = require('fs-extra');
    const os = require('os');
    const path = require('path');
    const readline = require('readline');
    const { exec } = require('child_process');
    const inspect = require('util').inspect;

    let teamSynchGithubAccountName = '';
    let teamSynchGithubAccountUrl = '';

    let parentDirectoryPathValue = '';
    let adminPathValue = '';
    let projectsPathValue = '';
    let adminFolderLocation = '';
    let projectsFolderLocation = '';
    let workingFolderLocation = '';

    let teamSynchFolderLocation = '';
    let teamSynchFolderFullBootstrapLocation = '';
    let teamSynchFolderFirstMinimalBootstrapLocation = '';
    let teamSynchFolderFirstMinimalBootstrapBashLocation = '';
    let teamSynchFolderProjectTemplatesLocation = '';
    let teamSynchFolderProjectTemplatesStagingLocation = '';

    const additionalHubIds = [];
    let additionalHubIdsClone = null;
    const teamRepositories = [];
    const templateHubIds = [];
    const templateHubs = [];
    let templateHubIdsClone = null;


    grunt.registerTask('default', function() {
        const done = this.async();
        let folderPathsGotten = false;
        let requiredTeamSynchInfoGathered = false;
        let additionalHubsGathered = false;
        let teamRepositoriesGathered = false;
        let templateRepositoryInfoGathered = false;
        let teamSynchRepoPopulatedAndSynched = false;
        let laptopBootstrapped = false;
        



        showExplanation();

        if (!environmentIsOkay()) {
            log(
                `
                This process will now terminate so you can investigate and correct; then
                you can restart this process by navigating here and typing 'npm start' or
                'grunt'
                `
            );

            return;
        }

        doNext();


        function doNext() {
            if (!folderPathsGotten) {
                getFolderPathsAndCreateFolders();
                return;
            }

            if (!requiredTeamSynchInfoGathered) {
                gatherRequiredTeamSynchInfo();
                return;
            }

            if (!additionalHubsGathered) {
                gatherAnyAdditionalHubs();
                return;
            }

            if (!teamRepositoriesGathered) {
                gatherAnyTeamRepositories();
                return;
            }

            if (!templateRepositoryInfoGathered) {
                gatherTemplateRepositoryInfo();
                return;
            }

            if (!teamSynchRepoPopulatedAndSynched) {
                populateLocalTeamSynchRepoAndSynchIt();
                return;
            }

            if (!laptopBootstrapped) {
                finishSettingUpTeamSynch();
                return;
            }


            log(
                `
                ******************COMPLETE***************
                ******************COMPLETE***************
                ******************COMPLETE***************
                ******************COMPLETE***************

                Congratulations!  You have completed the TeamSynch bootstrapping process for both your Team, and this
                laptop.

                To start working with the TeamSynch system, from a shell type 'ts'.  To see Help Info for the TeamSynch system,
                you can type 'ts help'.  Additionally, once you have begun the TeamSynch process (by typing 'ts'), you can
                show help by typing 'npm run help'.

                Happy Ts-in' !!!!!!
                `
            );

            done();
        }

        function showExplanation() {
            log(
              `
              ******************************************************************
              *                                                                 *
              *              TEAM BOOTSTRAPPING (OVERVIEW)                      *
              *                                                                 *
              ******************************************************************

              Welcome to TeamSynch!  (https://github.com/sladestewart/teamsynchteambootstrapper/blob/master/README.md)

              We are now going to bootstrap your team's TeamSynch (this process will guide you through that).  This will
              consist of:
              1) EVALUATE ENVIRONMENT: Evaluating this laptop's environment to ensure that all necessary artifacts exist.
              If not, this process will list the missing artifacts (so you can investigate and correct), and terminate (after
              correcting the situation, you can start this process again).

              2) GET FOLDER PATHS AND CREATE FOLDERS: You specifying where you want your Team's TeamSynch Admin and your Team's Projects Folders
              to exist on each laptop.

              3) GATHER TEAMSYNCH REPOSITORY INFO AND ADDITIONAL HUBS: This process will ask you for the Url where you created your TeamSynch repository.

              4) GATHER REPOSITORY INFO FOR HUBS: You will be asked for any info regarding repositories, for each of the hubs you
              have identified.

              5) GATHER TEMPLATE REPOSITORY INFORMATION (Optional): You can identify one or more Project Template Repositories (that adhere to the TeamSynch Project Template
              Repository standard), and specify Project Templates to add to your team's Team Synch Repository

              6) LOCAL TEAMSYNCH REPOSITORY: Create the Team Synch Local Repository, populate it, and initialize it; then push all the
              new artifacts to the Remote TeamSynch Repository.

              NOTE: Once the Local Repository is populated, it will have some similarities
              with the Public TeamSynch Repository you have cloned and are working with now; but it will also have crucial differences.
              The purpose of this Public TeamSynch Repository (that you're working with now) is mainly to bootstrap your team's TeamSynch
              Repository; the purpose of that created Repository (your team's TeamSynch Repository) is to bootstrap a given team member's
              laptop, and then to enable that team member (on that laptop) to perform TeamSynch functions.

              7) FINISH BOOTSTRAPPING THIS LAPTOP: Once you have bootstrapped the remote TeamSynch Repository, then any team member can clone the
              repository, bootstrap their laptop, and begin using the TeamSynch functions.  In order to bootstrap the TeamSynch
              Repository, this process has partially bootstrapped this laptop.  For your convenience, and also so as not to leave
              this laptop in a partial state, the final step will be to bootstrap this laptop with the TeamSynch system.  This means
              that you do not need to perform a separate step to bootstrap this particular laptop.
              `
            );
        }

        function getFolderPathsAndCreateFolders() {
            let useParentDirectory = false;
            let parentDirectoryShouldBeHomeDirectory = false;

            showExplanation();
            askQuestionAboutDefaults();



            function askQuestionAboutDefaults() {
                const rl = getReadline();

                rl.question(
                    'Do you wish to use the defaults?',
                    (answer) => {
                        if (answerIsInTheAffirmative(answer)) {
                            useParentDirectory = true;
                            parentDirectoryShouldBeHomeDirectory = true;
                            adminPathValue = 'teamsynchadmin';
                            projectsPathValue = 'projects';
                            rl.close();
                            setUpBasedOnFolderAnswers();
                            return;
                        }

                        rl.close();
                        askWhetherToUseParentDirectory();
                })
            }

            function askWhetherToUseParentDirectory() {
                const rl = getReadline();

                rl.question(
                    'Do you wish to have a Parent Directory?',

                    (answer => {
                        useParentDirectory = answerIsInTheAffirmative(answer);
                        rl.close();
                        proceed();

                        function proceed() {
                            if (useParentDirectory) {
                                askWhetherParentDirectoryShouldBeHomeDirectory();
                                return;
                            }

                            askQuestionAboutAdminFolder();
                        }
                    })
                );
            }

            function askWhetherParentDirectoryShouldBeHomeDirectory() {
                const rl = getReadline();

                rl.question(
                    'Do you wish the Home Directory to be the Parent Directory?',

                    (answer) => {
                        parentDirectoryShouldBeHomeDirectory = answerIsInTheAffirmative(answer);
                        rl.close();
                        proceed();

                        function proceed() {
                            if (parentDirectoryShouldBeHomeDirectory) {
                                askQuestionAboutAdminFolder();
                                return;
                            }

                            askQuestionAboutParentDirectory();
                        }
                    }
                )
            }

            function askQuestionAboutParentDirectory() {
                const rl = getReadline();

                rl.question(
                    'What is the path for the Parent Directory?',

                    (answer) => {
                        parentDirectoryPathValue = answer;
                        rl.close();
                        askQuestionAboutAdminFolder();
                    }
                )
            }

            function askQuestionAboutAdminFolder() {
                const rl = getReadline();

                rl.question(
                    'What is the path for the Admin Folder?',

                    (answer) => {
                        adminPathValue = answer;
                        rl.close();
                        askQuestionAboutProjectsFolder();
                    }
                )
            }

            function askQuestionAboutProjectsFolder() {
                const rl = getReadline();

                rl.question(
                    'What is the path for the Projects Folder?',

                    (answer) => {
                        projectsPathValue = answer;
                        rl.close();
                        setUpBasedOnFolderAnswers();
                    }
                )
            }

            function showExplanation() {
                log(
                  `
                  ******************************************************************
                  *                                                                 *
                  *         2. GET FOLDER PATHS AND CREATE FOLDERS                  *
                  *                                                                 *
                  ******************************************************************

                  Team Synch requires two folders to exist on a Team Member's laptop: the Admin Folder
                  (used for administration of Team Synch) and the Projects Folder (where Projects -
                  node.js projects, etc. - will be placed).

                  Now this process will ask you a series of questions to determine the standard location
                  for these folders for your Team.  After it gathers this information, it will crete
                  those Folders on your laptop.

                  The Admin and Project Folder paths can be specified independently of each other, or -
                  as is more common and recommended - a Parent Directory can be specified, and the Admin
                  and Project Folder paths are then specified relative to that Parent Directory.

                  Additionally, it is common and recommended to specify that the Home Directory (of any
                  given Team Laptop) be the Parent Directory.

                  The first question you will be asked is whether you want to simply go with the default
                  (the common and recommend approach) i.e. have the Home Directory of the Team Laptops
                  be the Parent Directory, and the Admin and Project Folders be relative to that; **and** to
                  specify that the Admin Folder is a Folder 'TeamSynchAdmin' under the Parent Directory (Home
                  Directory); **and** to specify that the Projects Folder is a Folder 'Projects' under the Parent
                  Directory (Home Directory).

                  The first question is one of two Yes-No questions in Step 2.  For any Yes-No question, an answer of
                  'Y', 'y', 'YES', 'Yes', or 'yes' will be considered an answer in the affirmative; and **all other
                  answers** (including just hitting '<Enter>/<Return>' etc.) will be considered an answer in the negative.

                  If you answer in the affirmative to the first question regarding using defaults, then this process
                  will simply set the Team Repository up to use the defaults, and Step 2 will be complete.  If you answer
                  in the negative to the first question, then three or four further questions (depending on whether or not
                  you indicate to have a Parent Directory) will be asked, and then the Team Repository will be set up
                  based on your answers.

                  Finally, take care with your answers regarding the paths of the Admin Folder and the Projects Folder
                  (and Parent Folder, if specified and not specified as Home Directory on the target Laptop).
                  These values must represent valid paths on the target laptop; if not, this will not be discovered until
                  the first time a Laptop Bootstrapping is attempted.

                  Also ensure that the paths you provide will not be interpreted as relative paths to a current directory
                  that the process is running in.  (When using a Parent Directory and using Home Directory for the Parent Directory,
                  this situation is avoided altogether, which is why that is standard, recommended, and default).

                  So for instance, when specifying any Folder independently of a Home Directory/Parent Directory, a value of
                  '/admin' would cause the Laptop Bootstrapper to create a subfolder 'admin' in the folder it's working in, which is not
                  wanted.  However, a value like '~/admin' would 'anchor' the path in an absolute path.  Or if you indicate
                  to use a Parent Directory that is not the Home Directory, then a path of 'parent' for the Parent Directory
                  and 'admin' for the Admin Directory, would cause the Laptop Bootstrapper to create a subfolder 'parent' in
                  the folder it's working in, and a subfolder 'admin' in the 'parent' subfolder (i.e. 'parent/admin'), which
                  is also not wanted.

                  Though the situation is correctible, taking a little care to avoid it altogether is the easiest approach.
                  `
                );
            }

            function setUpBasedOnFolderAnswers() {
                adminFolderLocation = getAdminFolderPath();
                projectsFolderLocation = getProjectsFolderPath();
                workingFolderLocation = path.join(adminFolderLocation, 'Working');

                if (!createFolders()) return;

                setUpBootstrapLaptopGruntFile();
                setUpAdminGruntFile();
                setUpTs();

                folderPathsGotten = true;
                doNext();


                function createFolders() {
                    try {
                        fs.mkdirSync(adminFolderLocation, {resursive: true});
                        fs.mkdirSync(projectsFolderLocation, {recursive: true});

                        return true;
                    }
                    catch(exception) {
                        log(
                            `
                            An error was encountered creating the Admin and/or Project Folders Path.  This process
                            will now stop so you can investigate; you can start the process again later ('npm start').

                            error: ${JSON.stringify(exception)}
                            `
                        )
                    }
                }

                function setUpBootstrapLaptopGruntFile() {
                    const bootstrapLaptopGruntFileText = fs.readFileSync(
                        getLaptopBootstrapGruntFilePath(), 'utf8'
                    );

                    const newBootstrapLaptopGruntFileText = bootstrapLaptopGruntFileText
                        .replace('ADMIN_FOLDER_PATH', adminFolderLocation)
                        .replace('PROJECTS_FOLDER_PATH', projectsFolderLocation);


                    fs.writeFileSync(getLaptopBootstrapGruntFilePath(), newBootstrapLaptopGruntFileText);

                    function getLaptopBootstrapGruntFilePath() {
                        return path.join(__dirname, 'LaptopBootstrapGruntFile.js');
                    }
                }

                function setUpAdminGruntFile() {
                    fs.writeFileSync(
                        './ProjectsFolderPath.js', 

                        `module.exports = '${projectsFolderLocation}';`
                    )
                }

                function setUpTs() {
                    const tsFilePath = getTsFilePath();

                    const tsFileText = fs.readFileSync(getTsFilePath(), 'utf8');
                    const newTsFileText = tsFileText.replace('WORKING_FOLDER_PATH', workingFolderLocation);

                    fs.writeFileSync(getTsFilePath(), newTsFileText);


                    function getTsFilePath() {
                        return path.join(__dirname, 'ts');
                    }
                }

                function getAdminFolderPath() {
                    return getPathBasedOnParentDirectoryOrNot(adminPathValue);
                }

                function getProjectsFolderPath() {
                    return getPathBasedOnParentDirectoryOrNot(projectsPathValue);
                }

                function getPathBasedOnParentDirectoryOrNot(basePath) {
                    return useParentDirectory
                        ? path.join(getParentDirectoryPath(), basePath)
                        : basePath;
                }

                function getParentDirectoryPath() {
                    return parentDirectoryShouldBeHomeDirectory
                        ? os.homedir()
                        : parentDirectoryPathValue;
                }
            }
        }

        function gatherRequiredTeamSynchInfo() {
            showExplanation();
            askForGithubAccountName();


            function showExplanation() {
                log(
                  `
                  ******************************************************************
                  *                                                                 *
                  *     3. GATHER TEAMSYNCH REPOSITORY INFO AND ADDITIONAL HUBS     *
                  *                                                                 *
                  ******************************************************************

                  Now we'll gather from you the information about your github account (you need already
                  to have created the TeamSynch repository in this hub i.e. a repository named TeamSynch.  If not, you can
                  go create that now).

                  Later, this process will create a local TeamSynch repository on your laptop, create all necessary artifacts
                  and populate the local TeamSynch repository with them, then push your local TeamSynch repository to the
                  remote repository.
                  `
                );
            }

            function askForGithubAccountName() {
                const rl = getReadline();

                rl.question(
                    'What is the account name for the hub in which you\'ll place your TeamSynch repository?',

                    answer => {
                        teamSynchGithubAccountName = answer;
                        teamSynchGithubAccountUrl = `${githubUrl(teamSynchGithubAccountName)}`;
                        rl.close();
                        requiredTeamSynchInfoGathered = true;
                        doNext();
                    }
                )
            }
       }

        function gatherAnyAdditionalHubs() {
            getNextHubAccountName();

            function getNextHubAccountName() {
                const rl = getReadline();

                rl.question(
                    'Enter the account names of any additional hubs you wish to specify.  When you have no more hubs to specify, type \'IAMDONE\' (all caps):  ',

                    answer => {
                        if (answer === 'IAMDONE') {
                            rl.close();

                            if (additionalHubIds.length > 0) {

                                additionalHubsGathered = true;
                                doNext();

                                return;
                            }

                            additionalHubsGathered = true;
                            doNext();
                            return;
                        }

                        if (!additionalHubIds.includes(answer)) {
                            additionalHubIds.push(answer);
                        }

                        rl.close();
                        getNextHubAccountName();
                    }
                )
            }
        }

        function gatherAnyTeamRepositories() {
            additionalHubIdsClone = [...additionalHubIds];
           showExplanation();

            gatherRepositoriesForAHub(
                teamSynchGithubAccountName,

                () => {
                    gatherRepositoriesForAdditionalAccounts();
                }
            );


            function gatherRepositoriesForAdditionalAccounts() {
                if (additionalHubIdsClone.length === 0) {
                    teamRepositoriesGathered = true;
                    doNext();
                    return;
                }

                gatherRepositoriesForAHub(
                    additionalHubIdsClone[additionalHubIdsClone.length - 1],

                    () => {
                        additionalHubIdsClone.pop();
                        gatherRepositoriesForAdditionalAccounts();
                    }
                )
            }

            function gatherRepositoriesForAHub(hubId, onComplete) {
                let hubRepositories = teamRepositories.find(tr => tr.hubId === hubId);

                if (!hubRepositories) {
                    hubRepositories = {
                        hubNumber: teamRepositories.length + 1,
                        hubId,
                        repositories: []
                    };
    
                    teamRepositories.push(hubRepositories);
                }

                gatherOneRepository();

                function gatherOneRepository() {
                    const rl = getReadline();

                    rl.question(
                        `Enter the name of a repository for Account '${hubId}', or 'IAMDONE' (all caps) if you have no more repositories to enter for this account: `,

                        answer => {
                            if (answer === 'IAMDONE') {
                                rl.close();
                                onComplete();
                                return;
                            }

                            if (!hubRepositories.repositories.includes(answer)) {
                                hubRepositories.repositories.push({
                                    number: hubRepositories.repositories.length + 1,
                                    id: answer
                                });
                            }

                            rl.close();
                            gatherOneRepository();
                        }
                    );
                }
            }

            function showExplanation() {
                log(
                  `
                  ******************************************************************
                  *                                                                 *
                  *              4. GATHER REPOSITORY INFO FOR HUBS                 *
                  *                                                                 *
                  ******************************************************************

                  Now you have an opportunity to enter, for each hub you've identified (including your
                  TeamSynch hub), a list of repositories in that hub, that you want to be in the official TeamSynch
                  repository list.
                  `
                );
            }
        }

        function gatherTemplateRepositoryInfo() {
            showExplanation();
            gatherIt();

            function gatherIt() {
                const rl = getReadline();

                rl.question(
                    'Enter the account name of the first or next Template Repository Hub (note: if your TeamSynch hub is also a Template Repository Hub, enter its account name here again).  If you have no more to enter, type \'IAMDONE\' (all caps): ',

                    answer => {
                        if (answer === 'IAMDONE') {
                            rl.close();
                            templateRepositoryInfoGathered = true;
                            doNext();
                            return;
                        }

                        rl.close();

                        if (!templateHubIds.includes(answer)) {
                            templateHubIds.push(answer);
                            
                            templateHubs.push(
                                {
                                    hubNumber: templateHubs.length + 1,
                                    hubId: answer,
                                    templates: []
                                }
                            );
                        }

                        gatherIt();
                    }
                );
            }

            function showExplanation() {
                log(
                  `
                  ******************************************************************
                  *                                                                 *
                  *            5. GATHER TEMPLATE REPOSITORY INFORMATION            *
                  *                                                                 *
                  ******************************************************************

                  Now you can enter the account names for all Template Repository Hubs (hubs containing Repositories of
                  Project Templates, and adhering to the TeamSynch Template Repository standard).
                  `
                );
            }
        }

        function populateLocalTeamSynchRepoAndSynchIt() {
            showExplanation();
            createTeamSynchFolder();
            populateTeamSynchFolder();

            function createTeamSynchFolder() {
                log('A) Creating Folders');
                log('A1) Creating TeamSynch Folder.....');
                teamSynchFolderLocation = path.join(adminFolderLocation, 'TeamSynch');
                fs.mkdirSync(teamSynchFolderLocation);
                log('A2) Creating full_bootstrap Folder');
                teamSynchFolderFullBootstrapLocation = path.join(teamSynchFolderLocation, 'full_bootstrap');
                fs.mkdirSync(teamSynchFolderFullBootstrapLocation);
                log('A3) Creating FirstMinimalBootstrap Folder');
                teamSynchFolderFirstMinimalBootstrapLocation = path.join(teamSynchFolderLocation, 'first_minimal_bootstrap');
                fs.mkdirSync(teamSynchFolderFirstMinimalBootstrapLocation);
                log('A4) Creating FirstMinimalBootstrap/bash Folder');
                teamSynchFolderFirstMinimalBootstrapBashLocation = path.join(teamSynchFolderFirstMinimalBootstrapLocation, 'bash');
                fs.mkdirSync(teamSynchFolderFirstMinimalBootstrapBashLocation);
                log('A5) Creating ProjectTemplates Folder');
                teamSynchFolderProjectTemplatesLocation = path.join(teamSynchFolderLocation, 'ProjectTemplates');
                fs.mkdirSync(teamSynchFolderProjectTemplatesLocation);
                log('A6) Creating ProjectTemplates Staging Folder');
                teamSynchFolderProjectTemplatesStagingLocation = path.join(adminFolderLocation, 'ProjectTemplatesStaging');
                fs.mkdirSync(teamSynchFolderProjectTemplatesStagingLocation);
            }

            function populateTeamSynchFolder() {
                log('B) Populating TeamSynch Folder');
                populateFullBootstrapLocation();
                populateFirstMinimalBootstrapLocation();
                populateTeamSynchLocation();
                populateProjectTemplatesStagingFolderProjectTemplatesFolderAndTemplateHubsAndRepositoriesVariable();

                function populateTeamSynchLocation() {
                    log('B3) Populating TeamSynch Folder');
                    copyFile('just_do_it_and_damn_the_consequences_bash.sh');
                    copyFile('just_do_it_and_damn_the_consequences_windows.sh');

                    function copyFile(fileName) {
                        fs.copyFileSync(
                            path.join('../', fileName),
                            path.join(teamSynchFolderLocation, fileName)
                        );
                    }
                }

                function populateFullBootstrapLocation() {
                    log('B1) Populating full_bootstrap');
                    writeRepositoriesAndHubInfoForAdminGruntFile();
                    log('B1b) Copying AdminGruntFile');
                    copyFile('AdminGruntFile.js');
                    log('B2) Placing LaptopBootstrapGruntFile as plain Gruntfile');
                    copyFile('LaptopBootstrapGruntFile.js', 'Gruntfile.js')
                    log('B3) Copying AdminPackage.json');
                    copyFile('AdminPackage.json');
                    log('B4) Copying LaptopBootstrap README');
                    copyFile('LaptopBootstrapReadme.md', 'README.md');
                    log('B5) Copying after_minimal_bash script');
                    copyFile('after_minimal_bash.sh');
                    log('B6) Copying after_minimal_windows script');
                    copyFile('after_minimal_windows.sh');
                    log('B7) Copying full_bash script');
                    copyFile('full_bash.sh');
                    log('B8) Copying full_windows script');
                    copyFile('full_windows.sh');
                    log('B8) Copying package.json');
                    copyFile('package.json');
                    log('B10) Copying ts script file');
                    copyFile('ts');
                    log('B11) Copying ProjectsFolderPath.js');
                    copyFile('ProjectsFolderPath.js');
                    log('B12) Copying DefaultTeamHubId.js');
                    copyFile('DefaultTeamHubId.js');
                    log('B13) Copying DefaultTeamRepositoryIds.js');
                    copyFile('DefaultTeamRepositoryIds.js');
                    log('B14) Copying DefaultTemplateHubId.js');
                    copyFile('DefaultTemplateHubId.js');
                    log('B15) Copying DefaultTemplateRepositoryIds.js');
                    copyFile('DefaultTemplateRepositoryIds.js');
                    log('B16) Copying IgnoreMissingDefaults.js');
                    copyFile('IgnoreMissingDefaults.js');
                    log('B17) Copying TeamRepositories.js');
                    copyFile('TeamRepositories.js');
                    log('B19) Copying TeamHubs.js');
                    copyFile('TeamHubs.js');

                    function copyFile(fileName, targetFileName) {
                        fs.copyFileSync(
                            fileName,
                            targetLocation(targetFileName || fileName)
                        );
                    }

                    function targetLocation(fileName) {
                        return path.join(teamSynchFolderFullBootstrapLocation, fileName);
                    }

                    function writeRepositoriesAndHubInfoForAdminGruntFile() {
                        log('B1aii) Writing TeamRepositories info for the Admin grunt file');
                        fs.writeFileSync('./TeamRepositories.js', `module.exports = ${inspect(teamRepositories, false, null)};`);

                        log('B1aiii) Writing TeamHubs info for the Admin grunt file');
                        fs.writeFileSync('./TeamHubs.js', `module.exports = ${inspect(teamHubInfo(), false, null)};`);

                        function teamHubInfo() {
                            return teamRepositories
                                .map(tr => {return {number: tr.hubNumber, id: tr.hubId}})
                        }
                    }
                }

                function populateFirstMinimalBootstrapLocation() {
                    log('B2) Populating FirstMinimalBootstrap Folder');
                    log('B2a) Copying full_first_minimal_bootstrap script');
                    copyFile('full_first_minimal_bootstrap.sh');
                    log('B2b) Copying install_atom_using_homebrew script');
                    copyFile('install_atom_using_homebrew.sh');
                    log('B2c) Copying README');
                    copyFile('README.md');
                    log('B2d) Copying install_homebrew script');
                    copyFile('install_homebrew.sh');
                    log('B2e) Copying install_homebrew_then_install_nodenpxnpm_using_homebrew script');
                    copyFile('install_homebrew_then_install_nodenpxnpm_using_homebrew.sh');
                    log('B2f) Coppying install_nodenpxnpm_using_homebrew script');
                    copyFile('install_nodenpxnpm_using_homebrew.sh');

                    function copyFile(fileName) {
                        fs.copyFileSync(
                            theSourceLocation(fileName),
                            theTargetLocation(fileName)
                        );
                    }

                    function theSourceLocation(fileName) {
                        return path.join('../first_minimal_bootstrap/bash', fileName);
                    }

                    function theTargetLocation(fileName) {
                        return path.join(teamSynchFolderFirstMinimalBootstrapBashLocation, fileName);
                    }
                }

                function populateProjectTemplatesStagingFolderProjectTemplatesFolderAndTemplateHubsAndRepositoriesVariable() {
                    log('B4) Populating Project Templates Staging Folder');
                    const currentDirectory = process.cwd();
                    process.chdir(teamSynchFolderProjectTemplatesStagingLocation);
                    templateHubIdsClone = [...templateHubIds];
                    cloneRepos();
                    process.chdir(currentDirectory);

                    function cloneRepos() {
                        if (templateHubIdsClone.length === 0) {
                            populateProjectTemplatesFolderAndTemplateHubsAndRepositoriesVariable();
                            return;
                        }

                        cloneRepo(templateHubIdsClone[templateHubIdsClone.length - 1]);

                        function cloneRepo(hubId) {
                            log(`B4.. Cloning Project Template Repository '${hubId}'`);

                            exec(
                                `git clone ${githubCloneSource(hubId, 'TeamSynchProjectTemplates')}`,

                                (err, stdout, stderr) => {
                                    if (err) {
                                        log(
                                            `
                                            **********ERROR*********
                                            ${err}

                                            This process will now terminate so you can investigate and correct.
                                            When you are ready, clean up and start this process again ('npm start').
                                            `
                                        );

                                        return;
                                    }

                                    fs.renameSync(
                                        path.join(teamSynchFolderProjectTemplatesStagingLocation, 'TeamSynchProjectTemplates'),
                                        path.join(teamSynchFolderProjectTemplatesStagingLocation, hubId)
                                    );

                                    templateHubIdsClone.pop();
                                    cloneRepos();
                                }
                            );
                        }
                    }
                }

                function populateProjectTemplatesFolderAndTemplateHubsAndRepositoriesVariable() {
                    const projectTemplateFolderNamesFromStaging = fs.readdirSync(
                        teamSynchFolderProjectTemplatesStagingLocation,
                        {encoding: 'utf8', withFileTypes: true}
                    )
                    .filter(de => de.isDirectory())
                    .map(de => de.name);

                    projectTemplateFolderNamesFromStaging.map(fn => {
                        gatherTemplates();
                        copyFolderFromStagingToProjectTemplatesLocation();

                        function copyFolderFromStagingToProjectTemplatesLocation() {
                            fs.copySync(
                                path.join(teamSynchFolderProjectTemplatesStagingLocation, fn),
                                path.join(teamSynchFolderProjectTemplatesLocation, fn),
                                {filter: src => path.basename(src) !== '.git' && path.basename(src) !== '.gitignore'}
                            );
                        }

                        function gatherTemplates() {
                            const templateNames = fs.readdirSync(
                                path.join(teamSynchFolderProjectTemplatesStagingLocation, fn, 'ProjectTemplates'),
                                {encoding: 'utf8', withFileTypes: true}
                            )
                            .filter(de => de.isDirectory() && de.name !== '.git')
                            .map(de => de.name);

    
                            templateNames.map(tn => {
                                const hub = templateHubs.find(t => t.hubId === fn);

                                if (!hub) {
                                    hub =                                 {
                                        hubNumber: templateHubs.length + 1,
                                        hubId: fn,
                                        templates: []
                                    };
    
                                    templateHubs.push(hub);
                                }
                                
                                if (!hub.templates.find(t => t.id === tn)) {
                                    hub.templates.push({number: hub.templates.length + 1, name: tn});
                                }
                            });
                        }
                    });

                    synchTeamSynchFolder();
                }
            }

            function showExplanation() {
                log(
                  `
                  ******************************************************************
                  *                                                                 *
                  *              6. LOCAL TEAMSYNCH REPOSITORY                      *
                  *                                                                 *
                  ******************************************************************

                  This process is now creating a local TeamSynch repository, populating it with the appropriate
                  artifacts, and then synching it to the remote TeamSynch repository you indicated
                  (${teamSynchGithubAccountUrl}).

                  Nothing is required from you for this process.
                  `
                );
            }

            function synchTeamSynchFolder() {
                log('D) Synching TeamSynch Folder to remote');
                const currentDirectory = process.cwd();
                process.chdir(teamSynchFolderLocation);
                doGitInit();

                function doGitInit() {
                    log('D1) Doing \'git init\'');
                    exec('git init', (err, stdout, stderr) => {
                        if (err) {
                            logError(err);
                            return;
                        }

                        if (stderr) log(`did \'git init\' and got some response: ${stderr}`);
                        if (stdout) log(`did \'git init\'  and got some response: ${stdout}`);
                        log('*********DID \'GIT INIT\'; WILL NOW DO A \'GIT ADD\'');
                        doGitAdd();
                    })
                }

                function doGitAdd() {
                    log('D2) Doing \'git add\'');
                    exec('git add .', (err, stdout, stderr) => {
                        if (err) {
                            logError(err);
                            return;
                        }

                        if (stderr) log(`did \'git add\' and got some response: ${stderr}`);
                        if (stdout) log(`did \'git add\'  and got some response: ${stdout}`);
                        log('*********DID \'GIT ADD\'; WILL NOW DO A \'GIT COMMIT\'');
                        doGitCommit();
                    })
                }

                function doGitCommit() {
                    log('D3) Doing \'git commit\'');
                    exec(`git commit -m 'establishing TeamSynch repository'`, (err, stdout, stderr) => {
                        if (err) {
                            logError(err);
                            return;
                        }

                        if (stderr) log(`did \'git commit\' and got some response: ${stderr}`);
                        if (stdout) log(`did \'git commit\'  and got some response: ${stdout}`);
                        log('*********DID \'GIT COMMIT\'; WILL NOW DO A \'GIT REMOTE ADD\'');
                        doGitRemoteAdd();
                    })
                }

                function doGitRemoteAdd() {
                    log('D4) Doing \'git remote add\'');
                    exec(`git remote add origin ${githubCloneSource(teamSynchGithubAccountName, 'TeamSynch')}`, (err, stdout, stderr) => {
                        if (err) {
                            logError(err);
                            return;
                        }
                        if (stderr) log(`did \'git remote add\' and got some response: ${stderr}`);
                        if (stdout) log(`did \'git remote add\'  and got some response: ${stdout}`);
                        log('*********DID \'GIT REMOTE ADD\'; WILL NOW DO A \'GIT PUSH\' (depending on your github authentication setup, you might receive further prompts - for inatance perhaps your SSH key password - from github).');
                        doGitPush();
                    })
                }

                function doGitPush() {
                    log('D5) Doing \'git push\'');
                    exec('git push -u origin master', (err, stdout, stderr) => {
                        if (err) {
                            logError(err);
                            return;
                        }

                        if (stderr) log(`did \'git push\' and got some response: ${stderr}`);
                        if (stdout) log(`did \'git push\'  and got some response: ${stdout}`);
                        log('*********DID \'GIT PUSH\'; WE ARE DONE WITH THE LOCAL TEAM SYNCH REPO SETUP');
                        teamSynchRepoPopulatedAndSynched = true;
                        process.chdir(currentDirectory);
                        doNext();
                    })
                }



                function logError(err) {
                    log(
                        `
                        *************ERROR*************
                        Error occurred: ${err}
                        This process will now terminate so you can investigate and correct.
                        When you are ready, you can start this process agin ('npm start).
                        `
                    );
                }
            }
        }

        function finishSettingUpTeamSynch() {
            showExplanation();
            setUpWorkingDirectory();
            setUpTemplateHubsAndRepositories();

            function setUpTemplateHubsAndRepositories() {
                log('7B) Setting up TemplateHubsAndRepositories');
                log('7B1) Writing TemplateHubsAndRepositories');
                fs.writeFileSync(
                    './TemplateHubsAndRepositories.js', `module.exports = ${inspect(templateHubs, false, null)};`
                );

                log('7B2) Copying TemplateHubsAndRepositories.js');
                log('7B2a) Copying TemplateHubsAndRepositories.js to TeamSynch FullBootstrap location');
                fs.copyFileSync(
                    'TemplateHubsAndRepositories.js',
                    path.join(teamSynchFolderFullBootstrapLocation, 'TemplateHubsAndRepositories.js')
                );

                log('7B2b) Copying TemplateHubsAndRepositories.js to Working location');
                fs.copyFileSync(
                    'TemplateHubsAndRepositories.js',
                    path.join(workingFolderLocation, 'TemplateHubsAndRepositories.js')
                );
            }

            function setUpWorkingDirectory() {
                log('7A) Set up Working Directory');

                log(`7A1) Create Working Directory (${workingFolderLocation})`);
                fs.mkdirSync(workingFolderLocation);
                log('7A2) Copy AdminGruntfile to Working Directory as Gruntfile.js');
                copyFile('AdminGruntFile.js', 'Gruntfile.js');
                log('7A3) Copy AdminPackage.json to Working Directory as package.json');
                copyFile('AdminPackage.json', 'package.json');
                log('7A4) Setting up ts script');
                setUpTsScript();
                log('7A5) Copying \'require\'d\' files');
                log('7A5a) Copying  DefaultTeamHubId.js');
                copyFile('DefaultTeamHubId.js');
                log('7A5b) Copying DefaultTeamRepositoryIds.js');
                copyFile('DefaultTeamRepositoryIds.js');
                log('7A5c) Copying DefaultTemplateHubId.js');
                copyFile('DefaultTemplateHubId.js');
                log('7A5d) Copying DefaultTemplateRepositoryIds.js');
                copyFile('DefaultTemplateRepositoryIds.js');
                log('7A5e) Copying IgnoreMissingDefaults.js');
                copyFile('IgnoreMissingDefaults.js');
                log('7A5f) Copying ProjectsFolderPath.js');
                copyFile('ProjectsFolderPath.js');
                log('7A5g) Copying TeamHubs.js');
                copyFile('TeamHubs.js');
                log('7A5h) Copying TeamRepositories.js');
                copyFile('TeamRepositories.js');
                log('7A6) Installing npm packages in Working Folder');
                installNpmPackages();
                laptopBootstrapped = true;
                doNext();

                function installNpmPackages() {
                    const currentDirectory = process.cwd();
                    process.chdir(workingFolderLocation);

                    exec('npm install', (err) => {
                        if (err) {
                            log(
                                `
                                ***********ERROR (TERMINATING)***********
                                Encountered an error while attempting to install npm packages in TeamSynch Folder.
                                This process will now terminate so you can investigate and correct.  When ready, restart
                                this process ('npm start').

                                Error:
                                ${err}
                                `
                            );

                            return;
                        }
                    });

                    process.chdir(currentDirectory);
                }


                function setUpTsScript() {
                    const pathToUserLocal = '/usr/local/';
                    if (!fs.existsSync(pathToUserLocal)) fs.mkdirSync(pathToUserLocal);
                    const pathToUserLocalBin = path.join(pathToUserLocal, 'bin');
                    if (!fs.existsSync(pathToUserLocalBin)) fs.mkdirSync(pathToUserLocalBin);
                    const pathToTsInUserLocalBin = path.join(pathToUserLocalBin, 'ts');

                    moveTsScriptToBin();
                    makeTsScriptExecutable();

                    function makeTsScriptExecutable() {
                        fs.chmodSync(
                            pathToTsInUserLocalBin, 0o555
                        );
                    }

                    function moveTsScriptToBin() {
                        fs.copySync(
                            path.join(__dirname, 'ts'),
                            pathToTsInUserLocalBin
                        );
                    }
                }

                function copyFile(sourceFileName, targetFileName) {
                    fs.copyFileSync(
                        theSourceLocation(sourceFileName),
                        theTargetLocation(targetFileName || sourceFileName)
                    );
                }

                function theSourceLocation(fileName) {
                    return path.join(__dirname, fileName);
                }

                function theTargetLocation(fileName) {
                    return path.join(workingFolderLocation, fileName);
                }
        }

            function showExplanation() {
                log(
                  `
                  ******************************************************************
                  *                                                                 *
                  *             7. FINISH BOOTSTRAPPING THIS LAPTOP                 *
                  *                                                                 *
                  ******************************************************************

                  When someone is performing the 'normal TeamSynch Setup process', they will not be
                  bootstrapping TeamSynch for the Team, as you have just done.  They will be bootstrapping
                  their Laptop with the TeamSynch system.  As part of bootstrapping the Team, this process has
                  also partially bootstrapped this laptop.

                  This process will now finish bootstrapping this laptop.

                  At the end of this step, your laptop will 'look like' it would have looked if you had
                  cloned the TeamSynch Repository (that you created as part of this process), and kicked off that process.

                  This step does not require any interaction from you.
                  `
                );
            }
        }
    });

    grunt.registerTask('evaluateEnvironment', environmentIsOkay);

    function environmentIsOkay() {
        showExplanation();

        const tsExists = fs.existsSync(
            path.join(__dirname, 'ts')
        );

        const adminGruntFileExists = fs.existsSync(
            path.join(__dirname, 'AdminGruntfile.js')
        );

        const adminPackageJsonExists = fs.existsSync(
            path.join(__dirname, 'AdminPackage.json')
        );

        const laptopBootstrapGruntFileExists = fs.existsSync(
            path.join(__dirname, 'LaptopBootstrapGruntFile.js')
        );

        const laptopBootstrapReadMeExists = fs.existsSync(
            path.join(__dirname, 'LaptopBootstrapReadme.md')
        );

        log(
            `
            **********Environment Evaluation Completed*********
            `
        );

        if (allArtifactsExist()) {
            log(
                `
                All artifacts exist.
                `
            );

            return true;
        }

        log(
            `
            This environment is missing at least one required artifact (see below).  This process will now terminate so
            you can investigate and correct; then you can start this process again (simply navigate back here and type
            'npm start' or 'grunt' or - if all you wish to do is evaluate the environment again - 'npm run environmentIsOkay'
            or 'grunt:environmentIsOkay').


            Missing artifacts:
            ${listOfMissingArtifacts()}
            `
        );

        function allArtifactsExist() {
            return tsExists && adminGruntFileExists && adminPackageJsonExists &&
                laptopBootstrapGruntFileExists && laptopBootstrapReadMeExists;
        }

        function listOfMissingArtifacts() {
            return `
                ${tsExists ? '' : 'ts'}
                ${adminGruntFileExists ? '' : 'AdminGruntFile.js'}
                ${adminPackageJsonExists ? '' : 'AdminPackage.json'}
                ${laptopBootstrapGruntFileExists ? '' : 'LaptopBootstrapGruntFile.js'}
                ${laptopBootstrapReadMeExists ? '' : 'LaptopBootstrapReadMe.md'}
            `;
        }

        function showExplanation() {
            log(
                `
                ******************************************************************
                *                                                                 *
                *                 1. EVALUATING ENVIRONMENT                       *
                *                                                                 *
                ******************************************************************

                The first step is to examine your TeamSynch environment to ensure all necessary
                artifacts are present before proceeding.

                Usually all necessary artifacts are present; however, if not, then this process will inform
                you of the particular missing artifacts, and then terminate so you can correct the situation.
                After correcting the situation, you can restart this process.
                `
            );
        }
    }

    function githubUrl(githubAccountName) {
        return `github.com/${githubAccountName}`;
    }

    function githubCloneSource(githubAccountName, githubRepository) {
        return `git@github.com:${githubAccountName}/${githubRepository}.git`
    }

    function answerIsInTheAffirmative(answer) {
        return answer === 'Y' || answer === 'y' ||
            answer === 'YES' || answer === 'Yes' ||
            answer === 'yes';
    }

    function getReadline() {
        return readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
    }
    function log(toLog) {
        console.log(toLog);
    }
};
