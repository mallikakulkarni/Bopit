describe('Bopit', function() {
    var btnStart = $('#start-button');
    var playScreen = $('.play-screen');
    var startScreen = $('.start-screen');
    var btnPull = $('.button-li > .red');
    var btnTwist = $('.button-li > .green');
    var btnBop = $('.button-li > .yellow');
    var score = $('#score');
    var instr = $('#instr');
    var goToStartBtn = $('.btn');
    var url = 'file://' + __dirname.toString().substring(0, __dirname.toString().lastIndexOf('/')) + '/index.html';
    beforeEach(function() {
        browser.waitForAngularEnabled(false);
    });

    describe('Bopit', function () {
        it('should perform correct event on start button click', function () {
            browser.get(url).then(function () {
                expect(btnStart.isPresent()).toBe(true);
                expect(playScreen.isDisplayed()).toBe(false);
                btnStart.click().then(function() {
                    browser.sleep(2000);
                    expect(playScreen.isDisplayed()).toBe(true);
                });
            });
        });

        it('should increment score on correct button click', function () {
            browser.get(url).then(function () {
                expect(btnStart.isPresent()).toBe(true);
                btnStart.click().then(function() {
                    browser.sleep(2000);
                    expect(playScreen.isDisplayed()).toBe(true);
                    browser.sleep(2000);
                    $('#instr').getText().then(function(text) {
                        switch (text) {
                            case 'Pull It':
                                btnPull.click();
                                break;
                            case 'Twist It':
                                btnTwist.click();
                                break;
                            case 'Bop It':
                                btnBop.click();
                                break;
                        }
                        expect(score.getText()).toEqual('1');
                    });
                });
            });
        });

        it('should take you to start screen on clicking go to start screen', function () {
            browser.get(url).then(function () {
                expect(btnStart.isPresent()).toBe(true);
                btnStart.click().then(function() {
                    browser.sleep(2000);
                    expect(playScreen.isDisplayed()).toBe(true);
                    expect(goToStartBtn.isDisplayed()).toBe(true);
                    expect(startScreen.isDisplayed()).toBe(false);
                    goToStartBtn.click().then(function() {
                        expect(startScreen.isDisplayed()).toBe(true);
                    });
                });
            });
        });

        it('should end game on wrong button click', function () {
            browser.get(url).then(function () {
                expect(btnStart.isPresent()).toBe(true);
                btnStart.click().then(function() {
                    browser.sleep(2000);
                    expect(playScreen.isDisplayed()).toBe(true);
                    browser.sleep(4000);
                    instr.getText().then(function(text) {
                        switch (text) {
                            case 'Pull It':
                                btnTwist.click();
                                break;
                            case 'Twist It':
                                btnBop.click();
                                break;
                            case 'Bop It':
                                btnPull.click();
                                break;
                        }
                        expect(score.getText()).toEqual('0');
                        instr.getText().then(function(text) {
                            expect(text.includes('You finished')).toBe(true);
                        });
                    });
                });
            });
        });
    });
});