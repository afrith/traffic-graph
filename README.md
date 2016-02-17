traffic-graph
=============

This is a service which regularly checks the [Google Directions API](https://developers.google.com/maps/documentation/directions/intro) for the driving duration (with traffic) between two addresses, and plots it on a live graph.

Deployment
----------

You need node.js and mongo. Then you must set some environment variables before running the service, to specify your Google API key, the origin and destination locations, and the URI of your mongo database. For example:

```
export API_KEY=no_I_am_not_going_to_give_you_my_key
export ORIGIN="21 Wolfe Street, Wynberg, Cape Town"
export DESTINATION="27 Mechau Street, Cape Town"
export MONGO_URL=mongodb://localhost/traffic-graph
```

If you deploy behind a reverse proxy, optimally the proxy should support WebSockets ([see here](http://nginx.org/en/docs/http/websocket.html) for instructions for nginx).
