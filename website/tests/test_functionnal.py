from django.test import LiveServerTestCase
from website.tests.selenium_utility_belt import SeleniumUtilityBelt


class InterfaceTestCase(SeleniumUtilityBelt, LiveServerTestCase):
    def setUp(self):
        super(InterfaceTestCase, self).setUp()


class HomepageTests(InterfaceTestCase):
    def setUp(self):
        super(HomepageTests, self).setUp()

    def test_find_id_username_on_hp(self):
        self.open('/')
        self.assertOnPage('#id_username', visible=True)

    def test_simple_login(self):
        try:
            self.open('/')
            username_input = self.driver.find_element_by_id('id_username')
            username_input.send_keys('bob')

            self.driver.find_element_by_css_selector('#id_username + input[type="submit"]').click()
            self.assertOnPage('.add-comptoir input', visible=True)
        except Exception as er:
            self.driver.save_screenshot('screenshot.png')


