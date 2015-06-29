/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

$Promise = function(state) {
  this.state = state;
  this.handlerGroups = [];
};


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


$Promise.prototype.then = function(successHandler, failureHandler) {
  this.handlerGroups.push( {
    successCb: successHandler,
    errorCb: failureHandler,
    forwarder: new Deferral()

  });
  if (typeof successHandler !== "function") this.handlerGroups[this.handlerGroups.length-1].successCb = undefined;
  if (typeof failureHandler !== "function") this.handlerGroups[this.handlerGroups.length-1].errorCb = undefined;
  if(this.state !== 'pending'){
     this.callHandlers();
  }
  
};

$Promise.prototype.catch = function(errFn){
  return this.then(null, errFn)
}


Deferral = function() {
  this.$promise = new $Promise('pending');

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