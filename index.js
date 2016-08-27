/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { Class } = require("sdk/core/heritage");
const { Disposable } = require("sdk/core/disposable");
const { emit } = require("sdk/event/core");
const { EventTarget } = require("sdk/event/target");

const { Cu } = require("chrome");
const { gDevTools } = Cu.import("resource://devtools/client/framework/gDevTools.jsm", {});

// Weak map of toolbox per target
const toolboxes = new WeakMap();
const toolboxFor = target => toolboxes.get(target);

const ToolboxListener = Class({
  extends: Disposable,
  implements: [EventTarget],

  initialize() {
    this.onToolboxReady = this.onToolboxReady.bind(this);
    this.onToolboxDestroyed = this.onToolboxDestroyed.bind(this);
    this.onSelect = this.onSelect.bind(this);

    gDevTools.on("toolbox-ready", this.onToolboxReady);
    gDevTools.on("toolbox-destroyed", this.onToolboxDestroyed);
  },

  dispose() {
    for (let toolbox of toolboxes.values()) {
      toolbox.off("select", this.onSelect);
    }

    gDevTools.off("toolbox-ready", this.onToolboxReady);
    gDevTools.off("toolbox-destroyed", this.onToolboxDestroyed);
  },

  onToolboxReady(evt, toolbox) {
    toolboxes.set(toolbox.target, toolbox);

    toolbox.on("select", this.onSelect);
  },

  onToolboxDestroyed(evt, target) {
    const toolbox = toolboxFor(target);

    if (toolbox) {
      toolbox.off("select", this.onSelect);
    }
  },

  onSelect(evt, id) {
    emit(this, "panel-selected", id);
  }
});

const toolboxListener = new ToolboxListener();

const DevPanelVisibilityListener = Class({
  implements: [Disposable],
  initialize(panel) {
    this.panels = new Set();
    this.visiblePanels = new WeakSet();
    this.onPanelSelected = this.onPanelSelected.bind(this);

    toolboxListener.on("panel-selected", this.onPanelSelected);
  },

  dispose() {
    toolboxListener.off("panel-selected", this.onPanelSelected);

    this.panels.clear();
    this.visiblePanels = null;
  },

  onPanelSelected(id) {
    for (let panel of this.panels) {
      if (id == panel.id) {
        this.visiblePanels.add(panel);
        emit(panel, "show");
      } else if (this.visiblePanels.has(panel)){
        this.visiblePanels.delete(panel);
        emit(panel, "hide");
      }
    }
  },

  addPanel(panel) {
    this.panels.add(panel);
  },

  removePanel(panel) {
    this.panels.delete(panel);
  },
});

exports.DevPanelVisibilityListener = DevPanelVisibilityListener;
