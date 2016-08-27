/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { Panel } = require("dev/panel");
const { Tool } = require("dev/toolbox");
const { Class } = require("sdk/core/heritage");

const { DevPanelVisibilityListener } = require("./devpanel-visibility-listener");

const panelVisibilityListener = new DevPanelVisibilityListener();

const DemoPanel = Class({
  extends: Panel,
  label: "DemoPanel",
  tooltip: "Demo Panel",
  icon: "./icon.png",
  url: "./index.html",
  setup: function({debuggee}) {
    panelVisibilityListener.addPanel(this);
    this.debuggee = debuggee;
  },
  dispose: function() {
    panelVisibilityListener.removePanel(this);
    delete this.debuggee;
  },
  onReady: function() {
    this.debuggee.start();
    this.postMessage("RDP", [this.debuggee]);
  },
  onShow: function() {
    console.log("ON SHOW");
  },
  onHide: function() {
    console.log("ON HIDE");
  }
});
exports.DemoPanel = DemoPanel;


const demo = new Tool({
  panels: { demo: DemoPanel }
});
