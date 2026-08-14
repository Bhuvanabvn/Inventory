pipeline {

    agent any

    stages {

        stage('Check Environment') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'java -version'
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

        stage('Check Allure Results') {
            steps {
                dir('InventoryAuto') {
                    bat '''
                        echo Checking Allure results...
                        if exist allure-results (
                            echo Allure results found
                            dir allure-results
                        ) else (
                            echo ERROR: allure-results folder not found
                            exit /b 1
                        )
                    '''
                }
            }
        }
    }

    post {
        always {
            allure(
                commandline: 'Allure',
                results: [[path: 'InventoryAuto/allure-results']]
            )
        }
    }
}