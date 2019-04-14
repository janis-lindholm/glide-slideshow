# portret-slideshow
A simple browser based slideshow powered by [D3](http://d3js.org).

**Warning: This software is in beta state.**

### Quickstart

First make sure you have installed **node.js** on your computer.

#### Load needed dependencies

The slideshow requires some 3rd-party libraries e.g. [D3.js](http://d3js.org), [Vue.js](https://vuejs.org/) and [exif-js](https://github.com/exif-js/exif-js). Type

```bash
    cd js
```

followed by

```bash
    npm install
```

to load and install required dependencies.

#### Fire up the Portret API

```bash
    node js/portret-api/main.js
```

#### Prepare your slideshow

Five steps to launch a browser based slideshow:

1. Make sure the Portret API is running.
2. Drop your collections into the `./collections` subfolder. Within that folder create one subfolder per collection e.g. `./collections/my-first-show`.
3. Open the local `index.html` file in your web browser. Currently only Firefox is supporting direct file access. You must access Portret via a web server if you are using a different browser.
4. Choose one of your collections and start the show.
5. Lean back and enjoy your slideshow.

#### Use a web server to access Portret

You can use any web server like nginx or Apache to serve Portret. If you have no web server installed, the simplest way is to use `serve-static`. Simply call it via:

```bash
    node js/portret-api/server.js
```

Now Portret should be accessible at [http://127.0.0.1:8080](http://127.0.0.1:8080).

### Configuration

The default configuration settings can be overridden per collection by putting a `portret.json` file into the collection folder. The following settings are supported:

| Property      | Description | Value Range   | Default  |
| ------------- | ------------- | ------------- | ----- |
| name          | slideshow name | string        | "Slideshow" |
| showDuration  | controls how long a pic is displayed | milliseconds  |  5000 |
| autoForward   | enables automatic slide change  | true, false   |  true   |
| bgColor       | background colour | HEX colour code |  #1e2426   |
| animation     | animation style during slide change | NONE, RANDOM, ZOOM_IN, SLIDE_RIGHT, SLIDE_TOP, MEMORY |  NONE   |
| animDuration  | controls how much time an animation should take | milliseconds  |  2000   |
