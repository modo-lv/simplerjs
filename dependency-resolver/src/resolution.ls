class DependencyResolution
	/**
	* Owner DependencyResolver.
	*/
	dr: null

	/**
	* Object to resolve
	*/
	obj: null


	(@dr, @obj) ->
		@arguments = []


	addArguments: (...args) ~>
		@arguments ++= args
		return this


	resolve: ~> @dr.resolve this


	/**
	* Alias for addArguments(...).resolve()
	* @param {...} Arguments to pass to the constructor.
	*/
	createWith: ~> @addArguments ... .resolve!



if module? then module.exports = DependencyResolution