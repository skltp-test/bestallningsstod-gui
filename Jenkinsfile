pipeline {

  options {
    //timestamps () // Kräver plugin "Timestamper"
    timeout(time: 60, unit: 'MINUTES')
  }

  environment {

    // Går till 
    EPOSTMOTTAGARE = ""

    HOME = "${env.WORKSPACE}" // Måste sättas för "npm ci"

    CYPRESS_DIR_REL="cypress"
    RESULTAT_DIR_REL="${CYPRESS_DIR_REL}/results"
    RESULTAT_DIR_ABS="${env.WORKSPACE}/${RESULTAT_DIR_REL}"

    // TODO: cypress-failed-log skriver i dagsläget till <startdir>/cypress/logs oavsett hur
    // man konfigurerar Cypress. Endera låter vi det vara så (katalogen skapas endast när testfall
    // går fel), eller så tas cypress-failed-log-pluginet bort. Det tredje alternativet är att se
    // om en nyare version inför konfiguration av sökväg.
    CYPRESSFAILEDLOGS_REL="${CYPRESS_DIR_REL}/cypress/logs/**/*.json"

    TESTRAPPORTFILPATTERN = "*.xml"

	//CA 
	//TODO
	//CERT=credentials('')
	//CERT_PASS=credentials('SITHS_CERT_PASS')
	
	
    // Nycklarna till dashboard hanteras här: https://dashboard.cypress.io/#/projects/1diiry/settings
    //CYPRESS_RECORD_KEY=credentials('')
  }

  agent {
    docker {
      // Denna image innehåller allt som krävs för att köra Cypress i Linux med videoinspelning etc.
      image 'cypress/base:10'
      label 'docker-slave'
    }
  }

  stages {
    stage('Verifiera förkrav') {
      steps {
        echo "Running build ${env.BUILD_ID} on ${env.JENKINS_URL}"
        dir("${CYPRESS_DIR_REL}") {
          sh 'npm --version'
          sh 'node --version'
		  sh 'ls -lat'
        }
      }
    }
	stage('Installera proxyserver dependencies') {
	  steps {
	    echo "Installerar proxyserver dependencies"
		dir("proxy") {
			sh 'npm install'
		}
	  }
	}
	stage('Starta proxyserver') {
        steps {
	    echo "Installerar proxyserver dependencies"
		dir("proxy") {
			withCredentials([certificate(credentialsId: 'TSTNMT2321000156-B4V', keystoreVariable: 'CERTKEY', passwordVariable: 'PASSWORDVALIDCERT')]) {
			sh """
				#! /bin/bash
				cp ${CERTKEY} ./pki/cert.p12
				node app.js &
			"""
			}
		}
	  }
    }
    stage('Rensa gamla filer') {
      steps {
        // Testrapporter
        sh "rm -fr '${RESULTAT_DIR_ABS}/${TESTRAPPORTFILPATTERN}'"

        // Loggfiler från tidigare körningar
        sh "rm -fr '${env.WORKSPACE}/.npm/_logs/*.log'"

      }
    }

    stage('Installera & exekvera Cypress') {
      steps {
        dir("${CYPRESS_DIR_REL}") {
          sh 'npm ci'
          sh 'npm run cy:verify'

          // Skriv ut en lista med alla installerade Node-moduler
          sh 'npm list'
          // ToDo: SPECFILES_TO_RUN sätts som parameter i Jenkinsjobbet.
          // När troubleshootingen är klar gällande vart problemet med timeouts ligger
          // så ska nedanstående rad återställas:
          // sh "npm run test:e2e:electron"
          //sh "npm run test:e2e:electron -- --spec '${SPECFILES_TO_RUN}'"
		  
		  //Kör alla specs
		  sh "npm run cy:run:junit"
		}
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: 'cypress/videos/**/*.*', fingerprint: false
      // TODO: Använd variabler för att hämta JUnit-filer istället för hårdkodade pather
	  junit 'test-results.xml'
	  //echo 'Stopping local proxy server'
      //sh "kill \$(ps aux | grep 'node' | awk '{print \$2}')"
	  }
  failure {
      archiveArtifacts artifacts: 'cypress/screenshots/**/*.*', fingerprint: false
      archiveArtifacts artifacts: '.npm/_logs/*.log', fingerprint: false
      archiveArtifacts artifacts: "${CYPRESSFAILEDLOGS_REL}", fingerprint: false
	  }
  }
}