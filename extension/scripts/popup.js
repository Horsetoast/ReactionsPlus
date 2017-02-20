'use strict';

function logout() {
  chrome.runtime.sendMessage({action: 'logout'});
}

function login() {
  chrome.runtime.sendMessage({action: 'login'});
}

function debug() {
  chrome.runtime.sendMessage({action: 'debug'});
}

var logoutBtn = document.getElementById('logout');
logoutBtn.addEventListener('click', logout);

var loginBtn = document.getElementById('login');
loginBtn.addEventListener('click', login);

var debugBtn = document.getElementById('debug');
debugBtn.addEventListener('click', debug);
