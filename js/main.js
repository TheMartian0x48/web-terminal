/*jshint esversion: 6 */
"use strict";

class TreeNode {
  constructor(name, url, isDirectory) {
    this.name = name;
    this.url = url;
    this.isDirectory = isDirectory;
    this.parent = null;
    this.children = new Map();
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
    if (this.children.has(child.name)) {
      return;
    }
    this.children.set(child.name, child);
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
    this.validateNode(node);
    let name = node["name"];
    let url = node["url"];
    let isDirectory = node["isDirectory"];
    let newTreeNode = new TreeNode(name, url, isDirectory);
    newTreeNode.setParent(parent);
    let children = node["children"] === undefined ? null : node["children"];
    if (isDirectory) {
      for (let child of children) {
        if (child.size != 0) {
          this.createTreeRecursively(child, newTreeNode);
        }
      }
    } else if (!isDirectory && children != null){
      for (let child of children) {
        if (child.size != 0) {
          throw "file can not have directories / files";
        }
      }
    }
    return newTreeNode;
  }

  validateNode(node) {
    let properties = ["name", "url", "isDirectory"];
    for (let property of properties) {
      if (node[property] === undefined) {
        throw "validateNode : " + property + " not found for Name";
      }
    }
  }

  isValidPathFromNode(path, node) {
    //TODO
  }
};

class Command {
  constructor(manual = null) {
    if (manual == null) {
      throw "Forget to set the manual";
    }
    this.manual = manual;
  }
  execute(instruction) { }
  validateCommand(argv) { }
  printError(err) { }
};

// Global Object (must create singleton object)
let fileSystem = new Tree();
let supportedCommands = new Map();

class Cd extends Command {
  constructor() {
    let manual = "<table><thead> <tr> <th>NAME</th> </tr></thead><tbody> <tr> <td>cd - change the working directory</td> </tr> <tr> <td>SYNOPSIS</td> </tr> <tr> <td>cd [directory]</td> </tr> <tr> <td>cd</td> </tr></tbody></table>";
    super(manual);
  }
  
  execute(instructions) {
    let argv = instructions.split(" ").filter(instruction => instruction.length > 0);
    if (!this.validateCommand(argv)) {
      return;
    }
    if (argv.length == 1) {
      fileSystem.pwd = fileSystem.root;
    } else {
      let pwd = fileSystem.pwd;
      let folders = argv[1].split("/");
      for (let folder in folders) {
        if (folder == "..") {
          pwd = pwd.parent;
        } else if (folder != ".") {
          pwd = pwd.children.get(folder);
        }
      }
      fileSystem.pwd = pwd;
    }
  }
  validateCommand(argv) {
    if (argv.length == 1) {
      return true;
    };
    if (argv.length == 2 && fileSystem.isValidPathFromNode(argv[1].split("/"), fileSystem.pwd)) {
      return true;
    }
    super.printError("Incorrect Path");
    return false;
  }
}


const url = "filesystem.json";
// const url = "./old/web-terminal.json";

function f() {
  let a = 10;
  let b = 20;
  return a + b;
}


function Main() {
  fetch(url)
    .then(function (response) {
      return response.json();
    }).then((data) => {
      fileSystem.createTree(data["root"]);
    })
    .catch(function (err) { });
 
  // supportedCommands.set("cd", new Cd());
  // console.log(f());
}

Main();