const { file } = require('grunt');

module.exports = function(grunt) {
    const readline = require('readline');
    const fs = require('fs');

    let projectsFolderPath = require('./ProjectsFolderPath.js');
    let teamHubs = require('./TeamHubs.js');
    let defaultTeamHubId = require('./DefaultTeamHubId.js');
    let defaultTemplateHubId = require('./DefaultTemplateHubId.js');
    let teamRepositories = requir('./TeamRepositories.js');
    let templateHubsAndRepositories = require('./TemplateHubsAndRepositories.js');
    let defaultTeamRepositoryIds = require('./DefaultTeamRepositoryIds.js');
    let defaultTemplateRepositoryIds = require('./DefaultTemplateRepositoryIds.js');
    let ignoreMissingDefaults = require('./IgnoreMissingDefaults.js');

    grunt.registerTask('default', showHelp);
    grunt.registerTask('help', showHelp);

    grunt.registerTask('templatelist', function(allOrDefault) {
        const done = this.async();
        allOrDefault = allOrDefault || 'a';

        const rl = getReadline();

        gatherAnyDefaults(
            () => {
                if (allOrDefault === 'a') {
                    //TODO: templates, not teams
                    showTeamHubsInfo();
                    done();
                    return;
                }
        
                log(
                    `
                    **********DEFAULT TEMPLATE INFO*******
                    `
                )
            }
        );
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

    function showTeamHubsInfo(summary, skipBanner) {
        teamHubs.forEach(th => {
            showTeamHubInfo(th.id, summary, skipBanner);            
        });
    }

    function showTeamHubInfo(hubId, summary, skipBanner) {
        const hubInfo = teamHubInfo(hubId);
        
        if (!hubInfo) {
            log(teamHubInfoMessageText(`No Team Hub with ID '${hubId} was found.`));
            return;
        }

        log(teamHubInfoMessageText(teamHubInfoText(), skipBanner));
        
        function teamHubInfoText() {
            const result = `
                Number (for convenience, can be used instead of id to select this hub): ${hubInfo.hub.number}  
                Id: ${hubInfo.hub.id} 
                IsDefault: ${hubInfo.hub.IsDefault}
                ${
                    summary 
                        ? ''
                        : teamHubRepositoriesInfoText()
                }
            `;

            return result;
        }

        function teamHubRepositoriesInfoText() {
            let result =  
            `
            ----REPOSITORIES (${hubInfo.hub.number}: ${hubInfo.hub.id})---
            `;

            teamRepositoriesInfo(hubId).forEach(tr => {
                result += 
                `
                Number (for convenience, can be used instead of id to select this repository): ${tr.number}
                Id: ${tr.id}
                IsDefault: ${tr.isDefault}
                `
            });

            return result;
        }

        function teamHubInfoMessageText(innerText, skipBanner) {
            return `
            ${skipBanner ? '' : '************TEAM HUB INFO*************'}
            ${innerText}
            `;
        }
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
        const hubInfo = teamHubs.find(th => th.id === hubId);
        if (!hubInfo) return null;
        hubInfo.IsDefault = haveDefaultTeamHub() && getDefaultTeamHubId() === hubInfo.id;

        return {
            hub: hubInfo,
            repositories: teamRepositoriesInfo(hubId)
        };
    }

    function teamRepositoriesInfo(hubId) {
        const trObject = teamRepositories.find(tr => tr.hubId === hubId);
        if (!trObject) return [];
        const hubRepositories = trObject.repositories;
        if (!hubRepositories) return [];
        const result = [];

        hubRepositories.forEach(hr => {
            result.push(teamRepositoryInfo(hubId, hr.id));
        });

        return result;
    }

    function defaultTeamRepositoryInfo(hubId) {
        return teamRepositoryInfo(hubId, defaultTeamRepositoryId(hubId));
    }

    function defaultTeamRepositoryId(hubId) {
        const repositoriesByHub = teamRepositories.find(tr => tr.hubId === hubId);
        
        if (repositoriesByHub.length === 0) return null;
        if (repositoriesByHub.repositories.length === 1) return repositoriesByHub.repositories[0].id;
        const defaultRepositoryInfo = defaultTeamRepositoryIds.find(dtr => dtr.hubId === hubId);
        if (!defaultRepositoryInfo) return null;
        return defaultRepositoryInfo.repositoryId;
    }

    function teamRepositoryInfo(hubId, repositoryId) {
        const defaultRepositoryId = defaultTeamRepositoryId(hubId);
        const repositories = teamRepositories.find(tr => tr.hubId === hubId).repositories;
        const repositoryInfo = repositories.find(r => r.id === repositoryId);
        if (!repositoryInfo) return null;

        return {...repositoryInfo, isDefault: defaultRepositoryId && defaultRepositoryId === repositoryId};
    }

    function gatherAnyDefaults(onComplete) {
        if (ignoreMissingDefaults || !haveMissingDefaults()) {
            onComplete();
            return;
        };

        const rl = getReadline();

        log(
            `
            There are some missing default values (see below).  Default values aren't required, but make things more convenient 
            for you.  Do you want to define one or more default value?  (If you choose to define them, you will be given an option 
            for each; you can, for each, either define it or skip it.)

            You can either choose never to be asked this question again (type 'NEVER' - all caps), to perform this step (answer in the affirmative i.e. type 
            'Y', 'y', 'YES', 'Yes', or 'yes'), or to skip this step for now (any answer other than in the affirmative or 'NEVER').

            If you choose to skip, you will be asked this question again.  If you choose never to be asked this question again, 
            you can at any time explicitly perform this step ('npm run gather_defaults').

            DEFAULTS:
            ${defaultsText()}
            `
        )

        rl.question(
            `Do you wish to perform this step (answer in the affirmative), skip this step and never be asked again ('NEVER'), or skip this step for now (any other answer)? `,

            answer => {
                if (answer === 'NEVER') {
                    setIgnoreMissingDefaultsToTrue();
                    rl.close();
                    onComplete();
                    return;                    
                }

                if (valueIsInTheAffirmative(answer)) {
                    rl.close();
                    log('*************************GATHERING DEFAULT VALUES*****************');
                    gatherTheDefaults(onComplete);
                    return;
                }

                rl.close();
                onComplete();
            }
        );

        function setIgnoreMissingDefaultsToTrue() {
            ignoreMissingDefaults = true;
            
            persistValue(
                'IgnoreMissingDefaults', true
            );
        }

        function haveMissingDefaults() {
            return !defaultTeamHubId || 
                !defaultTemplateHubId || 
                !defaultTeamRepositoryIds || 
                !defaultTemplateRepositoryIds;
        }

        function defaultsText() {        
            return `
                Default Team Hub ID ${defaultTeamHubId ? '' : '(UNDEFINED)'}${defaultTeamHubId ? `: ${defaultTeamHubId}`:''}
                Default Team Repository IDs ${defaultTeamRepositoryIds ? '' : '(UNDEFINED)'} ${defaultTeamRepositoryIds ? ': ...' : ''}

                Default Template Hub ID ${defaultTemplateHubId ? '' : '(UNDEFINED)'}${defaultTemplateHubId ? `: ${defaultTemplateHubId}` : ''}
                Default Team Repository IDs ${defaultTemplateRepositoryIds ? '' : '(UNDEFINED)'}${defaultTemplateRepositoryIds ? '...' : ''}
            `;
        }
    }

    function gatherTheDefaults(onComplete) {
        gatherTeamDefaults(
            () => {
                //GATHER TEMPLATE DEFAULTS
                onComplete();
            }
        );
    }

    function gatherTeamDefaults(onComplete) {
        gatherDefaultTeamHub(
            dthResult => {
                if (dthResult.WasGathered) {
                    defaultTeamHubId = dthResult.HubId;
                    persistValue('DefaultTeamHubId', dthResult.HubId);
                }

                if (dthResult.Abort) {onComplete(); return;}

                gatherDefaultRepositories(
                    dhrResult => {
                        if (dhrResult.WasGathered) recordDefaults(dhrResult.RepositoryDefaults);
                        onComplete();
                    }
                )
            }
        )

        function recordDefaults(repositoryDefaults) {
            repositoryDefaults.forEach(rd => {
                const hubRepository = teamRepositories.find(tr => tr.hubId === rd.HubId);

                if (!hubRepository) return;

                hubRepository.repositories.forEach(hr => {hr.IsDefault = hr.id === rd.DefaultRepositoryId;})
            });
        }

        function gatherDefaultTeamHub(onComplete) {
            const rl = getReadline();
            log('***********GATHERING DEFAULT TEAM HUB*********');
            showTeamHubsInfo(true, true);

            rl.question(
                `
                To designate a Default Team Hub, enter either a Number or ID from the list above.  To abort the overall process of gathering defaults, type 'ABORT' (all caps). Any other answer will result iin skipping this step but continuing the overall process.
                `,

                answer => {
                    onComplete({
                        WasGathered: valueIsHubId(answer),
                        Abort: answer === 'ABORT',
                        HubId: hubId(answer)
                    });
                }
            )

            function valueIsHubId(valueToAssess) {
                return !!teamHubs.find(
                    th => th.number === parseInt(valueToAssess, 10) || th.id === valueToAssess
                );
            }

            function hubId(valueToAssess) {
                return teamHubs.find(th => th.number === parseInt(valueToAssess, 10) || th.id === valueToAssess).id;
            }
        }

        function gatherDefaultRepositories(onComplete) {
            const teamRepositoriesClone = [...teamRepositories];
            const teamRepositoryDefaults = [];

            gatherThem();

            function gatherThem() {
                if (teamRepositoriesClone.length === 0) {
                    onComplete({WasGathered: true, RepositoryDefaults: teamRepositoryDefaults});
                    return;
                }

                const rl = getReadline();

                log(
                    `
                    This process will now gather the default Repository for each Team Hub.  For each, the process 
                    will identify the Team Hub and list its Repositories.  You can choose a default from the list 
                    (by number or ID).  If you enter 'EXIT' (all caps), the process will exit, saving any answers 
                    you have provided up to that point.  If you enter 'ABORT' (all caps), the process will abort 
                    and exit, not saving any answers.  If you enter any other value (than a valid number/ID, 'EXIT', 
                    or 'ABORT'), the process will skip the Team Hub you're on, and move to the next.  `
                );

                gatherADefaultRepository();

                function gatherADefaultRepository() {
                    const rl = getReadline();
                    const currentTeamRepositories = teamRepositoriesClone.pop();

                    showTeamHubInfo(
                        currentTeamRepository.hubId, false, true
                    );

                    rl.question(
                        `By number or ID, designate the Repository from the list above, which will be the default for Team Hub '${currentTeamHub.id}' ('<ENTER>' to skip this Hub, 'ABORT' to abort and lose entriesm 'EXIT' to exit but save any entries).  `,

                        answer => {
                            if (answer === 'ABORT') {
                                rl.close();
                                onComplete({WasGathered: false, RepositoryDefaults: null});
                                return;
                            }

                            if (answer === 'EXIT') {
                                rl.close();
                                onComplete({WasGathered: true, RepositoryDefaults: teamRepositoryDefaults});
                                return;
                            }

                            if (!valueIsTeamRepositoryId(currentTeamRepository.hubId, answer)) {
                                rl.close();
                                gatherADefaultRepository();
                                return;
                            }
                            

                            rl.close();
                            
                            if (valueIsTeamRepositoryId(currentTeamRepository.hubId, answer)) {
                                teamRepositoryDefaults.push(
                                    {HubId: currentTeamRepository.hubId, DefaultRepositoryId: answer}
                                );
                            }

                            gatherADefaultRepository();
                        }
                    )
                }

                function valueIsTeamRepositoryId(hubId, repositoryId) {

                }
            }



        }
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

    function valueIsInTheAffirmative(value) {
        return value === 'Y' || 
            value === 'y' || 
            value === 'YES' || 
            value === 'Yes' || 
            value === 'yes';
    }

    function getReadline() {
        return readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
    }

    function persistValue(fileName, newValue) {
        const newValueText = typeof newValue === 'string' ? "'" + newValue + "'" : newValue;

        fs.writeFileSync(
            `./${fileName}.js`, `module.exports = ${newValueText};`
        );
    }
};
