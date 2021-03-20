

module.exports = (app) => {
  app.handle('rollups.list')
}

async function listRollups(data, send, next) {
  const rollups = [
    {
      name: 'Zkopru',
      description: 'An optimistic privacy rollup',
      rollupType: 'optimistic',
      website: 'https://zkopru.network',
      deployments: [
        {
          network: 6,
          address: '0xcdd5c38a39fdc9c77fe3a72998d34c8ce99d2d34',
        }
      ]
    },
    {
      name: 'Fuel',
      description: 'An optimstic rollup for sending and exchanging tokens',
      rollupType: 'optimistic',
      website: 'https://fuel.sh',
      deployments: [
        {
          network: 1,
          address: '0x6880f6fd960d1581c2730a451a22eed1081cfd72',
        }
      ]
    },
    {
      name: 'ZKSync',
      description: 'A zk rollup for sending Ether and tokens',
      rollupType: 'zk',
      website: 'https://zksync.io',
      deployments: [
        {
          network: 1,
          address: '0xabea9132b05a70803a4e85094fd0e1800777fbef',
        }
      ]
    }
  ]
  send(rollups)
}
