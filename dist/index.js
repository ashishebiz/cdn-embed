(() => {
  async function t() {
    return await (
      await fetch("https://jsonplaceholder.typicode.com/posts")
    ).json();
  }
  function n() {
    setInterval(async () => {
      try {
        let o = await t();
        console.log("Polled data:", o);
      } catch (o) {
        console.log("Polling error:", o);
      }
    }, 1e4);
  }
  (async function () {
    try {
      console.log("CDN script loaded");
      let r = await t();
      console.log("Initial API response:", r), n();
    } catch (r) {
      console.log("Error initializing script", r);
    }
  })();
})();
