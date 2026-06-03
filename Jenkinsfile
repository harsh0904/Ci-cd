pipeline {
    agent any

    environment {
        DOCKER_IMAGE   = 'harsh091004/cicd-project'
        DOCKER_CREDS   = credentials('dockerhub-credentials')
        KUBECONFIG     = '/root/.kube/config'
        NAMESPACE      = 'app'
    }

    stages {

        stage('📥 Checkout') {
            steps {
                echo '🔄 Checking out source code...'
                checkout scm
                sh 'echo "Branch: ${GIT_BRANCH}, Commit: ${GIT_COMMIT[0..7]}"'
            }
        }

        stage('🧪 Test') {
            steps {
                echo '🧪 Running Jest test suite...'
                sh '''
                    npm ci
                    MONGODB_URI=mongodb://localhost:27017/taskmanager_test \
                    NODE_ENV=test \
                    npm run test:ci
                '''
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'coverage/junit.xml'
                }
            }
        }

        stage('🐳 Build Docker Image') {
            steps {
                echo "🏗️ Building image: ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                sh """
                    docker build \
                        --target production \
                        -t ${DOCKER_IMAGE}:${BUILD_NUMBER} \
                        -t ${DOCKER_IMAGE}:latest \
                        .
                """
            }
        }

        stage('🚀 Push to Docker Hub') {
            steps {
                echo '📤 Pushing to Docker Hub...'
                sh """
                    echo '${DOCKER_CREDS_PSW}' | docker login -u '${DOCKER_CREDS_USR}' --password-stdin
                    docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                    docker push ${DOCKER_IMAGE}:latest
                    echo '✅ Pushed ${DOCKER_IMAGE}:${BUILD_NUMBER}'
                """
            }
        }

        stage('☸️ Deploy to Kubernetes') {
            steps {
                echo '🚢 Deploying to Kubernetes cluster...'
                sh """
                    export KUBECONFIG=${KUBECONFIG}

                    # Apply all manifests
                    kubectl apply -f k8s/namespace.yaml
                    kubectl apply -f k8s/configmap.yaml
                    kubectl apply -f k8s/secret.yaml
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml
                    kubectl apply -f k8s/hpa.yaml

                    # Roll out new image
                    kubectl set image deployment/taskapi-deployment \
                        taskapi=${DOCKER_IMAGE}:${BUILD_NUMBER} \
                        -n ${NAMESPACE}

                    # Wait for rollout
                    kubectl rollout status deployment/taskapi-deployment \
                        -n ${NAMESPACE} --timeout=120s

                    echo '✅ Deployment complete!'
                    kubectl get pods -n ${NAMESPACE}
                    kubectl get hpa -n ${NAMESPACE}
                """
            }
        }

        stage('✅ Verify') {
            steps {
                sh '''
                    sleep 5
                    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:30080/health)
                    if [ "$STATUS" = "200" ]; then
                        echo "✅ Health check passed! (HTTP $STATUS)"
                    else
                        echo "❌ Health check failed! (HTTP $STATUS)"
                        exit 1
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 Pipeline completed! App is live on Kubernetes.'
        }
        failure {
            echo '❌ Pipeline failed. Check logs above.'
        }
        always {
            sh 'docker logout || true'
        }
    }
}
