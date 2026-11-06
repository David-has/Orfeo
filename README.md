# Tempus & Aura – watches and perfumes

A landing page for a fictional boutique that sells watches and perfumes. One switch changes the whole page: dark mode shows the watch collection, light mode shows the perfumes. Everything runs in the browser, with no libraries and no server.

> Demo project: the products, prices and orders are made up.

## Features

- **Two worlds, one switch:** dark mode is the watch showroom, light mode is the perfume shop. The colors, the hero illustration, the texts and the products all change together.
- **Collections with filters** for each mode, for example watch type or fragrance family.
- **Product details** with description, price and options.
- **Demo cart** with quantities and a calculated total. No real payment.
- **Sections:** featured items, brand story, services, reviews, FAQ and contact.
- **Scroll motion:** progress bar, counting numbers, parallax and elements that appear one after another.
- **Responsive**, and it respects the "reduce motion" setting. The chosen theme is saved in the browser.

## Project structure

```
index.html   page structure
style.css    styles, themes and animations
script.js    content, themes, cart and scroll animations
```

## Run it locally

1. Download or clone the project.
2. Open `index.html` in a browser, or use the **Live Server** extension in VS Code.

All three files must be in the same folder.

## Publish it (GitHub Pages)

1. Upload the files to the root of the repository.
2. Go to **Settings → Pages**.
3. Under *Source* choose **Deploy from a branch**, branch **main**, folder **/ (root)**.
4. After a minute or two the page is live at `https://your-username.github.io/your-repo/`.

## Customize it

At the top of `script.js` you will find the product lists, prices and texts for each mode. Colors and fonts are in the variables at the top of `style.css`.

## Built with

Plain HTML, CSS and JavaScript. Fonts come from Google Fonts.
