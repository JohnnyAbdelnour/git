from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get the absolute path to the gallery.html file
        file_path = os.path.abspath("gallery.html")

        # Navigate to the local HTML file
        page.goto(f"file://{file_path}")

        # Wait for the gallery to be populated
        page.wait_for_selector('a[data-title="متطوعون يزرعون الأشجار"]')

        # Directly trigger lightbox using page.evaluate()
        page.evaluate("""() => {
            const anchor = document.querySelector('a[data-title="متطوعون يزرعون الأشجار"]');
            if (window.lightbox && window.jQuery) {
                window.lightbox.start(window.jQuery(anchor));
            }
        }""")

        # Wait for the lightbox to appear
        lightbox = page.locator('.lightbox.lb-opened')
        expect(lightbox).to_be_visible()

        # Wait for the image in the lightbox to be loaded and check its src
        lightbox_image = lightbox.locator('img.lb-image')
        # Note: The URL might have encoded characters, so we check for the base URL.
        expect(lightbox_image).to_have_attribute('src', 'https://via.placeholder.com/800x600.png/FFFF00/000000?text=Large+Image+3')

        # Take a screenshot of the page with the lightbox
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run()