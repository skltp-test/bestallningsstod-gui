pipeline {

  options {
    //timestamps () // Kräver plugin "Timestamper"
    timeout(time: 60, unit: 'MINUTES')
  }

  environment {

    // Går till 
    EPOSTMOTTAGARE = ""

    HOME = "${env.WORKSPACE}" // Måste sättas för "npm ci"

    CYPRESS_DIR_REL="test/cypress"
    RESULTAT_DIR_REL="${CYPRESS_DIR_REL}/results"
    RESULTAT_DIR_ABS="${env.WORKSPACE}/${RESULTAT_DIR_REL}"

    RESURSRAPPORTSKRIPTNAMN = "write_resource_stats.sh"
    RESURSSKRIPT_ABS="${env.WORKSPACE}/${CYPRESS_DIR_REL}/${RESURSRAPPORTSKRIPTNAMN}"

    RESURSRAPPORTERINGSFIL_REL="${RESULTAT_DIR_REL}/resursrapporteringsfil.txt"
    RESURSRAPPORTERINGSFIL_ABS="${env.WORKSPACE}/${RESURSRAPPORTERINGSFIL_REL}"
    RESURSINTERVALL=30

    // TODO: cypress-failed-log skriver i dagsläget till <startdir>/cypress/logs oavsett hur
    // man konfigurerar Cypress. Endera låter vi det vara så (katalogen skapas endast när testfall
    // går fel), eller så tas cypress-failed-log-pluginet bort. Det tredje alternativet är att se
    // om en nyare version inför konfiguration av sökväg.
    CYPRESSFAILEDLOGS_REL="${CYPRESS_DIR_REL}/cypress/logs/**/*.json"

    TESTRAPPORTFILPATTERN = "*.xml"

	//CA 
	//TODO
	CERT=credentials('')
	CERT_PASS=credentials('SITHS_CERT_PASS')
	
	
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
        }
      }
    }

    stage('Rensa gamla filer') {
      steps {
        // Testrapporter
        sh "rm -fr '${RESULTAT_DIR_ABS}/${TESTRAPPORTFILPATTERN}'"

        // Loggfiler från tidigare körningar
        sh "rm -fr '${env.WORKSPACE}/.npm/_logs/*.log'"

        // Resursrapporteringfil
        sh "rm -fr '${RESURSRAPPORTERINGSFIL_ABS}'"
      }
    }

    stage('Installera Cypress') {
      steps {
        dir("${CYPRESS_DIR_REL}") {
          sh 'npm ci'
          sh 'npm run cy:verify'

          // Skriv ut en lista med alla installerade Node-moduler
          sh 'npm list'
        }
      }
    }

    stage('Exekvera Cypresstester') {
      steps {
        dir("${CYPRESS_DIR_REL}") {
          // ToDo: SPECFILES_TO_RUN sätts som parameter i Jenkinsjobbet.
          // När troubleshootingen är klar gällande vart problemet med timeouts ligger
          // så ska nedanstående rad återställas:
          // sh "npm run test:e2e:electron"
          sh "npm run test:e2e:electron -- --spec '${SPECFILES_TO_RUN}'"
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'test/cypress/videos/**/*.*', fingerprint: false
      archiveArtifacts artifacts: "${RESURSRAPPORTERINGSFIL_REL}", fingerprint: false
      // TODO: Använd variabler för att hämta JUnit-filer istället för hårdkodade pather
      junit 'test/cypress/results/*.xml'
    }

    //fixed {
      //TODO
	  // Skicka epost om jobbet går bra igen
      //emailext (
      //  subject: "Fixat! Jobb '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      //  body: "Jobb '${env.JOB_NAME} [${env.BUILD_NUMBER}]' går nu BRA igen. Se konsollutmatning här: '${env.BUILD_URL}'",
      //  to: "${EPOSTMOTTAGARE}"
      //)
    //}

    failure {
      archiveArtifacts artifacts: 'test/cypress/screenshots/**/*.*', fingerprint: false
      archiveArtifacts artifacts: '.npm/_logs/*.log', fingerprint: false
      archiveArtifacts artifacts: "${CYPRESSFAILEDLOGS_REL}", fingerprint: false
    }

    // Denna sektion exekveras enbart om föregående körning gick bra och denna misslyckades
    //regression {
      // Skicka epost om jobbet misslyckas
    //  emailext (
    //    subject: "Misslyckat! Jobb '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
    //    body: "Jobb '${env.JOB_NAME} [${env.BUILD_NUMBER}]' MISSLYCKADES! Se konsollutmatning här: '${env.BUILD_URL}'. Inga fler mail kommer skickas innan jobbet åter går bra.",
    //    to: "${EPOSTMOTTAGARE}"
    //  )
    //}
  }
}