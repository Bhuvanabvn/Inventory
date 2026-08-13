pipeline {
    agent any
    stages {
        stage('Check Environment') {
            steps {
                bat 'node --version'
                bat 'npm --version'
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
    }
    post {
        always {
            allure([
                results: [[path: 'InventoryAuto/allure-results']]
            ])
        }
    }
}