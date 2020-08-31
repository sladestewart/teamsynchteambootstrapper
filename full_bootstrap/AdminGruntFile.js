module.exports = function(grunt) {
    const projectsFolderPath = 'PROJECTS_FOLDER_PATH';

    const teamRepositories = TEAM_REPOSITORIES;

    const defaultTeamHub = 'NO_DEFAULT_TEAM_HUB';

    grunt.registerTask('default', showHelp);
    grunt.registerTask('help', showHelp);


    function showHelp() {
        log(
            `
            ***************WELCOME TO TEAMSYNCH********
            The TeamSynch system helps a Team standardize on projects it creates and adds to repositories; it 
            also gives convenience functions both for adding these projects to repositories, and for working with 
            these projects in the Team Repositories.

            TeamSynch is implemented in grunt, and all commands, along with all permutations of parameters, can 
            be accessed via grunt.  Also, the most relevant grunt commands are recreated as npm scripts, and can 
            be accessed via those.  And finally, many of the commands are available via the 'ts' script file, which 
            is executable and placed where it's available from any shell.

            So many commands have more than one way of launching them; when that is the case, this Help Screen will 
            list all three ways.

            GETTING HELP:
            TS CLI: 'ts help' or 'ts' (it's the default command)
            NPM SCRIPT: 'npm run help' or 'npm start' (it's the default i.e. start command)
            GRUNT: 'grunt help' or 'grunt' (it's the default command)
            `
        )
    }

    function log(toLog) {
        console.log(toLog);
    }
};
