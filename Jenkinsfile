pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerHub-token')
        SONAR_TOKEN = credentials('sonar-token2')
        DOCKER_IMAGE = "ayeshlaksha35/react-frontend:${env.BUILD_NUMBER}"
        SONAR_HOST_URL = 'http://sonarqube:9000'
        DOCKERHUB_USER = 'ayeshlaksha35'
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
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    npx sonar-scanner \
                      -Dsonar.projectKey=$JOB_NAME \
                      -Dsonar.host.url=$SONAR_HOST_URL \
                      -Dsonar.login=$SONAR_TOKEN
                    '''
                }
            }
        }

        stage('Docker build') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Trivy scan image') {
            steps {
                echo "Running Trivy vulnerability scan in light mode..."
                sh '''
                docker run --rm \
                  -v /var/run/docker.sock:/var/run/docker.sock \
                  aquasec/trivy image --light --exit-code 1 $DOCKER_IMAGE || true
                '''
            }
        }

        stage('Push image') {
             steps {
                echo "Logging in to DockerHub and pushing image..."
                sh '''
                # Set DockerHub credentials
                DOCKER_USER=$DOCKERHUB_CREDENTIALS_USR
                DOCKER_PASS=$DOCKERHUB_CREDENTIALS_PSW

                # Login to DockerHub
                echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin

                # Tag and push the image with build number
                docker tag $DOCKER_IMAGE $DOCKERHUB_USER/react-frontend:${BUILD_NUMBER}
                docker push $DOCKERHUB_USER/react-frontend:${BUILD_NUMBER}

                # Tag and push the image as latest
                docker tag $DOCKER_IMAGE $DOCKERHUB_USER/react-frontend:latest
                docker push $DOCKERHUB_USER/react-frontend:latest
                '''
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo "Deploying to Kubernetes using kubectl container..."
                sh '''
                # Apply YAML manifests
                docker run --rm \
                  --network host \
                  -v /home/esh/.kube:/root/.kube \
                  -e KUBECONFIG=/root/.kube/config \
                  bitnami/kubectl:latest \
                  apply -f /var/jenkins_home/workspace/CICD-PIPELINE/k8s --validate=false

                # Update deployment image
                docker run --rm \
                  --network host \
                  -v /home/esh/.kube:/root/.kube \
                  -e KUBECONFIG=/root/.kube/config \
                  bitnami/kubectl:latest \
                  set image deployment/react-frontend react=$DOCKER_IMAGE --record
                '''
            }
        }
    }

    post {
        failure {
            emailext(
                subject: "Build failed: $JOB_NAME #$BUILD_NUMBER",
                body: "See Jenkins console output for details."
            )
        }
    }
}

