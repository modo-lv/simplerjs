// Generated by LiveScript 1.3.1
(function(){
  var DependencyConfig, DependencyResolution, DependencyResolver;
  DependencyConfig = require("./DependencyConfig");
  DependencyResolution = require("./DependencyResolution");
  if (typeof module != 'undefined' && module !== null) {
    module.exports = DependencyResolver = (function(){
      DependencyResolver.displayName = 'DependencyResolver';
      var prototype = DependencyResolver.prototype, constructor = DependencyResolver;
      prototype._registry = {};
      prototype._instances = {};
      function DependencyResolver(){
        this.newLifetime = bind$(this, 'newLifetime', prototype);
        this.getConfigFor = bind$(this, 'getConfigFor', prototype);
        this.prepare = bind$(this, 'prepare', prototype);
        this.resolveAll = bind$(this, 'resolveAll', prototype);
        this.resolve = bind$(this, 'resolve', prototype);
        this.registerAll = bind$(this, 'registerAll', prototype);
        this.register = bind$(this, 'register', prototype);
        this._new = bind$(this, '_new', prototype);
        /**
        * Registered dependencies
        */
        this._registry = {};
        /**
        * Created instances
        */
        this._instances = {};
      }
      /**
      * Set to a string to call this method on every newly created instance.
      */
      prototype.initMethodName = null;
      /**
      * Get the dependency registration name (key) for an object
      */
      prototype._keyFor = function(target){
        if (typeof target === "function") {
          return target;
        } else {
          return JSON.stringify(target);
        }
      };
      /**
      * Create a new instance of a given function.
      * New instance will have a property "_dr" that is set to this dependency resolver.
      * @param {Function} func - Function to create new instance of
      * @param {Array} args - Arguments to pass to the constructor
      */
      prototype._new = function(func, args){
        var x$, ref$;
        x$ = new (ref$ = function(a){
          return func.apply(this, a);
        }, ref$.prototype = func.prototype, ref$)(args);
        x$._dr = this;
        return x$;
      };
      /**
      * Register a new dependency. There are several ways this function can be called:
      * 1. register(object) - registers an object/function using itself as the key
      * 2. register(key, object) - registers an object/function using "key" as the key
      * @param {String|Object|Function} key - String key of the object. Can be object itself.
      * @param {Object|Function} Object or function to register. Only needed if "key" is provided.
      * @return {Object} Dependency configuration object for further dependency customization.
      */
      prototype.register = function(key, target){
        if (target == null) {
          target = key;
          key = null;
        }
        if (target == null) {
          throw new Error("Can't register " + target + " as a dependency.");
        }
        key = this._keyFor(key != null ? key : target);
        if (this._registry[key] != null) {
          throw new Error("Dependency already registered: " + key);
        }
        return this._registry[key] = new DependencyConfig(target);
      };
      /**
      * Interprets arrays as register() calls, instead of dependencies.
      * Lets you use syntax like registerAll([dependency1, [key2, dependency2]]).
      * Will cause unpredictable results if used to register arrays as dependencies.
      * @param {Array} targets - Array containing dependency registrations.
      * @return {Array} An array of DependencyConfiguration-s for each registered dep.
      */
      prototype.registerAll = function(targets){
        var results, i$, len$, target, result;
        results = [];
        for (i$ = 0, len$ = targets.length; i$ < len$; ++i$) {
          target = targets[i$];
          if (target.constructor === Array && target.length === 2) {
            result = this.register(target[0], target[1]);
          } else {
            result = this.register(target);
          }
          results.push(result);
        }
        return results;
      };
      /**
      * Resolve a dependency.
      * Target can be a string key or an object.
      * @param {Object} Dependency "class".
      * @returns {Object} Instance
      */
      prototype.resolve = function(target){
        var ref$, args, key, config, instance;
        if (target.constructor.displayName === DependencyResolution.displayName) {
          ref$ = [target.arguments, target.obj], args = ref$[0], target = ref$[1];
        }
        key = this._keyFor(target);
        config = this._registry[key];
        if (config == null) {
          throw new Error("Dependency not registered: " + key);
        }
        target = config.obj;
        if (config.instance.type === "none") {
          return target;
        }
        if (config.instance.type === "lifetime") {
          instance = this._instances[key];
        }
        if (instance == null) {
          if (typeof target !== 'function') {
            throw new Error("Cannot create an instance of non-function: " + key);
          }
          instance = this._new(target, args);
          if (config.instance.type === "lifetime") {
            this._instances[key] = instance;
          }
          config.beforeInit(instance);
          if (this.initMethodName != null && typeof instance[this.initMethodName] === 'function') {
            instance[this.initMethodName]();
          }
        }
        return instance;
      };
      /**
      * Call resolve() on an array of targets and return an array of resolved objects.
      */
      prototype.resolveAll = function(targets){
        var results, i$, len$, target;
        results = [];
        for (i$ = 0, len$ = targets.length; i$ < len$; ++i$) {
          target = targets[i$];
          results.push(this.resolve(target));
        }
        return results;
      };
      /**
      * Prepare for a resolution.
      * Use to configure a resolution before executing it, for example, to add constructor parameters.
      * @params {Object|String} target - Target dependency to prepare the resolution of
      * @return {DependencyResolution} Resolution configuration object.
      */
      prototype.prepare = function(target){
        return new DependencyResolution(this, target);
      };
      /**
      * Get dependency configuration for a given target
      */
      prototype.getConfigFor = function(target){
        return this._registry[this._keyFor(target)];
      };
      /**
      * Create a new instance of DependencyResolver with the same configuration
      */
      prototype.newLifetime = function(){
        var newLife, name, prop, ref$, key, val, own$ = {}.hasOwnProperty;
        newLife = new DependencyResolver;
        for (name in this) if (own$.call(this, name)) {
          prop = this[name];
          if (prop === null || ((ref$ = typeof prop) === 'string' || ref$ === 'number' || ref$ === 'undefined')) {
            newLife[name] = prop;
          }
        }
        for (key in ref$ = this._registry) {
          val = ref$[key];
          newLife._registry[key] = import$({}, val);
        }
        return newLife;
      };
      return DependencyResolver;
    }());
  }
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
