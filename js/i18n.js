function I18n() {
  this.locale = this.detectLocale();
  this.translations = {};
  this.ready = false;
}

I18n.prototype.detectLocale = function () {
  // URL parameter takes priority
  var match = window.location.search.match(/[?&]lang=([a-zA-Z\-]+)/);
  if (match) return match[1].split("-")[0].toLowerCase();

  // Then localStorage
  try {
    var stored = window.localStorage.getItem("2048-locale");
    if (stored) return stored;
  } catch (e) {}

  // Then browser language
  var nav = navigator.language || navigator.userLanguage || "en";
  return nav.split("-")[0].toLowerCase();
};

I18n.prototype.load = function (callback) {
  var self = this;

  var done = function () {
    self.ready = true;
    self.apply();
    if (callback) callback();
  };

  var xhr = new XMLHttpRequest();
  xhr.open("GET", "locales/" + this.locale + ".json", true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      try {
        self.translations = JSON.parse(xhr.responseText);
      } catch (e) {
        console.warn("I18n: failed to parse locale file for '" + self.locale + "'");
      }
      done();
    } else if (self.locale !== "en") {
      // Locale file not found, fall back to English
      self.locale = "en";
      self.load(callback);
    } else {
      // Even English failed — proceed with HTML defaults
      done();
    }
  };
  xhr.onerror = function () {
    // Network error — proceed with HTML defaults
    done();
  };
  xhr.send();
};

I18n.prototype.t = function (key) {
  return this.translations[key] || key;
};

I18n.prototype.apply = function () {
  var self = this;

  // Translate elements with data-i18n (sets innerHTML)
  var elements = document.querySelectorAll("[data-i18n]");
  for (var i = 0; i < elements.length; i++) {
    var key = elements[i].getAttribute("data-i18n");
    var translation = self.translations[key];
    if (translation) {
      elements[i].innerHTML = translation;
    }
  }

  // Translate data-label attributes (for CSS pseudo-element content)
  var labelElements = document.querySelectorAll("[data-i18n-label]");
  for (var j = 0; j < labelElements.length; j++) {
    var labelKey = labelElements[j].getAttribute("data-i18n-label");
    var labelTranslation = self.translations[labelKey];
    if (labelTranslation) {
      labelElements[j].setAttribute("data-label", labelTranslation);
    }
  }

  // Update html lang attribute
  document.documentElement.setAttribute("lang", self.locale);
};

I18n.prototype.setLocale = function (locale) {
  this.locale = locale;
  try {
    window.localStorage.setItem("2048-locale", locale);
  } catch (e) {}
  this.translations = {};
  this.ready = false;
  this.load();
};
