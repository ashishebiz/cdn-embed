"use strict";
(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => (x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected));
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/index.ts
  function fetchData() {
    return __async(this, null, function* () {
      const response = yield fetch("https://jsonplaceholder.typicode.com/posts");
      return yield response.json();
    });
  }
  function startPolling() {
    setInterval(
      () =>
        __async(null, null, function* () {
          try {
            const data = yield fetchData();
            console.log("Polled data:", data);
          } catch (err) {
            console.log("Polling error:", err);
          }
        }),
      5e3,
    );
  }
  (function main() {
    return __async(this, null, function* () {
      try {
        console.log("CDN script loaded 007");
        const response = yield fetchData();
        console.log("Initial API response:", response);
        startPolling();
      } catch (error) {
        console.log("Error initializing script", error);
      }
    });
  })();
})();
