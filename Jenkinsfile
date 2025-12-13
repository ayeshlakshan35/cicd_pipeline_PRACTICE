pipeline {
  agent any

  // ← Fix npm not found
  tools {
    nodejs 'Node20'   // NodeJS installation in Jenkins Global Tool Configuration
  }

  environment {
    DOCKERHUB_CREDENTIALS = credentials('dockerHub-token')
    SONAR_TOKEN = credentials('sonar-token2')
    DOCKER_IMAGE = "ayeshlakshan35/react-frontend:${env.BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        // Proper Git checkout in a clean workspace
        git branch: 'main', url: 'https://github.com/ayeshlakshan35/cicd_pipeline_PRACTICE.git'
      }
    }

    stage('Clean old build artifacts') {
      steps {
        // Only remove node_modules and dist folder, keep .git intact
        sh 'rm -rf node_modules dist'
      }
    }

    stage('Install & Test') {
      steps {
        sh 'npm ci'
        sh 'npm test -- --watchAll=false || true'
      }
    }

    stage('Build static assets') {
      steps {
        sh 'npm run build'
      }
    }

    stage('SonarQube analysis') {
      environment {
        SONAR_HOST_URL = 'http://sonarqube:9000'
      }
      steps {
        withSonarQubeEnv('SonarQube') {
          sh """
            npx sonar-scanner \
              -Dsonar.projectKey=${env.JOB_NAME} \
              -Dsonar.host.url=${SONAR_HOST_URL} \
              -Dsonar.login=${SONAR_TOKEN}
          """
        }
      }
    }

    stage('Docker build') {
      steps {
        sh "docker build -t ${DOCKER_IMAGE} ."
      }
    }

    stage('Trivy scan image') {
      steps {
        sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 1 ${DOCKER_IMAGE} || true"
      }
    }

    stage('Push image') {
      steps {
        sh """
          echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin
        """
        sh "docker tag ${DOCKER_IMAGE} ayeshlakshan35/react-frontend:latest"
        sh "docker push ${DOCKER_IMAGE}"
        sh "docker push ayeshlakshan35/react-frontend:latest"
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh "kubectl set image deployment/react-frontend react=${DOCKER_IMAGE} --record || kubectl apply -f k8s/"
      }
    }
  }

  post {
    failure {
      emailext subject: "Build failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}", body: "See Jenkins console."
    }
  }
}
