pipeline {
    agent any

    environment {
        JAVA_HOME = 'C:\\Program Files\\Java\\jdk-21.0.12'
        PATH = "${JAVA_HOME}\\bin;${env.PATH}"
    }

    stages {

        stage('Check Environment') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'java -version'
                bat 'allure --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('InventoryAuto') {
                    bat 'npm ci'
                }
            }
        }

        stage('Install Playwright Browser') {
            steps {
                dir('InventoryAuto') {
                    bat 'npx playwright install chromium'
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                dir('InventoryAuto') {
                    bat 'npx playwright test'
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                dir('InventoryAuto') {
                    bat 'if exist allure-report rmdir /s /q allure-report'
                    bat 'allure generate allure-results -o allure-report'
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'InventoryAuto/allure-report/**/*', allowEmptyArchive: true

            allure([
                results: [[path: 'InventoryAuto/allure-results']]
            ])
        }
    }
}