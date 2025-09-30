from playwright.sync_api import Page, expect

def test_app_verification(page: Page):
    """
    This script verifies that both the backoffice and the public-facing
    website are accessible and appear correctly.
    """

    # 1. Verify the Backoffice
    # Navigate to the backoffice dashboard page.
    page.goto("http://localhost:3000/admin")

    # Expect the page to have the correct title.
    expect(page).to_have_title("Dashboard")

    # Take a screenshot of the backoffice dashboard.
    page.screenshot(path="jules-scratch/verification/backoffice_dashboard.png")

    # 2. Verify the Public Website
    # Navigate to the public homepage.
    page.goto("http://localhost:3000/")

    # Expect the page to have the correct title.
    expect(page).to_have_title("بلدية زان")

    # Take a screenshot of the public homepage.
    page.screenshot(path="jules-scratch/verification/public_homepage.png")