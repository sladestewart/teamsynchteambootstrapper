module.exports = function(grunt) {
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    const readline = require('readline');

    let teamSynchGithubAccountName = '';
    let teamSynchGithubAccountUrl = '';
    let teamSynchUrl = '';

    let parentDirectoryPathValue = '';
    let adminPathValue = '';
    let projectsPathValue = '';

    const teamSynchAdditionalGithubAccountNames = [];
    const teamRepositories = [];
    const templateRepositories = [];

    
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
            }

            if (!laptopBootstrapped) {
                //???
            }

            log('DONEXT DONEXT DONEXT');
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
                if (!createFolders()) return;

                setUpAdminGruntFile();
                setUpTs();

                folderPathsGotten = true;
                doNext();
                

                function createFolders() {
                    try {
                        fs.mkdirSync(getAdminFolderPath());
                        fs.mkdirSync(getProjectsFolderPath());

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
                function setUpAdminGruntFile() {
                    const adminGruntFileText = fs.readFileSync(
                        getAdminGruntFilePath(), 'utf8'
                    );

                    const newAdminGruntFileText = adminGruntFileText
                        .replace('ADMIN_FOLDER_PATH', getAdminFolderPath())
                        .replace('PROJECTS_FOLDER_PATH', getProjectsFolderPath());


                    fs.writeFileSync(getAdminGruntFilePath(), newAdminGruntFileText);

                    function getAdminGruntFilePath() {
                        return path.join(__dirname, 'AdminGruntFile.js');
                    }
                }

                function setUpTs() {
                    const tsFilePath = getTsFilePath();

                    const tsFileText = fs.readFileSync(getTsFilePath(), 'utf8');
                    const newTsFileText = tsFileText.replace('ADMIN_FOLDER_PATH', getAdminFolderPath());

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
                        teamSynchUrl = `${teamSynchGithubAccountUrl}/TeamSynch`;
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
                    'Do you have any (more) hubs to specify?',

                    answer => {
                        if (answerIsInTheAffirmative(answer)) {
                            rl.close();

                            const rl2 = getReadline();

                            rl2.question(
                                'What is the account name of the next hub you wish to specify?',

                                answer => {
                                    if (!teamSynchAdditionalGithubAccountNames.includes(answer)) {
                                        teamSynchAdditionalGithubAccountNames.push(answer);
                                    }
                                    
                                    rl2.close();
                                    rl.close();
                                    getNextHubAccountName();
                                }
                            )

                            return;
                        }

                        rl.close();
                        additionalHubsGathered = true;
                        doNext();
                    }
                );
            }
        }

        function gatherAnyTeamRepositories() {
            showExplanation();

            gatherRepositoriesForAnAccount(
                teamSynchGithubAccountName, 
                
                () => {
                    gatherRepositoriesForAdditionalAccounts();
                }
            );


            function gatherRepositoriesForAdditionalAccounts() {
                if (teamSynchAdditionalGithubAccountNames.length === 0) {
                    teamRepositoriesGathered = true;
                    console.log(teamRepositories);
                    doNext();
                    return;
                }

                gatherRepositoriesForAnAccount(
                    teamSynchAdditionalGithubAccountNames[teamSynchAdditionalGithubAccountNames.length - 1], 
                    
                    () => {
                        teamSynchAdditionalGithubAccountNames.pop();
                        gatherRepositoriesForAdditionalAccounts();
                    }
                )
            }

            function gatherRepositoriesForAnAccount(accountId, onComplete) {
                const accountRepositories = {
                    accountId, 
                    repositories: []
                };

                teamRepositories.push(accountRepositories);
                gatherOneRepository();

                function gatherOneRepository() {
                    const rl = getReadline();

                    rl.question(
                        `Enter the name of a repository for Account '${accountId}', or 'IAMDONE' (all caps) if you have no more repositories to enter for this account: `,

                        answer => {
                            if (answer === 'IAMDONE') {
                                rl.close();
                                onComplete();
                                return;
                            }

                            accountRepositories.repositories.push(answer);
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
                    'Enter the acount name of the first or next Template Repository Hub.  If you have no more to enter, type \'IAMDONE\' (all caps): ',
    
                    answer => {
                        if (answer === 'IAMDONE') {
                            rl.close();
                            console.log(templateRepositories);
                            templateRepositoryInfoGathered = true;
                            doNext();
                            return;
                        }
    
                        rl.close();
                        templateRepositories.push(answer);
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
            let teamSynchFolderLocation = '';
            let teamSynchFolderFullBootstrapLocation = '';
            let teamSynchFolderFirstMinimalBootstrapLocation = '';
            let teamSynchFolderFirstMinimalBootstrapBashLocation = '';

            showExplanation();
            createTeamSynchFolder();
            populateTeamSynchFolder();

            function createTeamSynchFolder() {
                teamSynchFolderLocation = path.join(adminPathValue, 'TeamSynch');
                fs.mkdirSync(teamSynchFolderLocation);
                teamSynchFolderFullBootstrapLocation = path.join(teamSynchFolderLocation, 'full_bootstrap');
                fs.mkdirSync(teamSynchFolderFullBootstrapLocation);
                teamSynchFolderFirstMinimalBootstrapLocation = path.join(teamSynchFolderLocation, 'first_minimal_bootstrap');
                fs.mkdirSync(teamSynchFolderFirstMinimalBootstrapLocation);
                teamSynchFolderFirstMinimalBootstrapBashLocation = path.join(teamSynchFolderFirstMinimalBootstrapLocation, 'bash');
                fs.mkdirSync(teamSynchFolderFirstMinimalBootstrapBashLocation);


            }

            function populateTeamSynchFolder() {
                fs.copyFileSync(
                    '../README.md', path.join(teamSynchFolderLocation, 'README.md')
                );


                fs.copy

                fs.copyFileSync(
                    '../LaptopBootstrapGruntfile.js', 
                    path.join(teamSynchFolderLocation, 'Gruntfile.js')
                );

                populateFirstMinimalBootstrapLocation();

                function populateFirstMinimalBootstrapLocation() {
                    copyFile('full_first_minimal_bootstrap.sh');
                    copyFile('install_atom_using_homebrew.sh');
                    copyFile('README.md');
                    copyFile('install_homebrew.sh');
                    copyFile('install_homebrew_then_install_nodenpxnpm_using_homebrew.sh');
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