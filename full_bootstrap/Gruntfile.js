module.exports = async function(grunt) {

    grunt.registerTask('default', gruntDefault);

    function gruntDefault() {
        showExplanation();

  
        function showExplanation() {
            console.log(
              `
              ******************************************************************
              *                                                                 *
              *              TEAM BOOTSTRAPPING (OVERVIEW)                      *
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

    function evaluateEnvironment() {
        showExplanation();

        function showExplanation() {
            console.log(
              `
              ******************************************************************
              *                                                                 *
              *                  EVALUATING ENVIRONMENT                         *
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
};