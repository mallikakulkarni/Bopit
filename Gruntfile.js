module.exports = function (grunt) {
    grunt.initConfig({
        protractor: {
            options: {
                configFile: "tests/conf.js",
                noColor: false,
                args: {},
                webdriverManagerUpdate: true
            },
            e2e: {
                options: {
                    keepAlive: false
                }
            }
        },

        run: {
            mock_server: {
                options: {
                    wait: false
                }
            }
        },

        connect: {
            options: {
                port: 9000,
                hostname: 'localhost'
            },
            test: {
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-run');

    grunt.registerTask('test', ['connect:test', 'run:mock_server', 'protractor:e2e']);
};