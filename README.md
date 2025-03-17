# Generating and displaying word cloud chart for wikipedia category .

For a user specifyied wikipedia category, the app retrieves all wikipedia pages which are marked with that category and builds work frequencies from the introduction texts of the pages. Given these frequencies, a d3 word cloud chart is generated.

Absolout counts can be viewed when hovering over a word.

Static javascript with Wikipedia API and d3.js

# user controls:
- category input field
- language selection (en, de)


# notes:
- Only pages with that specific category are considered. No subcategories are considered.
- A category graph can be viewed on  [click to view app on github-pages](https://ManfredAtGit.github.io/Wiki-Category-Graph/)
- no word stemming is performed yet. So, 'model' and 'models' are to different words.

# view web app:
[click to view app on github-pages](https://ManfredAtGit.github.io/Wiki-Category-WordCloud/)


