# tunyan
A command-line tool to transform bunyan logs (or any ndjson stream).

##Install
```sh
  npm install -g tunyan
```

## Usage
```sh
  node server.js | tunyan <formatterFilePath> | bunyan
```

### Input
**formatterFilePath** - formatter is simply a nodejs module which returns a **function** of the following format:
```js
  function formatter(logObj) {
    // logObj is the bunyan (or any json parsed) object
    ...
    // transform logObj
    ...
    return logObj;
  }
    
  module.exports = formatter;
```

### The real power of tunyan is when you can save anything you like in your logs and then transform them for custom viewing

### Typical Use Case
We are using **tunyan** mainly to suppress certain fields and customize msg in bunyan logs for viewing.

Let's say your logs look like this:
```sh
  node test.js
  {"name":"myApp","hostname":"myHost","pid":7760,"level":30,"type":"rest","url":"http://blah.com/1b95f96c-6ba0-332a-b9d1-ab059d0a6d0f.json","method":"GET","duration":1439,"msg":"some rest message","someField":"not for viewing, but can be used for some analysis","time":"2016-05-12T09:49:51.444Z","v":0}
  {"name":"myApp","hostname":"myHost","pid":7760,"level":30,"type":"done","url":"/1b95f96c-6ba0-332a-b9d1-ab059d0a6d0f/address","method":"GET","service":"address service","duration":1540,"msg":"some done message","someField":"not for viewing, but can be used for some analysis","time":"2016-05-12T09:49:52.444Z","v":0}
  {"name":"myApp","hostname":"myHost","pid":7760,"level":30,"type":"rest","url":"http://blah.com/all.json","method":"GET","duration":1890,"msg":"some rest message","someField":"not for viewing, but can be used for some analysis","time":"2016-05-12T09:49:55.444Z","v":0}

```
With bunyan CLI (with some colors of-course)
```sh
  node test.js | bunyan -o short
  09:49:51.444Z  INFO myApp: some rest message (type=rest, method=GET, duration=1439, someField="not for viewing, but can be used for some analysis")
    url: http://blah.com/1b95f96c-6ba0-332a-b9d1-ab059d0a6d0f.json
  09:49:52.444Z  INFO myApp: some done message (type=done, url=/1b95f96c-6ba0-332a-b9d1-ab059d0a6d0f/address, method=GET, service="address service", duration=1540, someField="not for viewing, but can be used for some analysis")
  09:49:55.444Z  INFO myApp: some rest message (type=rest, url=http://blah.com/all.json, method=GET, duration=1890, someField="not for viewing, but can be used for some analysis")
```
Now lets have a tunyan formatter (formatter.js)
```js
  function formatter(logObject) {
    switch (logObject.type) {
        case 'rest':
            logObject.msg += ' : ' + logObject.method + ' ' + logObject.url + ' in ' + logObject.duration + 'ms';
            delete logObject.url;
            delete logObject.method;
            delete logObject.duration;
            break;
        case 'done':
            logObject.msg = logObject.service + ' : ' + logObject.msg;
            // we donot want to view these fields
            delete logObject.url;
            delete logObject.method;
            delete logObject.duration;
            break;
    }

    // we also want to suppress this field
    delete logObject.someField;
    return logObject;
  }

  module.exports = formatter;
```
Your log with tunyan
```sh
  node test.js | tunyan formatter.js 
  {"name":"myApp","hostname":"myHost","pid":7760,"level":30,"type":"rest","msg":"some rest message : GET http://blah.com/1b95f96c-6ba0-332a-b9d1-ab059d0a6d0f.json in 1439ms","time":"2016-05-12T09:49:51.444Z","v":0}
  {"name":"myApp","hostname":"myHost","pid":7760,"level":30,"type":"done","service":"address service","msg":"address service : some done message","time":"2016-05-12T09:49:52.444Z","v":0}
  {"name":"myApp","hostname":"myHost","pid":7760,"level":30,"type":"rest","msg":"some rest message : GET http://blah.com/all.json in 1890ms","time":"2016-05-12T09:49:55.444Z","v":0}
```
Now with bunyan CLI
```sh
  09:49:51.444Z  INFO myApp: some rest message : GET http://blah.com/1b95f86c-6ba0-332a-b9d1-ab059d0a6d0f.json in 1439ms (type=rest)
  09:49:52.444Z  INFO myApp: address service : some done message (type=done, service="address service")
  09:49:55.444Z  INFO myApp: some rest message : GET http://blah.com/all.json in 1890ms (type=rest)
```
And you can have any number of formatters as you like to see different kinds of outputs :)

