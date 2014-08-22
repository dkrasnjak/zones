
var reporters = {};

Zone.Reporters = {};

Zone.Reporters.get = function(name) {
  return name ? reporters[name] : reporters;
};

Zone.Reporters.add = function(name, reporter) {
  reporters[name] = reporter;
};

Zone.Reporters.remove = function(name) {
  delete reporters[name];
};

Zone.Reporters.removeAll = function(name) {
  reporters = {};
};

Zone.Reporters.run = function(zone) {
  for(var name in reporters) {
    reporters[name](zone);
  }
};

/*
 * Register default reporter
 */

Zone.Reporters.longStackTrace = function (zone) {
  var trace = [];
  var currZone = zone;
  var prevZone;
  var totalAsyncTime = 0;

  trace.push("Error: " + zone.erroredStack._e.message);
  trace.push(zone.erroredStack.get());

  processZone();
  
  function processZone() {
    if(currZone && currZone.currentStack) {
      var asyncTime = currZone.runAt - currZone.createdAt;
    
      if(prevZone) {
        // sometimes, there are gaps betweens zones
        // specially when handling with CPU intensive tasks and
        // with handling maxDepth
        var diff = prevZone.createdAt - currZone.runAt;
        asyncTime += diff;
      }

      if(asyncTime && asyncTime > 0) {
        totalAsyncTime += asyncTime;
        trace.push('\n> Before: ' + totalAsyncTime + 'ms (diff: ' + asyncTime + 'ms)');
      }

      trace.push(currZone.currentStack.get());
      prevZone = currZone;
      currZone = currZone.parent;
      
      setTimeout(processZone, 0);
    } else {
      console.log(trace.join('\n'));
    }
  }
}

Zone.Reporters.add('longStackTrace', Zone.Reporters.longStackTrace);
