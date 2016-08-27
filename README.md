# firefox-devpanel-visibility-events-workaround

This repo contains an npm package which can be used as a dependency in a Firefox Addon based on the
Addon SDK and built with the jpm tool.

The goal of this module is to workaround the missing visibility events on the "dev/panel" Addon SDK module.

## Usage

In your SDK addon, install the package as a dependency:

```
$ npm install --save rpl/firefox-devpanel-visibility-events-workaround
```

and integrate it into your Panel class:

```js
const { DevPanelVisibilityListener } = require("devpanel-visibility-listener");

const panelVisibilityListener = new DevPanelVisibilityListener();

const DemoPanel = Class({
  extends: Panel,
  label: "DemoPanel",
  tooltip: "Demo Panel",
  icon: "./icon.png",
  url: "./index.html",
  setup: function({debuggee}) {
    ...
    // Watch the panel for its visibility events.
    panelVisibilityListener.addPanel(this);
  },
  dispose: function() {
    // Do not watch the panel for its visibility events anymore.
    panelVisibilityListener.removePanel(this);
    delete this.debuggee;
  },
  onReady: function() {
    ...
  },
  onShow: function() {
    console.log("ON SHOW");
  },
  onHide: function() {
    console.log("ON HIDE");
  }
});

```
