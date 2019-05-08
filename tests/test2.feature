@Fast

Feature: Running Cucumber with Protractor
  As a user of Protractor
  I should be able to use Cucumber
  to run my e2e tests

  Scenario: Moving to element should trigger its hovered state
    When I go to URL "http://localhost:8001/test1.html"
    And I move to "testPage"."titleTest1"
    Then "testPage"."blockTextTest" text should contain "testPage"."txtTest1"

  Scenario: Moving to element with offset should trigger its hovered state (text style step)
    When I go to URL "http://localhost:8001/test1.html"
    And I move to titleTest1 from testPage page with an offset of x: 10px, y: 5px
    Then "testPage"."blockTextTest" text should contain "testPage"."txtTest1"

  Scenario: Validate current URL matches provided regexp
    When I go to URL "http://localhost:8001/test1.html"
    Then URL should match /:80{1,2}[0-9]/test[0-9].htm(l?)/

  Scenario: Switch to iframe should change the context to this iframe (text style step)
    When I go to URL "http://localhost:8001/test-iframe.html"
    And I switch to iframeTest1Page non angular frame from iframePage page
    Then "testPage"."linkTest2Page" should be present

  Scenario: Switch to default frame should change the context to the main page
    When I go to URL "http://localhost:8001/test-iframe.html"
    And I switch to "iframePage"."iframeTest1Page" non angular frame
    Then "testPage"."linkTest2Page" should be present
    And I switch to default frame
    And "testPage"."linkTest2Page" should not be present

  Scenario: Execute script should change the content on the page
    When I go to URL "http://localhost:8001/test1.html"
    And I execute "document.getElementById('text-test').innerHTML = 'Text to test script execution';"
    Then "testPage"."blockTextTest" text should contain "Text to test script execution"
