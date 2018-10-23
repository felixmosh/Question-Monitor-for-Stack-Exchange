// Copyright 2014 Google Inc. All Rights Reserved.

/**
 * @fileoverview View logic for the Stack Track popup page.
 * @author smus@google.com (Boris Smus)
 * @author e.bidelman@google.com (Eric Bidelman)
 */

// Get background page.
const background = chrome.extension.getBackgroundPage();
const st = background.st;
const questionList = background.questionList;

/**
 * Establish the popup namespace.
 */
st.popup = st.popup || {};

/**
 * @constructor
 * Top level view in the popup.
 */
st.popup.PopupView = function () {
  this.questionList = questionList;
  this.questionListView = new st.popup.QuestionListView(questionList);

  // Setup event handlers.
  this.handlers = {
    archive: this.archiveRead,
    refresh: this.refresh,
    next: this.goNext,
    prev: this.goPrev,
    options: this.openOptions,
    markAsRead: this.markAsRead,
    archiveWithAnswers: this.archiveWithAnswers
  };

  Object.keys(this.handlers).forEach((id) => {
    document.getElementById(id).addEventListener('click', () => {
      this.handlers[id].call(this);
    });
  });

  /* Keyevent for prev & next page navigation */
  document.addEventListener('keyup', (e) => {
    if (e.keyCode === 37) { // left
      this.handlers.prev.call(this);
    }
    if (e.shiftKey && e.keyCode === 39) { // right
      this.handlers.markAsRead.call(this);
      this.handlers.archive.call(this);
    } else if (e.keyCode === 39) { // right
      this.handlers.next.call(this);
    }
  });
};

/**
 * Renders the popup view.
 */
st.popup.PopupView.prototype.render = function () {
  this.questionListView.render();
  document.getElementById('markAsRead').classList.toggle('hidden');
  document.getElementById('archiveWithAnswers').classList.toggle('hidden');
};

/**
 * Archive all of the questions marked as read.
 */
st.popup.PopupView.prototype.archiveRead = function () {
  const count = this.questionList.getQuestionCount(st.State.READ);
  this.questionList.archiveRead();
  const newCount = this.questionList.getQuestionCount(st.State.READ);
  this.questionListView.setPage(0);
  this.questionListView.render();
  const diff = count - newCount;
  if (diff) {
    this.notify_(`Archived ${diff} read questions.`);
  } else {
    this.notify_('No read questions to archive.');
  }
};

/**
 * Mark all of the questions on this page as read.
 */
st.popup.PopupView.prototype.refresh = function () {
  this.questionList.update();
  this.notify_('Fetched latest questions from Stack Exchange.');
};

/**
 * Go to the previous page.
 */
st.popup.PopupView.prototype.goPrev = function () {
  this.questionListView.prev();
  this.questionListView.render();
};


/**
 * Go to the next page.
 */
st.popup.PopupView.prototype.goNext = function () {
  this.questionListView.next();
  this.questionListView.render();
};

/**
 * Load the options page.
 */
st.popup.PopupView.prototype.openOptions = function () {
  window.open('options.html');
};

st.popup.PopupView.prototype.markAsRead = function () {
  const questions = this.questionListView.getQuestionsOnPage();
  this.questionList.markRead(questions);
  this.questionListView.render();
};

st.popup.PopupView.prototype.archiveWithAnswers = function () {
  this.questionList.archiveWithAnswers();
  this.questionListView.render();
};

/**
 * @private
 * Show a temporary butterbar.
 * @param {string} message The message to display.
 */
st.popup.PopupView.prototype.notify_ = function (message) {
  const butterBar = document.querySelector('#butterbar');
  butterBar.querySelector('p').innerText = message;
  butterBar.classList.add('shown');
  setTimeout(() => {
    butterBar.classList.remove('shown');
  }, 2000);
};
