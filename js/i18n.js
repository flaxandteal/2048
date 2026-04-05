// Semantic tag vocabulary for translatable strings.
// Translators preserve these tags verbatim; real HTML (URLs, classes,
// attributes) lives here so it stays out of the locale files.
var I18N_TAGS = {
  "note":          ['<strong class="important">', "</strong>"],
  "emph":          ["<strong>", "</strong>"],
  "official-site": ['<a href="http://git.io/2048">', "</a>"],
  "author":        ['<a href="http://gabrielecirulli.com" target="_blank">', "</a>"],
  "source":        ['<a href="https://itunes.apple.com/us/app/1024!/id823499224" target="_blank">', "</a>"],
  "inspiration":   ['<a href="http://asherv.com/threes/" target="_blank">', "</a>"]
};

function expandI18nTags(str) {
  for (var tag in I18N_TAGS) {
    if (!I18N_TAGS.hasOwnProperty(tag)) continue;
    var esc = tag.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    str = str.replace(new RegExp("<" + esc + ">", "g"), I18N_TAGS[tag][0]);
    str = str.replace(new RegExp("</" + esc + ">", "g"), I18N_TAGS[tag][1]);
  }
  return str;
}

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
  var value = this.translations[key];
  return value ? expandI18nTags(value) : key;
};

I18n.prototype.apply = function () {
  var self = this;

  // Translate elements with data-i18n (sets innerHTML)
  var elements = document.querySelectorAll("[data-i18n]");
  for (var i = 0; i < elements.length; i++) {
    var key = elements[i].getAttribute("data-i18n");
    var translation = self.translations[key];
    if (translation) {
      elements[i].innerHTML = expandI18nTags(translation);
    }
  }

  // Translate data-label attributes (for CSS pseudo-element content)
  var labelElements = document.querySelectorAll("[data-i18n-label]");
  for (var j = 0; j < labelElements.length; j++) {
    var labelKey = labelElements[j].getAttribute("data-i18n-label");
    var labelTranslation = self.translations[labelKey];
    if (labelTranslation) {
      labelElements[j].setAttribute("data-label", expandI18nTags(labelTranslation));
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
