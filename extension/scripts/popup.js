'use strict';

function logout() {
  chrome.runtime.sendMessage({action: 'logout'});
}

function login() {
  chrome.runtime.sendMessage({action: 'login'});
}

var logoutBtn = document.getElementById('logout');
logoutBtn.addEventListener('click', logout);

var loginBtn = document.getElementById('login');
loginBtn.addEventListener('click', login);
