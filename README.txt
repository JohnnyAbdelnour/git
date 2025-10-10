Zan Municipality - Data JSON + Loader
====================================

Files:
- news.json
- announcements.json
- projects.json
- gallery.json
- data-loader.js

How to integrate:
1) Create a folder `data/` in your website repo root and commit the four JSON files there.
   Example path (GitHub Pages): /zan-municipality/data/news.json

2) In every HTML page that currently includes `script.js`, add the data loader BEFORE it:
   <script defer src="data-loader.js"></script>
   <script defer src="script.js"></script>

3) In `script.js`, change your main initialization to wait for the custom event before rendering:
   document.addEventListener('ZAN_DATA_READY', function(){
      // your existing code that renders from newsData, announcementsData, projectsData, galleryData
   });

   If you already use DOMContentLoaded, wrap your render code inside the ZAN_DATA_READY handler,
   because the arrays are now filled asynchronously.

Notes:
- The JSON here was auto-extracted from your current script.js. Review the values, especially
  image URLs that were abbreviated with "..." in the source.
- To add more sections (slides, services, about, contact), create files under /data/ and fetch
  them similarly.
