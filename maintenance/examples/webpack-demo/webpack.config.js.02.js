module.exports = {
  //mode: 'none',
  output: {
		module: true,
    library: {
        type: "module"
    }
	},
	optimization: {
		usedExports: true,
		concatenateModules: true
	},
	experiments: {
		outputModule: true
	}
};