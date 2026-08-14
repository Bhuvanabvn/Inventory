pipeline {
    agent any

 environment {
    JAVA_HOME = 'C:\\Program Files\\Java\\jdk-21.0.12'
    ALLURE_HOME = 'C:\\Users\\AGL.PM-BN-4072-LAP\\node_modules\\.bin'
    PATH = "${JAVA_HOME}\\bin;${ALLURE_HOME};${env.PATH}"
}
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
    }

    post {
        always {
            allure([
                allureVersion: '3',
                results: [
                    [path: 'InventoryAuto/allure-results']
                ]
            ])

            archiveArtifacts(
                artifacts: 'InventoryAuto/test-results/**/*,InventoryAuto/playwright-report/**/*',
                allowEmptyArchive: true,
                fingerprint: true
            )
        }
    }
}