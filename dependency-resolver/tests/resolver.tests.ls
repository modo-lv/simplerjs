... <- describe "DependencyResolver"

it "registers a function and resolves an instance", ->
	dr = new Dr
	class Test
		-> @name = "TestInstance"

	dr.register Test .instance-per-dependency!

	instance = dr.resolve Test

	expect instance .to .have .property "name"
	expect instance.name .to .equal "TestInstance"


it "only creates a lifetime dependency once", ->
	dr = new Dr
	class Test
		-> @value = Math.random!

	dr.register "Test", Test

	x = dr.resolve "Test"
	for from 1 to 4
		expect dr.resolve("Test") .to .equal x


it "calls init function on every new instance", !->
	dr = new Dr <<< initMethodName: "init"

	stub = sinon.spy!

	class Test
		-> @init = stub

	dr.register "Test", Test .instancePerDependency!

	for from 1 to 3
		dr.resolve "Test"

	expect stub.callCount .to .equal 3


it "only calls init function once on a lifetime dependency", ->
	dr = new Dr <<< initMethodName: "init"

	stub = sinon.spy!

	class Test
		-> @init = stub

	dr.register "Test", Test

	for from 1 to 5
		dr.resolve "Test"

	expect stub.callCount .to .equal 1


it "resolves function with custom parameters", ->
	class Test
		(@dr, @id, @name) ->
			@number = 12

	dr = new Dr

	dr.register Test .instancePerDependency!

	instance = dr.prepare Test .addArguments 1, "One" .resolve!

	expect instance.dr .to .equal dr
	expect instance.id .to .equal 1
	expect instance.name .to .equal "One"
	expect instance.number .to .equal 12


it "handles registerAll() calls with arrayed arguments", ->
	class Test1
	class Test2
		(@dr) ->

	dr = new Dr

	dr.registerAll [Test1, Test2]

	instance = dr.resolve Test2

	expect instance.dr .to .equal dr


it "correctly finds dependency keys", ->
	dr = new Dr

	expect dr._keyOf "Test1" .to .equal '"Test1"'
	expect dr._keyOf -> .to .be .a 'function'
	expect dr._keyOf a:1,b:2 .to .equal '{"a":1,"b":2}'


it "correctly handles resolve() with string key", ->
	dr = new Dr

	dr.register "Test", (@dr) ->
	inst = dr.resolve "Test"

	expect inst .to .be .an 'object'
	expect inst.dr .to .equal dr


it "correctly handles resolveAll() with string keys", ->
	dr = new Dr

	dr.registerAll [
		["Test", (@dr)->]
	]

	inst = dr.resolve "Test"

	expect inst .to .be .an 'object'
	expect inst.dr .to .equal dr


it "handles lifetime instances", ->
	dr = new Dr

	func = -> @a = 50

	reg = dr.register func

	expect reg.instance.type .to .equal "lifetime"

	inst = dr.resolve func

	expect inst.a .to .equal 50


it "handles register() with provided keys", ->
	dr = new Dr
	dr.register "Test1", -> @.value = 1
	dr.registerAll [
		["Test2", -> @.value = 2]
		["Test3", -> @.value = 3]
	]

	instances = [
		dr.resolve "Test1"
		dr.resolve "Test2"
		dr.resolve "Test3"
	]

	expect instances.0.value .to .equal 1
	expect instances.1.value .to .equal 2
	expect instances.2.value .to .equal 3


it "throws correct error on missing key", ->
	dr = new Dr

	expect(-> dr.resolve "INotExist").to.Throw("Dependency not registered: \"INotExist\"")


it "handles resolveAll() without errors", ->
	dr = new Dr

	dr.registerAll [
		["Test1", -> @x = 12]
		["Test2", -> @x = 34]
	]

	result = dr.resolveAll ["Test1" "Test2"]

	expect result.0.x .to .equal 12
	expect result.1.x .to .equal 34


it "throws the right error on trying to instantiate non-function", ->
	dr = new Dr
	dr.register "ITest", {}

	expect (-> dr.resolve "ITest") .to .throw "Cannot create an instance of non-function: \"ITest\""


it "calls init method when set", ->
	dr = new Dr! <<< initMethodName: "_init"

	stub = sinon.spy!

	dr.register "Test", -> @_init = stub; @

	x = dr.resolve "Test"

	expect stub.called .to.equal true


/**
* newLifetime() creates a new copy with the same config but no instances
*/
it "newLifetime() creates a correct copy", ->
	dr = new Dr <<< initMethodName: "initMethod"

	dr.register "Test", -> @val = 12; @

	obj1 = dr.resolve "Test"

	dr2 = dr.newLifetime!

	for key, reg of dr._registry
		for k, val of reg
			expect val, "_registry.#{key}.#{k}" .to .equal dr2._registry[key][k]

	expect dr2._instances .to .be .empty
	expect dr2.initMethodName .to .equal dr.initMethodName
		.and .to .equal "initMethod"


/**
* newLifetime() should not copy over methods (since they're bound to an instance)
*/
it "newLifetime() shouldn't copy methods", !->
	dr1 = new Dr
	dr2 = dr1.newLifetime!

	for own name, property of dr2 when typeof property == 'function'
		expect property, name .to .not .equal dr1[name]


it "throws error on circular dependencies", !->
	dr = new Dr

	dr.register "Test1", class Test1
		($dr) -> $dr.resolve "Test2"

	dr.register "Test2", class Test2
		($dr) -> $dr.resolve "Test1"

	expect (-> dr.resolve "Test1") .to .throw "Circular dependency"


it "uses require() to resolve deps with relevant config", !->
	dr = new Dr

	dr.registerRequire "Test1", "mocha"

	dr.register "Test2", "chai"
		.resolve.withRequire = true

	dr._require = sinon.spy!

	dr.resolveAll "Test1", "Test2"

	expect dr._require.callCount .to .equal 2