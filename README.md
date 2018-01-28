# glide-slideshow
A simple browser based slideshow powered by [D3.js](http://d3js.org).

**Warning: This software is in early alpha state.**

#Quickstart

Five steps to launch a browser based slideshow:

1. Drop your pictures into the `./pics` subfolder.
2. Create your own `pics.json`. (you can use `pics.example.json` as a template)
3. List pictures in your `pics.json`. This defines the order in which pics are played back.
4. Open the `slideshow.html` file in your web browser. (currently only Firefox is supported)
5. Lean back and watch your slideshow.

#Configuration

All configuration settings are made in the `pics.json` file.

| Property      | Description | Value Range   | Default  |
| ------------- | ------------- | ------------- | ----- |
| name          | slideshow name | string        | "Slideshow" |
| showDuration  | controls how long a pic is displayed | milliseconds  |  5000 |
| autoForward   | enables automatic slide change  | true, false   |  true   |
| bgColor       | background colour | HEX colour code |  #1e2426   |
| animation     | animation style during slide change | NONE, RANDOM, ZOOM_IN, SLIDE_RIGHT, SLIDE_TOP, MEMORY |  NONE   |
| animDuration  | controls how much time an animation should take | milliseconds  |  2000   |
| picsJsonURI   | - | URI, filename |  "pics.json" |
