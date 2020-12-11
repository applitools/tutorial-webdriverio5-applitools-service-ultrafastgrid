'use strict';


describe('Test app', () => {

  beforeEach(() => {
    browser.url('https://demo.applitools.com');
  });


  it('First test', () => {
    try {
      browser.eyesCheckWindow('Login Window test');
    } catch (e) {
      console.error(e);
    }
  });


});
