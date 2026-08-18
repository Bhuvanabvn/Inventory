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
                    bat 'allure generate allure-results -o allure-report --clean'
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '''
                InventoryAuto/allure-report/**,
                InventoryAuto/allure-results/**,
                InventoryAuto/test-results/**,
                InventoryAuto/playwright-report/**
            ''',
            allowEmptyArchive: true
        }
    }
}