/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

$Promise = function() {
  this.state = 'pending';
  this.handlerGroups = [];
};
/*

$Promise.prototype.callHandlers = function(){
  //console.log('typeof ', typeof this.handlerGroups[0].successCb)
  //console.log('state, ', this.state)
  for(var i = this.handlerGroups.length -1; i >= 0 ; i--){
    if(typeof this.handlerGroups[i].successCb === "function" && this.state==='resolved'){    
         var successTempState = this.handlerGroups.shift();
         successTempState.successCb(this.value);
         //console.log(tempState)  
         //this.handlerGroups[i].successCb(this.value)
        //if(this.handlerGroups[i]){
          //return 'some string' //this.handlerGroups[i].forwarder.$promise
        //}
     }
     else if(typeof this.handlerGroups[i].errorCb === "function" && this.state==='rejected'){    
         var failTempState = this.handlerGroups.shift();
         failTempState.errorCb(this.value);
         //console.log(tempState)  
         //this.handlerGroups[i].successCb(this.value)
          //return 'some string'//this.handlerGroups[i].forwarder.$promise
     } 
     if(this.handlerGroups[i]){
          return this.handlerGroups[i].forwarder.$promise
        }
   }

}
*/
$Promise.prototype.callHandlers = function(){
  //var self = this;
  if(this.state === 'pending') return
  var group, handler;
  while(this.handlerGroups.length){
    group = this.handlerGroups.shift();
    handler = (this.state === 'resolved') ? group.successCb : group.errorCb
    if(!handler){
      if(this.state === 'resolved'){
        group.forwarder.resolve(this.value)
      }
      else if(this.state === 'rejected'){
        group.forwarder.reject(this.value)
      }
    }
    else{
      try{
        var output = handler(this.value)
        if(output instanceof $Promise){
          output.then(function(val){
            group.forwarder.resolve(val);
          }, function(err){
            group.forwarder.reject(err);
          })
        }else{
          group.forwarder.resolve(output)
        }
      }catch (err){
        group.forwarder.reject(err)
      }
    }
  }
}

$Promise.prototype.then = function(successHandler, failureHandler) {
  var handlerGroup = {
    successCb: successHandler,
    errorCb: failureHandler,
    forwarder: new Deferral()
  }
  this.handlerGroups.push( handlerGroup );
  if (typeof successHandler !== "function") this.handlerGroups[this.handlerGroups.length-1].successCb = null;
  if (typeof failureHandler !== "function") this.handlerGroups[this.handlerGroups.length-1].errorCb = null;

  this.callHandlers();
  return handlerGroup.forwarder.$promise
  
};

$Promise.prototype.catch = function(errFn){
  return this.then(null, errFn)
}


Deferral = function() {
  this.$promise = new $Promise();

};

var defer = function() {
  return new Deferral();
};

Deferral.prototype.resolve = function(value) {
  if (this.$promise.state === 'pending') {
    this.$promise.state = 'resolved';
    this.$promise.value = value;
  }
  this.$promise.callHandlers();
};

Deferral.prototype.reject = function(value) {
  if (this.$promise.state === 'pending') {
    this.$promise.state = 'rejected';
    this.$promise.value = value;
  }
  this.$promise.callHandlers();
};
/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/