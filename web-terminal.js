/*jshint esversion: 6 */


/**
 * class representing a tree node
 */
class TreeNode {
  constructor() {
    this.parent = null;
    this.name = '';
    this.link = '';
    this.files = [];
    this.children = [];
  }
}

/**
 * Class representing a tree structure of directory and files
 */
class Tree {
  constructor() {
    this.root = null;
    this.pwd = null;
  }
  /**
   * Create the tree
   * @param {object} treeData Information about tree node and its' children
   * @param {TreeNode} parent 
   * @returns {TreeNode} TreeNode created for current tree node in treeData
   */
  createTreeRecursively(treeData, parent = null) {
    const node = new TreeNode();
    node.parent = parent;
    node.name = treeData.name;
    node.link = treeData.link;
    node.files = treeData.files;
    for (let i = 0; i < treeData.children.length; i++) {
      node.children.push(this.createTreeRecursively(treeData.children[i], node));
    }
    return node;
  }
  /**
   * Wrapper for creating the tree
   * @param {JSON} tree tree information
   */
  createTree(tree) {
    this.root = this.createTreeRecursively(tree, null);
    this.pwd = this.root;
  }
  // traverse1() {
  //   let res = this.traverse(this.root);
  //   let div = document.getElementById('tree');
  //   div.appendChild(res);
  // }
  // /**
  //  * 
  //  * @param {*} root 
  //  * @returns 
  //  */
  // traverse(root) {
  //   let ul = document.createElement('ul');
  //   let li = document.createElement('li');
  //   li.innerHTML = 'name : ' + root.name;
  //   ul.appendChild(li);
  //   li = document.createElement('li');
  //   li.innerHTML = 'link : ' + root.link;
  //   ul.appendChild(li);
  //   for (let i = 0; i < root.files.length; i++) {
  //     let li1 = document.createElement('li');
  //     li1.innerHTML = 'name : ' + root.files[i][0] + ' link : ' + root.files[i][1];
  //     ul.appendChild(li1);
  //   }
  //   for (let i = 0; i < root.children.length; i++) {
  //     ul.appendChild(this.traverse(root.children[i]));
  //   }
  //   return ul;
  // }
}
/**
 * Abstract class for Command
 */
class Command {
  /**
   * 
   * @param {string} name name of the command
   * @param {string} errorMessage error message
   */
  constructor(name, errorMessage = '') {
    this.name = name;
    this.errorMessage = errorMessage;
  }
  /**
   * Get the name value
   * @returns {string} name of the command
   */
  getName() {
    return this.name;
  }
  /**
   * Display the error message
   */
  displayErrorMessage() {
    let terminal = document.getElementById('web-terminal-window');
    let div = document.createElement('div');
    div.setAttribute('id', 'web-terminal-error-result');
    let p = document.createElement('p');
    p.innerHTML = this.errorMessage;
    div.appendChild(p);
    terminal.appendChild(div);
  }
}
/**
 * Class representing all current configuration of the web-terminal
 * and provide method to manipulates those configuration
 */
class WebTerminal {
  constructor(user) {
    this.user = "";
    this.filesystem = new Tree();
    this.commands = new Map();
  }
  /**
   * initialize configuration for current user
   * @param {JSON} config information about user and filesystem tree
   */
  init(config) {
    this.user = config.user;
    this.createTree(config.root);
  }
  /**
   * create tree representing file structure and store in filesystem attribute
   * @param {Object} filesystem file structure information in tree fashion 
   */
  createTree(filesystem) {
    this.filesystem.createTree(filesystem);
  }
  /**
   * Add new Command to terminal
   * @param {Command} command information about new Command
   */
  addCommand(command) {
    this.commands.set(command.getName(), command);
  }
  /**
   * Remove Command from web-terminal
   * @param {string} command name of the Command
   */
   removeCommad(command) {
    if (this.commands.has(command)) {
      this.commands.delete(command);
    }
  }
  /**
   * Display error message in web-terminal when unknown command in invoked
   * @param {string} message error message
   */
  displayErrorMessage(message) {
    let terminal = document.getElementById('web-terminal-window');
    let div = document.createElement('div');
    div.setAttribute('id', 'web-terminal-error-result');

    let p = document.createElement('p');
    p.innerHTML = message;

    div.appendChild(p);
    terminal.appendChild(div);
  }
  /**
   * Create div box that will display current user and input field for 
   * entering command
   */
  createCommandBox() {
    let div = document.createElement('div');
    div.setAttribute('id', 'web-terminal-command-box');

    let span = document.createElement('span');
    span.setAttribute('id', 'web-terminal-user');
    span.innerHTML = this.user + ' >>';

    let input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('id', 'web-terminal-command');

    div.appendChild(span);
    div.appendChild(input);
    let terminal = document.getElementById('web-terminal-window');
    terminal.appendChild(div);
    input.focus();

    document.getElementById('web-terminal-command').addEventListener('keyup', (event) => {
      if (event.code == 'Enter') {
        this.executeCommand();
      }
    });
  }
  /**
   * Replace command input field with span 
   * @param {string} command command inputed by user (without removing any parameters)
   */
  replaceCommandbox(command) {
    let div = document.createElement('div');
    div.setAttribute('class', 'web-terminal-command-history');

    let userSpan = document.createElement('span');
    userSpan.setAttribute('class', 'web-terminal-user');
    userSpan.innerHTML = this.user + ' >>';

    let commandSpan = document.createElement('span');
    commandSpan.setAttribute('class', 'web-terminal-command');
    commandSpan.innerHTML = command;

    div.appendChild(userSpan);
    div.appendChild(commandSpan);

    let terminal = document.getElementById('web-terminal-window');
    terminal.removeChild(terminal.childNodes[terminal.childNodes.length - 1]);
    terminal.appendChild(div);
  }
  /**
   * Check web-terminal support a Command or not
   * @param {string} command name of the Command 
   * @returns {boolean} true if command is valid  otherwise false
   */
  validCommad(command) {
    return this.commands.has(command);
  }
  /**
   * execute Command 
   */
  executeCommand() {
    let command = (document.getElementById('web-terminal-command')).value;
    this.replaceCommandbox(command);

    command = command.trim().split(' ');
    if (command.length == 0 || this.validCommad(command[0]) == false) {
      this.displayErrorMessage('This is not a valid command');
      this.createCommandBox();
      return;
    } else {
      this.commands.get(command[0]).execute(this.filesystem, command);
      this.createCommandBox();
    }
  }
}
/**
 * List the content of the present working directory
 * @extends Command
 */
class Ls extends Command {
  constructor() {
    super("ls", "Wrong parameters, use `help` for help");
  }
  /**
   * list the content of the present working directory
   * in a div tag
   * @param {TreeNode} pwd TreeNode representing present working directory
   */
  getResult(pwd) {
    let terminal = document.getElementById('web-terminal-window');
    let div = document.createElement('div');
    div.setAttribute('id', 'web-terminal-success-result');

    for (let i = 0; i < pwd.files.length; i++) {
      let a = document.createElement("a");
      a.innerHTML = pwd.files[i][0];
      a.href = pwd.files[i][1];
      a.target = "_blank";
      div.appendChild(a);
    }
    for (let i = 0; i < pwd.children.length; i++) {
      let a = document.createElement("a");
      a.innerHTML = "<i>" + pwd.children[i].name + "</i>";
      a.href = pwd.children[i].link;
      a.target = "_blank";
      div.appendChild(a);
    }
    terminal.appendChild(div);
  }
  /**
   * Invoke getResult method if command input is valid otherwise invoke displayErrorMessage
   * @param {Tree} filesystem reference to Tree representing current file structure
   * @param {string[]} command command with all parameter
   */
  execute(filesystem, command) {
    if (command.length != 1) {
      this.displayErrorMessage();
    } else {
      this.getResult(filesystem.pwd);
    }
  }
}
/**
 * open the file (url here) in new tab
 * @extends Command
 */
class Open extends Command {
  constructor() {
    super("open", "open takes only one parameter");
  }
    /**
   * open file in new tab if command input is valid otherwise invoke displayErrorMessage
   * @param {Tree} filesystem reference to Tree representing current file structure
   * @param {string[]} command command with all parameter
   */
  execute(filesystem, command) {
    if (command.length != 2) {
      this.errorMessage = "open takes only one parameter";
      this.displayErrorMessage();
      return;
    } else {
      let found = false;
      for (let i = 0; i < filesystem.pwd.files.length; i++) {
        if (filesystem.pwd.files[i][0] == command[1]) {
          window.open(filesystem.pwd.files[i][1], "_blank");
          found = true;
          break;
        }
      }
      for (let i = 0; found == false && i < filesystem.pwd.children.length; i++) {
        if (filesystem.pwd.children[i].name == command[1]) {
          window.open(filesystem.pwd.children[i].link, "_target");
          found = true;
          break;
        }
      }
      if (found == false) {
        this.errorMessage = "invalid parameter";
        this.displayErrorMessage();
      }
    }
  }
}
/**
 * change the present working directory
 * @extends Command
 */
class Cd extends Command {
  constructor() {
    super("cd", "");
  }
  /**
   * Change present working directory if command is valid ottherwise invoke displayErrorMessage method;
   * @param {Tree} filesystem reference to Tree representing current file structure
   * @param {string[]} command command with all parameter
   */
  execute(filesystem, command) {
    if (command.length != 2) {
      this.errorMessage = "cd takes only one parameter.";
      this.displayErrorMessage();
      return;
    }
    let path = command[1].trim().split('/');
    console.log(path);
    let current_path = filesystem.pwd;
    for (let i = 0; i < path.length; i++) {
      if (path[i] == "." || path[i] == "") continue;
      else if (path[i] == "..") {
        if (current_path.parent == null) {
          this.errorMessage = "Wrong path";
          this.displayErrorMessage();
          return;
        } else {
          current_path = current_path.parent;
        }
      } else {
        let found = false;
        for (let j = 0; j < current_path.children.length; j++) {
          if (current_path.children[j].name == path[i]) {
            found = true;
            current_path = current_path.children[j];
            break;
          }
        }
        if (found == false) {
          this.errorMessage = "Wrong path";
          this.displayErrorMessage();
          return;
        }
      }
    }
    filesystem.pwd = current_path;
  }
}
/**
 * Display present working directory
 * @extends Command
 */
class Pwd extends Command {
  constructor() {
    super("pwd", "pwd does not take any paramter.");
  }
  /**
   * Display present working directory path if command is valid otherwise invoke displayErrorMessage method
   * @param {Tree} filesystem reference to Tree representing current file structure
   * @param {string[]} command command with all parameter
   */
  execute(filesystem, command) {
    if (command.length != 1) {
      this.displayErrorMessage();
      return;
    }
    let path = [];
    let current_path = filesystem.pwd;
    while (current_path != null) {
      path.push(current_path.name);
      current_path = current_path.parent;
    }
    let path_string = "root";
    for (let i = path.length - 2; i >= 0; i--) {
      path_string += "/" + path[i];
    }
    let terminal = document.getElementById('web-terminal-window');
    let div = document.createElement('div');
    div.setAttribute('id', 'web-terminal-success-result');
    let p = document.createElement("p");
    p.innerHTML = path_string;
    div.appendChild(p);
    terminal.appendChild(div);
  }
}
/**
 * display one line information about each command supported by web-terminal
 * @extends Command
 */
class Help extends Command {
  constructor() {
    super("help", "help does not take any paramter.");
  }
  /**
   * display one line information about each command supported by web-terminal 
   * if command is valid otherwise invoke displayErrorMessage method
   * @param {Tree} filesystem reference to Tree representing current file structure
   * @param {string[]} command command with all parameter
   */
  execute(filesystem, command) {
    if (command.length != 1) {
      this.displayErrorMessage();
      return;
    }
    let terminal = document.getElementById('web-terminal-window');
    let div = document.createElement('div');
    div.setAttribute('id', 'web-terminal-success-result');
    let p = document.createElement("p");
    p.innerHTML = "cd &nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp; change directory<br>" +
      "help &nbsp;&nbsp;:&nbsp;&nbsp;  show this help window<br>" +
      "ls &nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp; list directory contents<br>" +
      "open &nbsp;&nbsp;:&nbsp;&nbsp; open link in new tab<br>" +
      "pwd &nbsp;&nbsp;&nbsp;:&nbsp;&nbsp; present working directory<br>" +
      "exit &nbsp;&nbsp;:&nbsp;&nbsp; exit the website";
    div.appendChild(p);
    terminal.appendChild(div);
  }
}
/**
 * Exit the website
 * @extends Command
 */
class Exit extends Command {
  constructor() {
    super("exit", "exit does not take any paramter");
  }
  /**
   * Exit the website if command is valid otherwise invoke displayErrorMessage method
   * @param {Tree} filesystem reference to Tree representing current file structure
   * @param {string[]} command command with all parameter
   */
  execute(filesystem, command) {
    if (command.length != 1) {
      this.displayErrorMessage();
    } else {
      window.close();
    }
  }
}
/**
 * Display welcome message and one line information about supported Commands
 */
function welcome() {
  let terminal = document.getElementById('web-terminal-window');
  let div = document.createElement('div');
  div.setAttribute('id', 'web-terminal-success-result');
  let p = document.createElement("p");
  p.innerHTML = "<br>.----------------.<br>| TheMartian0x48 |<br>'----------------'<br>cd &nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp; change directory<br>" +
    "help &nbsp;&nbsp;:&nbsp;&nbsp;  show this help window<br>" +
    "ls &nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp; list directory contents<br>" +
    "open &nbsp;&nbsp;:&nbsp;&nbsp; open link in new tab<br>" +
    "pwd &nbsp;&nbsp;&nbsp;:&nbsp;&nbsp; present working directory<br>" +
    "exit &nbsp;&nbsp;:&nbsp;&nbsp; exit the website";
  div.appendChild(p);
  terminal.appendChild(div);
}

url = document.location + "web-terminal.json";

let terminal = new WebTerminal();
/**
 * fetch JSON data located at location url and 
 * invoked web-terminal.init method then invoke welcome function then invoke 
 * web-terminal.createCommandBox method
 * otherwise display error message if some error happens
 */
fetch(url)
  .then(function (response) {
    return response.json();
  }).then((data) => {
    terminal.init(data);
    welcome();
    terminal.createCommandBox();
  })
  .catch(function (err) {
    let terminal = document.getElementById('web-terminal-window');
    let div = document.createElement('div');
    div.setAttribute('id', 'web-terminal-error-result');
    let p = document.createElement("p");
    p.innerHTML = "Unable to fetch data.";
    div.appendChild(p);
    terminal.appendChild(div);
  });
terminal.addCommand(new Ls());
terminal.addCommand(new Open());
terminal.addCommand(new Cd());
terminal.addCommand(new Pwd());
terminal.addCommand(new Help());
terminal.addCommand(new Exit());