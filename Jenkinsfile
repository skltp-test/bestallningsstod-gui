pipeline {
  agent {
    // this image provides everything needed to run Cypress
    docker {
      image 'cypress/base:ubuntu16-12.13.1'
    }
  }

  stages {
    // first stage installs node dependencies and Cypress binary
    stage('build') {
      steps {
        // there a few default environment variables on Jenkins
        // on local Jenkins machine (assuming port 8080) see
        // http://localhost:8080/pipeline-syntax/globals#env
        echo "Running build ${env.BUILD_ID} on ${env.JENKINS_URL}"
        sh 'npm install --cache /tmp/empty-cache'
		//sh 'npm install'
		sh 'npm ci'
        sh 'npm run cy:verify'
      }
    }

    stage('start local proxy server') {
      steps {
        // start local proxy server in the background
        // we will shut it down in "post" command block
        sh 'cd proxy && nohub node app.js'
      }
    }
	stage('cypress parallel tests') {
      environment {
        // we will be recording test results and video on Cypress dashboard
        // to record we need to set an environment variable
        // we can load the record key variable from credentials store
        // see https://jenkins.io/doc/book/using/using-credentials/
        CYPRESS_RECORD_KEY = credentials('cypress-example-kitchensink-record-key')
        // because parallel steps share the workspace they might race to delete
        // screenshots and videos folders. Tell Cypress not to delete these folders
        CYPRESS_trashAssetsBeforeRuns = 'false'
      }

      // https://jenkins.io/doc/book/pipeline/syntax/#parallel
      parallel {
        // start several test jobs in parallel, and they all
        // will use Cypress Dashboard to load balance any found spec files
        stage('tester A') {
          steps {
            echo "Running build ${env.BUILD_ID}"
            sh "npm run cypress:run"
          }
        }

        // second tester runs the same command
        //stage('tester B') {
        //  steps {
        //    echo "Running build ${env.BUILD_ID}"
        //    sh "npm run e2e:record:parallel"
        //  }
        //}
      }

    }
  }

  post {
    // shutdown the server running in the background
    always {
      echo 'Stopping local proxy server'
      sh "kill \$(ps aux | grep 'nohub' | awk '{print \$2}')"
    }
  }
}