"use strict";

class TreeNode {
  constructor(name, url, isDirectory) {
    this.name = this.setName(name);
    this.url = this.setURL(url);
    this.isDirectory = this.setIsDirectory(isDirectory);
    this.parent = this.setParent(this.parent);
    this.children = new Set();
  }

  setName(name) {
    this.name = name;
  }

  setURL(url) {
    this.url = url;
  }

  setIsDirectory(isDirectory) {
    this.isDirectory = isDirectory;
  }

  setParent(parent) {
    if (this.parent == parent) {
      return;
    }
    this.parent = parent;
    if (parent != null) {
      parent.addChild(this);
    }
  }

  addChild(child) {
    if (child == null || this.children.has(child)) {
      return;
    }
    this.children.add(child);
    child.setParent(this);
  }
};

class Tree {
  constructor() {
    this.root = null;
    this.pwd = null;
  }
  
  createTree(tree) {
    this.root = this.createTreeRecursively(tree, null);
    this.pwd = this.root;
  }

  createTreeRecursively(node, parent) {
    validateNode(node);
    let name = node["Name"];
    let url = node["URL"];
    let isDirectory = node["isDirectory"];
    let newTreeNode = new TreeNode(name, url, isDirectory);
    newTreeNode.setParent(parent);
    let children = node["Children"] === undefined ? null : node["Children"];
    if (isDirectory) {
      for (let eachChild of children) {
        if (eachChild.size != 0) {
          this.createTreeRecursively(eachChild, newTreeNode);
        }
      }
    } else {
      for (let eachChild of children) {
        if (eachChild.size != 0) {
          throw "File cann't have children";
        }
      }
    }
    return newTreeNode;
  }

  validateNode(node) {
    if (node instanceof Map == false) {
      throw "validateNode : JSON Node must be Map Object";
    }
    let properties = ["Name", "URL", "isDirectory"];
    for (let property in properties) {
      if (node[property] === undefined) {
        throw "validateNode : " + property + " not found for Name";
      }
    }
  }
};

class Command {
  constructor(manual) {
    this.manual = manual;
  }
  execute() {}
  validateCommand(){}
};

class Cd extends Command {
  constructor() {
    super();
  }
}