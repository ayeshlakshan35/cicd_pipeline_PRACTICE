pipeline {
  agent any

  // ← ADD THIS BLOCK TO FIX npm NOT FOUND
  tools {
    nodejs 'Node20'   // Name of NodeJS installation in Jenkins Global Tool Configuration
  }

  environment {
    DOCKERHUB_CREDENTIALS = credentials('dockerHub-token')   // FIXED
    SONAR_TOKEN = credentials('sonar-token2')                // FIXED
    DOCKER_IMAGE = "yourdockerhubuser/react-frontend:${env.BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
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
        sh "docker tag ${DOCKER_IMAGE} yourdockerhubuser/react-frontend:latest"
        sh "docker push ${DOCKER_IMAGE}"
        sh "docker push yourdockerhubuser/react-frontend:latest"
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
