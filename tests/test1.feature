@Fast

Feature: Running Cucumber with Protractor
  As a user of Protractor
  I should be able to use Cucumber
  to run my e2e tests

  Scenario: Go to URL should open corresponding page
    When I go to URL "http://localhost:8001/test1.html"
    Then the title should be "Test1 Page"

  Scenario: Go to URL should open corresponding page (text style step)
    When I go to pageTest1 from testPage page
    Then the title should be "Test1 Page"

  Scenario: Go to page should open corresponding page
    When I go to "testPage"."pageTest1"
    Then the title should be "Test1 Page"

  Scenario: Reload the page should refresh the page
    When I go to "testPage"."pageTest1"
    And I reload the page
    Then "testPage"."linkTest2Page" should be present
