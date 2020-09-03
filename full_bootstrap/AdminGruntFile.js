module.exports = function(grunt) {
    const projectsFolderPath = 'PROJECTS_FOLDER_PATH';

    const teamHubs = TEAM_HUBS;
    const defaultTeamHubId = null;
    const defaultTemplateHubId = null;

    const teamRepositories = TEAM_REPOSITORIES;
    
    const templateHubsAndRepositories = TEMPLATE_HUBS_AND_REPOSITORIES;

    const defaultTeamRepositoryIds = null;
    
    const defaultTemplateRepositoryIds = null;

    grunt.registerTask('default', showHelp);
    grunt.registerTask('help', showHelp);

    grunt.registerTask('templatelist', allOrDefault => {
        allOrDefault = allOrDefault || 'a';

        if (allOrDefault === 'a') {
            //TODO: list all
            return;
        }

        log(
            `
            **********DEFAULT TEMPLATE INFO*******
            `
        )
    });


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

    function haveDefaultTeamHub() {
        return teamHubs.length === 1 || defaultTeamHubId !== null;
    }

    function getDefaultTeamHubId() {
        if (teamHubs.length === 1) return teamHubs[0].id;
        return defaultTeamHubId;
    }

    function defaultTeamHubInfo() {
        if (!haveDefaultTeamHub()) return null;
        return teamHubInfo(getDefaultTemplateHubId());
    }

    function teamHubInfo(hubId) {
        const hubInfo = teamHubs.find(th => th.id === getDefaultTeamHubId());
        const repositoriesInfo = teamRepositoriesInfo(hubId);

        return {

        };
    }

    function teamRepositoriesInfo(hubId) {

    }

    function haveDefaultTemplateHub() {
        return templateHubsAndRepositories.length === 1 || defaultTemplateHubId !== null;
    }

    function getDefaultTemplateHubId() {
        if (templateHubsAndRepositories.length === 1) return templateHubsAndRepositories[0].hubId;
        return defaultTemplateHubId;
    }

    function defaultTemplateHubInfo() {
        if (!haveDefaultTemplateHub()) return null;
        return templateHubsAndRepositories.find(th => th.hubId === getDefaultTemplateHubId());
    }

    function log(toLog) {
        console.log(toLog);
    }
};
