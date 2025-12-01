from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Resolving absolute path to the file
    base_path = os.getcwd()
    file_path = f"file://{base_path}/admin-panel-zan/dashboard.html"

    print(f"Navigating to {file_path}")
    page.goto(file_path)

    # Take a screenshot of the dashboard
    page.screenshot(path="verification/dashboard.png")

    # Click on 'Manage News'
    page.click("a[href='manage-news.html']")
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/manage_news.png")

    # Test Search in News
    page.fill("#tableSearch", "تشجير")
    page.wait_for_timeout(500)
    page.screenshot(path="verification/news_search.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
