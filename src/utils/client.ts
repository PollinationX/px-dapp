import axios, { AxiosInstance } from 'axios'
import { pollinationXConfig } from '@/config'
import { configureChains, createClient } from 'wagmi'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Chain } from 'wagmi'
import { fantom } from '@wagmi/core/chains'

const artheraTestnet = {
  id: 10243,
  testnet: true,
  name: 'Arthera Testnet',
  network: 'Arthera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Arthera Testnet',
    symbol: 'AA'
  },
  rpcUrls: {
    public: { http: ['https://rpc-test2.arthera.net/'] },
    default: { http: ['https://rpc-test2.arthera.net/'] }
  },
  blockExplorers: {
    etherscan: { name: 'Arthera Testnet', url: 'https://explorer-test2.arthera.net' },
    default: { name: 'Arthera Testnet', url: 'https://explorer-test2.arthera.net' }
  }
} as const satisfies Chain

const sepolia = {
  id: 11155111,
  testnet: true,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'SEP'
  },
  rpcUrls: {
    public: { http: ['https://eth-sepolia.g.alchemy.com/v2/zZVxJK0XZZZIOH1SAOfS9Kz2Q6mqF2OA'] },
    default: { http: ['https://eth-sepolia.g.alchemy.com/v2/zZVxJK0XZZZIOH1SAOfS9Kz2Q6mqF2OA'] }
  },
  blockExplorers: {
    etherscan: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' }
  }
} as const satisfies Chain

const immu3Testnet = {
  id: 3100,
  testnet: true,
  name: 'Immu3 EVM TestNet',
  network: 'Immu3 EVM TestNet',
  nativeCurrency: {
    decimals: 18,
    name: 'IMMU',
    symbol: 'IMMU'
  },
  rpcUrls: {
    public: { http: ['https://fraa-flashbox-2800-rpc.a.stagenet.tanssi.network/'] },
    default: { http: ['https://fraa-flashbox-2800-rpc.a.stagenet.tanssi.network/'] }
  },
  blockExplorers: {
    etherscan: {
      name: 'Immu3 EVM TestNet',
      url: 'https://evmexplorer.tanssi-chains.network/?rpcUrl=https%3A%2F%2Ffraa-flashbox-2800-rpc.a.stagenet.tanssi.network'
    },
    default: {
      name: 'Immu3 EVM TestNet',
      url: 'https://evmexplorer.tanssi-chains.network/?rpcUrl=https%3A%2F%2Ffraa-flashbox-2800-rpc.a.stagenet.tanssi.network'
    }
  }
} as const satisfies Chain

const oasisSapphireTestnet = {
  id: 23295,
  testnet: true,
  name: 'Oasis Sapphire Testnet',
  network: 'Oasis Sapphire Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'oasisSapphireTEST',
    symbol: 'oasisSapphireTEST'
  },
  rpcUrls: {
    public: { http: ['https://testnet.sapphire.oasis.dev/'] },
    default: { http: ['https://testnet.sapphire.oasis.dev/'] }
  },
  blockExplorers: {
    etherscan: { name: 'Oasis Sapphire Testnet', url: 'https://testnet.explorer.sapphire.oasis.dev' },
    default: { name: 'Oasis Sapphire Testnet', url: 'https://testnet.explorer.sapphire.oasis.dev' }
  }
} as const satisfies Chain

const oasisSapphireMainnet = {
  id: 23294,
  testnet: false,
  name: 'Oasis Sapphire',
  network: 'Oasis Sapphire',
  nativeCurrency: {
    decimals: 18,
    name: 'ROSE',
    symbol: 'ROSE'
  },
  rpcUrls: {
    public: { http: ['https://sapphire.oasis.io/'] },
    default: { http: ['https://sapphire.oasis.io/'] }
  },
  blockExplorers: {
    etherscan: { name: 'Oasis Sapphire', url: 'https://explorer.sapphire.oasis.io' },
    default: { name: 'Oasis Sapphire', url: 'https://explorer.sapphire.oasis.io' }
  }
} as const satisfies Chain

const metisSepoliaTestnet = {
  id: 59902,
  testnet: true,
  name: 'Metis Sepolia Testnet',
  network: 'Metis Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tMETIS',
    symbol: 'tMETIS'
  },
  rpcUrls: {
    public: { http: ['https://sepolia.metisdevops.link/'] },
    default: { http: ['https://sepolia.metisdevops.link/'] }
  },
  blockExplorers: {
    etherscan: { name: 'Metis Sepolia Testnet', url: 'https://sepolia-explorer.metisdevops.link/' },
    default: { name: 'Metis Sepolia Testnet', url: 'https://sepolia-explorer.metisdevops.link/' }
  }
} as const satisfies Chain

const beresheetEVM = {
  id: 2022,
  testnet: true,
  name: 'BeresheetEVM',
  network: 'BeresheetEVM',
  nativeCurrency: {
    decimals: 18,
    name: 'TEDG',
    symbol: 'TEDG'
  },
  rpcUrls: {
    public: { http: ['https://beresheet-evm.jelliedowl.net/'] },
    default: { http: ['https://beresheet-evm.jelliedowl.net/'] }
  },
  blockExplorers: {
    etherscan: { name: 'BeresheetEVM Testnet', url: 'https://testnet.edgscan.live' },
    default: { name: 'BeresheetEVM Testnet', url: 'https://testnet.edgscan.live' }
  }
} as const satisfies Chain

const mantleTestnet = {
  id: 5003,
  testnet: true,
  name: 'MantleSepoliaTestnet',
  network: 'MantleSepoliaTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT'
  },
  rpcUrls: {
    public: { http: ['https://rpc.sepolia.mantle.xyz/'] },
    default: { http: ['https://rpc.sepolia.mantle.xyz/'] }
  },
  blockExplorers: {
    etherscan: { name: 'Mantle Sepolia Testnet', url: 'https://explorer.sepolia.mantle.xyz' },
    default: { name: 'Mantle Sepolia Testnet', url: 'https://explorer.sepolia.mantle.xyz' }
  }
} as const satisfies Chain

const zetachainTestnet = {
  id: 7001,
  testnet: true,
  name: 'ZetachainTestnet',
  network: 'ZetachainTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ZETA',
    symbol: 'ZETA'
  },
  rpcUrls: {
    public: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public/'] },
    default: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public/'] }
  },
  blockExplorers: {
    etherscan: { name: 'Zetachain Testnet', url: 'https://explorer.zetachain.com' },
    default: { name: 'Zetachain Testnet', url: 'https://explorer.zetachain.com' }
  }
} as const satisfies Chain

const fantomTestnet = {
  id: 4002,
  testnet: true,
  name: 'FantomTestnet',
  network: 'FantomTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'FTM',
    symbol: 'FTM'
  },
  rpcUrls: {
    public: { http: ['https://rpc.testnet.fantom.network/'] },
    default: { http: ['https://rpc.testnet.fantom.network/'] }
  },
  blockExplorers: {
    etherscan: { name: 'Fantom Testnet', url: 'https://faucet.fantom.network' },
    default: { name: 'Fantom Testnet', url: 'https://faucet.fantom.network' }
  }
} as const satisfies Chain
//
const gnosisTestnet = {
  id: 10200,
  testnet: true,
  name: 'GnosisTestnet',
  network: 'GnosisTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'xDAI',
    symbol: 'xDAI'
  },
  rpcUrls: {
    public: { http: ['https://rpc.chiadochain.net/'] },
    default: { http: ['https://rpc.chiadochain.net/'] }
  },
  blockExplorers: {
    etherscan: { name: 'Gnosis Testnet', url: 'https://blockscout.chiadochain.net' },
    default: { name: 'Gnosis Testnet', url: 'https://blockscout.chiadochain.net' }
  }
} as const satisfies Chain

const fantomSonicBuildersTestnet = {
  id: 64165,
  testnet: true,
  name: 'FantomSonicBuildersTestnet',
  network: 'FantomSonicBuildersTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'FTM',
    symbol: 'FTM'
  },
  rpcUrls: {
    public: { http: ['https://rpc.sonic.fantom.network/'] },
    default: { http: ['https://rpc.sonic.fantom.network/'] }
  },
  blockExplorers: {
    etherscan: { name: 'Fantom Sonic Builders Testnet', url: 'https://public-sonic.fantom.network/' },
    default: { name: 'Fantom Sonic Builders Testnet', url: 'https://public-sonic.fantom.network/' }
  }
} as const satisfies Chain

const soneiumMinatoTestnet = {
  id: 1946,
  testnet: true,
  name: 'Soneium Minato Testnet',
  network: 'Soneium Minato Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH'
  },
  rpcUrls: {
    public: { http: ['https://rpc.minato.soneium.org/'] },
    default: { http: ['https://rpc.minato.soneium.org/'] }
  },
  blockExplorers: {
    etherscan: { name: 'Soneium Minato Testnet', url: 'https://explorer-testnet.soneium.org/' },
    default: { name: 'Soneium Minato Testnet', url: 'https://explorer-testnet.soneium.org/' }
  }
} as const satisfies Chain
//
// const edgeEVM = {
//   id: 2021,
//   name: 'EdgeEVM',
//   network: 'EdgeEVM',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'EDG',
//     symbol: 'EDG'
//   },
//   rpcUrls: {
//     public: { http: ['https://edgeware-evm.jelliedowl.net/'] },
//     default: { http: ['https://edgeware-evm.jelliedowl.net/'] }
//   },
//   blockExplorers: {
//     etherscan: { name: 'Edgeware', url: 'https://edgscan.live' },
//     default: { name: 'Edgeware', url: 'https://edgscan.live' }
//   }
// } as const satisfies Chain

const projectId = process.env.WALLET_CONNECT_PROJECT_ID
const chains = [
  // sepolia,
  // artheraTestnet,
  // immu3Testnet,
  // oasisSapphireTestnet,
  // metisSepoliaTestnet,
  // beresheetEVM,
  // mantleTestnet,
  // zetachainTestnet,
  // fantomTestnet,
  // gnosisTestnet,
  // fantomSonicBuildersTestnet,
  fantom,
  oasisSapphireMainnet,
  soneiumMinatoTestnet
]
const { provider, webSocketProvider } = configureChains(chains, [w3mProvider({ projectId: process.env.WALLET_CONNECT_PROJECT_ID })])

export const client = createClient({
  autoConnect: true,
  connectors: w3mConnectors({
    chains,
    projectId: projectId
  }),
  provider,
  webSocketProvider
})
export const ethereumClient: EthereumClient = new EthereumClient(client, chains)

export const httpClient: AxiosInstance = axios.create({
  baseURL: pollinationXConfig.url
})
