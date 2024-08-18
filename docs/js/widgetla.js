((w, d, s) => {
    w.liveAPI = (...args) => (w.liveAPI.q = w.liveAPI.q || []).push(args);
    d.head.appendChild(Object.assign(d.createElement("script"), { src: s, async: true }));
  })(window, document, "https://d2q4vn0gqet98u.cloudfront.net/latest/liveapi.js");
    if (typeof window.liveAPI === "function") {
      window.liveAPI("loadwidget", {
        selectors: ['code'],
      });
  };


// ```
// GET
// https://gateway.ridebeam.com/api/idealLocation/latlng

// ---

// _METADATA={"api_name":"/idealLocation/latlng","request_type": "GET","api_description":"Find Parking Spots","api_url": "https://gateway.ridebeam.com/api/idealLocation/latlng"}
// ```
