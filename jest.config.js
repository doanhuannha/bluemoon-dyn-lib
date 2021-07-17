module.exports = {
    transform: {
        '\\.[jt]sx?$': 'ts-jest'
    },
    transformIgnorePatterns: [
        '/node_modules/', '/dist/', '/coverage/'
    ],
    collectCoverageFrom: [
        '<rootDir>/src/**/*.{ts,tsx,js}'
    ],
    coveragePathIgnorePatterns: [
        "/src/index.ts"
    ],
    testPathIgnorePatterns: [
        '/node_modules/', '/dist/', '/coverage/'
    ]
}

