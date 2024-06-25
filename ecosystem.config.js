module.exports = {
    apps: [
        {
            name: 'mp-cors',
            script: 'ts-node-dev',
            args: '--respawn --transpile-only src/server.ts',
            interpreter: 'none',
        },
    ],
};
