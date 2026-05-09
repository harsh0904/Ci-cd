pipeline {
    agent any

    environment {
        DOCKER_IMAGE     = 'harsh091004/cicd-project'
        DOCKER_CREDS     = credentials('dockerhub-credentials')
        K8S_DEPLOYMENT   = 'cicd-deployment'
        K8S_CONTAINER    = 'cicd'
        KUBECONFIG       = '/root/.kube/config'
    }

    stages {

        stage('📥 Checkout') {
            steps {
                echo '🔄 Checking out source code...'
                checkout scm
            }
        }

        stage('🐳 Build Docker Image') {
            steps {
                echo "🏗️ Building Docker image: ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                sh """
                    docker build \
                        -t ${DOCKER_IMAGE}:${BUILD_NUMBER} \
                        -t ${DOCKER_IMAGE}:latest \
                        .
                """
            }
        }

        stage('🚀 Push to Docker Hub') {
            steps {
                echo '📤 Pushing image to Docker Hub...'
                sh """
                    echo '${DOCKER_CREDS_PSW}' | docker login -u '${DOCKER_CREDS_USR}' --password-stdin
                    docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                    docker push ${DOCKER_IMAGE}:latest
                """
            }
        }

        stage('☸️ Deploy to Kubernetes') {
            steps {
                echo '🚢 Deploying to Kubernetes cluster...'
                sh """
                    export KUBECONFIG=${KUBECONFIG}
                    kubectl apply -f k8s/
                    kubectl set image deployment/${K8S_DEPLOYMENT} \
                        ${K8S_CONTAINER}=${DOCKER_IMAGE}:${BUILD_NUMBER} \
                        --record || true
                    kubectl rollout status deployment/${K8S_DEPLOYMENT} --timeout=120s
                """
            }
        }

        stage('✅ Verify Deployment') {
            steps {
                echo '🔍 Verifying deployment...'
                sh """
                    export KUBECONFIG=${KUBECONFIG}
                    kubectl get pods -l app=cicd-project
                    kubectl get svc cicd-service
                    echo "✅ Deployment verified!"
                """
            }
        }
    }

    post {
        success {
            echo '🎉 Pipeline completed successfully! Site is live.'
        }
        failure {
            echo '❌ Pipeline failed. Check the logs above.'
        }
        always {
            sh 'docker logout || true'
        }
    }
}
