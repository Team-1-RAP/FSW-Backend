module.exports = {
    transform: {
      "^.+\\.js$": "babel-jest",
    },
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1',
    },
    moduleDirectories: ['node_modules', 'src'],
  };
  